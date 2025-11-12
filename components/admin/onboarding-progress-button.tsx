"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/provider-onboarding";
import { useDashboard } from "@/lib/provider-dashboard";
import cn from "clsx";
import CollapseIcon from "@/public/media/icons/collapse.svg";
import CloseIcon from "@/public/media/icons/close.svg";
import ExpandIcon from "@/public/media/icons/expand.svg";

export type SetupStepStatus = "pending" | "in_progress" | "completed";

export interface SetupStep {
  id: string;
  label: string;
  status: SetupStepStatus;
  subSteps?: SetupStep[];
}

const SETUP_GUIDE_CLOSED_KEY = "setup_guide_closed";
const AUTO_PROMPT_KEY_PREFIX = "setup_prompted_user_";
const AUTO_PROMPTABLE_STEPS = new Set(["bank_connection", "join_pod"]);

export default function OnboardingProgressButton() {
  const router = useRouter();
  const { open, setStep } = useOnboarding();
  const {
    emailVerified,
    kycCompleted,
    kycStatus,
    bankConnected,
    hasPods,
    user,
    userLoading,
  } = useDashboard();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const canAccessBankConnection = emailVerified && kycCompleted;
  const canAccessJoinPod = emailVerified && kycCompleted && bankConnected;

  const setupSteps: SetupStep[] = useMemo(() => {
    return [
      {
        id: "identity_verification",
        label: "Complete Identity Verification",
        status: kycCompleted
          ? "completed"
          : kycStatus
          ? "in_progress"
          : "pending",
      },
      {
        id: "email_verification",
        label: "Verify Email",
        status: emailVerified ? "completed" : "pending",
      },
      {
        id: "bank_connection",
        label: "Connect Bank Account",
        status: bankConnected ? "completed" : "pending",
      },
      {
        id: "join_pod",
        label: "Join a Pod",
        status: hasPods ? "completed" : "pending",
      },
    ];
  }, [emailVerified, kycCompleted, kycStatus, bankConnected, hasPods]);

  const isStepEnabled = useCallback(
    (stepId: string): boolean => {
      switch (stepId) {
        case "email_verification":
        case "identity_verification":
          return true;
        case "bank_connection":
          return canAccessBankConnection;
        case "join_pod":
          return canAccessJoinPod;
        default:
          return true;
      }
    },
    [canAccessBankConnection, canAccessJoinPod]
  );

  useEffect(() => {
    const closed = localStorage.getItem(SETUP_GUIDE_CLOSED_KEY);
    if (closed === "true") {
      setIsClosed(true);
    }
  }, []);

  const allCompleted = setupSteps.every((step) => step.status === "completed");
  const completedCount = setupSteps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = setupSteps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const handleClose = () => {
    setIsClosed(true);
    localStorage.setItem(SETUP_GUIDE_CLOSED_KEY, "true");
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStepToggle = (stepId: string) => {
    if (expandedStepId === stepId) {
      setExpandedStepId(null);
    } else {
      setExpandedStepId(stepId);
    }
  };

  const startStepFlow = useCallback(
    (stepId: string): boolean => {
      if (!isStepEnabled(stepId)) {
        return false;
      }

      switch (stepId) {
        case "email_verification":
          if (emailVerified) return false;
          router.push("/register/verify-email");
          break;
        case "identity_verification":
          if (kycCompleted) return false;
          router.push("/register/kyc");
          break;
        case "bank_connection":
          if (!canAccessBankConnection) {
            return false;
          }
          setStep("bank_connection");
          open();
          break;
        case "join_pod":
          if (!canAccessJoinPod) {
            return false;
          }
          setStep("pod_plan_selection");
          open();
          break;
        default:
          return false;
      }

      setIsExpanded(false);
      return true;
    },
    [
      canAccessBankConnection,
      canAccessJoinPod,
      emailVerified,
      isStepEnabled,
      kycCompleted,
      open,
      router,
      setStep,
    ]
  );

  const handleStepClick = (stepId: string) => {
    startStepFlow(stepId);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userLoading || !user?.id || hasPods) {
      return;
    }

    const nextModalStep = setupSteps.find(
      (step) =>
        AUTO_PROMPTABLE_STEPS.has(step.id) && step.status !== "completed"
    );

    if (!nextModalStep) {
      return;
    }

    const storageKey = `${AUTO_PROMPT_KEY_PREFIX}${user.id}`;
    let lastPromptedStep: string | null = null;

    try {
      lastPromptedStep = window.sessionStorage.getItem(storageKey);
    } catch (error) {
      console.warn("Unable to read onboarding prompt state:", error);
    }

    if (lastPromptedStep === nextModalStep.id) {
      return;
    }

    const triggered = startStepFlow(nextModalStep.id);
    if (triggered) {
      try {
        window.sessionStorage.setItem(storageKey, nextModalStep.id);
      } catch (error) {
        console.warn("Unable to persist onboarding prompt state:", error);
      }
    }
  }, [
    hasPods,
    setupSteps,
    startStepFlow,
    user?.id,
    userLoading,
  ]);

  // Hide if user manually closed it OR if user has already joined pods
  if (isClosed || hasPods) {
    return null;
  }

  const nextStep = setupSteps.find(
    (step) => step.status !== "completed" && isStepEnabled(step.id)
  );

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              Setup guide
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpand}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Expand setup guide"
              >
                <ExpandIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close setup guide"
              >
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Next step */}
          {nextStep && (
            <div className="text-sm">
              <span className="text-gray-600">Next: </span>
              <button
                onClick={() => handleStepClick(nextStep.id)}
                className="text-primary hover:text-primary/90 font-medium cursor-pointer"
              >
                {nextStep.label}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Expanded view - matching setup-guide.tsx style
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Setup guide</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpand}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Collapse setup guide"
            >
              <CollapseIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close setup guide"
            >
              <CloseIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

          {/* Steps list */}
        <div className="space-y-1">
          {setupSteps.map((step) => {
            const isStepExpanded = expandedStepId === step.id;
            const hasSubSteps = step.subSteps && step.subSteps.length > 0;
            const isCompleted = step.status === "completed";
            const isInProgress = step.status === "in_progress";
            const isPending = step.status === "pending";
            const isEnabled = isStepEnabled(step.id);

            return (
              <div key={step.id}>
                <div
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
                    {
                      "bg-blue-50 border border-blue-200": isInProgress,
                      "opacity-50 line-through": isCompleted && !hasSubSteps,
                      "hover:bg-gray-50 cursor-pointer": !isCompleted && !isInProgress && isEnabled,
                      "cursor-not-allowed opacity-60": !isCompleted && !isInProgress && !isEnabled,
                    }
                  )}
                  onClick={() => {
                    if (!isEnabled) {
                      return;
                    }
                    if (hasSubSteps) {
                      handleStepToggle(step.id);
                    } else {
                      handleStepClick(step.id);
                    }
                  }}
                >
                  <span
                    className={cn("text-sm", {
                      "text-gray-900 font-medium": isInProgress,
                      "text-gray-400": (isCompleted && !hasSubSteps) || (!isEnabled && !isCompleted),
                      "text-gray-600": (isPending || (isCompleted && hasSubSteps)) && isEnabled,
                    })}
                  >
                    {step.label}
                    {!isEnabled && !isCompleted && (
                      <span className="ml-2 text-xs text-gray-500">
                        {step.id === "join_pod"
                          ? "(Connect bank first)"
                          : "(Complete email & KYC first)"}
                      </span>
                    )}
                  </span>
                  {hasSubSteps && (
                    <svg
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        {
                          "rotate-180": isStepExpanded,
                        }
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>

                {/* Sub-steps */}
                {hasSubSteps && isStepExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {step.subSteps?.map((subStep) => (
                      <div
                        key={subStep.id}
                        className="flex items-center gap-2 py-1 px-3 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStepClick(subStep.id);
                        }}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            {
                              "bg-gray-300": subStep.status === "pending",
                              "bg-blue-500": subStep.status === "in_progress",
                              "bg-green-500": subStep.status === "completed",
                            }
                          )}
                        />
                        <span
                          className={cn("text-xs", {
                            "text-gray-900": subStep.status === "in_progress",
                            "text-gray-400": subStep.status === "completed",
                            "text-gray-600": subStep.status === "pending",
                          })}
                        >
                          {subStep.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
