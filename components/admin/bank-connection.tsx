"use client";

import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { useOnboarding } from "@/lib/provider-onboarding";
import { useDashboard } from "@/lib/provider-dashboard";
import TokenManager from "@/lib/utils/memory-manager";

export default function BankConnection() {
  const { close } = useOnboarding();
  const { emailVerified, kycCompleted } = useDashboard();
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
      const token = TokenManager.getToken() || "ddfkdjfkjdkfjd";
      const userData = TokenManager.getUserData();
      
      // if (!token || !userData?.id) {
      //   throw new Error("User not authenticated");
      // }

      if (!stripe) {
        throw new Error("Stripe is not loaded. Please wait a moment and try again.");
      }

      let customerId = userData?.customer?.id;
      if (!customerId) {
        try {
          const { AuthService } = await import("@/lib/services/authService");
          const response = await AuthService.getMe(token);
          if (response && !("error" in response)) {
            customerId = response.customer?.id;
          }
        } catch (err) {
          console.warn("Failed to fetch user data:", err);
        }
      }

      if (!customerId) {
        try {
          console.log("Creating Stripe customer...");
          const createCustomerResponse = await fetch('/api/create-stripe-customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: userData?.id || "12397987",
              email: userData?.email || "user@example.com",
              phone: userData?.phone  || "1234567890",
              name: (userData?.firstName && userData?.lastName) 
                ? `${userData.firstName} ${userData.lastName}` 
                :  "John Doe",
            }),
          });

          if (createCustomerResponse.ok) {
            const customerData = await createCustomerResponse.json();
            customerId = customerData.customer?.id;
            console.log('Stripe customer created:', customerId);

            // Refresh user data to get updated customer ID
            // const { AuthService } = await import("@/lib/services/authService");
            // const refreshedResponse = await AuthService.getMe(token);
            // if (refreshedResponse && !("error" in refreshedResponse)) {
            //   customerId = refreshedResponse.customer?.id || customerId;
            // }
          } else {
            const errorData = await createCustomerResponse.json();
            throw new Error(errorData.error || errorData.details || 'Failed to create Stripe customer');
          }
        } catch (err) {
          console.error("Error creating Stripe customer:", err);
          throw new Error(err instanceof Error ? err.message : 'Failed to create Stripe customer. Please try again.');
        }
      }

      const response = await fetch('/api/create-financial-connections-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
          body: JSON.stringify({
            userId: userData?.id || "12397987",
            customerId,
            permissions: ['ownership', 'payment_method'],
            filters: {
              countries: ['US'],
              account_subcategories: ['checking', 'savings']
            }
          }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to create bank connection session');
      }

      const { client_secret, session_id } = await response.json();

      if (!client_secret) {
        throw new Error('Failed to get connection session from Stripe');
      }

      const result = await stripe.collectFinancialConnectionsAccounts({
        clientSecret: client_secret,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to connect bank account');
      }

      if (session_id) {
        localStorage.setItem('pendingBankConnection', session_id);
      }

      close();
    } catch (err) {
      console.error('Bank connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect bank account. Please try again.');
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
          <p>By connecting your bank account, you agree to our terms of service and authorize Koajo to process payments according to your pod schedule.</p>
        </div>
      </div>
    </CardAuth>
  );
}

