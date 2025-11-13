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
 * Creates a Stripe subscription for recurring pod contributions
 * Uses ACH Direct Debit for automatic bank account charges
 */
export interface CreateSubscriptionInput {
  customerId: string;
  bankAccountId: string; // Payment method ID from Financial Connections
  podId: string;
  membershipId: string;
  amount: number; // Amount in cents (e.g., 5000 = ₦50.00)
  currency: string; // e.g., "NGN"
  nextContributionDate: Date;
  cadence: "bi-weekly" | "monthly";
  description?: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status: Stripe.Subscription.Status;
  nextPaymentDate: number | null;
  paymentMethodId: string | null;
}

export async function resolveSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Promise<number | null> {
  const items = subscription.items?.data;
  if (!items || items.length === 0) {
    return null;
  }

  const latestPeriodEnd = items.reduce((latest, item) => {
    if (typeof item.current_period_end !== "number") {
      return latest;
    }
    return Math.max(latest, item.current_period_end);
  }, 0);

  return latestPeriodEnd > 0 ? latestPeriodEnd : null;
}

function resolveInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const payments = invoice.payments?.data;
  if (!payments || payments.length === 0) {
    return null;
  }

  const prioritizedPayment =
    payments.find((payment) => payment.is_default) ?? payments[0];
  const paymentIntentRef = prioritizedPayment.payment?.payment_intent;

  if (!paymentIntentRef) {
    return null;
  }

  return typeof paymentIntentRef === "string"
    ? paymentIntentRef
    : paymentIntentRef.id;
}

/**
 * Creates a recurring subscription for pod contributions
 */
export async function createPodSubscription(
  input: CreateSubscriptionInput
): Promise<SubscriptionResult> {
  const stripe = getStripe();

  try {
    // Create a product for this pod
    const product = await stripe.products.create({
      name: `Koajo Pod Contribution - ${input.podId}`,
      metadata: {
        pod_id: input.podId,
        membership_id: input.membershipId,
      },
    });

    // Create a price based on the cadence
    const intervalCount = input.cadence === "bi-weekly" ? 2 : 1;
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: input.amount,
      currency: input.currency.toLowerCase(),
      recurring: {
        interval: "week",
        interval_count: intervalCount,
      },
      metadata: {
        pod_id: input.podId,
        membership_id: input.membershipId,
      },
    });

    // Calculate the billing cycle anchor (next contribution date as Unix timestamp)
    const billingCycleAnchor = Math.floor(
      input.nextContributionDate.getTime() / 1000
    );

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: input.customerId,
      items: [{ price: price.id }],
      default_payment_method: input.bankAccountId,
      billing_cycle_anchor: billingCycleAnchor,
      proration_behavior: "none",
      description:
        input.description ||
        `Koajo Pod ${input.podId} - ${input.cadence} contribution`,
      metadata: {
        pod_id: input.podId,
        membership_id: input.membershipId,
        cadence: input.cadence,
      },
      payment_settings: {
        payment_method_types: ["us_bank_account", "link"],
        save_default_payment_method: "on_subscription",
      },
      // Enable automatic retry with exponential backoff
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payments"],
    });

    const nextPaymentDate = await resolveSubscriptionPeriodEnd(subscription);

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      nextPaymentDate,
      paymentMethodId:
        typeof subscription.default_payment_method === "string"
          ? subscription.default_payment_method
          : subscription.default_payment_method?.id || null,
    };
  } catch (error) {
    console.error("Error creating pod subscription:", error);
    throw error;
  }
}

/**
 * Updates the billing cycle anchor to a new contribution date
 */
export async function updateSubscriptionNextPaymentDate(
  subscriptionId: string,
  nextContributionDate: Date
): Promise<SubscriptionResult> {
  const stripe = getStripe();

  try {
    const billingCycleAnchor = Math.floor(
      nextContributionDate.getTime() / 1000
    );

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      billing_cycle_anchor: billingCycleAnchor as any,
      proration_behavior: "none",
    });

    const nextPaymentDate = await resolveSubscriptionPeriodEnd(subscription);

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      nextPaymentDate,
      paymentMethodId:
        typeof subscription.default_payment_method === "string"
          ? subscription.default_payment_method
          : subscription.default_payment_method?.id || null,
    };
  } catch (error) {
    console.error("Error updating subscription billing cycle:", error);
    throw error;
  }
}

/**
 * Cancels a subscription when a user leaves a pod
 */
export async function cancelPodSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();

  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error canceling pod subscription:", error);
    throw error;
  }
}

/**
 * Retries a failed payment manually (for grace period handling)
 */
export async function retryFailedPayment(
  invoiceId: string
): Promise<{ success: boolean; paymentIntentId: string | null }> {
  const stripe = getStripe();

  try {
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ["payments"],
    });

    const paymentIntentId = resolveInvoicePaymentIntentId(invoice);

    if (!paymentIntentId) {
      throw new Error("No payment intent found for this invoice");
    }

    // Attempt to confirm the payment intent again
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "requires_payment_method") {
      // Payment method failed, cannot retry automatically
      return { success: false, paymentIntentId };
    }

    if (
      paymentIntent.status === "requires_confirmation" ||
      paymentIntent.status === "requires_action"
    ) {
      await stripe.paymentIntents.confirm(paymentIntentId);
      return { success: true, paymentIntentId };
    }

    return { success: false, paymentIntentId };
  } catch (error) {
    console.error("Error retrying failed payment:", error);
    return { success: false, paymentIntentId: null };
  }
}

/**
 * Retrieves subscription details
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice", "default_payment_method"],
  });
}

/**
 * Creates a manual payment intent for immediate contribution
 * (Used for one-time payments or manual retries)
 */
export async function createManualPaymentIntent(
  customerId: string,
  amount: number,
  currency: string,
  paymentMethodId: string,
  metadata: {
    podId: string;
    membershipId: string;
    contributionType: string;
  }
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["us_bank_account"],
      metadata: {
        pod_id: metadata.podId,
        membership_id: metadata.membershipId,
        contribution_type: metadata.contributionType,
      },
      description: `Manual contribution for pod ${metadata.podId}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating manual payment intent:", error);
    throw error;
  }
}
