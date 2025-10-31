"use client";
import { useMemo, useState } from "react";
import {
  PodDurationWeeks,
  PodPlanCode,
  PodGoalCategory,
  PodSchedule,
  PodPlan,
} from "@/lib/types/pod";
import {
  POD_PLAN_ICONS,
  type PodPlanCodeKeys,
  POD_PLAN_AMOUNT_CENTS,
} from "@/lib/constants/pod";
import { CldImage } from "next-cloudinary";
import { Button } from "../utils/button";
import { useOnboarding } from "@/lib/provider-onboarding";

export interface PodSelectionData {
  planCode: PodPlanCode;
  durationWeeks: PodDurationWeeks;
  goalCategory?: PodGoalCategory;
  customGoalName?: string;
}

export interface PodFormData extends PodSelectionData {
  name?: string;
  schedule?: PodSchedule;
  activationDate?: string;
}

export default function PodSelection() {
  const { close, prev, selectedCycleWeeks, setSelectedCycleWeeks, next, selectedPlanCode, setSelectedPlanCode } = useOnboarding();

  const plans: PodPlan[] = useMemo(
    () => getPodPlanData(selectedCycleWeeks),
    [selectedCycleWeeks]
  );

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between gap-14">
        {/* Back Button */}
        <button
          className="text-sm text-gray-700 hover:text-gray-900  mr-16 flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        {/* Title */}
        <div className="text-center text-2xl font-bold text-gray-900 mb-2">
          Choose Pod
        </div>

        {/* Skip for now Button */}
        <button
          className="text-sm text-gray-700 hover:text-gray-900 border border-gray-100 px-8 py-3 rounded-full"
          onClick={close}
        >
          Skip for now
        </button>
      </div>

      <div
        className="flex w-fit mx-auto items-center justify-center p-0.5 gap-2 border border-gray-100 rounded-full shadow-[6px_6px_32px_0px_#0000000F]
"
      >
        {[12, 24].map((cycle) => (
          <button
            key={cycle}
            onClick={() => setSelectedCycleWeeks(cycle as PodDurationWeeks)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              cycle === selectedCycleWeeks
                ? "bg-primary text-white"
                : "bg-white border border-gray-100 text-gray-700 shadow-[inset_0px_0px_8px_0px_#00000014]"
            }`}
          >
            {cycle} Weeks Pod Cycle
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-4">
        {plans.map((plan) => {
          const isActive = selectedPlanCode === plan.code;
          return (
            <li key={plan.id}>
              <button
                onClick={() => setSelectedPlanCode(plan.code as PodPlanCode)}
                className={`w-full text-left p-4 md:p-5 rounded-xl border transition-colors flex items-center justify-between hover:bg-primary/10 gap-4 ${
                  isActive
                    ? "border-primary "
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <CldImage
                    src={
                      POD_PLAN_ICONS[plan.code.toUpperCase() as PodPlanCodeKeys]
                        ?.id 
                    }
                    alt={
                      POD_PLAN_ICONS[plan.code.toUpperCase() as PodPlanCodeKeys]
                        ?.alt
                    }
                    width={40}
                    height={40}
                    className="size-auto max-w-full max-h-full object-contain"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {plan.name}
                    </div>
                    <p className="text-sm text-gray-500 max-w-[56ch]">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`size-6 rounded-full border-6 bg-white ${
                    isActive ? "border-tertiary-100" : "border-white"
                  }`}
                >
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-end">
        <Button
          disabled={!selectedPlanCode}
          text="Next"
          variant="primary"
          onClick={next}
        />
      </div>
    </div>
  );
}

const getPodPlanData = (cycle: number): PodPlan[] => {
  const months = cycle === 12 ? 3 : 6;
  const template =
    "$${AMOUNT} contribution payment due on the 1st & 16th of each month for {MONTHS} months.".replace(
      "{MONTHS}",
      String(months)
    );

  return [
    {
      id: "1",
      code: "pod_100",
      name: "$100 Pod Plan",
      amountCents: POD_PLAN_AMOUNT_CENTS.POD_100,
      currency: "USD",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: template.replaceAll("{AMOUNT}", "100"),
    },
    {
      id: "2",
      code: "pod_200",
      name: "$200 Pod Plan",
      amountCents: POD_PLAN_AMOUNT_CENTS.POD_200,
      currency: "USD",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: template.replaceAll("{AMOUNT}", "200"),
    },
    {
      id: "3",
      code: "pod_500",
      name: "$500 Pod Plan",
      amountCents: POD_PLAN_AMOUNT_CENTS.POD_500,
      currency: "USD",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: template.replaceAll("{AMOUNT}", "500"),
    },
    {
      id: "4",
      code: "pod_1000",
      name: "$1000 Pod Plan",
      amountCents: POD_PLAN_AMOUNT_CENTS.POD_1000,
      currency: "USD",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: template.replaceAll("{AMOUNT}", "1000"),
    },
    {
      id: "5",
      code: "custom",
      name: "Custom Pod Plan",
      amountCents: POD_PLAN_AMOUNT_CENTS.CUSTOM,
      currency: "USD",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description:
        "Choose your contribution; bi‑weekly payments on the 1st & 16th. Monthly option available. Select members and length.",
    },
  ];
};
