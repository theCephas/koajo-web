"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { fetchVerificationSession } from "@/lib/utils/stripe";
import TokenManager from "@/lib/utils/menory-manager";
/*
import {
  loadStripe,
  Stripe,
  VerificationSessionResult,
} from "@stripe/stripe-js";

// OLD: Modal-based verification using stripe.verifyIdentity()
const runVerification = useCallback(
  async (type: "document" | "id_number") => {
    if (verificationTriggered) {
      console.log("Verification already in progress");
      return;
    }
    
    setError(null);
    setVerificationTriggered(true);

    try {
      const stripe: Stripe | null = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const verificationSession = await fetchVerificationSession({
        email: TokenManager.getUserData()?.email || "user@example.com",
        userId: TokenManager.getUserData()?.id || "user_123",
        phone: TokenManager.getUserData()?.phoneNumber || "+12222222222",
        type,
      });

      if (!verificationSession?.clientSecret) {
        throw new Error("Failed to create verification session");
      }

      // OLD: Used modal approach
      const result = await stripe.verifyIdentity(
        verificationSession.clientSecret
      );

      if (result.error) {
        if (result.error.code === "session_cancelled") {
          console.log("Modal cancelled by user");
          setVerificationTriggered(false);
          return;
        } else {
          setError(result.error.message || "Verification failed");
          return;
        }
      }

      // Update state after successful completion
      if (type === "document") {
        setVerificationStatus("document_complete");
        setCurrentStep("processing");
      } else {
        setVerificationStatus("id_complete");
        setCurrentStep("success");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setVerificationTriggered(false);
      setError(null);
    }
  },
  [stripePromise, verificationTriggered]
);


export default function KycPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<
    "verification" | "processing" | "success"
  >("verification");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationTriggered, setVerificationTriggered] = useState(false);

  const verificationWindowRef = useRef<Window | null>(null);
  const searchParams = useSearchParams();

  /**
   * Handles the return from Stripe verification and retrieves session details
   */
  const handleVerificationReturn = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Retrieving verification session:', sessionId);
      
      // Retrieve verification session details from our API (server-side)
      const response = await fetch(`/api/verification-session/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve verification details');
      }

      const data = await response.json();
      const { session, verificationReport } = data;

      console.log('Verification session retrieved:', {
        status: session.status,
        type: session.type,
        hasReport: !!verificationReport,
      });

      // Sync with backend API
      const syncResponse = await fetch('/api/sync-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          resultId: verificationReport?.id || session.id,
          verificationType: session.type,
          verificationStatus: session.status,
          userId: TokenManager.getUserData()?.id,
        }),
      });

      if (!syncResponse.ok) {
        console.error('Failed to sync verification with backend');
      }

      // Update UI based on verification status
      const type = localStorage.getItem('pendingVerificationType');
      
      if (session.status === 'verified') {
        if (type === 'document') {
          setCurrentStep("processing");
        } else if (type === 'id_number') {
          setCurrentStep("success");
        }
      } else if (session.status === 'requires_input') {
        setError('Verification requires additional input. Please try again.');
        setCurrentStep("verification");
      } else if (session.status === 'processing') {
        // Show processing state
        setCurrentStep("processing");
      } else {
        setError('Verification failed. Please try again.');
        setCurrentStep("verification");
      }

      localStorage.removeItem('pendingVerificationType');
      setVerificationTriggered(false);
    } catch (err) {
      console.error('Error handling verification return:', err);
      setError(err instanceof Error ? err.message : 'Failed to process verification');
      setVerificationTriggered(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user returned from verification and retrieve session details
  useEffect(() => {
    const verification = searchParams.get('verification');
    const verificationSessionId = searchParams.get('verification_session');
    
    if (verification === 'complete' && verificationSessionId) {
      handleVerificationReturn(verificationSessionId);
    } else if (verification === 'complete') {
      // Fallback if verification_session param is missing
      const type = localStorage.getItem('pendingVerificationType');
      if (type === 'document') {
        setCurrentStep("processing");
      } else if (type === 'id_number') {
        setCurrentStep("success");
      }
      localStorage.removeItem('pendingVerificationType');
      setVerificationTriggered(false);
    }
  }, [searchParams, handleVerificationReturn]);

  /**
   * Opens verification in a new window instead of modal
   */
  const runVerification = useCallback(
    async (type: "document" | "id_number") => {
      if (verificationTriggered) {
        console.log("Verification already in progress");
        return;
      }

      setError(null);
      setVerificationTriggered(true);

      try {
        // Fetch verification session
        const verificationSession = await fetchVerificationSession({
          email: TokenManager.getUserData()?.email || "user@example.com",
          userId: TokenManager.getUserData()?.id || "user_123",
          phone: TokenManager.getUserData()?.phoneNumber || "+12222222222",
          type,
        });

        if (!verificationSession?.verificationUrl) {
          throw new Error("Failed to create verification session");
        }

        // Store verification type for when user returns
        localStorage.setItem('pendingVerificationType', type);

        // Open verification URL in new window
        const width = 800;
        const height = 900;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        verificationWindowRef.current = window.open(
          verificationSession.verificationUrl,
          'stripeVerification',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!verificationWindowRef.current) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Monitor window closure (optional - user will be redirected to return_url)
        const checkWindow = setInterval(() => {
          if (verificationWindowRef.current?.closed) {
            clearInterval(checkWindow);
            // Don't reset state here - wait for return_url redirect
          }
        }, 1000);

        // Clean up interval after 10 minutes
        setTimeout(() => {
          clearInterval(checkWindow);
        }, 600000);

      } catch (err) {
        console.error("Verification error:", err);
        setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
        setVerificationTriggered(false);
      }
    },
    [verificationTriggered]
  );

  const triggerVerification = async (type: "document" | "id_number") => {
    await runVerification(type);
  };

  const handleDecline = () => router.push("/register");
  const handleContinue = () => router.push("/dashboard");

  // --- PROCESSING STEP ---
  if (currentStep === "processing") {
    return (
      <CardAuth
        title="Document Submitted"
        description="Your document is being processed. Please continue with ID number verification."
      >
        <div className="space-y-6">
          <Button
            onClick={() => triggerVerification("id_number")}
            text={verificationTriggered ? "Opening..." : "Start ID Number Verification"}
            variant="primary"
            className="w-full"
            disabled={verificationTriggered}
            showArrow
          />
          <Button
            onClick={() => {
              setVerificationTriggered(false);
              setCurrentStep("verification");
            }}
            text="Try Again"
            variant="secondary"
            className="w-full"
          />
          {error && (
            <p className="text-red-500 text-center text-sm pt-2">{error}</p>
          )}
        </div>
      </CardAuth>
    );
  }

  // --- SUCCESS STEP ---
  if (currentStep === "success") {
    return (
      <CardAuth
        title="ID Number Submitted"
        description="Your ID number is being processed. You will be notified within 24 hours through email and in your dashboard regarding the status of your verification. You can now proceed to your dashboard."
      >
        <div className="space-y-6 text-center">
          <Button
            onClick={handleContinue}
            text="Continue to Dashboard"
            variant="primary"
            className="w-full"
            showArrow
          />
        </div>
      </CardAuth>
    );
  }

  // --- INITIAL VERIFICATION STEP ---
  return (
    <CardAuth
      title="Document Verification"
      description="Koajo is required by law to verify the identity of all users to prevent fraud and comply with regulations. We use Stripe's secure verification system."
    >
      <div className="space-y-6">
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => triggerVerification("document")}
            text={isLoading || verificationTriggered ? "Processing..." : "Agree and Continue"}
            variant="primary"
            className="w-full"
            disabled={isLoading || verificationTriggered}
            showArrow
          />
          <Button
            onClick={handleDecline}
            text="Decline"
            variant="secondary"
            className="w-full"
          />
          {error && (
            <p className="text-red-500 text-center text-sm pt-2">{error}</p>
          )}
        </div>
      </div>
    </CardAuth>
  );
}
