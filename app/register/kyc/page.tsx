"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from "@/lib/constants/api";
import TokenManager from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import type {
  ApiError,
  StripeVerificationStatus,
  UpdateUserRequest,
  User,
} from "@/lib/types/api";
import { useStripeIdentity } from "@/lib/hooks/useStripeIdentity";
import {
  createVerificationSessionAction,
  ensureStripeCustomerAction,
  retrieveVerificationSessionAction,
} from "./actions";
import { CheckCircle2, AlertCircle, Camera, Shield } from "lucide-react";
import ProfileAddIcon from "@/public/media/icons/profile-add.svg";
import WalletMinusIcon from "@/public/media/icons/wallet-minus.svg";
import VerifiedIcon from "@/public/media/icons/verified.svg";
import { resolveApiErrorMessage } from "@/lib/utils/api-helpers";

const KYC_STORAGE_KEY = "kyc_step_state";

type StepKey = "document" | "idNumber";
type StepStatus =
  | "idle"
  | "in_progress"
  | "processing"
  | "verified"
  | "requires_input"
  | "error";

interface StepState {
  status: StepStatus;
  sessionId?: string;
  message?: string;
  lastError?: string | null;
  updatedAt?: number;
}

interface SessionSyncPayload {
  sessionId: string;
  verificationStatus: StripeVerificationStatus;
  verificationType: "document" | "id_number";
  resultId?: string;
  firstName?: string | null;
  lastName?: string | null;
  ssnLast4?: string | null;
  address?: unknown;
}

const defaultStepState: StepState = { status: "idle", lastError: null };

const isApiError = (value: unknown): value is ApiError => {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    "message" in value
  );
};

const getClientOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return "https://app.koajo.com";

  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
};

function StepCard({
  title,
  description,
  status,
  onAction,
  actionLabel,
  disabled,
  helperText,
  children,
  icon,
}: {
  title: string;
  description: string;
  status: StepState;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
  helperText?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const isVerified = status.status === "verified";
  const isInProgress =
    status.status === "in_progress" || status.status === "processing";
  const isPending = status.status === "idle";
  const isActionDisabled = Boolean(disabled || isVerified);
  const buttonVariant = isActionDisabled ? "secondary" : "primary";

  return (
    <div
      className={`
        relative h-full rounded-xl border p-4 lg:p-5 shadow-sm transition-all duration-300
        ${
          isVerified
            ? "border-green-300 bg-green-50"
            : "border-[#E4E9F2] bg-[#EDF1F3]"
        }
      `}
    >
      <div className="flex h-full flex-col gap-3 lg:gap-3.5">
        <div className="flex items-start gap-2.5 lg:gap-3">
          {icon && (
            <div
              className={`
              p-1.5 lg:p-2 rounded-lg shrink-0
              ${
                isVerified
                  ? "bg-green-500/20 text-green-700"
                  : "bg-secondary-100/20 text-secondary-400"
              }
            `}
            >
              {icon}
            </div>
          )}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-secondary-300 font-medium mb-0.5 lg:text-xs lg:mb-1">
              {title}
            </p>
            <p className="text-sm lg:text-base font-semibold text-secondary-900">
              {description}
            </p>
            {helperText && (
              <p className="mt-1.5 text-[11px] lg:text-xs text-secondary-400 leading-relaxed lg:mt-2">
                {helperText}
              </p>
            )}
          </div>
        </div>

        {status.lastError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 lg:p-3">
            <div className="flex items-start gap-1.5 lg:gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0 lg:w-4 lg:h-4" />
              <p className="text-xs text-red-600 lg:text-sm">
                {status.lastError}
              </p>
            </div>
          </div>
        )}

        {children}

        {onAction && actionLabel && (
          <div className="mt-auto">
            <Button
              onClick={onAction}
              text={actionLabel}
              variant={isVerified ? "secondary" : buttonVariant}
              className="w-full text-xs lg:text-sm"
              disabled={isActionDisabled}
              showArrow={!isVerified}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function KycPage() {
  const {
    verifyIdentity,
    isVerifying,
    loading: stripeLoading,
  } = useStripeIdentity();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [steps, setSteps] = useState<Record<StepKey, StepState>>({
    document: defaultStepState,
    idNumber: defaultStepState,
  });
  const [globalError, setGlobalError] = useState<any>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isContinuingToEmail, setIsContinuingToEmail] = useState(false);

  const token = useMemo(() => TokenManager.getToken(), []);

  useEffect(() => {
    const savedState =
      typeof window !== "undefined"
        ? localStorage.getItem(KYC_STORAGE_KEY)
        : null;
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as Record<StepKey, StepState>;
        setSteps((prev) => ({
          document: { ...prev.document, ...parsed.document },
          idNumber: { ...prev.idNumber, ...parsed.idNumber },
        }));
      } catch {
        localStorage.removeItem(KYC_STORAGE_KEY);
      }
    }
  }, []);

  const persistSteps = useCallback((next: Record<StepKey, StepState>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const hydrateStepsFromStatus = useCallback(
    (record: User["identityVerification"]) => {
      if (!record || record.status !== "verified") return;

      setSteps((prev) => {
        const next: Record<StepKey, StepState> = {
          ...prev,
        };

        if (record.type === "document" || record.type === "id_number") {
          next.document = {
            ...prev.document,
            status: "verified",
            lastError: null,
          };
        }

        if (record.type === "id_number") {
          next.idNumber = {
            ...prev.idNumber,
            status: "verified",
            lastError: null,
          };
        }

        persistSteps(next);
        return next;
      });
    },
    [persistSteps]
  );

  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false);
      setGlobalError("Please log in to continue.");
      return;
    }

    let cancelled = false;
    const bootstrap = async () => {
      try {
        const profileResponse: any = await AuthService.getMe(token);
        if (isApiError(profileResponse)) {
          if (!cancelled) {
            setGlobalError(
              profileResponse.message ||
                "Unable to load your profile. Please try again."
            );
          }
          return;
        }

        if (profileResponse && !cancelled) {
          const profile = profileResponse as User;
          setUser(profile);
          TokenManager.setUser(profile);
          hydrateStepsFromStatus(profile.identityVerification);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (!cancelled) {
          setGlobalError(
            resolveApiErrorMessage(
              err,
              "Unable to load your profile. Please try again."
            )
          );
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [hydrateStepsFromStatus, token]);

  const updateStep = useCallback(
    (key: StepKey, updater: (prev: StepState) => StepState) => {
      setSteps((prev) => {
        const next = {
          ...prev,
          [key]: updater(prev[key]),
        };
        persistSteps(next);
        return next;
      });
    },
    [persistSteps]
  );

  const handleSuccessfulVerification = useCallback(
    async ({
      verificationType,
      firstName,
      lastName,
      ssnLast4,
      address,
    }: {
      verificationType: "document" | "id_number";
      firstName?: string | null;
      lastName?: string | null;
      ssnLast4?: string | null;
      address?: unknown;
    }) => {
      if (!user || !token) return;

      const stepKey: StepKey =
        verificationType === "document" ? "document" : "idNumber";

      updateStep(stepKey, (prev) => ({
        ...prev,
        status: "verified",
        message: "Stripe verified this step successfully.",
        lastError: null,
      }));

      if (firstName || lastName) {
        try {
          const updatePayload: UpdateUserRequest = {
            first_name: firstName ?? user.firstName,
            last_name: lastName ?? user.lastName,
          };

          await AuthService.updateUser(updatePayload, token);
        } catch (error) {
          console.warn("Failed to update profile details:", error);
        }
      }

      if (verificationType === "id_number" && token && (ssnLast4 || address)) {
        try {
          const result = await ensureStripeCustomerAction({
            token,
            userId: user.id,
            email: user.email,
            phone: user.phone,
            name: [firstName ?? user.firstName, lastName ?? user.lastName]
              .filter(Boolean)
              .join(" "),
            ssnLast4: ssnLast4 ?? user.customer?.ssnLast4,
            address: address ?? user.customer?.address,
            customerId: user.customer?.id ?? undefined,
          });

          TokenManager.updateUserData({
            customer: {
              id: result.customerId,
              ssnLast4: ssnLast4 ?? user.customer?.ssnLast4,
              address: address ?? user.customer?.address,
            },
          });
        } catch (error) {
          console.error("Failed to persist Stripe customer:", error);
        }
      }

      try {
        const profile = await AuthService.getMe(token);
        if (profile && !("error" in profile)) {
          setUser(profile);
          TokenManager.setUser(profile);
          hydrateStepsFromStatus(profile.identityVerification);
        }
      } catch (error) {
        console.warn("Failed to refresh profile:", error);
      }
    },
    [hydrateStepsFromStatus, token, updateStep, user]
  );

  const syncVerificationSession = useCallback(
    async ({
      sessionId,
      verificationStatus,
      verificationType,
      resultId,
      firstName,
      lastName,
      ssnLast4,
      address,
    }: SessionSyncPayload) => {
      if (!user || !token) {
        setGlobalError("Please log in again to continue verification.");
        return;
      }

      const stepKey: StepKey =
        verificationType === "document" ? "document" : "idNumber";

      updateStep(stepKey, (prev) => ({
        ...prev,
        status:
          verificationStatus === "processing" ? "processing" : prev.status,
        sessionId,
        lastError: null,
      }));

      try {
        const syncResponse = await fetch(
          getApiUrl(API_ENDPOINTS.AUTH.IDENTITY_VERIFICATION),
          {
            method: "POST",
            headers: getAuthHeaders(token),
            body: JSON.stringify({
              id: user.id,
              session_id: sessionId,
              result_id: resultId || sessionId,
              type: verificationType,
              status: verificationStatus,
            }),
          }
        );

        if (!syncResponse.ok) {
          const err = await syncResponse.json().catch(() => ({}));
          throw new Error(
            err?.message ||
              err?.error ||
              "Failed to sync verification with Koajo."
          );
        }

        if (verificationStatus === "verified") {
          await handleSuccessfulVerification({
            verificationType,
            firstName,
            lastName,
            ssnLast4,
            address,
          });
        } else if (verificationStatus === "requires_input") {
          updateStep(stepKey, (prev) => ({
            ...prev,
            status: "requires_input",
            lastError:
              "Stripe needs more information. Please try again to continue.",
          }));
        } else if (verificationStatus === "canceled") {
          updateStep(stepKey, (prev) => ({
            ...prev,
            status: "error",
            lastError: "Verification was canceled before completion.",
          }));
        } else {
          updateStep(stepKey, (prev) => ({
            ...prev,
            status: "processing",
            message:
              "Stripe is still processing this verification. Check back shortly.",
          }));
        }
      } catch (error) {
        console.error("Failed to sync verification:", error);
        updateStep(stepKey, (prev) => ({
          ...prev,
          status: "error",
          lastError: resolveApiErrorMessage(
            error,
            "Failed to sync verification with our servers. Please try again."
          ),
        }));
      }
    },
    [handleSuccessfulVerification, token, updateStep, user]
  );

  const retrieveSession = useCallback(
    async (sessionId: string, fallbackType: "document" | "id_number") => {
      const data = await retrieveVerificationSessionAction(sessionId);

      // Ensure resultId is always present - use verificationReport.id or fallback to sessionId
      const resultId = data.verificationReport?.id || sessionId;

      await syncVerificationSession({
        sessionId,
        verificationStatus: data.session.status,
        verificationType:
          (data.session.type as "document" | "id_number") ?? fallbackType,
        resultId,
        firstName: data.firstName,
        lastName: data.lastName,
        ssnLast4: data.ssnLast4,
        address: data.address,
      });
    },
    [syncVerificationSession]
  );

  const runVerification = useCallback(
    async (type: "document" | "id_number") => {
      if (!user) {
        setGlobalError("Please log in to start verification.");
        return;
      }

      if (stripeLoading) {
        setGlobalError(
          "Stripe is still loading. Please try again in a moment."
        );
        return;
      }

      setGlobalError(null);
      const stepKey: StepKey = type === "document" ? "document" : "idNumber";

      updateStep(stepKey, (prev) => ({
        ...prev,
        status: "in_progress",
        message: "Opening secure verification...",
        lastError: null,
      }));

      try {
        const session = await createVerificationSessionAction({
          email: user.email,
          userId: user.id,
          phone: user.phone,
          type,
          firstName: user.firstName,
          lastName: user.lastName,
          origin: getClientOrigin(),
        });

        if (!session?.clientSecret) {
          throw new Error("Unable to create Stripe verification session.");
        }

        const result: any = await verifyIdentity(session.clientSecret);

        if (result?.error) {
          throw new Error(
            result.error.message || "Verification was cancelled."
          );
        }

        const sessionId = result?.verificationSessionId || session.sessionId;
        if (!sessionId) {
          throw new Error("Stripe did not return a verification session id.");
        }

        await retrieveSession(sessionId, type);
      } catch (error) {
        console.error("Verification failed:", error);
        updateStep(stepKey, (prev) => ({
          ...prev,
          status: "error",
          lastError: resolveApiErrorMessage(
            error,
            "Verification failed. Please try again."
          ),
        }));
      }
    },
    [retrieveSession, stripeLoading, updateStep, user, verifyIdentity]
  );

  const handleContinueToEmail = useCallback(async () => {
    if (!user) return;

    setIsContinuingToEmail(true);
    try {
      const response = await AuthService.resendVerificationEmail({
        email: user.email,
        origin: getClientOrigin(),
      });

      if (response && "error" in response) {
        const message = Array.isArray(response.message)
          ? response.message[0]
          : response.message;
        throw new Error(message || "Unable to send verification email.");
      }

      router.push(
        `/register/verify-email?email=${encodeURIComponent(user.email)}`
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setGlobalError(
        resolveApiErrorMessage(
          error,
          "Unable to continue to email verification. Please try again."
        )
      );
    } finally {
      setIsContinuingToEmail(false);
    }
  }, [router, user]);

  const documentReady = steps.document.status === "verified";
  const idReady = steps.idNumber.status === "verified";

  const renderSuccessCTA = () => {
    if (!documentReady || !idReady) return null;

    return (
      <div className="flex items-center justify-center pt-2">
        <Button
          text={
            isContinuingToEmail
              ? "Sending verification email..."
              : "Continue to Email Verification"
          }
          variant="primary"
          className="w-fit text-xs lg:text-sm"
          onClick={handleContinueToEmail}
          disabled={isContinuingToEmail}
          showArrow
        />
      </div>
    );
  };

  if (isBootstrapping) {
    return (
      <CardAuth
        title="Loading your verification status"
        description="Please wait while we load your progress."
      >
        <div className="flex flex-col items-center gap-3 text-text-400">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p>Checking with Stripe...</p>
        </div>
      </CardAuth>
    );
  }

  if (!token || !user) {
    return (
      <CardAuth
        title="Login required"
        description="You need to be logged in to complete verification."
      >
        <Button
          text="Go to Login"
          variant="primary"
          className="w-full"
          href="/auth/login"
          showArrow
        />
      </CardAuth>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center px-2 sm:px-4 lg:px-0">
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="space-y-4 rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-5 shadow-[0_35px_120px_rgba(15,23,42,0.12)] sm:px-6 lg:space-y-6 lg:px-8 lg:py-8">
          <div className="space-y-1.5 text-center lg:space-y-2">
            <h1 className="text-[24px] font-semibold lg:font-bold text-secondary-900 lg:text-2xl">
              Identity Verification
            </h1>
            <p className="mx-auto max-w-2xl text-xs text-secondary-400 lg:text-sm">
              Complete secure verification with Stripe to protect your account
              and ensure platform safety.
            </p>
          </div>

          {globalError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/80 p-3 lg:p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 lg:h-5 lg:w-5" />
              <p className="text-xs text-red-600 lg:text-sm">{globalError}</p>
            </div>
          )}

          {/* Cards Layout - Horizontal on Desktop, Vertical on Mobile */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
            <StepCard
              title="Document Verification"
              description="ID & Selfie Capture"
              helperText="Upload a government-issued ID and take a live selfie. Stripe uses advanced verification to match your photo and prevent fraud."
              status={steps.document}
              icon={<Camera className="w-4 h-4 lg:w-5 lg:h-5" />}
              onAction={() => runVerification("document")}
              actionLabel={
                steps.document.status === "verified"
                  ? "Verified Successfully"
                  : isVerifying && steps.document.status === "in_progress"
                  ? "Opening Stripe Verification..."
                  : "Begin ID Verification"
              }
              disabled={
                steps.document.status === "verified" ||
                steps.document.status === "processing" ||
                isVerifying
              }
            />

            <StepCard
              title="Document Verification"
              description="SSN & Personal Details"
              helperText="Verify your Social Security Number and date of birth. Stripe securely validates this information with trusted data sources to comply with KYC regulations."
              status={steps.idNumber}
              icon={<Shield className="w-4 h-4 lg:w-5 lg:h-5" />}
              onAction={() => runVerification("id_number")}
              actionLabel={
                steps.idNumber.status === "verified"
                  ? "Verified Successfully"
                  : steps.document.status !== "verified"
                  ? "Complete ID verification first"
                  : isVerifying && steps.idNumber.status === "in_progress"
                  ? "Opening Stripe Verification..."
                  : "Complete ID verification first"
              }
              disabled={
                steps.document.status !== "verified" ||
                steps.idNumber.status === "verified" ||
                steps.idNumber.status === "processing" ||
                isVerifying
              }
            />
          </div>

          {renderSuccessCTA()}

          {/* Help Section */}
          <div className="border-t border-[#E4E9F2] pt-4 text-center lg:pt-5">
            <p className="text-sm font-semibold text-secondary-900 lg:text-base">
              Need assistance?
            </p>
            <p className="text-xs text-secondary-400 lg:text-sm">
              Having trouble with verification? Contact our support team at{" "}
              <a
                className="text-tertiary-100 underline transition-colors hover:text-tertiary-100/80"
                href="mailto:support@koajo.com"
              >
                support@koajo.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
