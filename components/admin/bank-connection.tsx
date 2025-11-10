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
} from "@/app/register/kyc/actions";

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

      const connectedAccountId =
        result.financialConnectionsSession?.accounts?.[0]?.id;

      if (!connectedAccountId) {
        throw new Error(
          "Stripe did not return a connected bank account identifier."
        );
      }

      await AuthService.linkStripeBankAccount(
        {
          id: connectedAccountId,
          customer_id: customer.customerId,
        },
        token
      );

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
