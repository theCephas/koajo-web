import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { recordPayment } from "@/lib/services/paymentService";
import { retryFailedPayment } from "@/lib/services/stripeSubscriptionService";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-08-27.basil";

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
}

/**
 * Stripe Webhook Handler
 * Handles automated payment events from Stripe subscriptions
 *
 * Key Events:
 * - invoice.payment_succeeded: Record successful contribution
 * - invoice.payment_failed: Handle failed payment with retry logic
 * - customer.subscription.updated: Sync subscription status
 * - payment_intent.succeeded: Record successful manual payments
 * - payment_intent.payment_failed: Handle failed manual payments
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found in request");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}` },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful invoice payment (recurring subscription charge)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Processing successful payment for invoice: ${invoice.id}`);

    const subscription = invoice.subscription;
    if (!subscription) {
      console.log("Invoice is not associated with a subscription, skipping");
      return;
    }

    const subscriptionId =
      typeof subscription === "string" ? subscription : subscription.id;

    // Get subscription metadata
    const stripe = getStripe();
    const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
    const metadata = subscriptionData.metadata;

    const podId = metadata.pod_id;
    const membershipId = metadata.membership_id;

    if (!podId) {
      console.error("No pod_id found in subscription metadata");
      return;
    }

    // Get payment intent details
    const paymentIntentId =
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent?.id;

    if (!paymentIntentId) {
      console.error("No payment intent found for invoice");
      return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Record the payment in the backend
    // Note: We use a system token here - you'll need to implement a way to get this
    // For now, we'll make an unauthenticated call and let the backend handle authentication via webhook signature
    const paymentData = {
      podId,
      stripeReference: paymentIntent.id,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: "succeeded",
      description: `Subscription payment for pod ${podId} - Invoice ${invoice.id}`,
    };

    console.log("Recording payment:", paymentData);

    // Record payment via internal API
    await recordPaymentViaInternalAPI(paymentData);

    console.log(`Successfully processed payment for pod ${podId}`);
  } catch (error) {
    console.error("Error handling successful invoice payment:", error);
    // Don't throw - we don't want to cause webhook retries for logging errors
  }
}

/**
 * Handle failed invoice payment with exponential backoff retry
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Processing failed payment for invoice: ${invoice.id}`);

    const subscription = invoice.subscription;
    if (!subscription) {
      console.log("Invoice is not associated with a subscription, skipping");
      return;
    }

    const subscriptionId =
      typeof subscription === "string" ? subscription : subscription.id;

    const stripe = getStripe();
    const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
    const metadata = subscriptionData.metadata;

    const podId = metadata.pod_id;
    const attemptCount = invoice.attempt_count || 0;

    console.log(
      `Payment failed for pod ${podId}, attempt ${attemptCount}`
    );

    // Stripe automatically retries with exponential backoff
    // We just need to monitor and potentially notify the user
    // The subscription will automatically retry until grace period ends

    // Check if we've exceeded retry attempts
    if (attemptCount >= 4) {
      console.error(
        `Payment failed after ${attemptCount} attempts for pod ${podId}`
      );
      // TODO: Notify user that payment is failing and grace period is active
      // TODO: Send notification via email/push
    }

    // Record the failed payment attempt
    const paymentIntentId =
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent?.id;

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const paymentData = {
        podId,
        stripeReference: paymentIntent.id,
        amount: invoice.amount_due,
        currency: invoice.currency.toUpperCase(),
        status: "failed",
        description: `Failed payment attempt ${attemptCount} for pod ${podId}`,
      };

      await recordPaymentViaInternalAPI(paymentData);
    }
  } catch (error) {
    console.error("Error handling failed invoice payment:", error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription updated: ${subscription.id}`);

    const podId = subscription.metadata.pod_id;
    const status = subscription.status;

    console.log(`Pod ${podId} subscription status: ${status}`);

    // TODO: Update pod status in backend if needed
    // For example, if subscription is paused, mark pod as inactive
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription deleted: ${subscription.id}`);

    const podId = subscription.metadata.pod_id;

    console.log(`Pod ${podId} subscription has been canceled`);

    // TODO: Update pod status in backend to reflect cancellation
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
  }
}

/**
 * Handle successful payment intent (manual payments)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment intent succeeded: ${paymentIntent.id}`);

    const podId = paymentIntent.metadata.pod_id;
    if (!podId) {
      console.log("Payment intent not associated with a pod, skipping");
      return;
    }

    const paymentData = {
      podId,
      stripeReference: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: "succeeded",
      description: paymentIntent.description || `Manual payment for pod ${podId}`,
    };

    await recordPaymentViaInternalAPI(paymentData);

    console.log(`Successfully processed manual payment for pod ${podId}`);
  } catch (error) {
    console.error("Error handling payment intent success:", error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment intent failed: ${paymentIntent.id}`);

    const podId = paymentIntent.metadata.pod_id;
    if (!podId) {
      console.log("Payment intent not associated with a pod, skipping");
      return;
    }

    const paymentData = {
      podId,
      stripeReference: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: "failed",
      description: `Failed manual payment for pod ${podId}`,
    };

    await recordPaymentViaInternalAPI(paymentData);

    console.log(`Recorded failed manual payment for pod ${podId}`);
  } catch (error) {
    console.error("Error handling payment intent failure:", error);
  }
}

/**
 * Records payment via internal API call (bypassing authentication)
 * This uses a server-to-server communication pattern
 */
async function recordPaymentViaInternalAPI(paymentData: {
  podId: string;
  stripeReference: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
}) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com";
    const response = await fetch(`${apiUrl}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use internal API key for server-to-server auth
        "X-Webhook-Secret": process.env.STRIPE_WEBHOOK_SECRET || "",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to record payment:", error);
      throw new Error(`Payment recording failed: ${error}`);
    }

    const result = await response.json();
    console.log("Payment recorded successfully:", result);
    return result;
  } catch (error) {
    console.error("Error recording payment via internal API:", error);
    throw error;
  }
}
