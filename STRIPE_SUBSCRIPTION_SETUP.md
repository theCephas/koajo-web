# Stripe Recurring Subscription Setup for Pod Contributions

This document explains how to set up and use the automated recurring payment system for Koajo pod contributions using Stripe Subscriptions.

## Overview

The system automatically debits users' connected bank accounts on their `nextContributionDate` using Stripe's native subscription system with the following features:

- ✅ **Automated recurring charges** on contribution dates
- ✅ **Exponential backoff retry** for failed payments
- ✅ **Grace period handling** - retries until `graceEndsAt`
- ✅ **Webhook-based payment recording** via POST `/payments`
- ✅ **Daily cron job** for subscription monitoring
- ✅ **ACH Direct Debit** (or best payment method for connected banks)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Stripe Subscription Flow                     │
└─────────────────────────────────────────────────────────────────┘

1. User joins pod → Create Stripe Subscription
   ├─ Product: "Koajo Pod Contribution - {podId}"
   ├─ Price: Amount in cents, recurring (bi-weekly/monthly)
   ├─ Payment Method: Connected bank account
   └─ Billing Cycle Anchor: nextContributionDate

2. Stripe automatically charges on nextContributionDate
   └─ Sends webhook: invoice.payment_succeeded

3. Webhook handler receives event
   ├─ Validates signature
   ├─ Records payment via POST /payments
   └─ Updates contribution progress

4. If payment fails → invoice.payment_failed
   ├─ Stripe retries automatically (exponential backoff)
   ├─ Retries continue until graceEndsAt
   └─ User notified if grace period ending

5. Daily cron job (00:00 UTC)
   ├─ Syncs subscription statuses
   ├─ Monitors upcoming contributions
   └─ Alerts on grace period expirations
```

---

## File Structure

```
koajo-frontend/
├── app/
│   └── api/
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts              # Stripe webhook handler
│       └── cron/
│           └── sync-subscriptions/
│               └── route.ts              # Vercel cron job
├── lib/
│   ├── services/
│   │   ├── paymentService.ts            # Payment recording API
│   │   └── stripeSubscriptionService.ts  # Subscription management
│   └── utils/
│       └── payment-utils.ts              # Date/retry utilities
└── vercel.json                           # Cron schedule config
```

---

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend API
NEXT_PUBLIC_API_URL=https://api.koajo.com

# Cron Jobs & Internal APIs
CRON_SECRET=your-random-secret-for-cron-auth
INTERNAL_API_KEY=your-backend-internal-api-key

# Bank Connection
NEXT_PUBLIC_BANK_CONNECTION_RETURN_PATH=/register/kyc
```

### 2. Stripe Webhook Configuration

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Vercel Cron Job Setup

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-subscriptions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs daily at 00:00 UTC. Deploy to Vercel to activate.

### 4. Backend API Requirements

Your backend needs to support these endpoints:

#### **POST /v1/payments** (Payment Recording)
```typescript
Request Body:
{
  "podId": "uuid",
  "stripeReference": "pi_xxx",
  "amount": 5000,              // Amount in cents
  "currency": "NGN",
  "status": "succeeded",       // or "failed"
  "description": "string"
}

Response:
{
  "paymentId": "uuid",
  "transactionId": "uuid",
  "membershipId": "uuid",
  "podId": "uuid",
  "amount": "50.00",
  "currency": "NGN",
  "status": "succeeded",
  "stripeReference": "pi_xxx",
  "totalContributed": "150.00"
}
```

#### **GET /v1/pods/subscriptions/active** (For Cron Job)
```typescript
Headers:
  X-Internal-API-Key: <INTERNAL_API_KEY>

Response:
[
  {
    "podId": "uuid",
    "membershipId": "uuid",
    "stripeSubscriptionId": "sub_xxx",
    "nextContributionDate": "2025-01-15T00:00:00Z",
    "graceEndsAt": "2025-01-20T00:00:00Z",
    "status": "active"
  }
]
```

#### **PATCH /v1/pods/{podId}/subscription/status** (For Cron Job)
```typescript
Headers:
  X-Internal-API-Key: <INTERNAL_API_KEY>

Request Body:
{
  "subscriptionId": "sub_xxx",
  "status": "active",
  "currentPeriodEnd": 1737158400
}
```

---

## Usage Guide

### Creating a Subscription When User Joins a Pod

```typescript
import { createPodSubscription } from "@/lib/services/stripeSubscriptionService";

// After user joins a pod and has a connected bank account
const result = await createPodSubscription({
  customerId: user.stripeCustomerId,
  bankAccountId: user.stripeBankAccountId,
  podId: pod.podId,
  membershipId: membership.id,
  amount: 5000, // ₦50.00 in kobo (NGN cents)
  currency: "NGN",
  nextContributionDate: new Date(pod.nextContributionDate),
  cadence: pod.cadence, // "bi-weekly" or "monthly"
  description: `Pod contribution - ${pod.planCode}`,
});

// Store subscription ID in your database
await updateMembership(membership.id, {
  stripeSubscriptionId: result.subscriptionId,
});
```

### Updating Next Contribution Date

```typescript
import { updateSubscriptionNextPaymentDate } from "@/lib/services/stripeSubscriptionService";

await updateSubscriptionNextPaymentDate(
  membership.stripeSubscriptionId,
  new Date("2025-02-01")
);
```

### Canceling a Subscription

```typescript
import { cancelPodSubscription } from "@/lib/services/stripeSubscriptionService";

// When user leaves a pod
await cancelPodSubscription(membership.stripeSubscriptionId);
```

### Manual Payment Retry

```typescript
import { retryFailedPayment } from "@/lib/services/stripeSubscriptionService";

// Retry a specific failed invoice
const result = await retryFailedPayment(invoiceId);

if (result.success) {
  console.log("Payment retry successful!");
}
```

---

## Payment Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Contribution Date Arrives                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Stripe charges   │
                    │ bank account     │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
            ✓ Success                ✗ Failed
                 │                       │
                 ▼                       ▼
    ┌────────────────────────┐  ┌──────────────────────┐
    │ invoice.payment_       │  │ invoice.payment_     │
    │ succeeded webhook      │  │ failed webhook       │
    └────────┬───────────────┘  └──────┬───────────────┘
             │                          │
             ▼                          ▼
    ┌────────────────────┐     ┌────────────────────────┐
    │ POST /payments     │     │ Record failed attempt  │
    │ status=succeeded   │     │ status=failed          │
    └────────┬───────────┘     └──────┬─────────────────┘
             │                         │
             ▼                         ▼
    ┌────────────────────┐     ┌────────────────────────┐
    │ Update             │     │ Stripe retries with    │
    │ totalContributed   │     │ exponential backoff:   │
    └────────────────────┘     │ - 1 hour               │
                               │ - 2 hours              │
                               │ - 4 hours              │
                               │ - 8 hours              │
                               │ ... until graceEndsAt  │
                               └────────────────────────┘
```

---

## Retry Logic

Stripe automatically retries failed payments using **Smart Retries**:

1. **Immediate retry** after 1 hour
2. **Second retry** after 2 hours (exponential)
3. **Third retry** after 4 hours
4. **Fourth retry** after 8 hours
5. Continues until subscription is canceled or `graceEndsAt` passes

Our system respects `graceEndsAt` from the pod data and will stop retrying after that date.

---

## Testing

### Testing Webhooks Locally

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Trigger test webhook:
   ```bash
   stripe trigger invoice.payment_succeeded
   ```

### Testing Cron Jobs Locally

```bash
curl -X GET http://localhost:3000/api/cron/sync-subscriptions \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Payment Methods

Stripe provides test bank accounts:

- **Successful:** `000123456789` (routing: `110000000`)
- **Failed:** `000111111116` (routing: `110000000`)

---

## Monitoring & Alerts

### Webhook Dashboard

Monitor webhook delivery at:
https://dashboard.stripe.com/webhooks

### Cron Job Logs

View cron execution logs in Vercel:
https://vercel.com/your-project/deployments → Logs

### Failed Payments

The cron job identifies:
- Payments due soon
- Active failed payments
- Grace periods ending within 2 days

---

## Troubleshooting

### Webhook not receiving events

1. Check webhook signing secret matches `.env`
2. Verify webhook URL is publicly accessible
3. Check Stripe Dashboard → Webhooks for delivery failures

### Subscription not charging automatically

1. Verify `billing_cycle_anchor` is set correctly
2. Check subscription status in Stripe Dashboard
3. Ensure payment method is still valid

### Cron job not running

1. Verify `vercel.json` is deployed
2. Check Vercel project settings → Cron Jobs
3. Ensure `CRON_SECRET` is set in Vercel environment variables

---

## Security Considerations

1. **Webhook Signature Verification**: Always verify `stripe-signature` header
2. **Cron Authentication**: Use `CRON_SECRET` to prevent unauthorized execution
3. **Internal API Key**: Use separate key for backend communication
4. **HTTPS Only**: Never expose webhook endpoints over HTTP

---

## Currency Support

Current implementation supports:
- **NGN (Nigerian Naira)** - Primary
- **USD (US Dollar)** - For testing
- **Other currencies** - Add as needed by updating `stripeSubscriptionService.ts`

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure Stripe webhooks
3. ✅ Set environment variables
4. ✅ Test with Stripe test mode
5. ✅ Monitor first real subscription
6. ✅ Set up alerts for failed payments

---

## Support & Documentation

- [Stripe Subscriptions Docs](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Stripe Direct Debit](https://stripe.com/docs/payments/ach-debit)

---

## License

Internal Koajo Documentation - Confidential
