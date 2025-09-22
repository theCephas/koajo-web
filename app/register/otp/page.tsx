"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Field } from "@/components/utils";
import { useValidateForm } from "@/lib/hooks/useValidateForm";
import CardAuth from "@/components/auth/card-auth";

interface OtpFormData {
  otp: string;
}

export default function OtpPage() {
  const {
    registerField,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
  } = useValidateForm("otp");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [email] = useState("example@mail.com"); // This should come from props or context
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update the form value when otpValues changes
  useEffect(() => {
    const otpString = otpValues.join("");
    setValue("otp", otpString);
  }, [otpValues, setValue]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits

    if (pastedData.length === 6) {
      const newOtpValues = pastedData.split("");
      setOtpValues(newOtpValues);

      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      // Log the OTP data for debugging
      console.log("OTP submitted:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Reset OTP values
      setOtpValues(Array(6).fill(""));
      setValue("otp", "");
    } finally {
      setIsResending(false);
    }
  };


  const handleChangeEmail = () => {
    router.push("/register");
  };

  return (
    <CardAuth
      title="Check your inbox"
      description={`Secure your account by verifying your email. Enter the 6-digit verification code we sent to ${email}`}
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* OTP Input Fields */}
        <div className="space-y-4">
          <div className="flex gap-2.5 justify-center">
            {Array.from({ length: 6 }, (_, index) => (
              <Field
                key={index}
                // name={`otp-${index}`}
                label=""
                type="text"
                inputMode="numeric"
                maxLength={1}
                // value={otpValues[index] || ""}
                // onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="size-16"
                inputClassName="text-center text-lg font-semibold text-gray-700"
                error={formErrors.otp?.message}
                showError={false}
                // ref={(el) => {
                //   inputRefs.current[index] = el;
                // }}

          {...registerField(`otp`)}
              />
            ))}
          </div>
        </div>

        {/* Resend Code Link */}
        <div className="text-left">
          <span className="text-text-400 text-sm">
            Didn&apos;t get a code?{" "}
          </span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-tertiary-100 hover:text-tertiary-100/80 underline text-sm disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Click to resend"}
          </button>
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          text={isLoading ? "Verifying..." : "Verify"}
          variant="primary"
          className="w-full"
          disabled={isLoading || otpValues.some((value) => !value)}
          showArrow={true}
          href="/register/kyc"
        />

        {/* Change Email Button */}
        <Button
          type="button"
          text="Change email address"
          variant="secondary"
          className="w-full"
          onClick={handleChangeEmail}
          showArrow={false}
        />
      </form>
    </CardAuth>
  );
}
