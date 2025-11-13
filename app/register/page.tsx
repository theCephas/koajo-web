"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Field,
  Label,
  Modal,
  ModalProps,
  PasswordField,
  PhoneNumberField,
} from "@/components/utils";
import { useValidateForm } from "@/lib/hooks/useValidateForm";
import CardAuth from "@/components/auth/card-auth";
import PasswordStrengthIndicator from "@/components/auth/password-strength-indicator";
import { getPhoneNumber } from "@/lib/utils/form";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import { useRouter } from "next/navigation";
import {
  REGISTRATION_STAGE,
  REGISTRATION_STAGE_MAP,
  RegistrationStage,
} from "@/lib/constants/dashboard";
import { SignupResponse, User } from "@/lib/types/api";
import { resolveApiErrorMessage } from "@/lib/utils/api-helpers";

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
  const password = watch("password");
  const [registrationStage, setRegistrationStage] = useState<RegistrationStage>(
    TokenManager.getRegistrationStage() || REGISTRATION_STAGE.NONE
  );
  const [modalType, setModalType] = useState<"success" | "error" | "continue">(
    registrationStage === REGISTRATION_STAGE.NONE ? "success" : "continue"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (
      TokenManager.isRegistered() &&
      registrationStage !== REGISTRATION_STAGE.NONE
    ) {
      setModalType("continue");
      setModalVisible(true);
    }
  }, [registrationStage]);

  const onClose = () => {
    setModalVisible(false);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await AuthService.signup({
        email: data.email,
        phoneNumber: getPhoneNumber(data.phoneNumber),
        password: data.password,
      });

      // Check for error response
      if (response && "error" in response && "message" in response) {
        const message = resolveApiErrorMessage(
          response,
          "Account creation failed. Please try again."
        );
        setErrorMessage(message);
        setModalType("error");
        setModalVisible(true);
      } else if (
        response &&
        ("id" in response || "accountId" in response) &&
        !("error" in response)
      ) {
        const signupResponse = response as SignupResponse & User;
        setModalType("success");
        setModalVisible(true);
        TokenManager.setUser({
          id: response?.accountId || response?.id,
          email: data.email,
          phone: getPhoneNumber(data.phoneNumber),
          emailVerified: false,
          agreedToTerms: false,
          isActive: false,
          identityVerification: null,
        });
        TokenManager.setRegistrationStage(REGISTRATION_STAGE.REGISTERED);
      }
    } catch (error: any) {
      const message = resolveApiErrorMessage(
        error,
        "Account creation failed. Please try again."
      );
      setErrorMessage(message);
      setModalType("error");
      setModalVisible(true);
    } finally {
      setIsLoading(false);
      // setTimeout(() => {
      //   setModalVisible(false);
      if (modalType === "success") {
        router.push(
          REGISTRATION_STAGE_MAP[
            registrationStage.toUpperCase() as keyof typeof REGISTRATION_STAGE_MAP
          ]
        );
      }
      // }, 4000);
    }
  };

  return (
    <>
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
          <PhoneNumberField
            label="Phone Number"
            placeholder="(650) 555 1234"
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
          <PasswordStrengthIndicator
            password={password}
            showDescription={false}
          />

          {/* Confirm Password Field */}
          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter your password"
            required
            error={formErrors.confirmPassword?.message}
            {...registerField("confirmPassword")}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...registerField("agreeToTerms")}
                  className="w-4 h-4 text-primary border-secondary-100 rounded focus:ring-primary"
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-base text-text-500"
                >
                  I agree to Koajo terms
                </Label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-base text-tertiary-100 hover:text-tertiary-100/80 transition-colors"
              >
                Forgot Password
              </Link>
            </div>

            {/* Terms Error Message */}
            {formErrors.agreeToTerms && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                {formErrors.agreeToTerms.message}
              </div>
            )}
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
        <div className="text-center text-sm flex items-center justify-center gap-1">
          <span className="text-text-400">Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-tertiary-100 hover:text-tertiary-100/80"
          >
            Login Here
          </Link>
        </div>
      </CardAuth>

      {modalType === "success" && modalVisible && (
        <SuccessModal visible={modalVisible} onClose={onClose} />
      )}
      {modalType === "error" && modalVisible && (
        <ErrorModal
          visible={modalVisible}
          onClose={onClose}
          errorMessage={errorMessage}
        />
      )}
      {modalType === "continue" && (
        <ContinueModal
          visible={modalVisible}
          onClose={onClose}
          registrationStage={registrationStage}
        />
      )}
    </>
  );
}

const SuccessModal = ({
  visible,
  onClose,
}: Pick<ModalProps, "visible" | "onClose">) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth
        title="Account Successfully Created"
        description="Let's continue with your kyc verification. Please, login first."
        showSuccessIcon={true}
      >
        <Link href="/auth/login">
          <Button
            text="Continue"
            variant="primary"
            className="w-full"
            showArrow={false}
          />
        </Link>
      </CardAuth>
    </Modal>
  );
};

const ErrorModal = ({
  visible,
  onClose,
  errorMessage,
}: Pick<ModalProps, "visible" | "onClose"> & { errorMessage: string }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth
        title="Account Creation Failed"
        description={errorMessage || "Please try again"}
        showErrorIcon={true}
      >
        <Button
          text="Try Again"
          variant="primary"
          className="w-full"
          showArrow={false}
          onClick={onClose}
        />
      </CardAuth>
    </Modal>
  );
};

const ContinueModal = ({
  visible,
  onClose,
  registrationStage,
}: Pick<ModalProps, "visible" | "onClose"> & {
  registrationStage: RegistrationStage;
}) => {
  const registrationStageUrl =
    REGISTRATION_STAGE_MAP[
      registrationStage.toUpperCase() as keyof typeof REGISTRATION_STAGE_MAP
    ];

  return (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth
        title="Resume where you left off"
        description="Click the 'Yes, resume' button below to resume where you left off in your registration process or 'No, I want to create a new account'"
        showInfoIcon={true}
      >
        <Link href={registrationStageUrl}>
          <Button
            text="Yes, resume"
            variant="primary"
            className="w-full"
            showArrow={false}
          />
        </Link>
        <Button
          text="No, I want to create a new account"
          variant="secondary"
          className="w-full"
          showArrow={false}
          onClick={onClose}
        />
      </CardAuth>
    </Modal>
  );
};
