"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field } from "@/components/utils";
import { useForm } from "react-hook-form";
import CardAuth from "@/components/auth/card-auth";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { resolveApiMessage } from "@/lib/utils/api-helpers";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ForgotPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getOrigin = () => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) return "https://koajo-frontend.vercel.app";
    return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword({
        email: data.email,
        origin: getOrigin()
      });
      if (response && "email" in response && "requested" in response) {
        // Navigate to check-inbox page with email
        router.push(`/auth/forgot-password/check-inbox?email=${encodeURIComponent(data.email)}`);
      } else if (response && "error" in response && "message" in response) {
        // Show error - could enhance this with error state/toast
        console.error("Failed to send reset link:", response.message);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardAuth
      title="Reset Your Password"
      description="Just follow the steps to get back into your Koajo account!"
      goBackHref="/auth/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <Field
          label="Email"
          type="email"
          placeholder="example@mail.com"
          required
          error={formErrors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email address",
            },
          })}
        />

        {/* Continue Button */}
        <Button
          type="submit"
          text={isLoading ? "Sending..." : "Continue"}
          variant="primary"
          className="w-full"
          disabled={isLoading}
          showArrow={false}
        />
      </form>
    </CardAuth>
  );
}
