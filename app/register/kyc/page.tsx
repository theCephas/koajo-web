"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { fetchVerificationSession } from "@/lib/utils/stripe";
import {
  loadStripe,
  Stripe,
  VerificationSessionResult,
} from "@stripe/stripe-js";

export default function KycPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<
    "verification" | "processing" | "success"
  >("verification");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "document_complete" | "id_complete"
  >("pending");

  const verificationInitiated = useRef(false);
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  /**
   * Combined function: fetches a fresh session and opens the modal
   */
  const runVerification = useCallback(
    async (type: "document" | "id_number") => {
      if (verificationInitiated.current) return;
      verificationInitiated.current = true;
      setError(null);

      try {
        setIsLoading(true);
        const stripe: Stripe | null = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");

        // Fetch a new client secret and immediately launch the modal
        const verificationSession = await fetchVerificationSession({
          email: localStorage.getItem("userEmail") || "user@example.com",
          userId: localStorage.getItem("userId") || "user_123",
          phone: localStorage.getItem("phoneNumber") || "+12222222222",
          type,
        });

        let result: VerificationSessionResult;
        if (!verificationSession?.clientSecret) {
          setError(" An error occured. Please try again.");
          return;
        } else {
          result = await stripe.verifyIdentity(
            verificationSession.clientSecret
          );
        }

        if (result.error) {
          if (result.error.code === "session_cancelled") {
            console.log("Modal cancelled by user");
            return; // Allow retry
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
        setIsLoading(false);
        verificationInitiated.current = false;
      }
    },
    [stripePromise]
  );

  const handleDecline = () => router.push("/register");
  const handleContinue = () => router.push("/dashboard");

  // --- PROCESSING STEP ---
  if (currentStep === "processing") {
    return (
      <CardAuth
        title="Document Verification Complete"
        description="Your document verification is complete. Please continue with ID number verification."
      >
        <div className="space-y-6">
          <Button
            onClick={() => runVerification("id_number")}
            text={isLoading ? "Processing..." : "Start ID Number Verification"}
            variant="primary"
            className="w-full"
            disabled={isLoading}
            showArrow
          />
          <Button
            onClick={() => setCurrentStep("verification")}
            text="Try Again"
            variant="secondary"
            className="w-full"
          />
        </div>
      </CardAuth>
    );
  }

  // --- SUCCESS STEP ---
  if (currentStep === "success") {
    return (
      <CardAuth
        title="Verification Successful!"
        description="Your identity has been verified successfully. You can now proceed to your dashboard."
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
      title="Identity Verification"
      description="Koajo is required by law to verify the identity of all users to prevent fraud and comply with regulations. We use Stripe’s secure verification system."
    >
      <div className="space-y-6">
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => runVerification("document")}
            text={isLoading ? "Processing..." : "Agree and Continue"}
            variant="primary"
            className="w-full"
            disabled={isLoading}
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
