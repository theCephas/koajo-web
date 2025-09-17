"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, PasswordField } from "@/components/utils";
import { useForm } from "react-hook-form";
import CardAuth from "@/components/auth/card-auth";
import { getPasswordStrength } from "@/lib/utils/form";
import { FORM_FIELDS_MESSAGES, FORM_FIELDS_PATTERNS } from "@/lib/constants";


interface NewPasswordFormData {
  newPassword: string;
  repeatPassword: string;
}


export default function NewPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors, isSubmitted },
  } = useForm<NewPasswordFormData>();

  const formData = watch();

  const passwordStrength = getPasswordStrength(formData.newPassword || "");

  const handleSubmitForm = async (data: NewPasswordFormData) => {
    if (data.newPassword !== data.repeatPassword) {
      setFailureMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to login page on success
    } catch (error) {
      setFailureMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        onSubmit={handleSubmit(handleSubmitForm)}
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
          {formData.newPassword && (
            <div className="space-y-2">
              <p className="text-xs text-text-400">
                Min 10 Characters with a combination of letters, numbers and
                special characters
              </p>

              <div className="flex items-center gap-6">
                <div className="flex gap-1 w-full">
                  {[...Array(5)].map((_, segment) => (
                    <div
                      key={segment}
                      className={`h-1.5 rounded-full transition-all ${
                        segment < passwordStrength.score
                          ? "bg-tertiary-100"
                          : "bg-text-200"
                      }`}
                      style={{ width: `${100 / 5}%` }}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    passwordStrength.score <= 2
                      ? "text-red-500"
                      : passwordStrength.score === 3
                      ? "text-yellow-500"
                      : passwordStrength.score === 4
                      ? "text-blue-500"
                      : "text-tertiary-100"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
            </div>
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
