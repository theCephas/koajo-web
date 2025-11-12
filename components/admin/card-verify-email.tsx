"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { getApiUrl, getDefaultHeaders } from "@/lib/constants/api";
import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  User,
} from "@/lib/types/api";
import TokenManager from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import { resolveApiErrorMessage } from "@/lib/utils/api-helpers";

const isKycComplete = (status: User["identityVerification"]) =>
  Boolean(
    status && status.status === "verified" && status.type === "id_number"
  );

export default function CardVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(
    () => TokenManager.getUserData()?.emailVerified || false
  );
  const [action, setAction] = useState<"verify-email" | "resend-email">(
    "verify-email"
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>(
    () => TokenManager.getUserData()?.email || ""
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [requiresKycRedirect, setRequiresKycRedirect] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const autoActionTriggeredRef = useRef(false);
  const getOrigin = () => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) return "https://koajo-frontend.vercel.app";
    return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  };

  const origin = getOrigin();

  useEffect(() => {
    autoActionTriggeredRef.current = false;
  }, [searchParams]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && emailParam !== email) {
      setEmail(emailParam);
    }
  }, [searchParams, email]);

  useEffect(() => {
    const token = TokenManager.getToken();
    if (!token) {
      setIsProfileLoading(false);
      return;
    }

    let cancelled = false;

    const hydrateProfile = async () => {
      try {
        const response: any = await AuthService.getMe(token);
        if (cancelled || !response) return;

        if ("error" in response) {
          setProfileError(
            response.message || "Unable to load your profile. Please try again."
          );
          return;
        }

        const profile = response as User;
        TokenManager.setUser(profile);
        setEmail(profile.email);
        setIsVerified(profile.emailVerified);

        if (!isKycComplete(profile.identityVerification)) {
          setRequiresKycRedirect(true);
          router.replace("/register/kyc");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch profile:", err);
          setProfileError(
            resolveApiErrorMessage(err, "Unable to load your profile. Please log in and try again.")
          );
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const resendEmail = useCallback(
    async (targetEmail?: string) => {
      const emailToUse = targetEmail ?? email;
      if (isVerified || !emailToUse) return;

      if (targetEmail && targetEmail !== email) {
        setEmail(targetEmail);
      }

      setIsLoading(true);
      setError(null);
      setAction("resend-email");

      try {
        const response = await AuthService.resendVerificationEmail({
          email: emailToUse,
          origin,
        });

        if ("error" in response && "message" in response) {
          setError(resolveApiErrorMessage(response, `Failed to send email. Click "Resend email" below to try again.`));
        }
      } catch (err) {
        console.error("Resend email error:", err);
        setError(
          resolveApiErrorMessage(err, `Failed to send email. Click "Resend email" below to try again.`)
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, isVerified, origin]
  );

  useEffect(() => {
    if (
      isProfileLoading ||
      requiresKycRedirect ||
      autoActionTriggeredRef.current
    ) {
      return;
    }

    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");
    const targetEmail = emailParam || email;

    if (!targetEmail) return;

    if (token) {
      autoActionTriggeredRef.current = true;
      void verifyEmailToken(targetEmail, token);
      return;
    }

    if (!isVerified) {
      autoActionTriggeredRef.current = true;
      void resendEmail(targetEmail);
    }
  }, [
    email,
    isProfileLoading,
    isVerified,
    requiresKycRedirect,
    resendEmail,
    searchParams,
  ]);

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
        TokenManager.updateUserData({ emailVerified: true });
      } else {
        setError(resolveApiErrorMessage(result, "Email verification failed. Please try again."));
      }
    } catch (err) {
      console.error("Email verification error:", err);
      setError(
        resolveApiErrorMessage(err, "Email verification failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (requiresKycRedirect) {
    return (
      <CardAuth
        title="Complete identity verification first"
        description="Finish verifying your ID so we can unlock email verification."
      >
        <div className="space-y-4">
          <p className="text-sm text-text-400">
            We detected that your identity verification is still pending. Head
            back to the verification step to wrap it up.
          </p>
          <Button
            text="Back to identity verification"
            variant="primary"
            className="w-full"
            showArrow
            href="/register/kyc"
          />
        </div>
      </CardAuth>
    );
  }

  if (isProfileLoading) {
    return (
      <CardAuth
        title="Checking your status"
        description="Please wait while we confirm which step you need to complete next."
      >
        <div className="flex flex-col items-center gap-3 text-text-400">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p>Loading your profile...</p>
        </div>
      </CardAuth>
    );
  }

  if (profileError) {
    return (
      <CardAuth title="Unable to load your profile" description={profileError}>
        <Button
          text="Go to Login"
          variant="primary"
          className="w-full"
          showArrow
          href="/auth/login"
        />
      </CardAuth>
    );
  }

  if (isVerified) {
    return (
      <CardAuth
        title="Email Verified!"
        description="Your email has been successfully verified."
        showSuccessIcon={true}
      >
        <div className="space-y-6">
          <Button
            text="Continue"
            variant="primary"
            className="w-full"
            showArrow={true}
            href="/dashboard"
          />
        </div>
      </CardAuth>
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
                  onClick={() => resendEmail()}
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
