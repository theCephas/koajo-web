"use server";

import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-08-27.basil";
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Stripe secret key (STRIPE_SECRET_KEY) is not configured on the server."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  return stripeClient;
}

/**
 * Create a Stripe Customer
 */
export async function createStripeCustomer(
  email: string,
  userId: string,
  metadata?: { phone?: string; name?: string }
) {
  const stripe = getStripe();

  return stripe.customers.create({
    email,
    ...(metadata?.name && { name: metadata.name }),
    ...(metadata?.phone && { phone: metadata.phone }),
    metadata: { userId },
  });
}

/**
 * Attach a Payment Method (ACH / Financial Connections) to a customer
 * and set it as the default payment method
 */
export async function attachPaymentMethodToCustomer(
  customerId: string,
  paymentMethodId: string
) {
  const stripe = getStripe();

  // Attach payment method
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Retrieve to check mandate status
  return stripe.paymentMethods.retrieve(paymentMethodId);
}

/**
 * Create an off-session ACH PaymentIntent for a pod contribution
 * This is the core "auto-pull" functionality
 */
export interface ChargeAchContributionParams {
  customerId: string;
  paymentMethodId: string;
  amount: number; // in cents
  podId: string;
  membershipId: string;
  contributionDate: Date;
  description?: string;
}

export interface ChargeAchContributionResult {
  success: boolean;
  intentId?: string;
  status?: string;
  error?: string;
  errorCode?: string;
  raw?: any;
}

export async function chargeAchContribution(
  params: ChargeAchContributionParams
): Promise<ChargeAchContributionResult> {
  const {
    customerId,
    paymentMethodId,
    amount,
    podId,
    membershipId,
    contributionDate,
    description,
  } = params;

  const stripe = getStripe();

  try {
    console.log("🔄 Creating ACH PaymentIntent for pod contribution:", {
      customerId,
      paymentMethodId,
      amount,
      podId,
      membershipId,
    });

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true, // CRITICAL: Allows charging without customer present
      confirm: true, // Automatically confirm the payment
      payment_method_types: ["us_bank_account"],
      description:
        description ||
        `Koajo Pod Contribution – Pod ${podId} – ${contributionDate.toISOString().split("T")[0]}`,
      metadata: {
        pod_id: podId,
        membership_id: membershipId,
        contribution_date: contributionDate.toISOString(),
        type: "pod_contribution",
      },
    });

    console.log("✅ ACH PaymentIntent created successfully:", intent.id);
    console.log("   Status:", intent.status);

    return {
      success: true,
      intentId: intent.id,
      status: intent.status,
    };
  } catch (err: any) {
    console.error("❌ ACH PaymentIntent failed:", err);

    // Handle specific ACH errors
    if (err?.raw?.decline_code === "insufficient_funds") {
      return {
        success: false,
        error: "Insufficient funds in bank account",
        errorCode: "INSUFFICIENT_FUNDS",
        raw: err,
      };
    }

    if (err?.code === "payment_intent_authentication_failure") {
      return {
        success: false,
        error: "Payment authentication failed",
        errorCode: "REQUIRES_AUTH",
        raw: err,
      };
    }

    if (err?.code === "payment_method_not_available") {
      return {
        success: false,
        error: "Payment method not available",
        errorCode: "PAYMENT_METHOD_UNAVAILABLE",
        raw: err,
      };
    }

    // Generic fallback
    return {
      success: false,
      error: err?.message || "Unknown error occurred",
      errorCode: "GENERIC_ERROR",
      raw: err,
    };
  }
}

/**
 * Verify Stripe Webhook Signatures
 */
export async function verifyStripeWebhookSignature(
  rawBody: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Process PaymentIntent webhook events
 */
export interface WebhookProcessResult {
  status: "SUCCESS" | "PROCESSING" | "FAILED" | "UNKNOWN";
  podId?: string;
  membershipId?: string;
  contributionDate?: string;
  intentId?: string;
  failureReason?: string;
}

export async function processPaymentIntentWebhook(
  event: Stripe.Event
): Promise<WebhookProcessResult | null> {
  const intent = event.data.object as Stripe.PaymentIntent;
  const { pod_id, membership_id, contribution_date } = intent.metadata || {};

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("✅ ACH Payment Succeeded:", intent.id);
      return {
        status: "SUCCESS",
        podId: pod_id,
        membershipId: membership_id,
        contributionDate: contribution_date,
        intentId: intent.id,
      };

    case "payment_intent.processing":
      console.log("🔄 ACH Payment Processing (ACH takes 1-5 business days):", intent.id);
      return {
        status: "PROCESSING",
        podId: pod_id,
        membershipId: membership_id,
        contributionDate: contribution_date,
        intentId: intent.id,
      };

    case "payment_intent.payment_failed":
      console.log("❌ ACH Payment Failed:", intent.id);
      return {
        status: "FAILED",
        podId: pod_id,
        membershipId: membership_id,
        contributionDate: contribution_date,
        intentId: intent.id,
        failureReason: intent.last_payment_error?.message,
      };

    case "payment_intent.canceled":
      console.log("🚫 ACH Payment Canceled:", intent.id);
      return {
        status: "FAILED",
        podId: pod_id,
        membershipId: membership_id,
        contributionDate: contribution_date,
        intentId: intent.id,
        failureReason: "Payment was canceled",
      };

    default:
      return null;
  }
}

/**
 * Retrieve a PaymentIntent by ID
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Retry a failed PaymentIntent
 */
export async function retryPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();

  try {
    const intent = await stripe.paymentIntents.confirm(paymentIntentId);
    return { success: true, intent };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
