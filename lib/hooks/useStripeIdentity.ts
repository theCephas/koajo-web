"use client";

import { useState, useCallback, useRef } from "react";
import { useStripe } from "../provider-stripe";
import { StripeError, VerificationSessionResult } from "@stripe/stripe-js";

export function useStripeIdentity() {
  const { stripe, loading: stripeLoading } = useStripe();
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationInProgress = useRef(false);
  const [error, setError] = useState<StripeError | null>(null);

  // lib/hooks/useStripeIdentity.ts
const verifyIdentity = useCallback(
  async (clientSecret: string): Promise<VerificationSessionResult | { error: unknown }> => {
    if (!stripe) throw new Error("Stripe not initialized");

    try {
      verificationInProgress.current = true;
      // Do NOT setIsVerifying(true) here — it triggers a render.
      await new Promise((r) => setTimeout(r, 100));
      return await stripe.verifyIdentity(clientSecret);
    } catch (err) {
      console.error("Verification error:", err);
      return { error: err };
    } finally {
      // Delay any state updates until modal is done.
      setTimeout(() => {
        verificationInProgress.current = false;
        setIsVerifying(false);
      }, 1000);
    }
  },
  [stripe]
);

  return {
    verifyIdentity,
    isVerifying,
    loading: stripeLoading,
    error,
  };
}
