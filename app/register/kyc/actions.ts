"use server";

import Stripe from "stripe";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants/api";

type VerificationType = "document" | "id_number";

type CreateVerificationSessionInput = {
  userId: string;
  email: string;
  type: VerificationType;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  origin?: string | null;
};

export type RetrieveVerificationSessionResult = {
  session: {
    id: string;
    status: Stripe.Identity.VerificationSession.Status;
    type: Stripe.Identity.VerificationSession.Type;
    created: number;
    last_error: Stripe.Identity.VerificationSession.LastError | null;
    metadata: Stripe.Metadata | null;
  };
  verificationReport: {
    id: string;
    type: Stripe.Identity.VerificationReport.Type;
    created: number;
  } | null;
  firstName: string | null;
  lastName: string | null;
  ssnLast4: string | null;
  address: Stripe.Address | null;
};

type EnsureStripeCustomerInput = {
  token: string;
  userId: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  customerId?: string | null;
  ssnLast4?: string | null;
  address?: unknown;
};

type EnsureStripeCustomerResult = {
  customerId: string;
  customer: Pick<Stripe.Customer, "id" | "email" | "phone" | "name">;
};

type CreateFinancialConnectionsSessionInput = {
  customerId: string;
  permissions?: Stripe.FinancialConnections.SessionCreateParams.Permission[];
  filters?: Stripe.FinancialConnections.SessionCreateParams.Filters;
  prefetch?: Stripe.FinancialConnections.SessionCreateParams.Prefetch[];
  origin?: string | null;
};

type CreateFinancialConnectionsSessionResult = {
  sessionId: string;
  clientSecret: string | null;
};

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-08-27.basil";
const BANK_CONNECTION_RETURN_PATH =
  process.env.NEXT_PUBLIC_BANK_CONNECTION_RETURN_PATH || "";
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

const normalizeOrigin = (origin?: string | null): string => {
  const fallback = process.env.NEXT_PUBLIC_BASE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : `https://${process.env.NEXT_PUBLIC_BASE_URL ?? "app.koajo.com"}`;
  const fallbackOrigin = fallback.replace(/\/$/, "");

  if (!origin) return fallbackOrigin;

  const candidate = origin.startsWith("http") ? origin : `https://${origin}`;

  try {
    const url = new URL(candidate);

    // Stripe requires https endpoints and does not accept localhost callbacks
    const isLocalHost = /localhost|127\.0\.0\.1/i.test(url.hostname);
    if (isLocalHost) {
      return fallbackOrigin;
    }

    if (url.protocol !== "https:") {
      url.protocol = "https:";
    }

    return url.origin;
  } catch {
    return fallbackOrigin;
  }
};

const buildBankReturnUrl = (origin: string): string => {
  const normalizedPath = BANK_CONNECTION_RETURN_PATH.startsWith("/")
    ? BANK_CONNECTION_RETURN_PATH
    : `/${BANK_CONNECTION_RETURN_PATH}`;
  return `${origin}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1");
};

const persistStripeCustomerReference = async ({
  token,
  stripeCustomerId,
  ssnLast4,
  address,
}: {
  token: string;
  stripeCustomerId: string;
  ssnLast4?: string | null;
  address?: unknown;
}) => {
  const url = getApiUrl(API_ENDPOINTS.AUTH.STRIPE_CUSTOMER);
  const payload: Record<string, unknown> = {
    id: stripeCustomerId,
  };

  if (ssnLast4) {
    payload.ssn_last4 = ssnLast4;
  }

  if (address) {
    payload.address =
      typeof address === "string" ? address : JSON.stringify(address);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(async () => ({ message: await response.text().catch(() => "") }));
    const message =
      (errorBody && (errorBody.message || errorBody.error)) ||
      "Failed to persist Stripe customer.";
    throw new Error(message);
  }
};

const retrieveStripeCustomer = async (
  stripe: Stripe,
  customerId: string
): Promise<Stripe.Customer | null> => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as Stripe.errors.StripeError).code === "resource_missing"
    ) {
      return null;
    }

    throw error;
  }
};

export async function createVerificationSessionAction(
  input: CreateVerificationSessionInput
) {
  const stripe = getStripe();
  const returnOrigin = normalizeOrigin(input.origin);

  const metadata: Stripe.MetadataParam = {
    user_id: input.userId,
    email: input.email,
  };

  if (input.phone) {
    metadata.phone = input.phone;
  }
  if (input.firstName) {
    metadata.first_name = input.firstName;
  }
  if (input.lastName) {
    metadata.last_name = input.lastName;
  }

  const providedDetails: Stripe.Identity.VerificationSessionCreateParams.ProvidedDetails =
    {
      email: input.email,
    };

  if (input.phone) {
    providedDetails.phone = input.phone;
  }

  const options:
    | Stripe.Identity.VerificationSessionCreateParams.Options
    | undefined =
    input.type === "document"
      ? {
          document: {
            allowed_types: ["driving_license", "passport", "id_card"],
            require_live_capture: true,
            require_matching_selfie: true,
          },
        }
      : undefined;

  const sessionParams: Stripe.Identity.VerificationSessionCreateParams = {
    type: input.type,
    client_reference_id: input.userId,
    provided_details: providedDetails,
    metadata,
    return_url: `${returnOrigin}/register/kyc?${input.type}=submitted`,
  };

  if (options) {
    sessionParams.options = options;
  }

  const session = await stripe.identity.verificationSessions.create(
    sessionParams
  );

  return {
    clientSecret: session.client_secret,
    verificationUrl: session.url,
    sessionId: session.id,
  };
}

export async function retrieveVerificationSessionAction(
  sessionId: string
): Promise<RetrieveVerificationSessionResult> {
  if (!sessionId) {
    throw new Error("Verification session ID is required.");
  }

  console.log("🔍 [Stripe API] Retrieving verification session:", sessionId);

  const stripe = getStripe();
  const session = await stripe.identity.verificationSessions.retrieve(
    sessionId,
    {
      expand: ["last_verification_report"],
    }
  );

  console.log("📡 [Stripe API] Session retrieved:", {
    id: session.id,
    status: session.status,
    type: session.type,
    created: new Date(session.created * 1000).toISOString(),
    lastError: session.last_error,
    hasReport: !!session.last_verification_report,
  });

  let firstName: string | null = null;
  let lastName: string | null = null;
  let ssnLast4: string | null = null;
  let address: Stripe.Address | null = null;
  let verificationReport: RetrieveVerificationSessionResult["verificationReport"] =
    null;

  const reportId =
    typeof session.last_verification_report === "string"
      ? session.last_verification_report
      : session.last_verification_report?.id;

  if (reportId) {
    console.log("📄 [Stripe API] Retrieving verification report:", reportId);

    const report = (await stripe.identity.verificationReports.retrieve(
      reportId
    )) as Stripe.Identity.VerificationReport & {
      verified_outputs?: {
        document?: { name?: string };
        id_number?: {
          first_name?: string;
          last_name?: string;
          ssn_last4?: string;
          address?: Stripe.Address;
        };
      };
    };

    console.log("📋 [Stripe API] Verification report:", {
      id: report.id,
      type: report.type,
      created: new Date(report.created * 1000).toISOString(),
      hasVerifiedOutputs: !!report.verified_outputs,
      documentName: report.verified_outputs?.document?.name,
      idNumberData: report.verified_outputs?.id_number
        ? {
            firstName: report.verified_outputs.id_number.first_name,
            lastName: report.verified_outputs.id_number.last_name,
            ssnLast4: report.verified_outputs.id_number.ssn_last4,
            hasAddress: !!report.verified_outputs.id_number.address,
          }
        : null,
    });

    verificationReport = {
      id: report.id,
      type: report.type,
      created: report.created,
    };

    const outputs = report.verified_outputs;

    // Extract name from document verification
    if (outputs?.document?.name) {
      console.log(
        "📝 [Document] Extracting name from document:",
        outputs.document.name
      );
      const [first, ...rest] = outputs.document.name.split(" ");
      if (first) firstName = first;
      if (rest.length) lastName = rest.join(" ");
      console.log("✅ [Document] Extracted:", { firstName, lastName });
    }

    // Extract data from ID number verification
    if (outputs?.id_number) {
      console.log("🆔 [ID Number] Raw data from Stripe:", {
        first_name: outputs.id_number.first_name,
        last_name: outputs.id_number.last_name,
        ssn_last4: outputs.id_number.ssn_last4,
        address: outputs.id_number.address,
      });

      firstName = outputs.id_number.first_name ?? firstName;
      lastName = outputs.id_number.last_name ?? lastName;
      ssnLast4 = outputs.id_number.ssn_last4 ?? ssnLast4;
      address = outputs.id_number.address ?? address;

      console.log("✅ [ID Number] Extracted:", {
        firstName,
        lastName,
        ssnLast4,
        hasAddress: !!address,
      });
    }
  } else {
    console.warn("⚠️ [Stripe API] No verification report available yet");
  }

  const result = {
    session: {
      id: session.id,
      status: session.status,
      type: session.type,
      created: session.created,
      last_error: session.last_error,
      metadata: session.metadata,
    },
    verificationReport,
    firstName,
    lastName,
    ssnLast4,
    address,
  };

  console.log("🎯 [Final Result]:", {
    sessionId: result.session.id,
    status: result.session.status,
    type: result.session.type,
    firstName: result.firstName,
    lastName: result.lastName,
    ssnLast4: result.ssnLast4,
    hasAddress: !!result.address,
    hasReport: !!result.verificationReport,
  });

  return result;
}

export async function ensureStripeCustomerAction(
  input: EnsureStripeCustomerInput
): Promise<EnsureStripeCustomerResult> {
  if (!input.token) {
    throw new Error(
      "Authentication token is required to sync Stripe customer data."
    );
  }

  if (!input.userId) {
    throw new Error("User id is required to sync Stripe customer data.");
  }

  if (!input.email) {
    throw new Error("Email is required to create or update a Stripe customer.");
  }

  const stripe = getStripe();
  let customer: Stripe.Customer | null = null;

  if (input.customerId) {
    customer = await retrieveStripeCustomer(stripe, input.customerId);
  }

  if (!customer) {
    const params: Stripe.CustomerCreateParams = {
      email: input.email,
      metadata: {
        user_id: input.userId,
      },
    };

    if (input.phone) {
      params.phone = input.phone;
    }

    if (input.name) {
      params.name = input.name;
    }

    customer = await stripe.customers.create(params);
  } else {
    const updatePayload: Stripe.CustomerUpdateParams = {};
    if (input.phone && input.phone !== customer.phone) {
      updatePayload.phone = input.phone;
    }
    if (input.name && input.name !== customer.name) {
      updatePayload.name = input.name;
    }

    if (Object.keys(updatePayload).length > 0) {
      customer = await stripe.customers.update(customer.id, updatePayload);
    }
  }

  await persistStripeCustomerReference({
    token: input.token,
    stripeCustomerId: customer.id,
    ssnLast4: input.ssnLast4,
    address: input.address,
  });

  return {
    customerId: customer.id,
    customer: {
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
    },
  };
}

export async function createFinancialConnectionsSessionAction(
  input: CreateFinancialConnectionsSessionInput
): Promise<CreateFinancialConnectionsSessionResult> {
  if (!input.customerId) {
    throw new Error(
      "Stripe customer ID is required before initiating a bank connection."
    );
  }

  const stripe = getStripe();
  const origin = normalizeOrigin(input.origin);
  const returnUrl = buildBankReturnUrl(origin);

  const permissions: Stripe.FinancialConnections.SessionCreateParams.Permission[] =
    input.permissions?.length
      ? input.permissions
      : ([
          "ownership",
        ] as Stripe.FinancialConnections.SessionCreateParams.Permission[]);

  const filters: Stripe.FinancialConnections.SessionCreateParams.Filters =
    input.filters ?? {
      countries: ["US"],
      account_subcategories: [
        "checking",
        "savings",
      ] as Stripe.FinancialConnections.SessionCreateParams.Filters.AccountSubcategory[],
    };

  const prefetch: Stripe.FinancialConnections.SessionCreateParams.Prefetch[] =
    input.prefetch?.length ? input.prefetch : ["ownership"];

  const session = await stripe.financialConnections.sessions.create({
    account_holder: {
      type: "customer",
      customer: input.customerId,
    },
    permissions,
    filters,
    prefetch, // Automatically fetch ownership data
    return_url: returnUrl,
  });

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}

// ============================
// RETRIEVE OWNERSHIP DETAILS
// ============================

interface GetAccountOwnershipInput {
  accountId: string;
}

interface AccountOwner {
  name: string;
  email?: string;
}

interface GetAccountOwnershipResult {
  owners: AccountOwner[];
}

/**
 * Retrieves ownership information for a Financial Connections account.
 * This is used to get the actual account holder name(s) for validation.
 */
export async function getAccountOwnershipAction(
  input: GetAccountOwnershipInput
): Promise<GetAccountOwnershipResult> {
  const stripe = getStripe();

  try {
    // First, get the account to check ownership status
    let account = await stripe.financialConnections.accounts.retrieve(
      input.accountId
    );

    console.log("Initial account ownership status:", account.ownership);
    console.log(
      "Ownership refresh status:",
      (account as any).ownership_refresh
    );

    // If ownership is null, we need to refresh it
    if (!account.ownership) {
      console.log("Ownership is null, attempting to refresh...");

      try {
        // Refresh the ownership data
        const refreshResult =
          await stripe.financialConnections.accounts.refresh(input.accountId, {
            features: ["ownership"],
          });

        console.log("Ownership refresh result:", refreshResult);

        // Wait for ownership refresh to complete (with timeout)
        const maxAttempts = 5;
        const delayMs = 1000; // 1 second between attempts

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          account = await stripe.financialConnections.accounts.retrieve(
            input.accountId
          );

          const ownershipRefresh = (account as any).ownership_refresh;
          console.log(
            `Attempt ${attempt + 1}: Ownership refresh status:`,
            ownershipRefresh?.status
          );

          // If ownership is now available, break out
          if (account.ownership) {
            console.log("Ownership now available after refresh");
            break;
          }

          // If refresh succeeded but ownership is still null, continue waiting
          if (ownershipRefresh?.status === "succeeded") {
            console.log("Refresh succeeded, checking for ownership...");
            // Try one more retrieval
            account = await stripe.financialConnections.accounts.retrieve(
              input.accountId
            );
            if (account.ownership) break;
          }

          // If refresh failed, stop trying
          if (ownershipRefresh?.status === "failed") {
            console.error("Ownership refresh failed:", ownershipRefresh);
            return { owners: [] };
          }
        }

        console.log("Account after polling:", account.ownership);
      } catch (refreshError) {
        console.error("Failed to refresh ownership:", refreshError);
        // If refresh fails, ownership might not be available for this account
        return { owners: [] };
      }
    }

    // If ownership is still null after refresh, return empty
    if (!account.ownership) {
      console.warn(
        "Ownership data not available even after refresh and polling"
      );
      return { owners: [] };
    }

    // Extract ownership ID (it can be a string or object)
    const ownershipId =
      typeof account.ownership === "string"
        ? account.ownership
        : account.ownership.id;

    console.log("Fetching owners with ownership ID:", ownershipId);

    // List all owners for this account using the ownership ID
    const ownersResponse =
      await stripe.financialConnections.accounts.listOwners(input.accountId, {
        ownership: ownershipId,
      });

    console.log("Owners response:", ownersResponse);

    // Extract owner names and emails
    const owners: AccountOwner[] = ownersResponse.data.map((owner) => ({
      name: owner.name,
      email: owner.email ?? undefined,
    }));

    return { owners };
  } catch (error) {
    console.error("Failed to retrieve account ownership:", error);
    return { owners: [] };
  }
}

// ============================
// GET CLIENT INFO FOR MANDATE
// ============================

/**
 * Gets the client IP address and user agent from request headers
 * This is required for Stripe mandate compliance
 */
export async function getClientInfoAction(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  const { headers } = await import("next/headers");
  const headersList = await headers();

  // Get IP address from various possible headers
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") || // Cloudflare
    "0.0.0.0";

  // Get user agent
  const userAgent = headersList.get("user-agent") || "Koajo Platform";

  return { ipAddress, userAgent };
}

// ============================
// CREATE PAYMENT METHOD
// ============================

interface CreatePaymentMethodInput {
  financialConnectionsAccountId: string;
  customerId: string;
  billingName: string;
  ipAddress?: string;
  userAgent?: string;
}

interface CreatePaymentMethodResult {
  success: boolean;
  paymentMethodId?: string;
  status?: string;
  error?: string;
}

/**
 * Creates a payment method from a Financial Connections account
 * and attaches it to the customer. This is CRITICAL - without this step,
 * Stripe cannot charge the bank account.
 */
export async function createPaymentMethodFromFinancialConnectionsAction(
  input: CreatePaymentMethodInput
): Promise<CreatePaymentMethodResult> {
  try {
    const stripe = getStripe();

    console.log(
      "🔄 Creating payment method for Financial Connections account:",
      input.financialConnectionsAccountId
    );

    // Create payment method from Financial Connections account with mandate
    const paymentMethod = await stripe.paymentMethods.create({
      type: "us_bank_account",
      us_bank_account: {
        financial_connections_account: input.financialConnectionsAccountId,
      },
      billing_details: {
        name: input.billingName,
      },
    });

    console.log("✅ Payment method created:", paymentMethod.id);
    console.log("   Type:", paymentMethod.type);
    console.log("   Bank:", paymentMethod.us_bank_account?.bank_name);
    console.log("   Last 4:", paymentMethod.us_bank_account?.last4);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: input.customerId,
    });

    console.log("✅ Payment method attached to customer:", input.customerId);

    // Create SetupIntent to collect mandate for ACH debit authorization
    // This is CRITICAL for US bank account payments - without a mandate, payment intents will fail
    const setupIntent = await stripe.setupIntents.create({
      customer: input.customerId,
      payment_method: paymentMethod.id,
      payment_method_types: ["us_bank_account"],
      confirm: true,
      mandate_data: {
        customer_acceptance: {
          type: "online",
          online: {
            ip_address: input.ipAddress || "0.0.0.0",
            user_agent: input.userAgent || "Koajo Platform",
          },
        },
      },
    });

    console.log("✅ Mandate collected via SetupIntent:", setupIntent.id);
    console.log("   Status:", setupIntent.status);
    console.log("   Mandate:", setupIntent.mandate);

    // Set as default payment method for future invoices
    await stripe.customers.update(input.customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    console.log("✅ Set as default payment method");

    return {
      success: true,
      paymentMethodId: paymentMethod.id,
      status: "verified", // Financial Connections with instant verification auto-verifies
    };
  } catch (error) {
    console.error("❌ Error creating payment method:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);

    return {
      success: false,
      error: `Failed to create payment method: ${errorMessage}`,
    };
  }
}

// ============================
// STRIPE CONNECT - CREATE CONNECTED ACCOUNT
// ============================

interface CreateConnectedAccountInput {
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  userId: string;
}

interface CreateConnectedAccountResult {
  success: boolean;
  accountId?: string;
  error?: string;
}

/**
 * Creates a Stripe Connect Express account for payouts.
 * This account will be used to send money TO the user's bank account.
 */
export async function createConnectedAccountAction(
  input: CreateConnectedAccountInput
): Promise<CreateConnectedAccountResult> {
  try {
    const stripe = getStripe();

    console.log("🔄 Creating Stripe Connect Express account for:", input.email);

    const account = await stripe.accounts.create({
      type: "express",
      country: input.country || "US",
      email: input.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        email: input.email,
        first_name: input.firstName || undefined,
        last_name: input.lastName || undefined,
      },
      metadata: {
        user_id: input.userId,
        platform: "koajo",
      },
    });

    console.log("✅ Connected account created:", account.id);
    console.log("📋 Account details:", JSON.stringify(account, null, 2));

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error("❌ Error creating connected account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: `Failed to create connected account: ${errorMessage}`,
    };
  }
}

// ============================
// STRIPE CONNECT - CREATE CUSTOM ACCOUNT WITH BANK
// ============================

interface CreateCustomConnectedAccountInput {
  email: string;
  firstName: string;
  lastName: string;
  dob: string; // MM-DD-YYYY format
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  routingNumber: string;
  accountNumber: string;
  userId: string;
}

interface CreateCustomConnectedAccountResult {
  success: boolean;
  accountId?: string;
  error?: string;
}

/**
 * Creates a Stripe Connect Custom account with external bank account for payouts.
 * This account will be used to send money TO the user's bank account.
 * Uses user's DOB and address from /auth/me endpoint.
 */
export async function createCustomConnectedAccountAction(
  input: CreateCustomConnectedAccountInput
): Promise<CreateCustomConnectedAccountResult> {
  try {
    const stripe = getStripe();

    console.log("🔄 Creating Stripe Connect Custom account for:", input.email);
    console.log("📋 Input data:", JSON.stringify({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      dob: input.dob,
      address: input.address,
      routingNumber: `${input.routingNumber.substring(0, 3)}***`,
      accountNumber: `***${input.accountNumber.slice(-4)}`,
    }, null, 2));

    // Parse DOB from MM-DD-YYYY format
    const [month, day, year] = input.dob.split("-").map(Number);

    const accountHolderName = `${input.firstName} ${input.lastName}`;

    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      business_type: "individual",
      email: input.email,
      capabilities: {
        transfers: { requested: true },
      },
      individual: {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        dob: {
          day,
          month,
          year,
        },
        address: {
          line1: input.address.line1,
          city: input.address.city,
          state: input.address.state,
          postal_code: input.address.postal_code,
          country: input.address.country,
        },
      },
      external_account: {
        object: "bank_account",
        country: "US",
        currency: "usd",
        account_holder_name: accountHolderName,
        routing_number: input.routingNumber,
        account_number: input.accountNumber,
      },
      metadata: {
        user_id: input.userId,
        platform: "koajo",
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: "0.0.0.0", // Will be updated with actual IP
      },
    });

    console.log("✅ Custom connected account created:", account.id);
    console.log("📋 Account response:", JSON.stringify({
      id: account.id,
      type: account.type,
      capabilities: account.capabilities,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      external_accounts: account.external_accounts?.data?.length,
    }, null, 2));

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    console.error("❌ Error creating custom connected account:", error);
    console.error("📋 Error details:", JSON.stringify(error, null, 2));
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: `Failed to create custom connected account: ${errorMessage}`,
    };
  }
}

// ============================
// STRIPE CONNECT - CREATE ACCOUNT SESSION
// ============================

interface CreateAccountSessionInput {
  accountId: string;
}

interface CreateAccountSessionResult {
  success: boolean;
  clientSecret?: string;
  error?: string;
}

/**
 * Creates an Account Session for Stripe Connect embedded onboarding.
 * The client secret is used to initialize the Connect embedded component.
 */
export async function createAccountSessionAction(
  input: CreateAccountSessionInput
): Promise<CreateAccountSessionResult> {
  try {
    const stripe = getStripe();

    console.log("🔄 Creating account session for:", input.accountId);

    const accountSession = await stripe.accountSessions.create({
      account: input.accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    console.log("✅ Account session created");

    return {
      success: true,
      clientSecret: accountSession.client_secret,
    };
  } catch (error) {
    console.error("❌ Error creating account session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: `Failed to create account session: ${errorMessage}`,
    };
  }
}

// ============================
// STRIPE CONNECT - GET ACCOUNT STATUS
// ============================

interface GetConnectedAccountStatusInput {
  accountId: string;
}

interface GetConnectedAccountStatusResult {
  success: boolean;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  error?: string;
}

/**
 * Retrieves the status of a connected account to check if onboarding is complete.
 */
export async function getConnectedAccountStatusAction(
  input: GetConnectedAccountStatusInput
): Promise<GetConnectedAccountStatusResult> {
  try {
    const stripe = getStripe();

    const account = await stripe.accounts.retrieve(input.accountId);

    return {
      success: true,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch (error) {
    console.error("❌ Error retrieving account status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: `Failed to retrieve account status: ${errorMessage}`,
    };
  }
}
