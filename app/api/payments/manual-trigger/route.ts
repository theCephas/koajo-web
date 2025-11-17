import { NextRequest, NextResponse } from "next/server";
import { chargeAchContribution } from "@/lib/services/stripeAchService";
import { TokenManager } from "@/lib/utils/memory-manager";

/**
 * Manual Payment Trigger
 *
 * Allows users to manually trigger a contribution payment when:
 * - Grace period has expired (graceEndsAt has passed)
 * - Automatic retries failed during grace period
 * - User wants to retry immediately
 *
 * Flow:
 * 1. User clicks "Pay Now" button in UI
 * 2. This endpoint charges their saved payment method immediately
 * 3. Webhook handles success/failure
 * 4. On success, records payment via /payments endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { membershipId, podId } = body;

    if (!membershipId || !podId) {
      return NextResponse.json(
        { error: "Missing required fields: membershipId, podId" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 Manual payment trigger requested for membership ${membershipId}`
    );

    // Fetch membership details from backend
    // Backend should return: { user: { stripeCustomerId, stripePaymentMethodId }, contributionAmount, nextContributionDate, pod: { name } }
    const { API_ENDPOINTS, getApiUrl, getAuthHeaders } = await import(
      "@/lib/constants/api"
    );
    const apiUrl = getApiUrl(API_ENDPOINTS.PODS.MINE);

    const membershipResponse = await fetch(
      `${apiUrl}/${podId}/membership/${membershipId}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!membershipResponse.ok) {
      const error = await membershipResponse.text();
      throw new Error(`Failed to fetch membership: ${error}`);
    }

    const membership = await membershipResponse.json();

    // Validate user has payment method set up
    if (!membership.user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe customer not found. Please reconnect your bank account." },
        { status: 400 }
      );
    }

    if (!membership.user?.stripePaymentMethodId) {
      return NextResponse.json(
        { error: "No payment method found. Please connect your bank account." },
        { status: 400 }
      );
    }

    // Validate payment is overdue (past grace period)
    // Manual trigger should only work when graceEndsAt < nextContributionDate
    const graceEndsAt = new Date(membership.graceEndsAt);
    const nextContribDate = new Date(membership.nextContributionDate);

    if (graceEndsAt >= nextContribDate) {
      return NextResponse.json(
        {
          error: "Payment is still within grace period. Automatic charging will handle this.",
          graceEndsAt: membership.graceEndsAt,
          nextContributionDate: membership.nextContributionDate
        },
        { status: 400 }
      );
    }

    console.log(`💰 Attempting manual payment for membership ${membershipId}`);

    // Attempt immediate ACH charge
    const chargeResult = await chargeAchContribution({
      customerId: membership.user.stripeCustomerId,
      paymentMethodId: membership.user.stripePaymentMethodId,
      amount: membership.contributionAmount, // Amount in cents
      podId: membership.podId,
      membershipId: membership.id,
      contributionDate: new Date(membership.nextContributionDate),
      description: `Manual payment - Pod ${membership.pod.name} - ${membership.nextContributionDate}`,
    });

    if (chargeResult.success) {
      console.log(
        `✅ Manual payment initiated: ${chargeResult.intentId} for membership ${membershipId}`
      );

      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        paymentIntentId: chargeResult.intentId,
        status: chargeResult.status,
      });
    } else {
      console.error(
        `❌ Manual payment failed for membership ${membershipId}: ${chargeResult.error}`
      );

      return NextResponse.json(
        {
          success: false,
          error: chargeResult.error,
          errorCode: chargeResult.errorCode,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Manual payment trigger failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
