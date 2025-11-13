/**
 * Example: How to integrate Stripe Subscriptions for Pod Contributions
 *
 * This file shows practical examples of using the subscription system
 */

import {
  createPodSubscription,
  cancelPodSubscription,
} from "@/lib/services/stripeSubscriptionService";
import { isContributionDue } from "@/lib/utils/payment-utils";

/**
 * Example 1: Creating a subscription when user joins a pod
 */
export async function handleUserJoinsPod(
  userId: string,
  podData: {
    podId: string;
    membershipId: string;
    amount: number;
    currency: string;
    nextContributionDate: string;
    cadence: "bi-weekly" | "monthly";
  },
  userData: {
    stripeCustomerId: string;
    stripeBankAccountId: string;
  }
) {
  try {
    console.log(
      `Creating subscription for user ${userId} joining pod ${podData.podId}`
    );

    // Create the Stripe subscription
    const subscription = await createPodSubscription({
      customerId: userData.stripeCustomerId,
      bankAccountId: userData.stripeBankAccountId,
      podId: podData.podId,
      membershipId: podData.membershipId,
      amount: podData.amount, // Amount in cents/kobo
      currency: podData.currency,
      nextContributionDate: new Date(podData.nextContributionDate),
      cadence: podData.cadence,
      description: `Koajo Pod ${podData.podId} - ${podData.cadence} contribution`,
    });

    console.log(`Subscription created: ${subscription.subscriptionId}`);

    // Store the subscription ID in your database
    // This is crucial for future reference and cancellation
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/pods/${podData.podId}/membership`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
        body: JSON.stringify({
          membershipId: podData.membershipId,
          stripeSubscriptionId: subscription.subscriptionId,
        }),
      }
    );

    return {
      success: true,
      subscriptionId: subscription.subscriptionId,
      nextPaymentDate: subscription.nextPaymentDate,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Example 2: Canceling a subscription when user leaves a pod
 */
export async function handleUserLeavesPod(
  userId: string,
  podId: string,
  subscriptionId: string
) {
  try {
    console.log(
      `Canceling subscription ${subscriptionId} for user ${userId} leaving pod ${podId}`
    );

    await cancelPodSubscription(subscriptionId);

    console.log(`Subscription canceled successfully`);

    // Update your database to remove the subscription ID
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/pods/${podId}/membership`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
        body: JSON.stringify({
          stripeSubscriptionId: null,
          status: "canceled",
        }),
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Example 3: Checking if a contribution is due
 */
export function checkContributionStatus(pod: {
  nextContributionDate?: string;
  graceEndsAt?: string;
}) {
  if (!pod.nextContributionDate) {
    return {
      isDue: false,
      status: "no_contribution_scheduled",
    };
  }

  const isDue = isContributionDue(pod.nextContributionDate, pod.graceEndsAt);

  if (isDue) {
    return {
      isDue: true,
      status: "contribution_due",
      message: "Your contribution will be automatically charged",
    };
  }

  return {
    isDue: false,
    status: "contribution_scheduled",
    nextDate: pod.nextContributionDate,
  };
}

/**
 * Example 4: Frontend component showing contribution status
 */
export function ContributionStatusBadge({ pod }: { pod: any }) {
  const status = checkContributionStatus(pod);

  // if (status.isDue) {
  //   return (
  //     <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
  //       ⏰ Contribution processing...
  //     </div>
  //   );
  // }

  // if (status.status === "contribution_scheduled") {
  //   return (
  //     <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
  //       ✓ Next: {new Date(status.nextDate!).toLocaleDateString()}
  //     </div>
  //   );
  // }

  return null;
}

/**
 * Example 5: Handling subscription creation in a join pod flow
 */
export async function joinPodWithSubscription(
  planCode: string,
  podId: string,
  token: string
) {
  try {
    // Step 1: Join the pod via API
    const joinResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/pods/plans/${planCode}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ podId }),
      }
    );

    if (!joinResponse.ok) {
      throw new Error("Failed to join pod");
    }

    const joinData = await joinResponse.json();

    // Step 2: Get user's Stripe details
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = await userResponse.json();

    if (!user.customer?.id || !user.bankAccount?.id) {
      throw new Error(
        "User must have a Stripe customer and bank account connected"
      );
    }

    // Step 3: Create subscription
    const subscriptionResult = await handleUserJoinsPod(
      user.id,
      {
        podId: joinData.podId,
        membershipId: joinData.membershipId,
        amount: joinData.amount,
        currency: joinData.currency || "NGN",
        nextContributionDate: joinData.nextContributionDate,
        cadence: joinData.cadence,
      },
      {
        stripeCustomerId: user.customer.id,
        stripeBankAccountId: user.bankAccount.id,
      }
    );

    return {
      success: true,
      membership: joinData,
      subscription: subscriptionResult,
    };
  } catch (error) {
    console.error("Error in joinPodWithSubscription:", error);
    throw error;
  }
}

/**
 * Helper function to get user token
 * Replace with your actual token management
 */
function getUserToken(): string {
  // Implement your token retrieval logic
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken") || ""
    : "";
}

/**
 * Example 6: Displaying payment history
 */
export async function fetchPaymentHistory(podId: string, token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/pods/${podId}/payments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payment history");
    }

    const payments = await response.json();
    return payments;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return [];
  }
}
