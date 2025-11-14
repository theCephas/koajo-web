"use client";

import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
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

export default function BankConnection() {
  const { close } = useOnboarding();
  const { emailVerified, kycCompleted, user, refreshUser } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);

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

      console.log("Sending bank account data to backend...");
      await AuthService.linkStripeBankAccount(bankAccountData, token);
      console.log("Bank account successfully linked");

      await refreshUser();
      close();
    } catch (err) {
      console.error("Bank connection error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect bank account. Please try again."
      );
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
