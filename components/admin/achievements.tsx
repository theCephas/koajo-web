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
import type { AchievementsSummary } from "@/lib/types/api";

type AchievementItem = {
  id: string | number;
  title: string;
  Icon: React.ReactNode;
  gradientColors: { start: string; stop: string };
  type: "recent" | "upcoming";
  progress: { current: number; target: number } | null;
  description?: string;
};

type AchievementsProps = {
  className?: string;
  summary?: AchievementsSummary | null;
  loading?: boolean;
  error?: string | null;
};

const iconPalette = [
  <StarIcon key="icon-star" />,
  <FlashIcon key="icon-flash" />,
  <GrowthIcon key="icon-growth" />,
  <KeyIcon key="icon-key" />,
  <PieIcon key="icon-pie" />,
  <MoneyIcon key="icon-money" />,
  <MuscleIcon key="icon-muscle" />,
];

const gradientPalette = [
  { start: "#29C746", stop: "#1D912E" },
  { start: "#3E86E4", stop: "#1A61BE" },
  { start: "#F0933D", stop: "#E46B1B" },
  { start: "#BC29C7", stop: "#891D91" },
  { start: "#29C7BF", stop: "#1D918B" },
  { start: "#555555", stop: "#363636" },
];

const buildAchievementsFromSummary = (
  summary: AchievementsSummary
): AchievementItem[] => {
  const earned = summary.earned.map((item, index) => ({
    id: `earned-${item.code}-${index}`,
    title: item.name,
    Icon: iconPalette[index % iconPalette.length],
    gradientColors: gradientPalette[index % gradientPalette.length],
    type: "recent" as const,
    progress: null,
    description: item.description,
  }));

  const pending = summary.pending.map((item, index) => {
    const paletteIndex = (earned.length + index) % gradientPalette.length;
    const current = item.progress ?? 0;
    const total = Math.max(current + (item.remaining ?? 0), 1);

    return {
      id: `pending-${item.code}-${index}`,
      title: item.name,
      Icon: iconPalette[(earned.length + index) % iconPalette.length],
      gradientColors: gradientPalette[paletteIndex],
      type: "upcoming" as const,
      progress: {
        current,
        target: total,
      },
      description: item.description,
    };
  });

  return [...earned, ...pending];
};

const Achievements = ({
  className,
  summary,
  loading,
  error,
}: AchievementsProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const achievements = summary ? buildAchievementsFromSummary(summary) : [];

  const recentAchievements = achievements.filter((a) => a.type === "recent");
  const upcomingAchievements = achievements.filter(
    (a) => a.type === "upcoming"
  );
  const totalCollected =
    (summary?.totalEarned ?? recentAchievements.length) || 0;
  const totalAchievements =
    (summary?.totalAvailable ?? achievements.length) || 0;

  const bodyHasContent =
    !loading &&
    !error &&
    (recentAchievements.length > 0 || upcomingAchievements.length > 0);

  return (
    <>
      <Card
        title="Achievement"
        tooltip="Track your financial achievements and progress"
        right={
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              Collected {totalCollected}/{totalAchievements}
            </span>
            {bodyHasContent && (
              <button
                type="button"
                className="text-tertiary-100 hover:text-tertiary-100/80 transition-colors"
                onClick={() => setModalVisible(true)}
              >
                View all
              </button>
            )}
          </div>
        }
        className={className}
      >
        <div className="space-y-8 mt-8">
          {loading && (
            <div className="text-sm text-gray-500">Loading achievements…</div>
          )}

          {error && !loading && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          {!loading &&
            !error &&
            recentAchievements.length === 0 &&
            upcomingAchievements.length === 0 && (
              <div className="text-sm text-gray-500">No achievements yet.</div>
            )}

          {!loading && !error && recentAchievements.length > 0 && (
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
          )}

          {!loading && !error && upcomingAchievements.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-4">
                Up next
              </h4>
              <div className="grid grid-cols-2 gap-4 justify-between w-full">
                {upcomingAchievements.slice(0, 4).map((achievement) => (
                  <UpcomingAchievement
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          )}
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

          {loading && (
            <div className="text-sm text-gray-500">Loading achievements…</div>
          )}

          {error && !loading && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
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
          )}
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
    <div
      className={cn(
        "flex flex-col justify-center items-center relative",
        size === "sm" ? "w-10 h-11" : "w-16 h-18"
      )}
    >
      <ExagonIcon
        className="size-full absolute z-0 top-0 left-0"
        gradientColors={gradientColors}
      />
      <span className="relative z-10">{Icon}</span>
    </div>
  );
};

interface AchievementProps {
  achievement: AchievementItem;
}

const RecentAchievement = ({ achievement }: AchievementProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Badge
        Icon={achievement.Icon}
        gradientColors={achievement.gradientColors}
      />
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
      <Badge
        Icon={achievement.Icon}
        gradientColors={achievement.gradientColors}
        size="sm"
      />
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
