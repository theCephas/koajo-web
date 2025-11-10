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
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Shield,
  FileText,
} from "lucide-react";

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

const STATUS_COPY: Record<
  StepStatus,
  {
    label: string;
    badgeClass: string;
    textClass: string;
    icon: React.ReactNode;
  }
> = {
  idle: {
    label: "Not started",
    badgeClass: "bg-white/10 text-black/70 border border-white/20",
    textClass: "text-text-400",
    icon: null,
  },
  in_progress: {
    label: "Verifying",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    textClass: "text-blue-400",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  processing: {
    label: "Processing",
    badgeClass: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    textClass: "text-yellow-600",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  verified: {
    label: "Verified",
    badgeClass: "bg-green-500/20 text-green-400 border border-green-500/30",
    textClass: "text-green-600",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  requires_input: {
    label: "Action needed",
    badgeClass: "bg-red-500/20 text-red-400 border border-red-500/30",
    textClass: "text-red-500",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  error: {
    label: "Error",
    badgeClass: "bg-red-500/20 text-red-400 border border-red-500/30",
    textClass: "text-red-500",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

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
  stepNumber,
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
  stepNumber?: number;
}) {
  const config = STATUS_COPY[status.status];
  const isVerified = status.status === "verified";
  const isInProgress =
    status.status === "in_progress" || status.status === "processing";

  return (
    <div
      className={`
        relative rounded-2xl border backdrop-blur-sm p-6 transition-all duration-300
        ${
          isVerified
            ? "border-green-500/40 bg-green-500/10 shadow-lg shadow-green-500/20"
            : isInProgress
            ? "border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/20 animate-pulse-slow"
            : "border-white/10 bg-white/5 hover:border-white/20"
        }
      `}
    >
      {/* Step Number Badge */}
      {stepNumber && (
        <div
          className={`
          absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
          ${
            isVerified
              ? "bg-green-500 text-black"
              : isInProgress
              ? "bg-blue-500 text-black"
              : " text-black/70 border border-white/20"
          }
        `}
        >
          {isVerified ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && (
              <div
                className={`
                p-2 rounded-lg
                ${
                  isVerified
                    ? "bg-green-500/20"
                    : isInProgress
                    ? "bg-blue-500/20"
                    : "bg-white/10"
                }
              `}
              >
                {icon}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-black font-medium">
                {title}
              </p>
              <p className="text-lg font-semibold text-black/60 mt-0.5">
                {description}
              </p>
            </div>
          </div>

          {helperText && (
            <p className="mt-3 text-sm text-black/60 leading-relaxed pl-14">
              {helperText}
            </p>
          )}

          {status.lastError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 pl-14">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{status.lastError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 ${config.badgeClass}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
      </div>

      {children}

      {onAction && actionLabel && (
        <div className="mt-5 pl-14">
          <Button
            onClick={onAction}
            text={actionLabel}
            variant={isVerified ? "secondary" : "primary"}
            className="w-full"
            disabled={disabled || isVerified}
            showArrow={!isVerified}
          />
        </div>
      )}
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
          setGlobalError("Unable to load your profile. Please try again.");
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
          lastError:
            error instanceof Error
              ? error.message
              : "An unknown error occurred while syncing verification.",
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
          lastError:
            error instanceof Error ? error.message : "Verification failed.",
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
        error instanceof Error
          ? error.message
          : "Unable to continue to email verification."
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
      <div className="space-y-4 pt-4">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-black/80">
          Both identity checks are complete! Next, verify your email to continue
          onboarding.
        </div>
        <Button
          text={
            isContinuingToEmail
              ? "Sending verification email..."
              : "Continue to Email Verification"
          }
          variant="primary"
          className="w-full"
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
    <CardAuth
      title="Identity Verification"
      description="Complete secure verification with Stripe to protect your account and ensure platform safety."
    >
      <div className="space-y-6">
        {globalError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{globalError}</p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={`h-2 rounded-full flex-1 ${
                steps.document.status === "verified"
                  ? "bg-green-500"
                  : steps.document.status === "in_progress" ||
                    steps.document.status === "processing"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-white/10"
              }`}
            />
            <div
              className={`h-2 rounded-full flex-1 ${
                steps.idNumber.status === "verified"
                  ? "bg-green-500"
                  : steps.idNumber.status === "in_progress" ||
                    steps.idNumber.status === "processing"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-white/10"
              }`}
            />
          </div>
          <span className="text-xs text-black/50 font-medium">
            {steps.document.status === "verified" &&
            steps.idNumber.status === "verified"
              ? "2/2 Complete"
              : steps.document.status === "verified"
              ? "1/2 Complete"
              : "0/2 Complete"}
          </span>
        </div>

        <StepCard
          stepNumber={1}
          title="Document Verification"
          description="ID & Selfie Capture"
          helperText="Upload a government-issued ID and take a live selfie. Stripe uses advanced verification to match your photo and prevent fraud."
          status={steps.document}
          icon={<Camera className="w-5 h-5 " />}
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
          stepNumber={2}
          title="Identity Confirmation"
          description="SSN & Personal Details"
          helperText="Verify your Social Security Number and date of birth. Stripe securely validates this information with trusted data sources to comply with KYC regulations."
          status={steps.idNumber}
          icon={<Shield className="w-5 h-5" />}
          onAction={() => runVerification("id_number")}
          actionLabel={
            steps.idNumber.status === "verified"
              ? "Verified Successfully"
              : steps.document.status !== "verified"
              ? "Complete ID verification first"
              : isVerifying && steps.idNumber.status === "in_progress"
              ? "Opening Stripe Verification..."
              : "Verify SSN & Details"
          }
          disabled={
            steps.document.status !== "verified" ||
            steps.idNumber.status === "verified" ||
            steps.idNumber.status === "processing" ||
            isVerifying
          }
        />

        {renderSuccessCTA()}

        {/* Help Section */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-white/60 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-black/90 font-medium mb-1">Need assistance?</p>
              <p className="text-black/60">
                Having trouble with verification? Contact our support team at{" "}
                <a
                  className="text-blue-400 underline hover:text-blue-300 transition-colors"
                  href="mailto:hello@koajo.com"
                >
                  hello@koajo.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardAuth>
  );
}
