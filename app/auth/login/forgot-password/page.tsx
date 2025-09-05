"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Label, Input, Field } from "@/components/utils";
import cn from "clsx";
import { useForm } from "react-hook-form";
import CardAuth from "@/components/auth/card-auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting, isSubmitted },
    watch,
  } = useForm<ForgotPasswordFormData>();
  const { recoverPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const formData = watch();

  const handleSubmitForm = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const success = await recoverPassword(data.email);

      if (!success) {
        // Handle login failure
        return;
      }

    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log("Google login clicked");
  };

  if (isSubmitted) 
    return <SuccessMessage />


    return (
      <CardAuth
        title="Reset Your Password"
        description="Just follow the steps to get back into your Koajo account!"
      >
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          {/* Email Field */}
         <Field
          label="Email"
          type="email"
          placeholder="yourname@gmail.com"
          required
          error={formErrors.email?.message}
          {...register("email", { required: "Email is required" })}
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

const SuccessMessage = () => {
  return (
    <CardAuth
      title="Reset Password Link Sent your email"
      description="Please check your email, and create your new password"
      showSuccessIcon={true}
    >
      {/* Login Button */}
      <Link href="/auth/login">
        <Button
          text="Login now"
          variant="primary"
          className="w-full"
          showArrow={false}
        />
      </Link>
    </CardAuth>
  );
};
