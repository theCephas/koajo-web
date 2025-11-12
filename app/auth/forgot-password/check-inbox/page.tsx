"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Button, Field } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";

function CheckInboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!emailFromUrl) return;

    setIsResending(true);
    try {
      await AuthService.forgotPassword({ email: emailFromUrl });
    } catch (error) {
      console.error("Failed to resend:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <CardAuth
      title="Check your inbox"
      description="Please check your email, and click on the link to create your new password"
      showInfoIcon={true}
    >
      <div className="space-y-6">
        {/* Email Display */}
        <Field
          name=""
          label="Email"
          type="email"
          value={emailFromUrl}
          readOnly
          disabled
        />

        {/* Resend Link */}
        <div className="text-center">
          <span className="text-text-400 text-sm">
            Didn&apos;t get a code?{" "}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-tertiary-100 hover:text-tertiary-100/80 underline text-sm disabled:opacity-50"
          >
            Click to resend
          </button>
        </div>

        {/* Login Button */}
        <Link href="/auth/login">
          <Button
            text="Verify Now"
            variant="primary"
            className="w-full"
            showArrow={false}
          />
        </Link>
      </div>
    </CardAuth>
  );
}

export default function CheckInboxPage() {
  return (
    <Suspense
      fallback={
        <CardAuth title="Loading..." description="Please wait">
          <div className="text-center">Loading...</div>
        </CardAuth>
      }
    >
      <CheckInboxContent />
    </Suspense>
  );
}
