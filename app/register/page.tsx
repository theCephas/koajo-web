"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Field, PasswordField } from "@/components/utils";
import { useValidateForm } from "@/lib/hooks/useValidateForm";
import CardAuth from "@/components/auth/card-auth";
import PasswordStrengthIndicator from "@/components/auth/password-strength-indicator";

interface RegisterFormData {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function RegisterPage() {
  const {
    registerField,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
  } = useValidateForm("registration");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Store user data in localStorage for use in KYC verification
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('phoneNumber', data.phoneNumber);
      localStorage.setItem('userId', `user_${Date.now()}`); // Generate a simple user ID
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/register/otp");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardAuth
      title="Let's Create Your Account"
      description="Get started with Koajo and take control of your finances."
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6.5"
        noValidate
      >
        {/* Email Field */}
        <Field
          label="Email"
          type="email"
          placeholder="Enter Your email"
          required
          error={formErrors.email?.message}
          {...registerField("email")}
        />

        {/* Phone Number Field */}
        <Field
          label="Phone Number"
          type="tel"
          placeholder="+1 650-555-1234"
          required
          error={formErrors.phoneNumber?.message}
          {...registerField("phoneNumber")}
        />

        {/* Password Field */}
        <PasswordField
          label="Password"
          placeholder="Enter your password"
          required
          error={formErrors.password?.message}
          {...registerField("password")}
        />
        
        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator password={password} showDescription={false} />

        {/* Confirm Password Field */}
        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          required
          error={formErrors.confirmPassword?.message}
          {...registerField("confirmPassword")}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...registerField("agreeToTerms")}
              className="w-4 h-4 text-primary border-secondary-100 rounded focus:ring-primary"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-base text-text-500">
                I agree to the terms
              </span>
            </label>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-base text-tertiary-100 hover:text-tertiary-100/80 transition-colors"
          >
            Forgot Password
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          text={isLoading ? "Creating account..." : "Sign up"}
          variant="primary"
          className="w-full"
          disabled={isLoading}
          showArrow={false}
        />
      </form>

      {/* Registration Link */}
      <div className="text-center font-semibold flex items-center justify-center gap-1">
        <span className="text-text-400">Already have an account? </span>
        <Link
          href="/auth/login"
          className="text-tertiary-100 hover:text-tertiary-100/80"
        >
          Login Here
        </Link>
      </div>
    </CardAuth>
  );
}
