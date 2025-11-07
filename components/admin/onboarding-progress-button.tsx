"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/lib/provider-onboarding";
import { TokenManager } from "@/lib/utils/menory-manager";
import { AuthService } from "@/lib/services/authService";
import type { User } from "@/lib/types/api";
import cn from "clsx";

interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

export default function OnboardingProgressButton() {
  const { open, setStep } = useOnboarding();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const token = TokenManager.getToken();
      if (!token) return;

      try {
        const response = await AuthService.getMe(token);
        if (response && "error" in response) return;

        const user = response as User;
        
        // Define onboarding steps
        const onboardingSteps: OnboardingStep[] = [
          {
            id: "email_verification",
            label: "Verify Email",
            completed: user.emailVerified || false,
          },
          {
            id: "identity_verification",
            label: "Complete Identity Verification",
            completed: user.identity_verification === "all_verified",
          },
          {
            id: "bank_connection",
            label: "Connect Bank Account",
            completed: !!user.bankAccount?.id,
          },
          {
            id: "join_pod",
            label: "Join a Pod",
            completed: false, // TODO: Check if user has joined a pod
          },
        ];

        setSteps(onboardingSteps);
        
        // Show button if not all steps are completed
        const allCompleted = onboardingSteps.every((step) => step.completed);
        setIsVisible(!allCompleted);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
    
    // Refresh periodically
    const interval = setInterval(checkOnboardingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStepClick = (stepId: string) => {
    switch (stepId) {
      case "bank_connection":
        setStep("bank_connection");
        open();
        break;
      case "email_verification":
        // Redirect to email verification page
        window.location.href = "/register/verify-email";
        break;
      case "identity_verification":
        // Redirect to KYC page
        window.location.href = "/register/kyc";
        break;
      case "join_pod":
        setStep("pod_plan_selection");
        open();
        break;
      default:
        break;
    }
    setIsExpanded(false);
  };

  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;
  const remainingCount = totalCount - completedCount;

  if (!isVisible || steps.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        {isExpanded && (
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-900">Complete Your Onboarding</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-text-400 hover:text-text-900"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    step.completed
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-secondary-50 hover:bg-secondary-100 text-text-900 border border-secondary-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{step.label}</span>
                    {step.completed ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-primary">→</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-secondary-200">
              <p className="text-xs text-text-400">
                {remainingCount} of {totalCount} steps remaining
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-full shadow-lg",
            "hover:bg-primary/90 transition-all",
            "font-medium text-sm"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {remainingCount}
            </span>
            <span>Steps Left</span>
          </div>
          <svg
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
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
        </button>
      </div>
    </div>
  );
}



