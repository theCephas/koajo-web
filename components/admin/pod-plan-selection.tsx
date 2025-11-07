"use client";

import cn from "clsx";
import { useMemo } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "../utils/button";
import { useOnboarding, CUSTOM_POD_PLAN_CODE } from "@/lib/provider-onboarding";
import { POD_PLAN_ICONS, type PodPlanCodeKeys } from "@/lib/constants/pod";
import { PodDurationWeeks } from "@/lib/types/pod";

const MAX_VISIBLE_OPEN_PODS = 3;

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value?: string | null): string => {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getIconConfig = (amount: number) => {
  const key = `POD_${Math.round(amount)}`.toUpperCase();
  return POD_PLAN_ICONS[key as PodPlanCodeKeys] ?? POD_PLAN_ICONS.CUSTOM;
};

export default function PodSelection() {
  const {
    close,
    prev,
    next,
    selectedPlanCode,
    setSelectedPlanCode,
    setSelectedCycleWeeks,
    selectedCycleWeeks,
    podPlans,
    podPlansLoading,
    podPlansError,
    refreshPodPlans,
  } = useOnboarding();

  const plans = useMemo(() => podPlans ?? [], [podPlans]);

  const handleSelectPlan = (planCode: string, lifecycleWeeks?: number) => {
    setSelectedPlanCode(planCode);
    if (
      lifecycleWeeks &&
      (lifecycleWeeks === 12 || lifecycleWeeks === 24) &&
      lifecycleWeeks !== selectedCycleWeeks
    ) {
      setSelectedCycleWeeks(lifecycleWeeks as PodDurationWeeks);
    }
  };

  const handleNext = () => {
    if (!selectedPlanCode) return;
    next();
  };

  const isNextDisabled = !selectedPlanCode;

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg max-h-[700px] overflow-y-scroll">
      <div className="flex items-center justify-between gap-6">
        <button
          className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center border border-gray-100 size-12 gap-2 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        <div className="text-center text-2xl font-bold text-gray-900">
          Choose Pod Plan
        </div>

        <button
          className="text-sm text-gray-700 hover:text-gray-900 border border-gray-100 px-8 py-3 rounded-full"
          onClick={close}
        >
          Skip for now
        </button>
      </div>

      {podPlansLoading && (
        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary">
          Loading available pod plans…
        </div>
      )}

      {podPlansError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between gap-4">
          <span>{podPlansError}</span>
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => refreshPodPlans()}
          >
            Retry
          </button>
        </div>
      )}

      {!podPlansLoading && plans.length === 0 && !podPlansError && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
          No pod plans are currently available. You can still create a custom
          pod below.
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {plans.map(({ plan, openPods }) => {
          const isActive = selectedPlanCode === plan.code;
          const iconConfig = getIconConfig(plan.amount);
          return (
            <li key={plan.code} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSelectPlan(plan.code, plan.lifecycleWeeks)}
                className={cn(
                  "w-full text-left p-4 md:p-5 rounded-xl border transition-colors flex items-center justify-between gap-4",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 hover:bg-primary/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <CldImage
                    src={iconConfig.id}
                    alt={iconConfig.alt}
                    width={40}
                    height={40}
                    className="size-auto max-w-full max-h-full object-contain"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(plan.amount)} Plan
                    </div>
                    <p className="text-sm text-gray-500 max-w-[56ch]">
                      {plan.lifecycleWeeks}-week cycle · up to {plan.maxMembers}{" "}
                      members
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "size-6 rounded-full border-6 bg-white",
                    isActive ? "border-tertiary-100" : "border-white"
                  )}
                />
              </button>

              {isActive && openPods.length > 0 && (
                <div className="ml-12 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Available pods
                  </div>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    {openPods.slice(0, MAX_VISIBLE_OPEN_PODS).map((pod) => (
                      <li
                        key={pod.podId}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="truncate pr-4">
                          {pod.name && typeof pod.name === "string"
                            ? pod.name
                            : `Pod ${pod.podId.slice(-6)}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          Next contribution{" "}
                          {formatDate(pod.nextContributionDate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {openPods.length > MAX_VISIBLE_OPEN_PODS && (
                    <div className="mt-2 text-xs text-gray-500">
                      +{openPods.length - MAX_VISIBLE_OPEN_PODS} more pods are
                      open for this plan.
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}

        <li className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSelectPlan(CUSTOM_POD_PLAN_CODE)}
            className={cn(
              "w-full text-left p-4 md:p-5 rounded-xl border transition-colors flex items-center justify-between gap-4",
              selectedPlanCode === CUSTOM_POD_PLAN_CODE
                ? "border-primary bg-primary/5"
                : "border-gray-100 hover:bg-primary/10"
            )}
          >
            <div className="flex items-center gap-4">
              <CldImage
                src={POD_PLAN_ICONS.CUSTOM.id}
                alt={POD_PLAN_ICONS.CUSTOM.alt}
                width={40}
                height={40}
                className="size-auto max-w-full max-h-full object-contain"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  Create a custom pod
                </div>
                <p className="text-sm text-gray-500 max-w-[56ch]">
                  Define your own contribution amount, cadence, and invitees.
                  Perfect for private savings circles.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "size-6 rounded-full border-6 bg-white",
                selectedPlanCode === CUSTOM_POD_PLAN_CODE
                  ? "border-tertiary-100"
                  : "border-white"
              )}
            />
          </button>
        </li>
      </ul>

      <div className="flex items-center justify-end">
        <Button
          disabled={isNextDisabled}
          text="Next"
          variant="primary"
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
