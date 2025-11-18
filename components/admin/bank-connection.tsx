"use client";

import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { useOnboarding } from "@/lib/provider-onboarding";
import { useDashboard } from "@/lib/provider-dashboard";
import TokenManager from "@/lib/utils/memory-manager";
import type { User } from "@/lib/types/api";
import { AuthService } from "@/lib/services/authService";
import {
  createFinancialConnectionsSessionAction,
  ensureStripeCustomerAction,
  getAccountOwnershipAction,
  createPaymentMethodFromFinancialConnectionsAction,
  getClientInfoAction,
  createConnectedAccountAction,
  createAccountSessionAction,
  getConnectedAccountStatusAction,
} from "@/app/register/kyc/actions";

/**
 * Helper function to compare names for KYC validation.
 * Normalizes names by removing extra spaces, converting to lowercase,
 * and allows for minor variations (middle names, suffixes, etc.)
 */
function namesMatch(name1: string, name2: string): boolean {
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();

  const normalized1 = normalize(name1);
  const normalized2 = normalize(name2);

  // Exact match
  if (normalized1 === normalized2) return true;

  // Check if one name contains all parts of the other (handles middle names)
  const parts1 = normalized1.split(" ");
  const parts2 = normalized2.split(" ");

  // Check if all parts of the shorter name exist in the longer name
  const [shorter, longer] =
    parts1.length <= parts2.length ? [parts1, parts2] : [parts2, parts1];

  return shorter.every((part) => longer.includes(part));
}

// Types for the multi-step flow
type FlowStep = "initial" | "connect_onboarding" | "completing";

// Store intermediate data between steps
interface BankConnectionData {
  connectedAccountId: string;
  customerId: string;
  paymentMethodId: string;
  accountFirstName: string;
  accountLastName: string;
  accountLast4: string;
  bankName?: string;
  fcAccountId: string;
}

export default function BankConnection() {
  const { close } = useOnboarding();
  const { emailVerified, kycCompleted, user, refreshUser } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  // Multi-step flow state
  const [flowStep, setFlowStep] = useState<FlowStep>("initial");
  const [bankConnectionData, setBankConnectionData] = useState<BankConnectionData | null>(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<ReturnType<typeof loadConnectAndInitialize> | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (stripeKey) {
        const stripeInstance = await loadStripe(stripeKey);
        setStripe(stripeInstance);
      }
    };
    initStripe();
  }, []);

  const handleConnectBank = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!stripe) {
        throw new Error(
          "Stripe is not loaded. Please wait a moment and try again."
        );
      }

      const token = TokenManager.getToken();
      if (!token) {
        throw new Error("Please log in again to connect your bank account.");
      }

      let resolvedUser: User | null =
        (user as User | null) ||
        ((TokenManager.getUserData() as User | null) ?? null);

      if (!resolvedUser) {
        try {
          const profile = await AuthService.getMe(token);
          if (profile && !("error" in profile)) {
            resolvedUser = profile;
            TokenManager.setUser(profile);
          }
        } catch (profileError) {
          console.warn("Failed to fetch user profile:", profileError);
        }
      }

      if (!resolvedUser) {
        throw new Error("Unable to load your profile. Please try again.");
      }

      const fullName = [resolvedUser.firstName, resolvedUser.lastName]
        .filter(Boolean)
        .join(" ");

      const customer = await ensureStripeCustomerAction({
        token,
        userId: resolvedUser.id,
        email: resolvedUser.email,
        phone: resolvedUser.phone,
        name: fullName || undefined,
        customerId: resolvedUser.customer?.id ?? undefined,
      });

      const session = await createFinancialConnectionsSessionAction({
        customerId: customer.customerId,
        permissions: ["ownership", "payment_method"],
        filters: {
          countries: ["US"],
          account_subcategories: ["checking", "savings"],
        },
        origin:
          typeof window !== "undefined" ? window.location.origin : undefined,
      });

      if (!session.clientSecret) {
        throw new Error("Failed to start Stripe bank connection.");
      }

      const result = await stripe.collectFinancialConnectionsAccounts({
        clientSecret: session.clientSecret,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Failed to connect bank account."
        );
      }

      const connectedAccount =
        result.financialConnectionsSession?.accounts?.[0];

      if (!connectedAccount?.id) {
        throw new Error(
          "Stripe did not return a connected bank account identifier."
        );
      }

      console.log("Connected account from Stripe:", connectedAccount);
      console.log(
        "Session permissions:",
        result.financialConnectionsSession?.permissions
      );

      // ✅ CRITICAL: Create payment method from Financial Connections account
      // Without this step, Stripe Dashboard will show no payment methods and cannot charge
      console.log("🔄 Creating payment method from Financial Connections account...");

      // Get client IP and user agent for mandate compliance
      const clientInfo = await getClientInfoAction();
      console.log("Client info for mandate:", clientInfo);

      const paymentMethodResult = await createPaymentMethodFromFinancialConnectionsAction({
        financialConnectionsAccountId: connectedAccount.id,
        customerId: customer.customerId,
        billingName: fullName || `${resolvedUser.firstName} ${resolvedUser.lastName}`.trim(),
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      if (!paymentMethodResult.success || !paymentMethodResult.paymentMethodId) {
        console.error("❌ Failed to create payment method:", paymentMethodResult.error);
        throw new Error(
          paymentMethodResult.error || "Connected bank account but failed to create payment method. Please try again or contact support."
        );
      }

      const paymentMethodId = paymentMethodResult.paymentMethodId;

      console.log("✅ Payment method created and attached:", paymentMethodId);
      console.log("   Status:", paymentMethodResult.status);

      // Retrieve account ownership information to get the actual account holder name
      let accountHolderName: string | undefined = undefined;
      let accountFirstName: string | undefined = undefined;
      let accountLastName: string | undefined = undefined;

      // Try to get account holder name from the connected account object first
      // Stripe may include owner information directly if ownership permission was granted
      if ((connectedAccount as any).account_holder) {
        const accountHolder = (connectedAccount as any).account_holder;
        console.log("Account holder from connected account:", accountHolder);

        if (accountHolder.name) {
          accountHolderName = accountHolder.name;
        } else if (accountHolder.customer_name) {
          accountHolderName = accountHolder.customer_name;
        }
      }

      // If we didn't get the name from the account object, try the ownership API
      if (!accountHolderName) {
        try {
          console.log(
            "Attempting to fetch ownership data for account:",
            connectedAccount.id
          );
          const ownership = await getAccountOwnershipAction({
            accountId: connectedAccount.id,
          });

          console.log("Ownership data received:", ownership);

          // Get the first owner's name (most accounts have a single owner)
          if (ownership.owners.length > 0) {
            accountHolderName = ownership.owners[0].name;
            console.log(
              "Account holder name from ownership:",
              accountHolderName
            );
          } else {
            console.warn("No owners found in ownership data");
          }
        } catch (ownershipError) {
          console.error("Failed to retrieve ownership data:", ownershipError);
          // Continue without ownership data - backend will handle validation
        }
      }

      // Split the name into first and last name if we have it
      if (accountHolderName) {
        const nameParts = accountHolderName.trim().split(/\s+/);
        if (nameParts.length === 1) {
          // Only one name provided, use it as first name
          accountFirstName = nameParts[0];
        } else if (nameParts.length === 2) {
          // Two names: first and last
          accountFirstName = nameParts[0];
          accountLastName = nameParts[1];
        } else {
          // More than two names: first name is first part, last name is everything else
          accountFirstName = nameParts[0];
          accountLastName = nameParts.slice(1).join(" ");
        }
        console.log(
          "Split names - First:",
          accountFirstName,
          "Last:",
          accountLastName
        );
      } else {
        console.warn("No account holder name available from any source");
      }

      // Extract full bank account details from Stripe response
      const bankAccountData = {
        id: connectedAccount.id,
        customer_id: customer.customerId,
        payment_method_id: paymentMethodId, // ✅ Include payment method ID
        account_first_name: accountFirstName ?? "Test",
        account_last_name: accountLastName ?? "Koajo",
        account_last4: connectedAccount.last4 ?? "0000",
        bank_name: connectedAccount.institution_name ?? undefined,
      };

      console.log("Bank account data to be sent to backend:", bankAccountData);

      // Validate that bank account holder name matches KYC verified name
      if (
        accountHolderName &&
        fullName &&
        !namesMatch(accountHolderName, fullName)
      ) {
        throw new Error(
          `Bank account holder name "${accountHolderName}" does not match your verified name "${fullName}". Please ensure you're connecting an account in your name.`
        );
      }

      // ============================
      // STEP 2: CREATE STRIPE CONNECT ACCOUNT FOR PAYOUTS
      // ============================
      console.log("🔄 Creating Stripe Connect Express account for payouts...");

      const connectAccountResult = await createConnectedAccountAction({
        email: resolvedUser.email,
        firstName: resolvedUser.firstName ?? undefined,
        lastName: resolvedUser.lastName ?? undefined,
        country: "US",
        userId: resolvedUser.id,
      });

      if (!connectAccountResult.success || !connectAccountResult.accountId) {
        throw new Error(
          connectAccountResult.error || "Failed to create Connect account for payouts."
        );
      }

      const connectedAccountId = connectAccountResult.accountId;
      console.log("✅ Connect account created:", connectedAccountId);

      // Store data for after onboarding completes
      setBankConnectionData({
        connectedAccountId,
        customerId: customer.customerId,
        paymentMethodId,
        accountFirstName: accountFirstName ?? "Test",
        accountLastName: accountLastName ?? "Koajo",
        accountLast4: connectedAccount.last4 ?? "0000",
        bankName: connectedAccount.institution_name ?? undefined,
        fcAccountId: connectedAccount.id,
      });

      // ============================
      // STEP 3: INITIALIZE CONNECT ONBOARDING
      // ============================
      console.log("🔄 Initializing Connect onboarding component...");

      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) {
        throw new Error("Stripe publishable key not configured.");
      }

      const connectInstance = loadConnectAndInitialize({
        publishableKey: stripeKey,
        fetchClientSecret: async (): Promise<string> => {
          const sessionResult = await createAccountSessionAction({
            accountId: connectedAccountId,
          });

          if (!sessionResult.success || !sessionResult.clientSecret) {
            console.error("Failed to create account session:", sessionResult.error);
            throw new Error(sessionResult.error || "Failed to create account session");
          }

          return sessionResult.clientSecret;
        },
      });

      setStripeConnectInstance(connectInstance);
      setFlowStep("connect_onboarding");
      setIsLoading(false);

      console.log("✅ Connect onboarding initialized - showing UI");

    } catch (err) {
      console.error("Bank connection error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect bank account. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Handler for when Connect onboarding is completed
  const handleConnectOnboardingExit = async () => {
    if (!bankConnectionData) {
      setError("Missing bank connection data. Please try again.");
      setFlowStep("initial");
      return;
    }

    setFlowStep("completing");
    setIsLoading(true);
    setError(null);

    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error("Please log in again to complete bank connection.");
      }

      // Check if onboarding was successful
      console.log("🔍 Checking Connect account status...");
      const statusResult = await getConnectedAccountStatusAction({
        accountId: bankConnectionData.connectedAccountId,
      });

      console.log("Account status:", statusResult);

      // Note: For Express accounts, payouts_enabled may not be immediately true
      // The account needs to complete verification which can take time
      if (!statusResult.detailsSubmitted) {
        throw new Error(
          "Onboarding was not completed. Please try again and complete all required steps."
        );
      }

      // Send all data to backend
      const bankAccountPayload = {
        id: bankConnectionData.fcAccountId,
        customer_id: bankConnectionData.customerId,
        payment_method_id: bankConnectionData.paymentMethodId,
        account_first_name: bankConnectionData.accountFirstName,
        account_last_name: bankConnectionData.accountLastName,
        account_last4: bankConnectionData.accountLast4,
        bank_name: bankConnectionData.bankName,
        connected_account_id: bankConnectionData.connectedAccountId,
      };

      console.log("Sending bank account data to backend:", bankAccountPayload);
      await AuthService.linkStripeBankAccount(bankAccountPayload, token);
      console.log("✅ Bank account successfully linked with Connect account");

      await refreshUser();
      close();
    } catch (err) {
      console.error("Error completing bank connection:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete bank connection. Please try again."
      );
      // Go back to initial state so user can retry
      setFlowStep("initial");
    } finally {
      setIsLoading(false);
    }
  };

  if (!emailVerified || !kycCompleted) {
    return (
      <CardAuth
        title="Connect Your Bank Account"
        description="Securely connect your US bank account via Stripe to enable automated contributions and payouts. Your banking credentials are never stored by Koajo."
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              {!emailVerified && !kycCompleted
                ? "Please verify your email and complete KYC verification before connecting your bank account."
                : !emailVerified
                ? "Please verify your email before connecting your bank account."
                : "Please complete KYC verification before connecting your bank account."}
            </p>
          </div>
          <Button
            onClick={close}
            text="Close"
            variant="secondary"
            className="w-full"
          />
        </div>
      </CardAuth>
    );
  }

  // Show Connect onboarding UI
  if (flowStep === "connect_onboarding" && stripeConnectInstance) {
    return (
      <CardAuth
        title="Complete Payout Setup"
        description="Complete your account verification to enable receiving payouts from your pod."
      >
        <div className="space-y-6">
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={handleConnectOnboardingExit}
              collectionOptions={{
                fields: "eventually_due",
                futureRequirements: "include",
              }}
            />
          </ConnectComponentsProvider>
          {error && (
            <p className="text-red-500 text-center text-sm pt-2">{error}</p>
          )}
        </div>
      </CardAuth>
    );
  }

  // Show completing state
  if (flowStep === "completing") {
    return (
      <CardAuth
        title="Completing Setup"
        description="Finalizing your bank account connection..."
      >
        <div className="space-y-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
          {error && (
            <p className="text-red-500 text-center text-sm pt-2">{error}</p>
          )}
        </div>
      </CardAuth>
    );
  }

  // Initial state - show connect button
  return (
    <CardAuth
      title="Connect Your Bank Account"
      description="Securely connect your US bank account via Stripe to enable automated contributions and payouts. Your banking credentials are never stored by Koajo."
    >
      <div className="space-y-6">
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleConnectBank}
            text={isLoading ? "Connecting..." : "Connect Bank Account"}
            variant="primary"
            className="w-full"
            disabled={isLoading}
            showArrow
          />
          <Button
            onClick={close}
            text="Cancel"
            variant="secondary"
            className="w-full"
            disabled={isLoading}
            showArrow={false}
          />
          {error && (
            <p className="text-red-500 text-center text-sm pt-2">{error}</p>
          )}
        </div>
        <div className="text-xs text-text-400 text-center pt-2">
          <p>
            By connecting your bank account, you agree to our terms of service
            and authorize Koajo to process payments according to your pod
            schedule.
          </p>
        </div>
      </div>
    </CardAuth>
  );
}
