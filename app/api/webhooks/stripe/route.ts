import { NextRequest, NextResponse } from "next/server";
import {
  verifyStripeWebhookSignature,
  processPaymentIntentWebhook,
} from "@/lib/services/stripeAchService";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants/api";

/**
 * Stripe Webhook Handler
 *
 * This endpoint receives webhook events from Stripe for ACH direct debit payments.
 *
 * Key Events:
 * - payment_intent.succeeded: Pod contribution payment completed
 * - payment_intent.processing: ACH payment initiated (takes 1-5 business days)
 * - payment_intent.payment_failed: Payment failed (insufficient funds, etc.)
 * - payment_intent.canceled: Payment was canceled
 *
 * Set this URL in Stripe Dashboard:
 * https://yourdomain.com/api/webhooks/stripe
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = await verifyStripeWebhookSignature(rawBody, signature);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✅ Webhook received: ${event.type} (${event.id})`);

    // Process PaymentIntent events for pod contributions
    if (event.type.startsWith("payment_intent.")) {
      const result = await processPaymentIntentWebhook(event);

      if (result) {
        console.log("📊 Webhook processed:", result);

        // Record payment in backend using /payments endpoint
        // Only record on SUCCESS, not on PROCESSING or FAILED
        if (result.status === "SUCCESS") {
          await recordPayment(result);
        } else if (result.status === "FAILED") {
          console.log("⚠️ Payment failed, backend should increment nextContributionDate");
          // Backend handles failure logic based on the payment status
        }

        return NextResponse.json({
          received: true,
          processed: true,
          result,
        });
      }
    }

    // For other event types, just acknowledge receipt
    return NextResponse.json({ received: true, processed: false });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Record payment in the backend using existing /payments endpoint
 */
async function recordPayment(result: {
  status: "SUCCESS" | "PROCESSING" | "FAILED" | "UNKNOWN";
  podId?: string;
  membershipId?: string;
  contributionDate?: string;
  intentId?: string;
  failureReason?: string;
}) {
  try {
    console.log("🔄 Recording payment in backend:", result);

    // Only record if we have the required data
    if (!result.podId || !result.intentId) {
      console.warn("⚠️ Missing required data for payment recording");
      return;
    }

    // Get the payment intent details from Stripe to get the amount
    const { getPaymentIntent } = await import("@/lib/services/stripeAchService");
    const paymentIntent = await getPaymentIntent(result.intentId);

    const apiUrl = getApiUrl(API_ENDPOINTS.PAYMENTS.RECORD);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        podId: result.podId,
        stripeReference: result.intentId,
        amount: paymentIntent.amount, // Amount in cents
        currency: paymentIntent.currency.toUpperCase(),
        status: result.status === "SUCCESS" ? "succeeded" : result.status.toLowerCase(),
        description: {
          contributionDate: result.contributionDate,
          membershipId: result.membershipId,
          failureReason: result.failureReason,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to record payment:", error);
      throw new Error(`Payment recording failed: ${error}`);
    }

    const responseData = await response.json();
    console.log("✅ Payment recorded successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("❌ Error recording payment:", error);
    // Don't throw - we don't want to cause webhook retries for backend update failures
  }
}
