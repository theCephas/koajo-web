"use client";
import { useState } from "react";
import cn from "clsx";
import Card from "@/components2/usefull/Card";
import Modal from "@/components/utils/modal";
import StarIcon from "@/public/media/icons/star.svg";
import MoneyIcon from "@/public/media/icons/money.svg";
import MuscleIcon from "@/public/media/icons/muscle.svg";
import GrowthIcon from "@/public/media/icons/growth.svg";
import FlashIcon from "@/public/media/icons/flash.svg";
import KeyIcon from "@/public/media/icons/key.svg";
import PieIcon from "@/public/media/icons/pie.svg";
import ExagonIcon from "@/public/media/icons/exagon";

const achievements = [
  {
    id: 1,
    title: "The Vault Master",
    Icon: <StarIcon />,
    gradientColors: { start: "#29C746", stop: "#1D912E" },
    type: "recent",
    progress: null,
  },
  {
    id: 2,
    title: "The Flash",
    Icon: <FlashIcon />,
    gradientColors: { start: "#3E86E4", stop: "#1A61BE" },
    type: "recent",
    progress: null,
  },
  {
    id: 3,
    title: "The Visionary",
    Icon: <GrowthIcon />,
    gradientColors: { start: "#F0933D", stop: "#E46B1B" },
    type: "recent",
    progress: null,
  },
  {
    id: 4,
    title: "The Safety Net Hero",
    Icon: <KeyIcon />,
    gradientColors: { start: "#29C746", stop: "#1D912E" },
    type: "upcoming",
    progress: { current: 1, target: 5 },
  },
  {
    id: 5,
    title: "Investment Milestone",
    Icon: <PieIcon />,
    gradientColors: { start: "#BC29C7", stop: "#891D91" },
    type: "upcoming",
    progress: { current: 6, target: 8 },
  },
  {
    id: 6,
    title: "The Budget Guru",
    Icon: <MoneyIcon />,
    gradientColors: { start: "#29C7BF", stop: "#1D918B" },
    type: "upcoming",
    progress: { current: 12, target: 15 },
  },
  {
    id: 7,
    title: "The Freedom Fighter",
    Icon: <MuscleIcon />,
    gradientColors: { start: "#555555", stop: "#363636" },
    type: "upcoming",
    progress: { current: 9, target: 10 },
  },
  {
    id: 8,
    title: "The Savings Champion",
    Icon: <StarIcon />,
    gradientColors: { start: "#3E86E4", stop: "#1A61BE" },
    type: "upcoming",
    progress: { current: 3, target: 7 },
  },
  {
    id: 9,
    title: "The Debt Destroyer",
    Icon: <MoneyIcon />,
    gradientColors: { start: "#3E86E4", stop: "#1A61BE" },
    type: "upcoming",
    progress: { current: 0, target: 4 },
  },
];

type AchievementsProps = {
  className?: string;
};

const Achievements = ({ className }: AchievementsProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const recentAchievements = achievements.filter((a) => a.type === "recent");
  const upcomingAchievements = achievements.filter(
    (a) => a.type === "upcoming"
  );
  const totalCollected = recentAchievements.length;
  const totalAchievements = achievements.length;

  return (
    <>
      <Card
        title="Achievement"
        tooltip="Track your financial achievements and progress"
        right={
          <div className="text-sm text-gray-500">
            Collected {totalCollected}/{totalAchievements}
          </div>
        }
        className={className}
      >
        <div className="space-y-8 mt-8">
          {/* Recently earned section */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-4">
              Recently earned
            </h4>
            <div className="flex gap-4 justify-between w-full">
              {recentAchievements.map((achievement) => (
                <RecentAchievement
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>

          {/* Up next section */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-4">Up next</h4>
            <div className="grid grid-cols-2 gap-4 justify-between w-full">
              {upcomingAchievements.slice(0, 4).map((achievement) => (
                <UpcomingAchievement
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        position={{ vertical: "center", horizontal: "center" }}
      >
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              All Achievements
            </h3>
            <button
              onClick={() => setModalVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-8">
            {/* Recently earned in modal */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-4">
                Recently earned
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-between w-full">
                {recentAchievements.map((achievement) => (
                  <RecentAchievement
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>

            {/* Up next in modal */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Up next
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {upcomingAchievements.map((achievement) => (
                  <UpcomingAchievement
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Badge = ({
  Icon,
  gradientColors,
  size = "lg",
}: {
  Icon: React.ReactNode;
  gradientColors: { start: string; stop: string };
  size?: "sm" | "lg";
}) => {
  return (
    <div className={cn("flex flex-col justify-center items-center relative", size === "sm" ? "w-10 h-11" : "w-16 h-18")}>
      <ExagonIcon
        className="size-full absolute z-0 top-0 left-0"
        gradientColors={gradientColors}
      />
      <span className="relative z-10">{Icon}</span>
    </div>
  );
};

interface AchievementProps {
  achievement: {
    id: number;
    title: string;
    Icon: React.ReactNode;
    gradientColors: { start: string; stop: string };
    type: string;
    progress: { current: number; target: number } | null;
  };
}

const RecentAchievement = ({ achievement }: AchievementProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Badge Icon={achievement.Icon} gradientColors={achievement.gradientColors} />
      <span className="text-xs text-gray-900 text-center font-semibold">
        {achievement.title}
      </span>
    </div>
  );
};

const UpcomingAchievement = ({ achievement }: AchievementProps) => {
  if (!achievement.progress) return null;

  const percentage =
    (achievement.progress.current / achievement.progress.target) * 100;

  return (
    <div className="flex gap-2">
      <Badge Icon={achievement.Icon} gradientColors={achievement.gradientColors} size="sm"/>
      <div className="flex-1 flex flex-col gap-1">
        {/* Title */}
        <span className="text-sm font-semibold text-gray-700">
          {achievement.title}
        </span>

        {/* Progress bar */}
        <div className="w-full bg-green-100/20 rounded-full h-1.5">
          <div
            className="bg-tertiary-100 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Progress text */}
        <div className="text-xs font-medium text-secondary-300">
          <span className="text-tertiary-100">
            {achievement.progress.current}/{achievement.progress.target}{" "}
          </span>
          completed
        </div>
      </div>
    </div>
  );
};

export default Achievements;
