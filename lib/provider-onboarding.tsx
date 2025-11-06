"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PodOnboardingStep, PodDurationWeeks, PodPlanCode, PodSchedule, MaximumMembers } from "./types/pod";
import { POD_GOAL_CATEGORIES_MAP } from "./constants/pod";
import { TokenManager } from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import type { PodPlan as ApiPodPlan, PodPlanOpenPod, ApiError } from "@/lib/types/api";
import { ApiErrorClass } from "@/lib/utils/auth";
import { resolveApiMessage } from "@/lib/utils/api-helpers";

let checkOnboardingPrerequisites: (() => { emailVerified: boolean; kycCompleted: boolean }) | null = null;

export function setOnboardingPrerequisitesChecker(
  checker: () => { emailVerified: boolean; kycCompleted: boolean }
) {
  checkOnboardingPrerequisites = checker;
}

const CUSTOM_PLAN_CODE = "custom";
export const CUSTOM_POD_PLAN_CODE = CUSTOM_PLAN_CODE;

interface PlanWithOpenPods {
  plan: ApiPodPlan;
  openPods: PodPlanOpenPod[];
}

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
  selectedGoalCategoryValue: string;
  setSelectedGoalCategoryValue: (value: string) => void;
  goalNote: string;
  setGoalNote: (value: string) => void;

  // form (Pod Details)
  
  podName: string;
  setPodName: (name: string) => void;
  contributionAmountCents: number;
  setContributionAmountCents: (amount: number) => void;
  schedule: PodSchedule;
  setSchedule: (s: PodSchedule) => void;
  maxMembers: MaximumMembers;
  setMaxMembers: (n: MaximumMembers) => void;
  invitedEmails: string[];
  setInvitedEmails: (emails: string[]) => void;
  randomPosition: boolean;
  setRandomPosition: (value: boolean) => void;

  // plans & pods
  podPlans: PlanWithOpenPods[];
  podPlansLoading: boolean;
  podPlansError: string | null;
  refreshPodPlans: () => Promise<void>;

  // invite acceptance
  inviteToken: string;
  openInviteAcceptance: (token?: string) => void;
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
  const [selectedPlanCode, setSelectedPlanCode] = useState<PodPlanCode>("");
  const [selectedCycleWeeks, setSelectedCycleWeeks] = useState<PodDurationWeeks>(12);
  const [selectedGoalCategoryValue, setSelectedGoalCategoryValue] = useState<string>(
    POD_GOAL_CATEGORIES_MAP.MORTGAGE
  );
  const [goalNote, setGoalNote] = useState<string>("");

  // pod form state
  const [podName, setPodName] = useState<string>("");
  const [contributionAmountCents, setContributionAmountCents] = useState<number>(0);
  const [schedule, setSchedule] = useState<PodSchedule>("bi-weekly");
  const [maxMembers, setMaxMembers] = useState<MaximumMembers>(6);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [randomPosition, setRandomPosition] = useState<boolean>(false);

  const [podPlans, setPodPlans] = useState<PlanWithOpenPods[]>([]);
  const [podPlansLoading, setPodPlansLoading] = useState<boolean>(false);
  const [podPlansError, setPodPlansError] = useState<string | null>(null);

  const [inviteToken, setInviteToken] = useState<string>("");

  // Guarded setStep that checks prerequisites for sequential steps
  const setStepGuarded = useCallback((newStep: PodOnboardingStep) => {
    // Check prerequisites for steps that require email and KYC
    if (newStep === "bank_connection" || newStep === "pod_plan_selection") {
      if (checkOnboardingPrerequisites) {
        const { emailVerified, kycCompleted } = checkOnboardingPrerequisites();
        if (!emailVerified || !kycCompleted) {
          console.warn(
            `Cannot access ${newStep}: Email verification and KYC must be completed first.`
          );
          return; // Prevent step change
        }
      }
    }
    setStep(newStep);
  }, []);

  const refreshPodPlans = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token) {
      setPodPlans([]);
      setPodPlansError("You need to be logged in to view pod plans.");
      return;
    }

    setPodPlansLoading(true);
    setPodPlansError(null);

    try {
      const response = await AuthService.getPodPlans(token);

      if (!Array.isArray(response)) {
        if (response && typeof response === "object" && "error" in response) {
          setPodPlansError(
            resolveApiMessage(
              (response as ApiError).message,
              "Unable to retrieve pod plans right now."
            )
          );
        } else {
          setPodPlansError("Unable to retrieve pod plans right now.");
        }
        setPodPlans([]);
        return;
      }

      const plans = response as ApiPodPlan[];

      const openPodsResults = await Promise.all(
        plans.map(async (plan) => {
          const openPodsResponse = await AuthService.getPlanOpenPods(plan.code, token);

          if (Array.isArray(openPodsResponse)) {
            return openPodsResponse as PodPlanOpenPod[];
          }

          if (
            openPodsResponse &&
            typeof openPodsResponse === "object" &&
            "error" in openPodsResponse
          ) {
            console.error(
              "Failed to fetch open pods:",
              resolveApiMessage(
                (openPodsResponse as ApiError).message,
                (openPodsResponse as ApiError).error
              )
            );
          }

          return [] as PodPlanOpenPod[];
        })
      );

      const combined: PlanWithOpenPods[] = plans.map((plan, index) => ({
        plan,
        openPods: openPodsResults[index] ?? [],
      }));

      setPodPlans(combined);

      if (!combined.find(({ plan }) => plan.code === selectedPlanCode)) {
        const first = combined[0];
        if (first) {
          setSelectedPlanCode(first.plan.code);
          if (first.plan.lifecycleWeeks === 12 || first.plan.lifecycleWeeks === 24) {
            setSelectedCycleWeeks(first.plan.lifecycleWeeks as PodDurationWeeks);
          }
        }
      }
    } catch (error) {
      const fallback = "Unable to retrieve pod plans right now.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setPodPlansError(message);
      setPodPlans([]);
    } finally {
      setPodPlansLoading(false);
    }
  }, [selectedPlanCode]);

  useEffect(() => {
    void refreshPodPlans();
  }, [refreshPodPlans]);

  useEffect(() => {
    if (!selectedPlanCode || selectedPlanCode === CUSTOM_PLAN_CODE) {
      return;
    }

    const match = podPlans.find(({ plan }) => plan.code === selectedPlanCode);
    if (match) {
      const weeks = match.plan.lifecycleWeeks;
      if (weeks === 12 || weeks === 24) {
        setSelectedCycleWeeks(weeks as PodDurationWeeks);
      }
    }
  }, [selectedPlanCode, podPlans]);

  const next = useCallback(() => {
    setStep((current) => {
      switch (current) {
        case "pod_plan_selection":
          return selectedPlanCode === CUSTOM_PLAN_CODE
            ? "pod_form_filling"
            : "pod_goal_setting";
        case "pod_goal_setting":
          return "pod_onboarding_complete";
        case "pod_form_filling":
          return "pod_onboarding_complete";
        case "pod_invite_acceptance":
          return "pod_plan_selection";
        default:
          return current;
      }
    });
  }, [selectedPlanCode]);

  const prev = useCallback(() => {
    setStep((current) => {
      switch (current) {
        case "pod_form_filling":
        case "pod_goal_setting":
        case "pod_invite_acceptance":
        case "pod_onboarding_complete":
          return "pod_plan_selection";
        default:
          return current;
      }
    });
  }, []);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => {
    setVisible(false);
    setStep("pod_plan_selection");
    setInviteToken("");
    setGoalNote("");
    setSelectedGoalCategoryValue(POD_GOAL_CATEGORIES_MAP.MORTGAGE);
  }, [setSelectedGoalCategoryValue, setGoalNote]);

  const openInviteAcceptance = useCallback(
    (token?: string) => {
      if (token) {
        setInviteToken(token);
      }
      setStep("pod_invite_acceptance");
      setVisible(true);
    },
    []
  );

  const value = useMemo<OnboardingContextValue>(
    () => ({
      visible,
      open,
      close,
      step,
      setStep: setStepGuarded,
      next,
      prev,
      selectedPlanCode,
      setSelectedPlanCode,
      selectedCycleWeeks,
      setSelectedCycleWeeks,
      selectedGoalCategoryValue,
      setSelectedGoalCategoryValue,
      goalNote,
      setGoalNote,
      podName,
      setPodName,
      contributionAmountCents,
      setContributionAmountCents,
      schedule,
      setSchedule,
      maxMembers,
      setMaxMembers,
      invitedEmails,
      setInvitedEmails,
      randomPosition,
      setRandomPosition,
      podPlans,
      podPlansLoading,
      podPlansError,
      refreshPodPlans,
      inviteToken,
      openInviteAcceptance,
    }),
    [
      visible,
      open,
      close,
      step,
      setStepGuarded,
      next,
      prev,
      selectedPlanCode,
      selectedCycleWeeks,
      selectedGoalCategoryValue,
      goalNote,
      podName,
      contributionAmountCents,
      schedule,
      maxMembers,
      invitedEmails,
      randomPosition,
      podPlans,
      podPlansLoading,
      podPlansError,
      refreshPodPlans,
      inviteToken,
      openInviteAcceptance,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
