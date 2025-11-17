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

    // Fetch all pods/memberships that need to be charged today
    // Backend endpoint returns all memberships where nextContributionDate === today and status === "grace"
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com";
    const internalSecret = process.env.INTERNAL_API_SECRET;

    const response = await fetch(`${backendUrl}/v1/internal/pods/due-contributions?date=${today}`, {
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

    for (const pod of contributionsDue) {
      try {
        console.log(
          `💰 Processing contribution for pod ${pod.podId}`
        );

        // Validate required data from /auth/me
        if (!pod.user?.stripeCustomerId) {
          console.error(
            `❌ Missing Stripe customer ID for pod ${pod.podId}`
          );
          failed++;
          results.push({
            podId: pod.podId,
            status: "failed",
            error: "Missing Stripe customer ID",
          });
          continue;
        }

        if (!pod.user?.stripePaymentMethodId) {
          console.error(
            `❌ Missing payment method for pod ${pod.podId}`
          );
          failed++;
          results.push({
            podId: pod.podId,
            status: "failed",
            error: "Missing payment method",
          });
          continue;
        }

        // Check if within grace period
        // Logic: graceEndsAt >= nextContributionDate means auto-charging can be done
        const graceEndsAt = new Date(pod.graceEndsAt);
        const nextContribDate = new Date(pod.nextContributionDate);

        if (graceEndsAt < nextContribDate) {
          console.log(
            `⚠️ Pod ${pod.podId} past grace period (${pod.graceEndsAt} < ${pod.nextContributionDate}), skipping auto-charge`
          );
          // User needs to use manual payment trigger
          results.push({
            podId: pod.podId,
            status: "grace_period_expired",
            message: "Requires manual payment",
          });
          continue;
        }

        // Attempt ACH charge
        const chargeResult = await chargeAchContribution({
          customerId: pod.user.stripeCustomerId,
          paymentMethodId: pod.user.stripePaymentMethodId,
          amount: pod.amount * 100, // Convert to cents (amount is in dollars)
          podId: pod.podId,
          membershipId: pod.membershipId || pod.podId, // Use podId as fallback
          contributionDate: new Date(pod.nextContributionDate),
          description: `Pod contribution - ${pod.nextContributionDate}`,
        });

        if (chargeResult.success) {
          console.log(
            `✅ Payment initiated for pod ${pod.podId}: ${chargeResult.intentId}`
          );
          charged++;
          results.push({
            podId: pod.podId,
            status: "processing",
            paymentIntentId: chargeResult.intentId,
          });

          // No need to update backend here - webhook will handle it
          // The payment_intent.processing webhook will notify backend
        } else {
          console.error(
            `❌ Payment failed for pod ${pod.podId}: ${chargeResult.error}`
          );
          failed++;
          results.push({
            podId: pod.podId,
            status: "failed",
            error: chargeResult.error,
            errorCode: chargeResult.errorCode,
          });

          // Backend will handle incrementing nextContributionDate on webhook failure
        }
      } catch (error) {
        console.error(
          `❌ Error processing pod ${pod.podId}:`,
          error
        );
        failed++;
        results.push({
          podId: pod.podId,
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

