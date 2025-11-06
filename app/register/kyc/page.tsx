"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { fetchVerificationSession } from "@/lib/utils/stripe";
import TokenManager from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import { getApiUrl, getDefaultHeaders } from "@/lib/constants/api";

const KYC_STORAGE_KEY = 'kyc_step';
const PENDING_VERIFICATION_TYPE_KEY = 'pendingVerificationType';

export default function KycPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<
    "verification" | "processing" | "success" | "done"
  >("verification");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationTriggered, setVerificationTriggered] = useState(false);
  const [verificationStatusChecked, setVerificationStatusChecked] = useState(false);
  const [isIdNumber, setIsIdNumber] = useState(false);
  const [isDocument, setIsDocument] = useState(false);

  const verificationWindowRef = useRef<Window | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const isIdNumber = searchParams.get('id_number') === 'submitted';
    const isDocument = searchParams.get('document') === 'submitted';
    setIsIdNumber(isIdNumber);
    setIsDocument(isDocument);
    console.log('isIdNumber', isIdNumber);
    console.log('isDocument', isDocument);
  }, [searchParams]);

  // Initialize step from localStorage or check verification status
  useEffect(() => {
    const initializeStep = async () => {
      // First, check if we're returning from Stripe (has verification=complete in URL)
      const verification = searchParams.get('verification');
      const verificationSessionId = searchParams.get('verification_session');

      console.log('verification', verification);
      console.log('verificationSessionId', verificationSessionId);
      if (verification === 'complete' && verificationSessionId) {
        // We're returning from Stripe, handle the return
        await handleVerificationReturn(verificationSessionId);
        return;
      }

      // Check localStorage for persisted step
      const savedStep = localStorage.getItem(KYC_STORAGE_KEY) as "verification" | "processing" | "success" | null;
      if (savedStep) {
        setCurrentStep(savedStep);
        setVerificationStatusChecked(true);
      }

      // Also check backend verification status
      const token = TokenManager.getToken();
      if (!token) {
        setVerificationStatusChecked(true);
        return;
      }

      try {
        const response = await AuthService.getMe(token);
        if (response && "error" in response) {
          setVerificationStatusChecked(true);
          return;
        }

        const user = response as any;
        const verificationStatus = user.identity_verification;

        // If document is verified but ID number is not, show ID number verification step
        if (verificationStatus === "document_verified") {
          setCurrentStep("processing");
          localStorage.setItem(KYC_STORAGE_KEY, "processing");
        } else if (verificationStatus === "all_verified") {
          // Both verifications complete, redirect to dashboard
          router.push("/dashboard");
          return;
        }

        setVerificationStatusChecked(true);
      } catch (err) {
        console.error("Error checking verification status:", err);
        setVerificationStatusChecked(true);
      }
    };

    initializeStep();
  }, [router, searchParams]);

  const handleVerificationReturn = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Retrieving verification session:', sessionId);
      
      const response = await fetch(`/api/verification-session/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve verification details');
      }

      const data = await response.json();
      const { session, verificationReport, firstName, lastName, ssnLast4, address } = data;

      console.log('Verification session retrieved:', {
        status: session.status,
        type: session.type,
        hasReport: !!verificationReport,
        firstName,
        lastName,
        hasSSN: !!ssnLast4,
        hasAddress: !!address,
      });

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

      const type = localStorage.getItem(PENDING_VERIFICATION_TYPE_KEY) || session.type;
      
      if (session.status === 'verified') {
        if (type === 'document') {
          // Document verified - move to ID number verification
          setCurrentStep("verification");
          localStorage.setItem(KYC_STORAGE_KEY, "verification");
          localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
        } else if (type === 'id_number') {
          // ID number verified - create customer and update user
          setCurrentStep("success");
          localStorage.setItem(KYC_STORAGE_KEY, "success");
          localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
          const token = TokenManager.getToken();
          if (token) {
            try {
              // Update user name if available
              if (firstName || lastName) {
                const updateData: { firstName?: string; lastName?: string } = {};
                if (firstName) updateData.firstName = firstName;
                if (lastName) updateData.lastName = lastName;

                await AuthService.updateUser(updateData, token);
                console.log('User name updated successfully:', { firstName, lastName });
              }

              // Create customer with SSN and address if available from ID number verification
              if (ssnLast4 || address) {
                try {
                  const customerResponse = await fetch(getApiUrl('/auth/create-customer'), {
                    method: 'POST',
                    headers: {
                      ...getDefaultHeaders(),
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      ssn_last4: ssnLast4,
                      address: address,
                    }),
                  });

                  if (customerResponse.ok) {
                    const customerData = await customerResponse.json();
                    console.log('Customer created successfully:', customerData);
                  } else {
                    const errorData = await customerResponse.json();
                    console.error('Failed to create customer:', errorData);
                  }
                } catch (customerErr) {
                  console.error('Error creating customer:', customerErr);
                  // Don't block the flow if customer creation fails
                }
              }
            } catch (err) {
              console.error('Error updating user:', err);
            }
          }
          
          setCurrentStep("success");
          localStorage.setItem(KYC_STORAGE_KEY, "success");
          localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
        }
      } else if (session.status === 'requires_input') {
        setError('Verification requires additional input. Please try again.');
        setCurrentStep("verification");
        localStorage.setItem(KYC_STORAGE_KEY, "verification");
        localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
      } else if (session.status === 'processing') {
        setCurrentStep("processing");
        localStorage.setItem(KYC_STORAGE_KEY, "processing");
      } else {
        setError('Verification failed. Please try again.');
        setCurrentStep("verification");
        localStorage.setItem(KYC_STORAGE_KEY, "verification");
        localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
      }

      setVerificationTriggered(false);
    } catch (err) {
      console.error('Error handling verification return:', err);
      setError(err instanceof Error ? err.message : 'Failed to process verification');
      setCurrentStep("verification");
      localStorage.setItem(KYC_STORAGE_KEY, "verification");
      localStorage.removeItem(PENDING_VERIFICATION_TYPE_KEY);
      setVerificationTriggered(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const verification = searchParams.get('verification');
    const verificationSessionId = searchParams.get('verification_session');
    
    if (verification === 'complete' && verificationSessionId) {
      handleVerificationReturn(verificationSessionId);
    } else if (verification === 'complete') {
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

  const runVerification = useCallback(
    async (type: "document" | "id_number") => {
      if (verificationTriggered) {
        console.log("Verification already in progress");
        return;
      }

      setError(null);
      setVerificationTriggered(true);

      try {
        const verificationSession = await fetchVerificationSession({
          email: TokenManager.getUserData()?.email || "user@example.com",
          userId: TokenManager.getUserData()?.id || "user_123",
          phone: TokenManager.getUserData()?.phoneNumber || "+12222222222",
          type,
        });

        if (!verificationSession?.verificationUrl) {
          throw new Error("Failed to create verification session");
        }

        localStorage.setItem('pendingVerificationType', type);

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

        const checkWindow = setInterval(() => {
          if (verificationWindowRef.current?.closed) {
            clearInterval(checkWindow);
          }
        }, 1000);

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
    if (type === "id_number") setCurrentStep("done")
  };

  const handleDecline = () => router.push("/register");
  const handleContinue = () => router.push("/dashboard");

  if (!isIdNumber && isDocument) {
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


  if (isIdNumber) {
    return (
      <CardAuth
        title="ID Number Submitted"
        description="Your ID number is being processed. You will be notified within 24 hours through email and in your dashboard regarding the status of your verification. You can now proceed to your dashboard."
      >
        <div className="space-y-6 text-center">
          <Button
            onClick={handleContinue}
            text="Continue to Email Verification"
            variant="primary"
            className="w-full"
            showArrow
            href="/register/verify-email"
          />
        </div>
      </CardAuth>
    );
  }

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
