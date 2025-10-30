"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, PasswordField } from "@/components/utils";
import { useForm } from "react-hook-form";
import CardAuth from "@/components/auth/card-auth";
import { getPasswordStrength } from "@/lib/utils/form";
import { FORM_FIELDS_MESSAGES, FORM_FIELDS_PATTERNS } from "@/lib/constants/form";
import PasswordStrengthIndicator from "@/components/auth/password-strength-indicator";
import { AuthService } from "@/lib/services/authService";


interface NewPasswordFormData {
  newPassword: string;
  repeatPassword: string;
}


export default function NewPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors, isSubmitted },
  } = useForm<NewPasswordFormData>();


  const password = watch("newPassword");

  const onSubmit = async (data: NewPasswordFormData) => {
    if (data.newPassword !== data.repeatPassword) {
      setFailureMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.resetPassword({ email: "test@test.com", token: "1234567890", newPassword: data.newPassword });
      if (response && "reset" in response && response.reset === true) {
        setSuccess(true);
      } else {
        setFailureMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      setFailureMessage("An error occurred. Please try again.");
    } 
    setIsLoading(false);
  };

  if (isSubmitted)
    return <SuccessMessage />

  return (
    <CardAuth
      title="Create New Password"
      description="Send your email account to reset password & make new password"
      goBackHref="/auth/login"
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6.5"
        noValidate
      >
        {failureMessage && (
          <span className="text-red-500 text-sm mx-auto w-fit block">
            {failureMessage}
          </span>
        )}

        {/* New Password Field */}
        <div className="space-y-3">
          <PasswordField
            label="New Password"
            placeholder="Enter new password"
            required
            error={formErrors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: FORM_FIELDS_PATTERNS.PASSWORD.MIN_LENGTH,
                message: FORM_FIELDS_MESSAGES.PASSWORD.MIN_LENGTH,
              },
              pattern: {
                value: FORM_FIELDS_PATTERNS.PASSWORD.ALL,
                message:
                  FORM_FIELDS_MESSAGES.PASSWORD.ALL,
              },
            })}
          />

          {/* Password Strength Indicator */}
          {password && (
            <PasswordStrengthIndicator password={password} />
          )}
        </div>

        {/* Repeat Password Field */}
        <PasswordField
          label="Repeat Password"
          placeholder="Repeat your password"
          required
          error={formErrors.repeatPassword?.message}
          {...register("repeatPassword", {
            required: FORM_FIELDS_MESSAGES.PASSWORD.REPEAT,
            validate: (value) => {
              const newPassword = watch("newPassword");
              return value === newPassword || FORM_FIELDS_MESSAGES.PASSWORD.REPEAT;
            },
          })}
        />

        {/* Continue Button */}
        <div className="flex flex-col gap-3 items-center">
          <Button
            type="submit"
            text={isLoading ? "Updating..." : "Continue"}
            variant="primary"
            className="w-full"
            disabled={isLoading}
            showArrow={false}
          />
        </div>
      </form>
    </CardAuth>
  );
}

const SuccessMessage = () => {
  return (
    <CardAuth
      title="Password Successfully Reset"
      description="You can now go to login page and login with your new password"
      showSuccessIcon={true}
    >
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
