"use client";

import { useState } from "react";
import { useStripe } from "../stripe-provider";

interface VerificationResult {
  success: boolean;
  error?: string;
  sessionId?: string;
  clientSecret?: string;
  verificationUrl?: string;
}

type VerificationType = "document" | "id_number";

export function useStripeIdentity() {
  const { stripe, loading } = useStripe();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyIdentity = async (
    type: VerificationType,
    options: {
      email: string,
      phone: string,
      userId: string,
    }) => {
    if (!stripe) {
      console.error("Stripe is not loaded:", { stripe, loading });
      return {
        success: false,
        error: "Stripe is not loaded yet. Please try again.",
      };
    }

    console.log("Starting verification with Stripe:", { ...options });
    setIsVerifying(true);

    try {
      // Call your backend to create the VerificationSession
      const response = await fetch("/api/create-verification-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: options.email,
          userId: options.userId,
          type: type,
          phone: options.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to create verification session"
        );
      }

      const verificationResult  = await response.json().then(session => stripe.verifyIdentity(session.clientSecret));

      
      return verificationResult;
      
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyIdentity,
    isVerifying,
    loading,
  };
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "consent_declined":
      return "You declined the verification process. Please try again if you wish to continue.";
    case "device_unsupported":
      return "Your device does not support camera functionality required for verification.";
    case "under_supported_age":
      return "You must be of legal age to complete verification.";
    case "phone_otp_declined":
      return "Phone number verification failed. Please try again.";
    case "email_verification_declined":
      return "Email verification failed. Please try again.";
    default:
      return "Verification failed. Please try again.";
  }
}







