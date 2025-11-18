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
  createCustomConnectedAccountAction,
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
type FlowStep = "initial" | "bank_details" | "connect_onboarding" | "completing";

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

// Bank account form data
interface BankAccountFormData {
  routingNumber: string;
  accountNumber: string;
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

  // Bank account form state
  const [bankFormData, setBankFormData] = useState<BankAccountFormData>({
    routingNumber: "",
    accountNumber: "",
  });
  const [formErrors, setFormErrors] = useState<{ routingNumber?: string; accountNumber?: string }>({});

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

  // Validate bank account form
  const validateBankForm = (): boolean => {
    const errors: { routingNumber?: string; accountNumber?: string } = {};

    if (!bankFormData.routingNumber) {
      errors.routingNumber = "Routing number is required";
    } else if (!/^\d{9}$/.test(bankFormData.routingNumber)) {
      errors.routingNumber = "Routing number must be exactly 9 digits";
    }

    if (!bankFormData.accountNumber) {
      errors.accountNumber = "Account number is required";
    } else if (!/^\d{4,17}$/.test(bankFormData.accountNumber)) {
      errors.accountNumber = "Account number must be between 4 and 17 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Go to bank details step
  const handleShowBankDetailsForm = () => {
    setFlowStep("bank_details");
  };

  // Handle bank details form submission
  const handleConnectBank = async () => {
    if (!validateBankForm()) {
      return;
    }

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

      // Check if user has required DOB and address data
      if (!resolvedUser.dob && !resolvedUser.dateOfBirth) {
        throw new Error("Date of birth is required. Please update your profile.");
      }

      if (!resolvedUser.address) {
        throw new Error("Address is required. Please update your profile.");
      }

      const userDob = resolvedUser.dob || resolvedUser.dateOfBirth || "";

      console.log("📋 User data for Stripe:", {
        email: resolvedUser.email,
        firstName: resolvedUser.firstName,
        lastName: resolvedUser.lastName,
        dob: userDob,
        address: resolvedUser.address,
      });

      // ============================
      // STEP 1: CREATE CUSTOM CONNECTED ACCOUNT WITH BANK
      // ============================
      console.log("🔄 Creating Stripe Connect Custom account with bank details...");

      const customAccountResult = await createCustomConnectedAccountAction({
        email: resolvedUser.email,
        firstName: resolvedUser.firstName || "",
        lastName: resolvedUser.lastName || "",
        dob: userDob,
        address: {
          line1: resolvedUser.address.line1,
          city: resolvedUser.address.city,
          state: resolvedUser.address.state,
          postal_code: resolvedUser.address.postal_code,
          country: resolvedUser.address.country || "US",
        },
        routingNumber: bankFormData.routingNumber,
        accountNumber: bankFormData.accountNumber,
        userId: resolvedUser.id,
      });

      console.log("📋 Full customAccountResult response:", JSON.stringify(customAccountResult, null, 2));

      if (!customAccountResult.success || !customAccountResult.accountId) {
        console.error("❌ Failed to create custom account:", customAccountResult.error);
        throw new Error(
          customAccountResult.error || "Failed to create Connect account for payouts."
        );
      }

      const connectedAccountId = customAccountResult.accountId;
      console.log("✅ Custom Connect account created:", connectedAccountId);

      // ============================
      // STEP 2: CREATE CUSTOMER AND FINANCIAL CONNECTIONS
      // ============================
      console.log("🔄 Creating Stripe customer and Financial Connections session...");

      const customer = await ensureStripeCustomerAction({
        token,
        userId: resolvedUser.id,
        email: resolvedUser.email,
        phone: resolvedUser.phone,
        name: fullName || undefined,
        customerId: resolvedUser.customer?.id ?? undefined,
      });

      console.log("✅ Stripe customer ensured:", customer.customerId);

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

      console.log("✅ Financial Connections session created:", session.sessionId);

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

      console.log("✅ Connected account from Stripe:", connectedAccount);
      console.log("📋 Session permissions:", result.financialConnectionsSession?.permissions);

      // ============================
      // STEP 3: CREATE PAYMENT METHOD
      // ============================
      console.log("🔄 Creating payment method from Financial Connections account...");

      // Get client IP and user agent for mandate compliance
      const clientInfo = await getClientInfoAction();
      console.log("📋 Client info for mandate:", clientInfo);

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
      console.log("📋 Status:", paymentMethodResult.status);

      // Store data for completing the flow
      setBankConnectionData({
        connectedAccountId,
        customerId: customer.customerId,
        paymentMethodId,
        accountFirstName: resolvedUser.firstName || "",
        accountLastName: resolvedUser.lastName || "",
        accountLast4: bankFormData.accountNumber.slice(-4),
        bankName: connectedAccount.institution_name ?? undefined,
        fcAccountId: connectedAccount.id,
      });

      // Move directly to completing step since we're using custom account (no onboarding UI needed)
      setFlowStep("completing");

      // Complete the bank connection
      const bankAccountPayload = {
        id: connectedAccount.id,
        customer_id: customer.customerId,
        payment_method_id: paymentMethodId,
        account_first_name: resolvedUser.firstName || "",
        account_last_name: resolvedUser.lastName || "",
        account_last4: bankFormData.accountNumber.slice(-4),
        bank_name: connectedAccount.institution_name ?? undefined,
        connected_account_id: connectedAccountId,
      };

      console.log("📋 Sending bank account data to backend:", bankAccountPayload);
      await AuthService.linkStripeBankAccount(bankAccountPayload, token);
      console.log("✅ Bank account successfully linked with Connect account");

      await refreshUser();
      setIsLoading(false);
      close();

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

  // Bank details form step
  if (flowStep === "bank_details") {
    const isBankFormValid = bankFormData.routingNumber.length === 9 && bankFormData.accountNumber.length >= 4;

    return (
      <CardAuth
        title="Enter Bank Account Details"
        description="Please enter your bank account routing and account numbers for payouts."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-600">
              Routing Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankFormData.routingNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                setBankFormData((prev) => ({ ...prev, routingNumber: value }));
                if (formErrors.routingNumber) {
                  setFormErrors((prev) => ({ ...prev, routingNumber: undefined }));
                }
              }}
              placeholder="123456789"
              className="w-full px-3 py-2.5 border border-secondary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={9}
            />
            {formErrors.routingNumber && (
              <p className="text-red-500 text-xs mt-1">{formErrors.routingNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-600">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankFormData.accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 17);
                setBankFormData((prev) => ({ ...prev, accountNumber: value }));
                if (formErrors.accountNumber) {
                  setFormErrors((prev) => ({ ...prev, accountNumber: undefined }));
                }
              }}
              placeholder="000123456789"
              className="w-full px-3 py-2.5 border border-secondary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              maxLength={17}
            />
            {formErrors.accountNumber && (
              <p className="text-red-500 text-xs mt-1">{formErrors.accountNumber}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleConnectBank}
              text={isLoading ? "Connecting..." : "Connect Bank Account"}
              variant="primary"
              className="w-full"
              disabled={isLoading || !isBankFormValid}
              showArrow
            />
            <Button
              onClick={() => setFlowStep("initial")}
              text="Back"
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
              Your bank details are securely transmitted to Stripe and never stored by Koajo.
            </p>
          </div>
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
            onClick={handleShowBankDetailsForm}
            text="Connect Bank Account"
            variant="primary"
            className="w-full"
            showArrow
          />
          <Button
            onClick={close}
            text="Cancel"
            variant="secondary"
            className="w-full"
            showArrow={false}
          />
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
