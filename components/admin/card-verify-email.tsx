"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { getApiUrl, getDefaultHeaders } from "@/lib/constants/api";
import type { VerifyEmailRequest, VerifyEmailResponse } from "@/lib/types/api";
import TokenManager from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";

export default function CardVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(
    TokenManager.getUserData()?.emailVerified || false
  );
  const [action, setAction] = useState<"verify-email" | "resend-email">(
    "verify-email"
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL || "https://koajo-frontend.vercel.app";

  useEffect(() => {
    console.log(
      "isVerified in useEffect",
      TokenManager.getUserData()?.emailVerified
    );

    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    const userEmail = emailParam || TokenManager.getUserData()?.email || "";
    setEmail(userEmail);

    if (token && userEmail) {
      verifyEmailToken(userEmail, token);
    } else if (!token && userEmail && !isVerified) {
      resendEmail();
    }
  }, [searchParams, isVerified]);

  const verifyEmailToken = async (userEmail: string, token: string) => {
    setIsLoading(true);
    setError(null);
    setAction("verify-email");

    try {
      const requestBody: VerifyEmailRequest = {
        email: userEmail,
        token,
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
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    if (isVerified || !email) return;
    setIsLoading(true);
    setError(null);
    setAction("resend-email");

    try {
      console.log("resend email", email, "origin", origin);
      const response = await AuthService.resendVerificationEmail({
        email,
        origin,
      });

      if ("error" in response && "message" in response) {
        setError(response.message as string);
      }
    } catch (err) {
      console.error("Resend email error:", err);
      setError(
        `Failed to send email. Click "Resend email" below to try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <>
        <CardAuth
          title="Email Verified!"
          description="Your email has been successfully verified."
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600">
                Your email address has been verified successfully.
              </p>
            </div>

            <Button
              text="Continue"
              variant="primary"
              className="w-full"
              showArrow={true}
              href="/dashboard"
            />
          </div>
        </CardAuth>

        {/* <Modal
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
              /> */}
        {/* <Button
                onClick={handleGoToRegistration}
                text="Continue Registration"
                variant="secondary"
                className="w-full"
                showArrow={false}
              /> */}
        {/* </div>
          </div>
        </Modal> */}
      </>
    );
  }

  return (
    <CardAuth
      title={
        !email
          ? "Login First to Your Account"
          : error
          ? "Resend Email"
          : "Check your inbox"
      }
      description={
        !email
          ? `We need to identify your email in order to send you the verification link. Please login to your account and then click on "Verify Email" in the Sttup Guide to come back to this page to verify your email.`
          : error ||
            `Secure your account by verifying your email. Open the verification link sent to your inbox at ${email}.`
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              {action === "verify-email"
                ? "Verifying your email..."
                : "Sending email..."}
            </p>
          </div>
        ) : (
          <>
            {!isVerified && (
              <div className="text-center">
                <span className="text-text-400 text-sm">
                  Didn&apos;t receive the email?{" "}
                </span>
                <button
                  type="button"
                  onClick={resendEmail}
                  disabled={isLoading}
                  className="text-tertiary-100 hover:text-tertiary-100/80 underline text-sm disabled:opacity-50"
                >
                  Resend email
                </button>
              </div>
            )}

            <Button
              text={email ? "Continue" : "Login"}
              variant="secondary"
              className="w-full"
              showArrow={false}
              href={email ? "/dashboard" : "/auth/login"}
            />
          </>
        )}
      </div>
    </CardAuth>
  );
}
