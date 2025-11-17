import { NextRequest, NextResponse } from "next/server";
import { chargeAchContribution } from "@/lib/services/stripeAchService";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants/api";

/**
 * Cron Job: Charge Pod Contributions
 *
 * Runs daily to charge contributions that are due today.
 *
 * Flow:
 * 1. Query backend for memberships where nextContributionDate === today
 * 2. For each membership within grace period (today <= graceEndsAt):
 *    - Attempt ACH charge via Stripe
 *    - If initiated successfully, wait for webhook
 *    - If immediate failure, backend will increment nextContributionDate
 * 3. Memberships past grace period are handled by backend (kick from pod)
 *
 * Schedule in vercel.json:
 * "0 13 * * *" (runs at midnight UTC+11)
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Starting contribution charge cron job...");

    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron job attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    console.log(`📅 Processing contributions for: ${today}`);

    // Fetch memberships that need to be charged today
    const apiUrl = getApiUrl(API_ENDPOINTS.ADMIN.PODS); // Adjust endpoint as needed
    const internalSecret = process.env.INTERNAL_API_SECRET; // Server-to-server auth

    const response = await fetch(`${apiUrl}/contributions/due?date=${today}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": internalSecret || "",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch contributions: ${error}`);
    }

    const contributionsDue = await response.json();

    console.log(`📊 Found ${contributionsDue.length} contributions due today`);

    if (contributionsDue.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No contributions due today",
        charged: 0,
        failed: 0,
      });
    }

    // Process each contribution
    let charged = 0;
    let failed = 0;
    const results = [];

    for (const contribution of contributionsDue) {
      try {
        console.log(
          `💰 Processing contribution for membership ${contribution.membershipId} in pod ${contribution.podId}`
        );

        // Validate required data
        if (!contribution.user?.stripeCustomerId) {
          console.error(
            `❌ Missing Stripe customer ID for membership ${contribution.membershipId}`
          );
          failed++;
          results.push({
            membershipId: contribution.membershipId,
            status: "failed",
            error: "Missing Stripe customer ID",
          });
          continue;
        }

        if (!contribution.user?.stripePaymentMethodId) {
          console.error(
            `❌ Missing payment method for membership ${contribution.membershipId}`
          );
          failed++;
          results.push({
            membershipId: contribution.membershipId,
            status: "failed",
            error: "Missing payment method",
          });
          continue;
        }

        // Check if within grace period
        const graceEndsAt = new Date(contribution.graceEndsAt);
        const todayDate = new Date(today);

        if (todayDate > graceEndsAt) {
          console.log(
            `⚠️ Membership ${contribution.membershipId} past grace period, skipping auto-charge`
          );
          // Backend will handle kicking member or requiring manual payment
          results.push({
            membershipId: contribution.membershipId,
            status: "grace_period_expired",
            message: "Requires manual payment",
          });
          continue;
        }

        // Attempt ACH charge
        const chargeResult = await chargeAchContribution({
          customerId: contribution.user.stripeCustomerId,
          paymentMethodId: contribution.user.stripePaymentMethodId,
          amount: contribution.amount, // Amount in cents
          podId: contribution.podId,
          membershipId: contribution.membershipId,
          contributionDate: new Date(contribution.nextContributionDate),
          description: `Pod ${contribution.podName} - Contribution for ${contribution.nextContributionDate}`,
        });

        if (chargeResult.success) {
          console.log(
            `✅ Payment initiated for membership ${contribution.membershipId}: ${chargeResult.intentId}`
          );
          charged++;
          results.push({
            membershipId: contribution.membershipId,
            status: "processing",
            paymentIntentId: chargeResult.intentId,
          });

          // Update backend to mark as "processing"
          // Webhook will handle final success/failure
          await updateContributionStatus(
            contribution.membershipId,
            "processing",
            chargeResult.intentId || null
          );
        } else {
          console.error(
            `❌ Payment failed for membership ${contribution.membershipId}: ${chargeResult.error}`
          );
          failed++;
          results.push({
            membershipId: contribution.membershipId,
            status: "failed",
            error: chargeResult.error,
            errorCode: chargeResult.errorCode,
          });

          // Update backend - backend will increment nextContributionDate
          await updateContributionStatus(
            contribution.membershipId,
            "failed",
            null,
            chargeResult.error
          );
        }
      } catch (error) {
        console.error(
          `❌ Error processing membership ${contribution.membershipId}:`,
          error
        );
        failed++;
        results.push({
          membershipId: contribution.membershipId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `✅ Cron job completed: ${charged} charged, ${failed} failed/skipped`
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${contributionsDue.length} contributions`,
      charged,
      failed,
      results,
    });
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Update contribution status in backend
 */
async function updateContributionStatus(
  membershipId: string,
  status: "processing" | "failed",
  paymentIntentId: string | null,
  failureReason?: string
) {
  try {
    const apiUrl = getApiUrl(API_ENDPOINTS.ADMIN.PODS); // Adjust as needed
    const internalSecret = process.env.INTERNAL_API_SECRET;

    const response = await fetch(
      `${apiUrl}/contributions/${membershipId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": internalSecret || "",
        },
        body: JSON.stringify({
          status,
          paymentIntentId,
          failureReason,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to update contribution status:", error);
    }

    return response.ok;
  } catch (error) {
    console.error("Error updating contribution status:", error);
    return false;
  }
}
