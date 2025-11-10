"use client";
import cn from "clsx";
import { useMemo, useState } from "react";
import { PodGoalCategory } from "@/lib/types/pod";
import { Button } from "../utils/button";
import { useOnboarding, CUSTOM_POD_PLAN_CODE } from "@/lib/provider-onboarding";
import { Field } from "../utils/field";
import { POD_GOAL_CATEGORIES_MAP } from "@/lib/constants/pod";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import { resolveApiMessage } from "@/lib/utils/api-helpers";
import { ApiErrorClass } from "@/lib/utils/auth";
import { useDashboard } from "@/lib/provider-dashboard";

export default function PodGoalSetting() {
  const {
    close,
    prev,
    selectedPlanCode,
    setSelectedGoalCategoryValue,
    selectedGoalCategoryValue,
    goalNote,
    setGoalNote,
    refreshPodPlans,
  } = useOnboarding();
  const { bankConnected } = useDashboard();

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const categories = useMemo(() => Object.values(POD_GOAL_CATEGORIES_MAP), []);

  const canProceed = useMemo(() => {
    return (
      Boolean(selectedPlanCode) &&
      Boolean(selectedGoalCategoryValue) &&
      goalNote.trim().length > 0
    );
  }, [goalNote, selectedGoalCategoryValue, selectedPlanCode]);
  const canJoinPod = canProceed && bankConnected;

  const handleSubmit = async () => {
    if (!selectedPlanCode || selectedPlanCode === CUSTOM_POD_PLAN_CODE) {
      return;
    }

    if (!bankConnected) {
      setStatus({
        type: "error",
        message: "Connect your bank account to join a pod.",
      });
      return;
    }

    if (!canProceed) {
      setStatus({
        type: "error",
        message:
          "Please select a goal and provide a goal note before continuing.",
      });
      return;
    }

    const token = TokenManager.getToken();
    if (!token) {
      setStatus({
        type: "error",
        message: "You need to be logged in to join a pod.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await AuthService.joinPod(
        selectedPlanCode,
        {
          goal: selectedGoalCategoryValue || POD_GOAL_CATEGORIES_MAP.MORTGAGE,
          goalNote: goalNote.trim(),
        },
        token
      );

      if (response && typeof response === "object" && "error" in response) {
        setStatus({
          type: "error",
          message: resolveApiMessage(
            response.message as string,
            "Unable to join this pod right now. Please try again."
          ),
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Pod join request submitted successfully.",
      });

      await refreshPodPlans();

      setTimeout(() => {
        close();
      }, 1800);
    } catch (error) {
      const fallback = "Unable to join this pod right now. Please try again.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between gap-14">
        <button
          className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        <div className="text-center grow mr-16">
          <div className="text-2xl font-bold text-gray-900">
            Pod tracking goal
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Help us tailor insights and tracking for your savings journey.
          </p>
        </div>
{/* 
        <button
          className="text-sm text-gray-700 hover:text-gray-900 border border-gray-100 px-8 py-3 rounded-full"
          onClick={close}
        >
          Skip for now
        </button> */}
      </div>

      <div className="text-text-500 font-semibold text-lg">
        Choose your financial goal by marking the box clearly.
      </div>

      <div className="mb-4">
        <ul className="flex flex-wrap gap-4 mb-6.5">
          {categories.map((value) => {
            const isActive = selectedGoalCategoryValue === value;
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGoalCategoryValue(value as PodGoalCategory);
                  }}
                  className={cn(
                    "size-fit text-left px-6 py-4 md:p-5 rounded-2xl border transition-colors flex items-center justify-between hover:bg-primary/10 gap-4 capitalize",
                    isActive ? "border-tertiary-100" : "border-gray-100"
                  )}
                >
                  <span className="text-gray-900 text-sm font-medium">
                    {value.replace("_", " ")}
                  </span>
                  <span
                    className={cn(
                      "size-6 rounded-full bg-white",
                      isActive
                        ? "border-6 border-tertiary-100"
                        : "border border-gray-100"
                    )}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <Field
          name="goalNote"
          label="Goal note"
          placeholder="Tell us more about this goal…"
          labelClassName="!text-sm !text-gray-900 !font-medium"
          // as="textarea"
          value={goalNote}
          onChange={(e) => setGoalNote(e.target.value)}
          required
        />
      </div>

      {status && (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            status.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600"
          )}
        >
          {status.message}
        </div>
      )}
      {!bankConnected && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Please connect your bank account to continue. This ensures payouts and
          contributions can be automated safely.
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {/* <Button text="Close" variant="secondary" onClick={close} /> */}
        <Button
          disabled={!canJoinPod || loading}
          text={loading ? "Submitting…" : "Join pod"}
          variant="primary"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
