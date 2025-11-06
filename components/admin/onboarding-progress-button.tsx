"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/provider-onboarding";
import { useDashboard } from "@/lib/provider-dashboard";
import cn from "clsx";

export type SetupStepStatus = "pending" | "in_progress" | "completed";

export interface SetupStep {
  id: string;
  label: string;
  status: SetupStepStatus;
  subSteps?: SetupStep[];
}

const SETUP_GUIDE_CLOSED_KEY = "setup_guide_closed";

export default function OnboardingProgressButton() {
  const router = useRouter();
  const { open, setStep } = useOnboarding();
  const {
    emailVerified,
    kycCompleted,
    kycStatus,
    bankConnected,
    setupCompleted,
  } = useDashboard();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const canAccessBankConnection = emailVerified && kycCompleted;
  const canAccessJoinPod = emailVerified && kycCompleted;

  const setupSteps: SetupStep[] = useMemo(() => {
    return [
      {
        id: "email_verification",
        label: "Verify Email",
        status: emailVerified ? "completed" : "pending",
      },
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
        id: "bank_connection",
        label: "Connect Bank Account",
        status: bankConnected ? "completed" : "pending",
      },
      {
        id: "join_pod",
        label: "Join a Pod",
        status: "pending", // Always show as pending for now
      },
    ];
  }, [emailVerified, kycCompleted, kycStatus, bankConnected]);

  const isStepEnabled = (stepId: string): boolean => {
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
  };

  useEffect(() => {
    const closed = localStorage.getItem(SETUP_GUIDE_CLOSED_KEY);
    if (closed === "true") {
      const allCompleted = setupSteps.every(
        (step) => step.status === "completed"
      );
      setIsClosed(allCompleted);
    }
  }, [setupSteps]);

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

  const handleStepClick = (stepId: string) => {
    if (!isStepEnabled(stepId)) {
      return;
    }

    switch (stepId) {
      case "email_verification":
        router.push("/register/verify-email");
        break;
      case "identity_verification":
        router.push("/register/kyc");
        break;
      case "bank_connection":
        if (!canAccessBankConnection) {
          return;
        }
        setStep("bank_connection");
        open();
        break;
      case "join_pod":
        if (!canAccessJoinPod) {
          return;
        }
        setStep("pod_plan_selection");
        open();
        break;
      default:
        break;
    }
    setIsExpanded(false);
  };

  if (isClosed || allCompleted || setupCompleted) {
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
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close setup guide"
              >
                <span className="text-gray-600 text-lg leading-none">×</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Next step */}
          {nextStep && (
            <div className="text-sm">
              <span className="text-gray-600">Next: </span>
              <button
                onClick={() => handleStepClick(nextStep.id)}
                className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
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
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close setup guide"
            >
              <span className="text-gray-600 text-lg leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
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
                        (Complete email & KYC first)
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



