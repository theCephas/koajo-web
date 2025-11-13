# Quick Start Guide - Stripe Recurring Subscriptions

Get Koajo's automated pod contribution system up and running in 15 minutes.

---

## 🚀 Quick Setup (5 Steps)

### **Step 1: Environment Variables** (2 min)

Copy these to your `.env.local`:

```bash
# Required - Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Required - Your backend API
NEXT_PUBLIC_API_URL=https://api.koajo.com

# Generate random secrets
CRON_SECRET=$(openssl rand -base64 32)
INTERNAL_API_KEY=$(openssl rand -base64 32)

# Bank connection callback
NEXT_PUBLIC_BANK_CONNECTION_RETURN_PATH=/register/kyc
```

### **Step 2: Configure Stripe Webhook** (3 min)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** → Paste into `STRIPE_WEBHOOK_SECRET`

### **Step 3: Deploy to Vercel** (5 min)

```bash
# Commit changes
git add .
git commit -m "feat: add Stripe recurring subscriptions"
git push origin main

# Vercel auto-deploys
# Cron job activates automatically via vercel.json
```

### **Step 4: Add Environment Vars to Vercel** (3 min)

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add all variables from `.env.local`
3. Redeploy: `vercel --prod`

### **Step 5: Test** (2 min)

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger invoice.payment_succeeded

# Test cron job
curl https://your-domain.com/api/cron/sync-subscriptions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📝 Integration Code (Copy & Paste)

### **When User Joins Pod**

```typescript
import { createPodSubscription } from "@/lib/services/stripeSubscriptionService";

async function handleJoinPod(userId: string, pod: any, user: any) {
  // Create subscription
  const subscription = await createPodSubscription({
    customerId: user.stripeCustomerId,
    bankAccountId: user.stripeBankAccountId,
    podId: pod.podId,
    membershipId: pod.membershipId,
    amount: pod.amount, // in cents/kobo
    currency: "NGN",
    nextContributionDate: new Date(pod.nextContributionDate),
    cadence: pod.cadence, // "bi-weekly" or "monthly"
  });

  // Save subscription ID to database
  await updateMembership(pod.membershipId, {
    stripeSubscriptionId: subscription.subscriptionId,
  });

  return subscription;
}
```

### **When User Leaves Pod**

```typescript
import { cancelPodSubscription } from "@/lib/services/stripeSubscriptionService";

async function handleLeavePod(subscriptionId: string) {
  await cancelPodSubscription(subscriptionId);
}
```

### **Check Contribution Status**

```typescript
import { isContributionDue } from "@/lib/utils/payment-utils";

function ContributionBadge({ pod }: { pod: any }) {
  const isDue = isContributionDue(
    pod.nextContributionDate,
    pod.graceEndsAt
  );

  if (isDue) {
    return <div className="badge-warning">⏰ Processing...</div>;
  }

  return (
    <div className="badge-success">
      ✓ Next: {new Date(pod.nextContributionDate).toLocaleDateString()}
    </div>
  );
}
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Webhook endpoint responds: `POST https://your-domain.com/api/webhooks/stripe`
- [ ] Cron job accessible: `GET https://your-domain.com/api/cron/sync-subscriptions`
- [ ] Stripe webhook shows "Succeeded" delivery status
- [ ] Vercel cron job appears in project settings
- [ ] Test subscription created successfully
- [ ] Test payment recorded in backend

---

## 🎯 What Happens Automatically

### **On Contribution Date**
1. Stripe charges user's bank account
2. Webhook fires: `invoice.payment_succeeded`
3. System records payment via `POST /payments`
4. Backend updates `totalContributed`

### **On Payment Failure**
1. Webhook fires: `invoice.payment_failed`
2. Stripe retries automatically (1hr, 2hr, 4hr, 8hr...)
3. System records failed attempt
4. Continues retrying until `graceEndsAt`

### **Daily at 00:00 UTC**
1. Cron job checks all active subscriptions
2. Syncs Stripe status with backend
3. Identifies upcoming contributions
4. Alerts on grace periods ending soon

---

## 📱 User Experience

```
User joins pod
  ↓
[Subscription created automatically]
  ↓
On contribution date
  ↓
Bank account debited ₦X.XX
  ↓
User receives confirmation notification
  ↓
Dashboard shows updated "Total Contributed"
```

If payment fails:
```
Payment fails
  ↓
[System retries automatically]
  ↓
Grace period active (X days remaining)
  ↓
User receives reminder to update payment method
  ↓
If fixed: Payment succeeds on next retry
If not fixed: Membership suspended after grace period
```

---

## 🐛 Troubleshooting

### **Webhook not receiving events**
```bash
# Check webhook secret matches
echo $STRIPE_WEBHOOK_SECRET

# View Stripe webhook logs
# Dashboard → Webhooks → Your endpoint → Logs

# Test locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### **Cron job not running**
```bash
# Verify vercel.json deployed
cat vercel.json

# Check Vercel cron settings
# Dashboard → Project → Settings → Cron Jobs

# Test manually
curl -X GET https://your-domain.com/api/cron/sync-subscriptions \
  -H "Authorization: Bearer $CRON_SECRET"
```

### **Subscription not charging**
```bash
# Check subscription in Stripe Dashboard
# Billing → Subscriptions → Search by pod ID

# Verify billing_cycle_anchor is set
# Check subscription.current_period_end

# Ensure payment method is valid
```

---

## 📚 Documentation

- **Full Setup Guide**: [STRIPE_SUBSCRIPTION_SETUP.md](STRIPE_SUBSCRIPTION_SETUP.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Code Examples**: [lib/examples/subscription-integration-example.ts](lib/examples/subscription-integration-example.ts)

---

## ✅ Production Checklist

Before going live:

- [ ] Switch to Stripe live keys (`sk_live_...`, `pk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test with real bank account in test mode first
- [ ] Set up monitoring/alerting
- [ ] Configure user notifications for failed payments
- [ ] Test grace period flow end-to-end
- [ ] Document runbook for handling payment issues
- [ ] Train support team on subscription management

---

## 🎉 You're Ready!

Your automated pod contribution system is now live. Stripe will:
- ✅ Charge users automatically on contribution dates
- ✅ Retry failed payments intelligently
- ✅ Record all transactions in your backend
- ✅ Monitor subscription health daily

No manual intervention required! 🚀
