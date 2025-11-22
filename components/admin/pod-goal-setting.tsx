"use client";
import cn from "clsx";
import { useMemo, useState } from "react";
import { PodGoalCategory } from "@/lib/types/pod";
import { Button } from "../utils/button";
import { Modal } from "@/components/utils";
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
    open,
    setStep,
    selectedPlanCode,
    selectedCycleWeeks,
    schedule,
    podPlans,
    setSelectedGoalCategoryValue,
    selectedGoalCategoryValue,
    goalNote,
    setGoalNote,
    refreshPodPlans,
  } = useOnboarding();
  const { bankConnected, refreshPods, refreshUser } = useDashboard();

  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationVisible, setConfirmationVisible] =
    useState<boolean>(false);

  const categories = useMemo(() => Object.values(POD_GOAL_CATEGORIES_MAP), []);

  const canProceed = useMemo(() => {
    return Boolean(selectedPlanCode) && Boolean(selectedGoalCategoryValue);
  }, [selectedGoalCategoryValue, selectedPlanCode]);
  const canJoinPod = canProceed && bankConnected;

  const selectedPlan = useMemo(
    () =>
      podPlans.find(({ plan }) => plan.code === selectedPlanCode)?.plan ?? null,
    [podPlans, selectedPlanCode]
  );

  const contributionAmount = selectedPlan?.amount ?? 0;
  const lifecycleWeeks =
    selectedPlan?.lifecycleWeeks ?? selectedCycleWeeks ?? 0;
  const contributionPeriods = lifecycleWeeks
    ? Math.max(Math.round(lifecycleWeeks / 2), 1)
    : 0;
  const podDurationLabel = useMemo(() => {
    if (!lifecycleWeeks) return "Duration shared after confirmation";
    if (lifecycleWeeks === 12) return "3 months (6 total contributions)";
    if (lifecycleWeeks === 24) return "6 months (12 total contributions)";
    const months = Math.round(lifecycleWeeks / 4);
    return `${months} months (${contributionPeriods} total contributions)`;
  }, [lifecycleWeeks, contributionPeriods]);

  const payoutBeforeFees = contributionAmount * contributionPeriods;
  const processingFeeAmount = payoutBeforeFees * 0.025;
  const estimatedPayout = Math.max(payoutBeforeFees - processingFeeAmount, 0);
  const contributionCadenceLabel =
    schedule === "monthly" ? "auto paid monthly" : "auto paid every 2 weeks";
  const contributionCadenceDescription =
    schedule === "monthly"
      ? "Monthly contributions for the full cycle"
      : "Biweekly contributions for the full cycle";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

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
        message: "Please select a goal before continuing.",
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
          ...(goalNote.trim() && { goalNote: goalNote.trim() }),
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

      // Refresh all pod-related data in real-time
      await Promise.all([refreshPodPlans(), refreshPods(), refreshUser()]);

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

  const handleOpenConfirmation = () => {
    if (!canJoinPod || loading) return;
    setStatus(null);
    setConfirmationVisible(true);
  };

  const handleConfirmJoin = async () => {
    setConfirmationVisible(false);
    await handleSubmit();
  };

  return (
    <>
      <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] max-h-[88vh] overflow-y-scroll relative p-6 md:p-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between gap-14">
          <button
            className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
            aria-label="Go back"
            onClick={prev}
          >
            <span className="inline-block -ml-1 rotate-180">➜</span>
          </button>

          <div className="text-center grow mr-16">
            <div className="text-lg lg:text-2xl font-bold text-gray-900">
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
            label="Goal note (optional)"
            placeholder="Tell us more about this goal…"
            labelClassName="!text-sm !text-gray-900 !font-medium"
            // as="textarea"
            value={goalNote}
            onChange={(e) => setGoalNote(e.target.value)}
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
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-yellow-800">
                Please connect your bank account to continue. This ensures
                payouts and contributions can be automated safely.
              </p>
              <Button
                text="Connect Bank"
                variant="primary"
                onClick={() => {
                  close(); // Close the current modal first
                  setTimeout(() => {
                    setStep("bank_connection");
                    open();
                  }, 100);
                }}
                className="shrink-0"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {/* <Button text="Close" variant="secondary" onClick={close} /> */}
          <Button
            disabled={!canJoinPod || loading}
            text={loading ? "Submitting…" : "Review your pod"}
            variant="primary"
            onClick={handleOpenConfirmation}
          />
        </div>
      </div>

      <Modal
        visible={confirmationVisible}
        onClose={() => setConfirmationVisible(false)}
      >
        <div className="w-full max-w-[540px] h-[88vh] overflow-y-scroll bg-white rounded-2xl shadow-lg px-4 py-6 md:py-8 md:px-5 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-xl bg-primary/10 text-primary font-semibold flex items-center justify-center">
                Pod
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-primary tracking-wide">
                  Pod confirmation
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  You&apos;re about to join a Koajo pod
                </h3>
                <p className="text-sm text-gray-500">
                  Let&apos;s make sure everything looks right before you begin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmationVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close confirmation"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Pod Amount
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {contributionAmount ? formatCurrency(contributionAmount) : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Plan you selected</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your Contribution
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {contributionAmount ? formatCurrency(contributionAmount) : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">
                {contributionCadenceLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pod Duration
              </p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {podDurationLabel}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {contributionCadenceDescription}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your Payout Week
              </p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                Displayed after first savings confirmed
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Assigned automatically once contributions start
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Koajo Processing Fee
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    2.5% taken from your payout
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {processingFeeAmount > 0
                    ? `${formatCurrency(processingFeeAmount)} est.`
                    : "—"}
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-dashed border-primary/30 bg-white px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Payout Amount You&apos;ll Receive
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {estimatedPayout > 0
                    ? `${formatCurrency(estimatedPayout)} after fees`
                    : "Calculated once plan is confirmed"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on your total pod contributions
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              By joining this pod, you&apos;re agreeing to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Make on-time biweekly auto contributions for the full pod
                  cycle
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>
                  Receive your payout during your assigned week, guaranteed by
                  Koajo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Abide by our community rules and pod terms</span>
              </li>
            </ul>
            <p className="text-sm font-semibold text-gray-900 mt-3">
              Fund what matters, without debt.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-full border border-gray-100"
              onClick={() => setConfirmationVisible(false)}
            >
              Go back
            </button>
            <Button
              disabled={loading}
              text={loading ? "Joining…" : "Confirm & join pod"}
              variant="primary"
              onClick={handleConfirmJoin}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
