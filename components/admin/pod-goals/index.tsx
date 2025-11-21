"use client";
import { useState, useMemo } from "react";
import cn from "clsx";
import Card from "@/components2/usefull/Card";
import Modal from "@/components/utils/modal";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";
import {
  SkeletonBlock,
  SkeletonLine,
} from "@/components/admin/dashboard-skeletons";
import type { PodGoalCategory } from "@/lib/types/pod";

type PodGoalsProps = {
  className?: string;
};

const MAX_VISIBLE_GOALS = 2;

// Goal type to icon mapping with emojis
const GOAL_TYPE_ICONS: Record<PodGoalCategory, string> = {
  mortgage: "🏠",
  home_improvement: "🔨",
  college_tuition: "🎓",
  debt_payoff: "💳",
  january_recovery: "💰",
  emergency_fund: "🛡️",
  business_capital: "💼",
  investment_portfolio: "📈",
  detty_december: "🎉",
  savings: "💵",
  other: "🎯",
};

// Goal type to display name mapping
const GOAL_TYPE_NAMES: Record<PodGoalCategory, string> = {
  mortgage: "Mortgage",
  home_improvement: "Home Improvement",
  college_tuition: "College Tuition",
  debt_payoff: "Debt Payoff",
  january_recovery: "January Recovery",
  emergency_fund: "Emergency Fund",
  business_capital: "Business Capital",
  investment_portfolio: "Investment Portfolio",
  detty_december: "Detty December",
  savings: "Savings",
  other: "Other Goal",
};

const PodGoals = ({ className }: PodGoalsProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentPod, emailVerified, podsLoading } = useDashboard();

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Extract goals from current pod
  const goals = useMemo(() => {
    if (!currentPod) return [];

    const goalType = (currentPod.goalType as PodGoalCategory) || "savings";
    const totalContributed = parseFloat(currentPod.totalContributed || "0");
    const targetAmount = parseFloat(currentPod.totalContributionTarget || "0");
    const progressPercent = currentPod.contributionProgress || 0;
    const nextPayoutDate = currentPod.nextPayoutDate
      ? new Date(currentPod.nextPayoutDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return [
      {
        id: currentPod.podId,
        goalType,
        title: currentPod.goalNote || GOAL_TYPE_NAMES[goalType] || "My Goal",
        subtitle: nextPayoutDate ? `Due date - ${nextPayoutDate}` : "Ongoing",
        icon: GOAL_TYPE_ICONS[goalType] || "🎯",
        target: targetAmount,
        current: totalContributed,
        progress: progressPercent,
      },
    ];
  }, [currentPod]);

  const displayedGoals = goals.slice(0, MAX_VISIBLE_GOALS);
  const isLocked = !emailVerified;
  const isLoading = podsLoading;
  const hasGoals = goals.length > 0;

  return (
    <>
      <div className="relative">
        <Card
          title="My Pod Goal"
          tooltip="Track your pod's progress towards financial goals"
          onSeeMore={
            goals.length > MAX_VISIBLE_GOALS
              ? () => setModalVisible(true)
              : undefined
          }
          className={cn(
            className,
            isLocked &&
              "[&>div:not(:first-child)]:blur-sm [&>div:not(:first-child)]:select-none [&>div:not(:first-child)]:pointer-events-none"
          )}
          showSeeMore={
            !isLocked && !isLoading && goals.length > MAX_VISIBLE_GOALS
          }
        >
          <div className="bg-white rounded-lg mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: MAX_VISIBLE_GOALS }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-100 p-4 space-y-3"
                  >
                    <SkeletonLine className="w-32 h-4" />
                    <SkeletonLine className="w-44" />
                    <SkeletonBlock className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : !hasGoals ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-text-400 font-medium">No pod goals yet</p>
                <p className="text-text-500 text-sm mt-1">
                  Join a pod to start tracking your goals
                </p>
              </div>
            ) : (
              displayedGoals.map((goal) => {
                const percentage = getProgressPercentage(
                  goal.current,
                  goal.target
                );
                return (
                  <GoalItem key={goal.id} goal={goal} percentage={percentage} />
                );
              })
            )}
          </div>
        </Card>
        <LockedOverlay />
      </div>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        position={{ vertical: "center", horizontal: "center" }}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              All Pod Goals
            </h3>
            <button
              onClick={() => setModalVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = getProgressPercentage(
                goal.current,
                goal.target
              );
              return (
                <GoalItem key={goal.id} goal={goal} percentage={percentage} />
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};

interface GoalItemProps {
  id: string;
  goalType: PodGoalCategory;
  title: string;
  subtitle: string;
  icon: string;
  target: number;
  current: number;
  progress: number;
}

const GoalItem = ({
  goal,
  percentage,
}: {
  goal: GoalItemProps;
  percentage: number;
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col border border-secondary-100 rounded-lg p-4 gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
          {goal.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {goal.title}
          </span>
          <span className="text-xs text-gray-500">{goal.subtitle}</span>
        </div>
      </div>
      <div className="flex justify-between gap-4 items-center text-xs">
        <span className="text-gray-500">
          Amount Paid:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(goal.current)}
          </span>
        </span>
        <span className="text-gray-500">
          Target:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(goal.target)}
          </span>{" "}
          ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PodGoals;
