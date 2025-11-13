import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionDetails } from "@/lib/services/stripeSubscriptionService";
import { isContributionDue, isWithinGracePeriod } from "@/lib/utils/payment-utils";

/**
 * Vercel Cron Job: Sync Subscription Status
 *
 * This job runs daily to:
 * 1. Check all active subscriptions
 * 2. Verify upcoming contribution dates
 * 3. Monitor failed payments within grace period
 * 4. Alert on subscriptions nearing grace period expiration
 *
 * Scheduled via vercel.json cron configuration
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request from Vercel
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized cron job request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting subscription sync cron job...");

    // Get all active pod memberships with subscriptions
    const pods = await fetchActivePodMemberships();

    if (!pods || pods.length === 0) {
      console.log("No active pod memberships found");
      return NextResponse.json({
        success: true,
        message: "No active pod memberships to sync",
        synced: 0,
      });
    }

    console.log(`Found ${pods.length} pod memberships to sync`);

    const results = {
      synced: 0,
      errors: 0,
      dueSoon: [] as string[],
      failedPayments: [] as string[],
      graceEnding: [] as string[],
    };

    for (const pod of pods) {
      try {
        if (!pod.stripeSubscriptionId) {
          console.log(`Pod ${pod.podId} has no subscription ID, skipping`);
          continue;
        }

        // Fetch subscription details from Stripe
        const subscription = await getSubscriptionDetails(
          pod.stripeSubscriptionId
        );

        console.log(
          `Syncing subscription ${subscription.id} for pod ${pod.podId}, status: ${subscription.status}`
        );

        // Check if contribution is due
        if (
          pod.nextContributionDate &&
          isContributionDue(pod.nextContributionDate, pod.graceEndsAt)
        ) {
          results.dueSoon.push(pod.podId);
          console.log(`Contribution due for pod ${pod.podId}`);
        }

        // Check for failed payments
        if (
          subscription.status === "past_due" ||
          subscription.status === "unpaid"
        ) {
          results.failedPayments.push(pod.podId);
          console.log(`Failed payment detected for pod ${pod.podId}`);

          // Check if grace period is ending soon (within 2 days)
          if (pod.graceEndsAt) {
            const now = new Date();
            const graceEndDate = new Date(pod.graceEndsAt);
            const daysUntilExpiry = Math.ceil(
              (graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilExpiry <= 2 && daysUntilExpiry > 0) {
              results.graceEnding.push(pod.podId);
              console.log(
                `Grace period ending soon for pod ${pod.podId} (${daysUntilExpiry} days remaining)`
              );
              // TODO: Send urgent notification to user
            }
          }
        }

        // Update pod status in backend if needed
        await updatePodSubscriptionStatus(pod.podId, {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        });

        results.synced++;
      } catch (error) {
        console.error(`Error syncing pod ${pod.podId}:`, error);
        results.errors++;
      }
    }

    console.log("Subscription sync completed:", results);

    return NextResponse.json({
      success: true,
      message: "Subscription sync completed",
      ...results,
    });
  } catch (error) {
    console.error("Error in subscription sync cron job:", error);
    return NextResponse.json(
      {
        error: "Subscription sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Fetches all active pod memberships from the backend
 */
async function fetchActivePodMemberships(): Promise<
  Array<{
    podId: string;
    membershipId: string;
    stripeSubscriptionId?: string;
    nextContributionDate?: string;
    graceEndsAt?: string;
    status: string;
  }>
> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com";
    const internalApiKey = process.env.INTERNAL_API_KEY;

    const response = await fetch(`${apiUrl}/v1/pods/subscriptions/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": internalApiKey || "",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch active pod memberships:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching active pod memberships:", error);
    return [];
  }
}

/**
 * Updates pod subscription status in the backend
 */
async function updatePodSubscriptionStatus(
  podId: string,
  status: {
    subscriptionId: string;
    status: string;
    currentPeriodEnd: number;
  }
): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com";
    const internalApiKey = process.env.INTERNAL_API_KEY;

    await fetch(`${apiUrl}/v1/pods/${podId}/subscription/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": internalApiKey || "",
      },
      body: JSON.stringify(status),
    });
  } catch (error) {
    console.error(
      `Error updating subscription status for pod ${podId}:`,
      error
    );
  }
}

/**
 * POST handler (for manual trigger via API)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
