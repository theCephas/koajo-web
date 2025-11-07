"use client";

import { useState, useEffect } from "react";
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

interface SetupGuideProps {
  steps: SetupStep[];
  onStepClick?: (stepId: string) => void;
  className?: string;
}

const SETUP_GUIDE_CLOSED_KEY = "setup_guide_closed";

const SetupGuide = ({ steps, onStepClick, className }: SetupGuideProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  useEffect(() => {
    const closed = localStorage.getItem(SETUP_GUIDE_CLOSED_KEY);
    if (closed === "true") {
      const allCompleted = steps.every(
        (step) => step.status === "completed"
      );
      setIsClosed(allCompleted);
    }
  }, [steps]);

  const allCompleted = steps.every((step) => step.status === "completed");
  const completedCount = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = steps.length;
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
    onStepClick?.(stepId);
  };

  if (isClosed || allCompleted) {
    return null;
  }

  const nextStep = steps.find((step) => step.status !== "completed");

  if (!isExpanded) {
    return (
      <div
        className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-100 p-4",
          className
        )}
      >
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
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4",
        className
      )}
    >
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
        {steps.map((step) => {
          const isExpanded = expandedStepId === step.id;
          const hasSubSteps = step.subSteps && step.subSteps.length > 0;
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in_progress";
          const isPending = step.status === "pending";

          return (
            <div key={step.id}>
              <div
                className={cn(
                  "flex items-center justify-between py-2 px-3 rounded-lg transition-colors cursor-pointer",
                  {
                    "bg-blue-50 border border-blue-200": isInProgress,
                    "opacity-50 line-through": isCompleted && !hasSubSteps,
                    "hover:bg-gray-50": !isCompleted && !isInProgress,
                  }
                )}
                onClick={() => {
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
                    "text-gray-400": isCompleted && !hasSubSteps,
                    "text-gray-600": isPending || (isCompleted && hasSubSteps),
                  })}
                >
                  {step.label}
                </span>
                {hasSubSteps && (
                  <svg
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      {
                        "rotate-180": isExpanded,
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
              {hasSubSteps && isExpanded && (
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
  );
};

export default SetupGuide;

