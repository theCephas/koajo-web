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
  const [verificationTriggered, setVerificationTriggered] = useState(false);

  const verificationInitiated = useRef(false);
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  /**
   * Combined function: fetches a fresh session and opens the modal
   */
  const runVerification = useCallback(
    async (type: "document" | "id_number") => {
      console.log("runVerification running");
      if (verificationTriggered) {
        console.log("in here, and value is:", verificationTriggered);
        return;
      }
      verificationInitiated.current = true;
      setError(null);

      try {
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
          throw new Error(" An error occured. Please try again.");
          return;
        } else {
          result = await stripe.verifyIdentity(
            verificationSession.clientSecret
          );
        }

        if (result.error) {
          if (result.error.code === "session_cancelled") {
            console.log("Modal cancelled by user  → allowing retry");

            setVerificationTriggered(false);
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
        setVerificationTriggered(false);
        setError(null);
      }
    },
    [stripePromise, verificationTriggered]
  );

  const triggerVerification = async (type: "document" | "id_number") => {
    setVerificationTriggered(true);
    setError(null);
    console.log("verificationTriggered → true");

    await runVerification(type);

    // Reset AFTER modal is done
    setTimeout(() => {
      setVerificationTriggered(false);
      console.log("verificationTriggered → false");
    }, 100);
  };

  const handleDecline = () => router.push("/register");
  const handleContinue = () => router.push("/dashboard");

  // --- PROCESSING STEP ---
  // if (currentStep === "processing") {
  return (
    <CardAuth
      title="Document Submitted"
      description="Your document is being processed. Please continue with ID number verification."
    >
      <div className="space-y-6">
        <Button
          onClick={() => triggerVerification("id_number")}
          text={verificationTriggered ? "Processing..." : "Start ID Number Verification"}
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
      </div>
    </CardAuth>
  );
  // }

  // --- SUCCESS STEP ---
  // if (currentStep === "success") {
  //   return (
  //     <CardAuth
  //       title="ID Number Submitted"
  //       description="Your ID number is being processed. You will be notified within 24 hours through email and in your dashboard regarding the status of your verification. You can now proceed to your dashboard."
  //     >
  //       <div className="space-y-6 text-center">
  //         <Button
  //           onClick={handleContinue}
  //           text="Continue to Dashboard"
  //           variant="primary"
  //           className="w-full"
  //           showArrow
  //         />
  //       </div>
  //     </CardAuth>
  //   );
  // }

  // --- INITIAL VERIFICATION STEP ---
  // return (
  //   <CardAuth
  //     title="Document Verification"
  //     description="Koajo is required by law to verify the identity of all users to prevent fraud and comply with regulations. We use Stripe’s secure verification system."
  //   >
  //     <div className="space-y-6">
  //       <div className="space-y-3 pt-4">
  //         <Button
  //           onClick={() => {
  //             setVerificationTriggered(true);
  //             runVerification("document").finally(() =>
  //               setVerificationTriggered(false)
  //             );
  //           }}
  //           text={isLoading ? "Processing..." : "Agree and Continue"}
  //           variant="primary"
  //           className="w-full"
  //           disabled={isLoading}
  //           showArrow
  //         />
  //         <Button
  //           onClick={() => {
  //             setVerificationTriggered(false);
  //             handleDecline();
  //           }}
  //           text="Decline"
  //           variant="secondary"
  //           className="w-full"
  //         />
  //         {error && (
  //           <p className="text-red-500 text-center text-sm pt-2">{error}</p>
  //         )}
  //       </div>
  //     </div>
  //   </CardAuth>
  // );
}
