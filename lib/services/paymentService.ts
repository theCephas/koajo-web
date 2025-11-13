import {
  API_ENDPOINTS,
  getApiUrl,
  getAuthHeaders,
} from "@/lib/constants/api";
import type {
  CreatePaymentRequest,
  RecordPaymentResponse,
  ApiError,
} from "@/lib/types/api";

/**
 * Payment Service
 * Handles payment recording and Stripe subscription management
 */

/**
 * Records a payment in the backend system
 * This is called after a successful Stripe charge via webhook
 */
export async function recordPayment(
  data: CreatePaymentRequest,
  token: string
): Promise<RecordPaymentResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PAYMENTS.RECORD);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Payment recording failed",
        message: "Failed to record payment in the system",
        statusCode: response.status,
      }));

      return errorData;
    }

    const result: RecordPaymentResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Error recording payment:", error);
    return {
      error: "Network error",
      message:
        error instanceof Error ? error.message : "Failed to record payment",
      statusCode: 0,
    };
  }
}

/**
 * Retrieves pod memberships with upcoming contribution dates
 * This is used by the cron job to check which contributions are due
 */
export async function getPodsWithUpcomingContributions(
  token: string,
  targetDate?: string
): Promise<
  | Array<{
      podId: string;
      membershipId: string;
      amount: number;
      currency: string;
      nextContributionDate: string;
      graceEndsAt?: string;
      stripeSubscriptionId?: string;
    }>
  | ApiError
> {
  const url = getApiUrl(API_ENDPOINTS.PODS.MINE);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Failed to fetch pods",
        message: "Unable to retrieve pod memberships",
        statusCode: response.status,
      }));
      return errorData;
    }

    const pods = await response.json();

    // Filter pods that have upcoming contributions
    const podsWithContributions = pods
      .filter((pod: any) => pod.nextContributionDate)
      .map((pod: any) => ({
        podId: pod.podId,
        membershipId: pod.membershipId,
        amount: pod.amount,
        currency: pod.currency || "NGN",
        nextContributionDate: pod.nextContributionDate,
        graceEndsAt: pod.graceEndsAt,
        stripeSubscriptionId: pod.stripeSubscriptionId,
      }));

    return podsWithContributions;
  } catch (error) {
    console.error("Error fetching pods with upcoming contributions:", error);
    return {
      error: "Network error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch pod memberships",
      statusCode: 0,
    };
  }
}

export const PaymentService = {
  recordPayment,
  getPodsWithUpcomingContributions,
};
