# System Architecture - Stripe Recurring Subscriptions

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          KOAJO FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐      ┌────────────────────┐                    │
│  │  User Interface    │      │  Server Actions    │                    │
│  │  - Join Pod        │─────▶│  - Create Sub      │                    │
│  │  - Leave Pod       │      │  - Cancel Sub      │                    │
│  │  - View Status     │      │  - Retry Payment   │                    │
│  └────────────────────┘      └─────────┬──────────┘                    │
│                                         │                                │
│                              ┌──────────▼──────────┐                    │
│                              │  Services Layer     │                    │
│                              ├─────────────────────┤                    │
│                              │ Subscription Svc    │                    │
│                              │ Payment Svc         │                    │
│                              │ Payment Utils       │                    │
│                              └─────────┬───────────┘                    │
│                                        │                                │
└────────────────────────────────────────┼────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌───────────────────┐ ┌─────────────────┐ ┌──────────────────┐
        │  STRIPE API       │ │  KOAJO BACKEND  │ │  VERCEL CRON     │
        │                   │ │                  │ │                  │
        │ - Subscriptions   │ │ - POST /payments│ │ - Daily Sync     │
        │ - Payment Intents │ │ - GET /pods     │ │ - 00:00 UTC      │
        │ - Webhooks        │ │ - PATCH /status │ │                  │
        └─────────┬─────────┘ └─────────────────┘ └──────────────────┘
                  │
                  │ Webhook Events
                  │
                  ▼
        ┌─────────────────────┐
        │  WEBHOOK HANDLER    │
        │  /api/webhooks/     │
        │  stripe/route.ts    │
        │                     │
        │ - Verify signature  │
        │ - Process events    │
        │ - Record payments   │
        └─────────────────────┘
```

---

## 🔄 Subscription Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SUBSCRIPTION LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────┘

1. CREATION
   User joins pod
        │
        ▼
   [createPodSubscription()]
        │
        ├─ Create Stripe Product
        ├─ Create Stripe Price (recurring)
        ├─ Create Stripe Subscription
        │  └─ billing_cycle_anchor = nextContributionDate
        │
        ├─ Store subscriptionId in database
        │
        └─ Status: "active"

2. ACTIVE BILLING
   On billing_cycle_anchor date
        │
        ▼
   Stripe generates invoice
        │
        ▼
   Stripe attempts payment
        │
        ├─ SUCCESS ──────────────┐
        │                        │
        └─ FAILURE               │
             │                   │
             ▼                   ▼
        Retry Logic         invoice.payment_succeeded
        (exponential)            │
             │                   ▼
             │              Record payment
             │              POST /payments
             │                   │
             │                   ▼
             │              Update totalContributed
             │
             ├─ Retry 1 (1hr)
             ├─ Retry 2 (2hr)
             ├─ Retry 3 (4hr)
             ├─ Retry 4 (8hr)
             └─ Continue until graceEndsAt

3. GRACE PERIOD
   Payment failed
        │
        ▼
   Check graceEndsAt
        │
        ├─ Within grace ────▶ Continue retrying
        │
        └─ Past grace ──────▶ Stop retrying
                                   │
                                   ▼
                              Mark as failed

4. CANCELLATION
   User leaves pod
        │
        ▼
   [cancelPodSubscription()]
        │
        ├─ Cancel Stripe subscription
        ├─ Remove subscriptionId from DB
        └─ Status: "canceled"
```

---

## 📊 Data Flow

### **Payment Success Flow**

```
Stripe charges bank account
         │
         ▼
┌─────────────────────────┐
│ invoice.payment_        │
│ succeeded event         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Webhook Handler         │
│ /api/webhooks/stripe    │
├─────────────────────────┤
│ 1. Verify signature     │
│ 2. Extract metadata     │
│    - podId              │
│    - amount             │
│    - stripeReference    │
│ 3. Call backend API     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Backend API             │
│ POST /v1/payments       │
├─────────────────────────┤
│ {                       │
│   podId: "uuid",        │
│   stripeReference: "pi",│
│   amount: 5000,         │
│   currency: "NGN",      │
│   status: "succeeded"   │
│ }                       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Database Updates        │
├─────────────────────────┤
│ - Create payment record │
│ - Update membership:    │
│   totalContributed += X │
│   contributionProgress++│
│ - Calculate next date   │
└─────────────────────────┘
```

### **Payment Failure Flow**

```
Stripe payment fails
         │
         ▼
┌─────────────────────────┐
│ invoice.payment_        │
│ failed event            │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Webhook Handler         │
├─────────────────────────┤
│ 1. Verify signature     │
│ 2. Extract metadata     │
│ 3. Record failed attempt│
│ 4. Check attempt count  │
└──────────┬──────────────┘
           │
           ├─ attemptCount < 4
           │  └─ Wait for Stripe auto-retry
           │
           └─ attemptCount >= 4
              └─ Alert user
                   │
                   ▼
              ┌─────────────────────┐
              │ Notification System │
              ├─────────────────────┤
              │ - Email user        │
              │ - Push notification │
              │ - In-app alert      │
              │ "Payment failing"   │
              │ "X days until grace"│
              └─────────────────────┘
```

---

## ⏰ Cron Job Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL CRON JOB (Daily 00:00 UTC)                │
└─────────────────────────────────────────────────────────────────────┘

Trigger: Vercel Cron
    │
    ▼
GET /api/cron/sync-subscriptions
    │
    ├─ Verify authorization (CRON_SECRET)
    │
    ▼
Fetch active pod memberships
    │
    └─ GET /v1/pods/subscriptions/active
         │
         └─ Returns: [{podId, subscriptionId, nextDate, graceEndsAt}]
              │
              ▼
For each subscription:
    │
    ├─ Get Stripe subscription details
    │     │
    │     └─ stripe.subscriptions.retrieve(id)
    │
    ├─ Check status
    │     │
    │     ├─ active ────────▶ ✅ All good
    │     │
    │     ├─ past_due ──────▶ ⚠️  Failed payment detected
    │     │                      │
    │     │                      └─ Check graceEndsAt
    │     │                           │
    │     │                           ├─ < 2 days ──▶ 🚨 Alert urgent
    │     │                           └─ > 2 days ──▶ ⏰ Monitor
    │     │
    │     └─ canceled ──────▶ ❌ Sync status to backend
    │
    └─ Update backend
          │
          └─ PATCH /v1/pods/{id}/subscription/status
               {
                 subscriptionId: "sub_xxx",
                 status: "active",
                 currentPeriodEnd: 1234567890
               }

Return summary:
    {
      synced: 150,
      dueSoon: 23,
      failedPayments: 5,
      graceEnding: 2
    }
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────────┘

1. WEBHOOK SECURITY
   ┌──────────────────┐
   │ Stripe Webhook   │
   │ Request          │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Signature Verification       │
   ├──────────────────────────────┤
   │ stripe.webhooks.             │
   │   constructEvent(            │
   │     body,                    │
   │     signature,               │
   │     WEBHOOK_SECRET           │
   │   )                          │
   └────────┬─────────────────────┘
            │
            ├─ Valid ──────▶ Process event
            │
            └─ Invalid ────▶ Return 400 error

2. CRON JOB SECURITY
   ┌──────────────────┐
   │ Cron Request     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Authorization Check          │
   ├──────────────────────────────┤
   │ Header: Authorization        │
   │ Expected: Bearer CRON_SECRET │
   └────────┬─────────────────────┘
            │
            ├─ Match ──────▶ Execute job
            │
            └─ No match ───▶ Return 401

3. BACKEND API SECURITY
   ┌──────────────────┐
   │ Internal API     │
   │ Call             │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ API Key Verification         │
   ├──────────────────────────────┤
   │ Header: X-Internal-API-Key   │
   │ Validates server-to-server   │
   └────────┬─────────────────────┘
            │
            ├─ Valid ──────▶ Process request
            │
            └─ Invalid ────▶ Return 403

4. HTTPS ENFORCEMENT
   All endpoints require HTTPS
   No HTTP allowed in production
```

---

## 📦 Component Breakdown

### **Service Layer**

```
lib/services/
│
├── stripeSubscriptionService.ts
│   ├── createPodSubscription()
│   │   └── Creates Stripe subscription with billing anchor
│   │
│   ├── updateSubscriptionNextPaymentDate()
│   │   └── Updates billing cycle for date changes
│   │
│   ├── cancelPodSubscription()
│   │   └── Cancels active subscription
│   │
│   ├── retryFailedPayment()
│   │   └── Manual retry logic for invoices
│   │
│   └── getSubscriptionDetails()
│       └── Fetches current subscription state
│
└── paymentService.ts
    ├── recordPayment()
    │   └── Records payment in backend via POST /payments
    │
    └── getPodsWithUpcomingContributions()
        └── Fetches pods for cron job monitoring
```

### **API Routes**

```
app/api/
│
├── webhooks/stripe/route.ts
│   ├── POST handler
│   │   ├── Verify webhook signature
│   │   ├── Route to event handlers:
│   │   │   ├── invoice.payment_succeeded
│   │   │   ├── invoice.payment_failed
│   │   │   ├── customer.subscription.updated
│   │   │   └── payment_intent.*
│   │   └── Return 200 OK
│   │
│   └── Event Handlers
│       ├── handleInvoicePaymentSucceeded()
│       ├── handleInvoicePaymentFailed()
│       ├── handleSubscriptionUpdated()
│       └── handlePaymentIntentSucceeded()
│
└── cron/sync-subscriptions/route.ts
    ├── GET handler (Vercel triggers)
    ├── POST handler (manual trigger)
    │
    └── Sync Logic
        ├── fetchActivePodMemberships()
        ├── getSubscriptionDetails()
        └── updatePodSubscriptionStatus()
```

### **Utilities**

```
lib/utils/payment-utils.ts
│
├── Date Functions
│   ├── isToday()
│   ├── isPast()
│   ├── isFuture()
│   ├── isContributionDue()
│   └── isWithinGracePeriod()
│
├── Retry Logic
│   ├── calculateNextRetryTime()
│   ├── shouldRetryPayment()
│   └── DEFAULT_RETRY_STRATEGY
│
├── Grace Period
│   └── getDaysRemainingInGracePeriod()
│
├── Currency
│   ├── centsToMajor()
│   ├── majorToCents()
│   └── formatCurrency()
│
└── Validation
    ├── isValidContributionDate()
    └── parseDate()
```

---

## 🔌 Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                          │
└─────────────────────────────────────────────────────────────────────┘

STRIPE API
    │
    ├─ Subscriptions API
    │  └─ Create, update, cancel subscriptions
    │
    ├─ Payment Intents API
    │  └─ Manual payment processing
    │
    ├─ Invoices API
    │  └─ Retry failed payments
    │
    ├─ Webhooks API
    │  └─ Real-time event notifications
    │
    └─ Financial Connections API
       └─ Bank account linking (already implemented)

KOAJO BACKEND API
    │
    ├─ POST /v1/payments
    │  └─ Record successful/failed payments
    │
    ├─ GET /v1/pods/subscriptions/active
    │  └─ Fetch active subscriptions for cron
    │
    ├─ PATCH /v1/pods/{id}/subscription/status
    │  └─ Update subscription status from cron
    │
    └─ GET /v1/pods/mine
       └─ Fetch user's pod memberships

VERCEL PLATFORM
    │
    ├─ Cron Jobs
    │  └─ Trigger /api/cron/sync-subscriptions daily
    │
    ├─ Edge Functions
    │  └─ Host API routes globally
    │
    └─ Environment Variables
       └─ Secure secrets storage
```

---

## 🎯 Performance Considerations

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PERFORMANCE OPTIMIZATION                        │
└─────────────────────────────────────────────────────────────────────┘

WEBHOOK PROCESSING
    ├─ Signature verification: <10ms
    ├─ Event routing: <5ms
    ├─ Payment recording: <200ms
    └─ Total webhook response: <250ms

CRON JOB EXECUTION
    ├─ Fetch subscriptions: <500ms
    ├─ Per-subscription check: <100ms
    ├─ 100 subscriptions: ~10 seconds
    └─ Timeout limit: 10 minutes (Vercel)

STRIPE API RATE LIMITS
    ├─ Test mode: 100 req/sec
    ├─ Live mode: 100 req/sec
    └─ Webhook delivery: Automatic retry with backoff

SCALING CONSIDERATIONS
    ├─ Webhooks: Stateless, auto-scales
    ├─ Cron: Single instance, processes all
    └─ Future: Batch processing for >1000 subscriptions
```

---

## 📈 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MONITORING STACK                             │
└─────────────────────────────────────────────────────────────────────┘

STRIPE DASHBOARD
    ├─ Webhook delivery status
    ├─ Subscription health
    ├─ Payment success rate
    └─ Failed payment alerts

VERCEL LOGS
    ├─ Function execution logs
    ├─ Cron job execution history
    ├─ Error tracking
    └─ Performance metrics

APPLICATION METRICS
    ├─ Successful payments / day
    ├─ Failed payments / day
    ├─ Active subscriptions count
    ├─ Grace period alerts count
    └─ Retry success rate

ALERTS (TO IMPLEMENT)
    ├─ Webhook delivery failure
    ├─ Cron job execution failure
    ├─ Payment failure spike
    └─ Grace period expiration imminent
```

---

This architecture ensures:
- ✅ Automated, hands-off operation
- ✅ Resilient payment processing
- ✅ Secure webhook handling
- ✅ Scalable subscription management
- ✅ Real-time payment recording
- ✅ Proactive failure detection
