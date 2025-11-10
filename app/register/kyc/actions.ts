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

  const options: Stripe.Identity.VerificationSessionCreateParams.Options | undefined =
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

  const stripe = getStripe();
  const session = await stripe.identity.verificationSessions.retrieve(
    sessionId,
    {
      expand: ["last_verification_report"],
    }
  );

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

    verificationReport = {
      id: report.id,
      type: report.type,
      created: report.created,
    };

    const outputs = report.verified_outputs;
    if (outputs?.document?.name) {
      const [first, ...rest] = outputs.document.name.split(" ");
      if (first) firstName = first;
      if (rest.length) lastName = rest.join(" ");
    }

    if (outputs?.id_number) {
      firstName = outputs.id_number.first_name ?? firstName;
      lastName = outputs.id_number.last_name ?? lastName;
      ssnLast4 = outputs.id_number.ssn_last4 ?? ssnLast4;
      address = outputs.id_number.address ?? address;
    }
  }

  return {
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

  const session = await stripe.financialConnections.sessions.create({
    account_holder: {
      type: "customer",
      customer: input.customerId,
    },
    permissions,
    filters,
    return_url: returnUrl,
  });

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}
