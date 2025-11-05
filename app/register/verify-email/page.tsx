"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { getApiUrl, getDefaultHeaders } from "@/lib/constants/api";
import type { VerifyEmailRequest, VerifyEmailResponse } from "@/lib/types/api";
import TokenManager from "@/lib/utils/menory-manager";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    const userEmail = emailParam || TokenManager.getUserData()?.email || "";
    setEmail(userEmail);


    if (token && userEmail) {
      verifyEmailToken(userEmail, token);
    }
  }, [searchParams]);

  const verifyEmailToken = async (userEmail: string, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: VerifyEmailRequest = {
        email: userEmail,
        token: token,
      };

      const response = await fetch(getApiUrl("/auth/verify-email"), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Email verification failed");
      }

      const result: VerifyEmailResponse = await response.json();
      
      if (result.verified) {
        setIsVerified(true);

      } else {
        setError("Email verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Email verification error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/auth/resend-email"), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      alert("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error("Resend email error:", err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(true);
  };

  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  const handleGoToRegistration = () => {
    router.push("/register/");
  };

  if (isVerified) {
    return (
      <>
        <CardAuth
          title="Email Verified!"
          description="Your email has been successfully verified. You can now continue with your registration."
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Your email address has been verified successfully.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              text="Continue"
              variant="primary"
              className="w-full"
              showArrow={true}
            />
          </div>
        </CardAuth>

        <Modal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
              <p className="text-gray-600">
                Your email has been successfully verified. You can now proceed to login.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                text="Go to Login"
                variant="primary"
                className="w-full"
                showArrow={true}
              />
              {/* <Button
                onClick={handleGoToRegistration}
                text="Continue Registration"
                variant="secondary"
                className="w-full"
                showArrow={false}
              /> */}
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <CardAuth
      title="Verify Your Email"
      description={error || `Please verify your email address. Check your inbox at ${email} for the verification link.`}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : (
          <>
            <div className="text-left">
              <span className="text-text-400 text-sm">
                Didn&apos;t receive the email?{" "}
              </span>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isLoading}
                className="text-tertiary-100 hover:text-tertiary-100/80 underline text-sm disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Resend email"}
              </button>
            </div>

            <Button
              text="Continue"
              variant="secondary"
              className="w-full"
              showArrow={false}
              href="/auth/login"
            />
          </>
        )}
      </div>
    </CardAuth>
  );
}
