"use client";

import Link from "next/link";
import {
  Button,
  Field,
  Modal,
  ModalProps,
  PasswordField,
} from "@/components/utils";
import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import GoogleIcon from "@/public/media/icons/google-g-letter.svg";
import CardAuth from "@/components/auth/card-auth";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { LoginSuccessResponse } from "@/lib/types/api";
import { TokenManager } from "@/lib/utils/memory-manager";
import {
  REGISTRATION_STAGE,
  type RegistrationStage,
} from "@/lib/constants/dashboard";

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

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

type LoginUser = LoginSuccessResponse["user"] | null;

interface PostLoginDecision {
  destination: string;
  shouldResendEmail: boolean;
  registrationStage: RegistrationStage;
}

const getClientOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return "https://app.koajo.com";

  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
};

const isIdentityVerified = (
  record:
    | LoginSuccessResponse["user"]["identityVerification"]
    | null
    | undefined
) =>
  Boolean(
    record && record.status === "verified" && record.type === "id_number"
  );

const determinePostLoginDecision = (user: LoginUser): PostLoginDecision => {
  if (!user) {
    return {
      destination: "/dashboard",
      shouldResendEmail: false,
      registrationStage: REGISTRATION_STAGE.NONE,
    };
  }

  if (!isIdentityVerified(user.identityVerification)) {
    return {
      destination: "/register/kyc",
      shouldResendEmail: false,
      registrationStage: REGISTRATION_STAGE.REGISTERED,
    };
  }

  if (!user.emailVerified) {
    return {
      destination: "/register/verify-email",
      shouldResendEmail: true,
      registrationStage: REGISTRATION_STAGE.KYC_ID_NUMBER_COMPLETE,
    };
  }

  const hasBankConnection = Boolean(user.bankAccount?.id);
  return {
    destination: "/dashboard",
    shouldResendEmail: false,
    registrationStage: hasBankConnection
      ? REGISTRATION_STAGE.BANK_CONNECTED
      : REGISTRATION_STAGE.EMAIL_VERIFIED,
  };
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [faillureMessage, setFaillureMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigateAfterAuth = useCallback(
    async (
      user: LoginSuccessResponse["user"] | null,
      options: { replace?: boolean } = {}
    ) => {
      const decision = determinePostLoginDecision(user);
      TokenManager.setRegistrationStage(decision.registrationStage);

      if (decision.shouldResendEmail && user?.email) {
        try {
          await AuthService.resendVerificationEmail({
            email: user.email,
            origin: getClientOrigin(),
          });
        } catch (error) {
          console.error(
            "Failed to auto-resend verification email before redirect:",
            error
          );
        }
      }

      if (options.replace) {
        router.replace(decision.destination);
      } else {
        router.push(decision.destination);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!TokenManager.isAuthenticated()) return;

    const storedUser = TokenManager.getUserData() as
      | LoginSuccessResponse["user"]
      | null;
    void navigateAfterAuth(storedUser, { replace: true });
  }, [navigateAfterAuth]);

  const onClose = () => {
    setModalVisible(false);
    setFaillureMessage("");
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await AuthService.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      if (
        response &&
        "error" in response &&
        "message" in response &&
        response.message.length > 0
      ) {
        setFaillureMessage(
          Array.isArray(response.message)
            ? response.message.join(", ")
            : response.message || "Invalid email or password"
        );
        setModalVisible(true);
      } else if (
        response &&
        "accessToken" in response &&
        "user" in response &&
        "expiresAt" in response
      ) {
        const loginResponse = response as LoginSuccessResponse;
        TokenManager.setAuthData(loginResponse);
        await navigateAfterAuth(loginResponse.user);
      }
    } catch (error) {
      console.error("Login error:", error);
      setFaillureMessage("Invalid email or password");
      setModalVisible(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setModalVisible(false);
      }, 4000);
      setFaillureMessage("");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <>
      <CardAuth
        title="Login First to Your Account"
        description="Sign in to your Koajo account to access all Koajo products."
      >
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6.5"
          noValidate
        >
          {faillureMessage && (
            <span className="text-red-500 text-sm mx-auto  w-fit block">
              {faillureMessage}
            </span>
          )}
          {/* Email Field */}
          <Field
            label="Email"
            type="email"
            placeholder="Enter Your email"
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

          {/* Password Field */}
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            required
            error={formErrors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 10,
                message: "Password must be at least 10 characters",
              },
            })}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer checked:bg-primary checked:border-primary"
              />
              <span className="text-base text-text-500  transition-colors select-none">
                Remember me for 30 days
              </span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-base text-tertiary-100 hover:text-tertiary-100/80 transition-colors"
            >
              Forgot Password
            </Link>
          </div>

          {/* Login Button */}
          <div className="flex flex-col gap-3 items-center">
            <Button
              type="submit"
              text={isLoading ? "Logging in..." : "Login"}
              variant="primary"
              className="w-full"
              disabled={isLoading}
              showArrow={false}
            />

            {/* <span className="text-sm text-gray-400">or login with</span> */}

            {/* Google Login */}
            {/* <button
            onClick={handleGoogleLogin}
            className="cursor-pointer w-full flex items-center justify-center gap-1 px-8 py-3 border border-secondary-100 rounded-full text-text-500 hover:bg-gray transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Google
          </button> */}
          </div>
        </form>

        {/* Registration Link */}
        <div className="text-center font-semibold flex items-center justify-center gap-1">
          <span className="text-text-400">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="text-tertiary-100 hover:text-tertiary-100/80"
          >
            Register Here
          </Link>
        </div>
      </CardAuth>
      {modalVisible && (
        <ErrorModal
          visible={modalVisible}
          onClose={onClose}
          message={faillureMessage}
        />
      )}
    </>
  );
}

const ErrorModal = ({
  visible,
  onClose,
  message,
}: Pick<ModalProps, "visible" | "onClose"> & { message?: string }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <CardAuth
        title="Login Failed"
        description={message || "Please try again"}
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
