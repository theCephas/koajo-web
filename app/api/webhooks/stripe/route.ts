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
      event = verifyStripeWebhookSignature(rawBody, signature);
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

        // Update contribution status in your backend
        await updateContributionStatus(result);

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
 * Update contribution status in the backend based on webhook result
 */
async function updateContributionStatus(result: {
  status: "SUCCESS" | "PROCESSING" | "FAILED" | "UNKNOWN";
  podId?: string;
  membershipId?: string;
  contributionDate?: string;
  intentId?: string;
  failureReason?: string;
}) {
  try {
    console.log("🔄 Updating contribution status in backend:", result);

    const apiUrl = getApiUrl(API_ENDPOINTS.WEBHOOKS.STRIPE_PAYMENT);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use webhook secret for server-to-server auth
        "X-Webhook-Secret": webhookSecret,
      },
      body: JSON.stringify({
        podId: result.podId,
        membershipId: result.membershipId,
        contributionDate: result.contributionDate,
        paymentIntentId: result.intentId,
        status: result.status.toLowerCase(),
        failureReason: result.failureReason,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to update contribution status:", error);
      throw new Error(`Backend update failed: ${error}`);
    }

    const responseData = await response.json();
    console.log("✅ Contribution status updated successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("❌ Error updating contribution status:", error);
    // Don't throw - we don't want to cause webhook retries for backend update failures
  }
}
