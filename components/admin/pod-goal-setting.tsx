"use client";
import { useMemo, useState } from "react";
import { PodGoalCategory } from "@/lib/types/pod";
import { Button } from "../utils/button";
import { useOnboarding } from "@/lib/provider-onboarding";
import { Field } from "../utils/field";
import { POD_GOAL_CATEGORIES_MAP } from "@/lib/constants/pod";

export default function PodGoalSetting() {
  const {
    close,
    prev,
    next,
    setSelectedGoalCategoryValue,
    selectedGoalCategoryValue,
  } = useOnboarding();
  const [selectedGoalCategory, setSelectedGoalCategory] =
    useState<PodGoalCategory>(POD_GOAL_CATEGORIES_MAP.MORTGAGE);
  const [customGoal, setCustomGoal] = useState<string>("");

  const canProceed = useMemo(() => {
    if (!selectedGoalCategoryValue) return false;
    if (selectedGoalCategoryValue === "other")
      return customGoal.trim().length > 0;
    return true;
  }, [selectedGoalCategoryValue, customGoal]);

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between gap-14">
        {/* Back Button */}
        <button
          className="text-sm text-gray-700 hover:text-gray-900  flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        <div className="text-center grow mr-16">
          <div className="text-2xl font-bold text-gray-900">
            Pod Tracking goal
          </div>
          <p className="text-sm text-gray-500 mt-1">
            help you create visual tracking reports on their dashboard for each
            goal
          </p>
        </div>
      </div>

      <div className="text-text-500 font-semibold text-lg">
        Choose your financial goal by marking the box clearly.
      </div>

      <div className="mb-25">
        <ul className="flex flex-wrap gap-4 mb-6.5">
          {Object.values(POD_GOAL_CATEGORIES_MAP).map((value) => {
            const isActive = selectedGoalCategoryValue === value;
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGoalCategory(value);
                    setSelectedGoalCategoryValue(value);
                  }}
                  className={`size-fit text-left px-6 py-4 md:p-5 rounded-2xl border transition-colors flex items-center justify-between hover:bg-primary/10 gap-4 ${
                    isActive ? "border-tertiary-100" : "border-gray-100"
                  }`}
                >
                  <span className="text-gray-900 text-sm font-medium capitalize">
                    {value.replace("_", " ")}
                  </span>
                  <span
                    className={`size-6 rounded-full  bg-white ${
                      isActive
                        ? "border-6 border-tertiary-100"
                        : "border-1 border-gray-100"
                    }`}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {selectedGoalCategory === "other" && (
          <Field
            name="customGoal"
            label="Input Your Financial Goal"
            placeholder="e.g. Marriage"
            labelClassName="!text-sm !text-gray-900 !font-medium"
            value={customGoal}
            onChange={(e) => {
              setCustomGoal(e.target.value);
              setSelectedGoalCategoryValue(e.target.value);
            }}
            disabled={selectedGoalCategory !== "other"}
            required
          />
        )}
      </div>
      <div className="flex items-center justify-end">
        <Button
          disabled={!canProceed}
          text="Next"
          variant="primary"
          onClick={next}
        />
      </div>
    </div>
  );
}
