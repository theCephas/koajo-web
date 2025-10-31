"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Modal, ModalProps } from "@/components/utils";
import { useForm } from "react-hook-form";
import CardAuth from "@/components/auth/card-auth";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";

const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? first.trim() : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return fallback;
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await AuthService.forgotPassword({ email: data.email });
      if (response && "email" in response && "requested" in response) {
        setSuccess(response.requested === true);
      } else if (response && "error" in response && "message" in response) {
        setSuccess(false);
        setErrorMessage(
          resolveApiMessage(
            response.message,
            "Failed to send reset link. Please check your email and try again."
          )
        );
      }
      setModalVisible(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setSuccess(false);
      setErrorMessage(
        "Failed to send reset link. Please check your email and try again."
      );
      setIsLoading(false);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardAuth
        title="Reset Your Password"
        description="Just follow the steps to get back into your Koajo account!"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {isSubmitted && modalVisible && (
        <MessageModal
          visible={modalVisible}
          onClose={() => {setSuccess(false); setModalVisible(false); setErrorMessage("");}}
          type={success ? "success" : "error"}
          title={success ? "Reset link Sent" : "Failed to send reset link"}
          description={
            success
              ? "Please check your email, and click on the link to create your new password"
              : errorMessage
          }
        />
      )}
    </>
  );
}

const MessageModal = ({
  visible,
  onClose,
  title,
  description,
  type = "success",
}: Pick<ModalProps, "visible" | "onClose"> & {
  title: string;
  description: string;
  type: "success" | "error";
}) => {
  const cardAuthChildren = () => (
    <>
      <Button
        text="Resend Link"
        variant="secondary"
        className="w-full"
        showArrow={false}
        onClick={onClose}
      />
      <Link href="/auth/login">
        <Button
          text="Login now"
          variant="primary"
          className="w-full"
          showArrow={false}
        />
      </Link>
    </>
  );
  return type === "success" ? (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth title={title} description={description} showSuccessIcon={true}>
        {cardAuthChildren()}
      </CardAuth>
    </Modal>
  ) : (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth title={title} description={description} showErrorIcon={true}>
        {cardAuthChildren()}
      </CardAuth>
    </Modal>
  );
};
