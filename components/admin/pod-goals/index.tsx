"use client";
import { useState } from "react";
import cn from "clsx";
import Card from "@/components2/usefull/Card";
import { Button } from "@/components/utils";
import Modal from "@/components/utils/modal";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";

type PodGoalsProps = {
  className?: string;
};

const PodGoals = ({ className }: PodGoalsProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const displayedGoals =  goals.slice(0, 1);

  const { emailVerified } = useDashboard();
  const isLocked = !emailVerified;

  return (
    <>
      <div className="relative">
      <Card
        title="My Pod Goal"
        tooltip="Track your pod's progress towards financial goals"
        onSeeMore={() => setModalVisible(true)}
          className={cn(
            className,
            isLocked &&
              "[&>div:not(:first-child)]:blur-sm [&>div:not(:first-child)]:select-none [&>div:not(:first-child)]:pointer-events-none"
          )}
      >
        <div className="bg-white rounded-lg mt-6">
          {displayedGoals.map((goal) => {
            const percentage = getProgressPercentage(goal.current, goal.target);
            // return (
              // <GoalItem key={goal.id} goal={goal} percentage={percentage} />
            // );
            return null;
          })}
        </div>
      </Card>
        {isLocked && <LockedOverlay />}
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
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
}

const GoalItem = ({
  goal,
  percentage,
}: {
  goal: (typeof goals)[0];
  percentage: number;
}) => {
  return (
    <div className="flex flex-col border border-secondary-100 rounded-lg p-2 gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">
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
          Amount Payed:{" "}
          <span className="font-semibold text-gray-900">
            {goal.current}
            {goal.unit}
          </span>
        </span>
        <span className="text-gray-500">
          Target:{" "}
          <span className="font-semibold text-gray-900">
            {goal.target}
            {goal.unit}
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

const goals: GoalItemProps[] = [
  // {
  //   id: 1,
  //   title: "Dream Car",
  //   subtitle: "Due date - August 15",
  //   icon: "🚗",
  //   target: 20000,
  //   current: 5000,
  //   unit: "$",
  // },
  // {
  //   id: 2,
  //   title: "Vacation Fund",
  //   subtitle: "Due date - December 20",
  //   icon: "✈️",
  //   target: 8000,
  //   current: 3200,
  //   unit: "$",
  // },
  // {
  //   id: 3,
  //   title: "Home Renovation",
  //   subtitle: "Due date - March 10",
  //   icon: "🏠",
  //   target: 25000,
  //   current: 15000,
  //   unit: "$",
  // },
  // {
  //   id: 4,
  //   title: "Emergency Fund",
  //   subtitle: "Due date - Ongoing",
  //   icon: "🛡️",
  //   target: 15000,
  //   current: 12000,
  //   unit: "$",
  // },
];

export default PodGoals;
