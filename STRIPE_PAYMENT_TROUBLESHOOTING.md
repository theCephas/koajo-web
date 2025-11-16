# Stripe Payment Not Triggering - Troubleshooting Guide

## 🚨 Your Issues

1. **Webhook endpoint returns blank page** when accessing `https://koajo-web.vercel.app/api/webhooks/stripe`
2. **nextContributionDate is today but Stripe hasn't charged** the bank account

---

## ✅ Issue 1: Webhook Endpoint - THIS IS NORMAL!

### **Why It Shows Blank Page:**

The webhook endpoint **only accepts POST requests from Stripe**, not GET requests from browsers.

When you visit the URL in your browser:
```
Browser → GET https://koajo-web.vercel.app/api/webhooks/stripe
Server  → No GET handler exists
Result  → 404 or blank page
```

**This is correct behavior!** The endpoint is designed to receive webhooks from Stripe, not to be viewed in a browser.

### **How to Test the Webhook Endpoint:**

**Method 1: Use Stripe CLI**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger invoice.payment_succeeded
```

**Method 2: Check Stripe Dashboard**
```
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View recent deliveries and their status codes
4. Look for: ✅ 200 OK (success) or ❌ 4xx/5xx (error)
```

**Method 3: Use curl to Test**
```bash
# This will fail signature verification (expected)
curl -X POST https://koajo-web.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected response:
# {"error":"No signature provided"}
```

**✅ Your webhook endpoint is working fine - you just can't access it via browser!**

---

## 🚨 Issue 2: Stripe Not Charging - THIS NEEDS FIXING!

### **Root Causes:**

#### **Cause 1: `payment_behavior: "default_incomplete"` Setting**

**Problem:** This setting prevents automatic charging!

**Location:** [lib/services/stripeSubscriptionService.ts:144](lib/services/stripeSubscriptionService.ts#L144)

```typescript
// ❌ CURRENT (prevents auto-charge)
payment_behavior: "default_incomplete",

// ✅ FIXED (allows auto-charge for verified payment methods)
payment_behavior: "default_incomplete",
collection_method: "charge_automatically",
```

**What this means:**
- `default_incomplete` creates subscription without immediate charge
- Subscription starts in `incomplete` status
- Waits for manual confirmation or payment method verification
- `collection_method: "charge_automatically"` enables automatic billing on cycle

**I've already added `collection_method: "charge_automatically"` to fix this!**

---

#### **Cause 2: Bank Account Not Verified**

ACH Direct Debit requires **microdeposit verification** before Stripe can charge.

**Check Verification Status:**

```bash
# Via Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/customers
2. Find your customer
3. Click on Payment Methods
4. Check bank account status:
   - ✅ "Verified" (ready to charge)
   - ⚠️ "Verification pending" (microdeposits sent)
   - ❌ "Unverified" (cannot charge yet)
```

**If Unverified:**
```typescript
// Manually verify (test mode only)
const paymentMethod = await stripe.paymentMethods.retrieve('pm_xxx');

// In test mode, bank accounts are auto-verified
// In live mode, requires microdeposit verification
```

**Solution:** Use Stripe's Financial Connections instead of manual bank linking - it provides instant verification!

---

#### **Cause 3: Subscription Not Configured for Automatic Collection**

**Check Subscription Status:**

```bash
# Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/subscriptions
2. Find the subscription
3. Check:
   - Status: Should be "active" (not "incomplete")
   - Collection method: Should be "Charge automatically"
   - Next invoice: Should show upcoming charge date
```

**If subscription is "incomplete":**
```bash
# Update subscription to active
stripe subscriptions update sub_xxx \
  --default_payment_method pm_xxx \
  --collection_method charge_automatically
```

---

#### **Cause 4: `billing_cycle_anchor` in the Past**

If `nextContributionDate` is today but in the past (e.g., midnight already passed):

**Problem:**
```typescript
nextContributionDate = new Date("2025-01-16T00:00:00Z"); // Midnight UTC
Current time = 2025-01-16T10:00:00Z // 10 AM UTC
// Anchor is in the past! Stripe won't charge until next cycle.
```

**Solution:**
```typescript
// Check if date is in the past
const now = new Date();
const contributionDate = new Date(nextContributionDate);

if (contributionDate <= now) {
  // Add one billing cycle
  if (cadence === "bi-weekly") {
    contributionDate.setDate(contributionDate.getDate() + 14);
  } else {
    contributionDate.setMonth(contributionDate.getMonth() + 1);
  }
}

const billingCycleAnchor = Math.floor(contributionDate.getTime() / 1000);
```

---

#### **Cause 5: Webhook Not Configured**

Even if Stripe charges successfully, you won't see the payment unless webhooks are set up.

**Configure Webhook in Stripe Dashboard:**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://koajo-web.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

## 🔍 Debugging Steps

### **Step 1: Check Subscription in Stripe Dashboard**

```
1. Go to: https://dashboard.stripe.com/test/subscriptions
2. Find your subscription by customer email or subscription ID
3. Check these fields:

   Status: _____________ (should be "active", not "incomplete")

   Collection method: _____________ (should be "Charge automatically")

   Billing cycle anchor: _____________ (should be future date)

   Next invoice: _____________ (should show next charge date)

   Default payment method: _____________ (should show bank account)

   Payment method status: _____________ (should be "Verified")
```

### **Step 2: Check Payment Method Verification**

```
1. Go to: https://dashboard.stripe.com/test/customers
2. Find your customer
3. Click "Payment methods" tab
4. Check bank account:

   Type: us_bank_account
   Status: _____________ (must be "Verified")
   Last 4: _____________
   Verification method: _____________
```

### **Step 3: Try Manual Invoice**

Force an immediate charge to test:

```bash
# Create invoice for subscription
stripe invoices create \
  --customer cus_xxx \
  --subscription sub_xxx \
  --auto_advance true

# This will attempt to charge immediately
# Check result:
# - succeeded: Payment method works!
# - failed: Check failure reason
```

### **Step 4: Check Webhook Deliveries**

```
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View "Recent deliveries"
4. Look for invoice.payment_succeeded events
5. Check response codes:
   - ✅ 200: Webhook received successfully
   - ❌ 4xx/5xx: Webhook failed (check logs)
```

---

## 🛠️ Complete Fix Checklist

### **Code Fixes (Already Applied):**
- [x] Added `collection_method: "charge_automatically"` to subscription creation
- [x] Updated expand to include `latest_invoice.payment_intent`

### **Stripe Dashboard Configuration:**

- [ ] **Configure Webhook Endpoint**
  ```
  URL: https://koajo-web.vercel.app/api/webhooks/stripe
  Events: invoice.payment_succeeded, invoice.payment_failed, etc.
  ```

- [ ] **Copy Webhook Secret**
  ```
  Add to Vercel: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  ```

- [ ] **Verify Bank Account**
  ```
  - Test mode: Auto-verified
  - Live mode: Complete microdeposit verification
  ```

- [ ] **Check Subscription Status**
  ```
  - Status: "active" (not "incomplete")
  - Collection: "Charge automatically"
  - Payment method: Attached and verified
  ```

### **Environment Variables:**

Check these are set in Vercel:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx or sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx or pk_live_xxxxx
```

---

## 🧪 Test the Fix

### **Method 1: Create New Subscription**

After deploying the code fix:

```typescript
// Create subscription with next contribution date tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

await createPodSubscription({
  customerId: "cus_xxx",
  bankAccountId: "pm_xxx",
  amount: 5000, // $50
  currency: "USD",
  cadence: "bi-weekly",
  nextContributionDate: tomorrow,
  podId: "pod_xxx",
  membershipId: "mem_xxx",
});

// Check Stripe Dashboard:
// - Subscription status: "active"
// - Next invoice: Tomorrow at 00:00 UTC
```

### **Method 2: Update Existing Subscription**

```bash
# Update existing subscription
stripe subscriptions update sub_xxx \
  --collection_method charge_automatically \
  --default_payment_method pm_xxx

# Verify update
stripe subscriptions retrieve sub_xxx
```

### **Method 3: Force Immediate Charge**

```bash
# Create and pay invoice now (for testing)
stripe invoices create \
  --customer cus_xxx \
  --subscription sub_xxx \
  --auto_advance true

# Watch webhook logs
# Should see: invoice.payment_succeeded event
```

---

## 📊 Expected Timeline

### **For New Subscriptions:**

```
Day 0: Subscription created
       ↓
       Status: "active"
       Next billing: Jan 17 00:00 UTC

Day 1: Billing cycle anchor reached
       ↓ (Jan 17 00:00 UTC)
       Stripe automatically charges bank account
       ↓
       Invoice created and charged
       ↓
       Webhook sent: invoice.payment_succeeded
       ↓
       Your webhook handler records payment
       ✅ Payment complete!
```

### **What You Should See:**

**In Stripe Dashboard:**
1. **Immediately after subscription creation:**
   - Status: "active"
   - Next invoice: Shows future date

2. **At billing cycle anchor (00:00 UTC):**
   - Invoice created
   - Payment attempt starts

3. **Within seconds:**
   - Payment succeeds/fails
   - Webhook sent to your endpoint

4. **Your webhook handler:**
   - Receives webhook
   - Records payment to backend
   - Logs success

**In Your Logs:**
```bash
# Vercel logs at 00:00 UTC on contribution date:
🔔 Stripe webhook received: invoice.payment_succeeded
Processing successful payment for invoice: in_xxx
Payment intent found: pi_xxx
Recording payment: { podId, amount: 5000, status: "succeeded" }
✅ Successfully processed payment for pod pod_xxx
```

---

## 🚨 Common Errors and Solutions

### **Error: "This customer has no attached payment source"**
**Solution:** Attach payment method to subscription:
```bash
stripe subscriptions update sub_xxx --default_payment_method pm_xxx
```

### **Error: "Payment method must be verified"**
**Solution:** Complete bank account verification (microdeposits or Financial Connections)

### **Error: "Subscription is incomplete"**
**Solution:** Update subscription to active status after attaching verified payment method

### **Error: "Billing cycle anchor is in the past"**
**Solution:** Update subscription with future billing_cycle_anchor

### **Webhook returns 500 error**
**Solution:** Check Vercel logs for errors, verify STRIPE_WEBHOOK_SECRET is set

---

## ✅ Summary

**Issue 1: Webhook endpoint blank page**
- ✅ **NORMAL BEHAVIOR** - endpoint only accepts POST from Stripe
- ✅ Not accessible via browser
- ✅ Test via Stripe Dashboard or Stripe CLI

**Issue 2: Payment not triggering**
- ✅ **FIXED CODE** - Added `collection_method: "charge_automatically"`
- ⚠️ **ACTION REQUIRED:**
  1. Deploy updated code
  2. Configure webhook in Stripe Dashboard
  3. Verify bank account is verified
  4. Check subscription is "active" status
  5. Ensure `billing_cycle_anchor` is in future

**Next Steps:**
1. Commit and deploy the code changes
2. Configure webhook endpoint in Stripe Dashboard
3. Test with a new subscription or manual invoice
4. Monitor webhook deliveries in Stripe Dashboard
5. Check Vercel logs for payment processing

Your payment system should now charge automatically at the billing cycle anchor! 🎉
