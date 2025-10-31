"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { PodOnboardingStep, PodDurationWeeks, PodPlanCode } from "./types/pod";


interface OnboardingContextValue {
  // visibility
  visible: boolean;
  open: () => void;
  close: () => void;

  // flow
  step: PodOnboardingStep;
  setStep: (step: PodOnboardingStep) => void;
  next: () => void;
  prev: () => void;

  // selections
  selectedPlanCode: PodPlanCode;
  setSelectedPlanCode: (code: PodPlanCode ) => void;
  selectedCycleWeeks: PodDurationWeeks;
  setSelectedCycleWeeks: (weeks: PodDurationWeeks) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
  defaultVisible?: boolean;
}

export function OnboardingProvider({
  children,
  defaultVisible = false,
}: OnboardingProviderProps) {
  const [visible, setVisible] = useState<boolean>(defaultVisible);
  const [step, setStep] = useState<PodOnboardingStep>("pod_plan_selection");
  const [selectedPlanCode, setSelectedPlanCode] = useState<PodPlanCode>("pod_100");
  const [selectedCycleWeeks, setSelectedCycleWeeks] = useState<PodDurationWeeks>(12);

  const next = () => {
    setStep((step) => {
      switch (step) {
        case "pod_plan_selection":
            return "pod_goal_setting";
        case "pod_goal_setting":
          return "pod_form_filling";
        case "pod_form_filling":
          return "pod_onboarding_complete";
        default:
          return step;
      }
    });
  };

  const prev = () => {
    setStep((step) => {
      switch (step) {
          case "pod_form_filling":
          return "pod_plan_selection";
        case "pod_goal_setting":
          return "pod_plan_selection";
        case "pod_onboarding_complete":
          return "pod_plan_selection";
        default:
          return step;
      }
    });
  };

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      visible,
      open,
      close,
      step,
      setStep,
      next,
      prev,
      selectedPlanCode,
      setSelectedPlanCode,
      selectedCycleWeeks,
      setSelectedCycleWeeks,
    }),
    [visible, step, selectedPlanCode, selectedCycleWeeks]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
