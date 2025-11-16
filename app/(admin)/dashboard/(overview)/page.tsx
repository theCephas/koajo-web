"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./DashboardV2Page.module.sass";
import Layout from "@/components2/usefull/Layout";
import Navigation from "@/components2/usefull/Navigation";
import PodInfo from "@/components/admin/pod-info";
import PodGoals from "@/components/admin/pod-goals";
import PodMembers from "@/components/admin/pod-members";
import Achievements from "@/components/admin/achievements";
import Card from "@/components2/usefull/Card";
import LockedOverlay from "@/components/admin/locked-overlay";
import BalanceInfo from "@/components/admin/blance-info";
import CycleDuration from "@/components/admin/cycle-duration";
import Modal from "@/components/utils/modal";
import Image from "@/components2/usefull/Image";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import type {
  AchievementsSummary,
  PodActivitiesResponse,
  PodActivityItem,
} from "@/lib/types/api";
import { ApiErrorClass } from "@/lib/utils/auth";
import { resolveApiMessage } from "@/lib/utils/api-helpers";
import { useDashboard } from "@/lib/provider-dashboard";
import { DASHBOARD_BREADCRUMBS } from "@/lib/constants/dashboard";
import { getAvatarUrl } from "@/lib/utils/avatar";
import {
  SkeletonBlock,
  SkeletonLine,
} from "@/components/admin/dashboard-skeletons";
import { UserIcon } from "lucide-react";

const MAX_VISIBLE_ACTIVITIES = 3;

const Dashboard = () => {
  const [activities, setActivities] = useState<PodActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [activitiesModalVisible, setActivitiesModalVisible] =
    useState<boolean>(false);

  const [achievementsSummary, setAchievementsSummary] =
    useState<AchievementsSummary | null>(null);
  const [achievementsLoading, setAchievementsLoading] =
    useState<boolean>(false);
  const [achievementsError, setAchievementsError] = useState<string | null>(
    null
  );

  const { user, currentPod, hasPods } = useDashboard();

  useEffect(() => {
    let isMounted = true;
    const token = TokenManager.getToken();

    if (!token) {
      const message = "You need to be logged in to view dashboard data.";
      setActivitiesError(message);
      setAchievementsError(message);
      setActivities([]);
      setAchievementsSummary(null);
      return () => {
        isMounted = false;
      };
    }

    const fetchData = async () => {
      setActivitiesLoading(true);
      setAchievementsLoading(true);
      setActivitiesError(null);
      setAchievementsError(null);

      try {
        // Fetch pod-specific activities if pod is selected, otherwise fetch global activities
        const activitiesPromise = currentPod
          ? AuthService.getPodActivitiesById(
              currentPod.podId,
              { limit: 50, offset: 0 },
              token
            )
          : AuthService.getPodActivitiesById(
              "", // Empty string for global activities fallback
              { limit: 50, offset: 0 },
              token
            );

        const [activitiesResult, achievementsResult] = await Promise.allSettled(
          [activitiesPromise, AuthService.getAchievementsSummary(token)]
        );

        if (!isMounted) {
          return;
        }

        if (activitiesResult.status === "fulfilled") {
          const response = activitiesResult.value;
          if (response && "error" in response) {
            setActivitiesError(
              resolveApiMessage(
                response.message,
                "Unable to retrieve pod activities right now."
              )
            );
          } else {
            const data = response as PodActivitiesResponse;
            setActivities(Array.isArray(data.items) ? data.items : []);
          }
        } else {
          const reason = activitiesResult.reason;
          const message =
            reason instanceof ApiErrorClass
              ? resolveApiMessage(
                  reason.message,
                  "Unable to retrieve pod activities right now."
                )
              : "Unable to retrieve pod activities right now.";
          setActivitiesError(message);
        }

        if (achievementsResult.status === "fulfilled") {
          const response = achievementsResult.value;
          if (response && "error" in response) {
            setAchievementsError(
              resolveApiMessage(
                response.message,
                "Unable to retrieve achievements right now."
              )
            );
          } else {
            setAchievementsSummary(response as AchievementsSummary);
          }
        } else {
          const reason = achievementsResult.reason;
          const message =
            reason instanceof ApiErrorClass
              ? resolveApiMessage(
                  reason.message,
                  "Unable to retrieve achievements right now."
                )
              : "Unable to retrieve achievements right now.";
          setAchievementsError(message);
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof ApiErrorClass) {
          const fallback = "Unable to retrieve dashboard data right now.";
          const message = resolveApiMessage(error.message, fallback);
          setActivitiesError(message);
          setAchievementsError(message);
        } else if (error instanceof Error) {
          setActivitiesError(error.message);
          setAchievementsError(error.message);
        } else {
          const fallback = "Unable to retrieve dashboard data right now.";
          setActivitiesError(fallback);
          setAchievementsError(fallback);
        }
      } finally {
        if (isMounted) {
          setActivitiesLoading(false);
          setAchievementsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentPod]); // Refetch when current pod changes

  const visibleActivities = useMemo(
    () => activities.slice(0, MAX_VISIBLE_ACTIVITIES),
    [activities]
  );

  const remainingActivities = useMemo(
    () => activities.slice(MAX_VISIBLE_ACTIVITIES),
    [activities]
  );

  return (
    <>
      <Layout
        title={`Welcome, ${user?.lastLoginAt && "back"} ${
          user?.firstName ? ", " + user.firstName : ""
        } 👏🏻`}
        breadcrumbs={DASHBOARD_BREADCRUMBS.OVERVIEW}
        head={<Navigation />}
      >
        <div className={styles.row}>
          <div className={styles.col}>
            <PodInfo />
            <PodActivityCard
              activities={visibleActivities}
              loading={activitiesLoading}
              error={activitiesError}
              hasMore={remainingActivities.length > 0}
              onSeeMore={() => setActivitiesModalVisible(true)}
            />
          </div>
          <div className={styles.col}>
            <BalanceInfo />
            <CycleDuration />
            <PodGoals />
          </div>
          <div className={styles.col}>
            <PodMembers />
            <Achievements
              summary={achievementsSummary}
              loading={achievementsLoading}
              error={achievementsError}
            />
          </div>
        </div>
      </Layout>

      <Modal
        visible={activitiesModalVisible}
        onClose={() => setActivitiesModalVisible(false)}
        position={{ vertical: "center", horizontal: "center" }}
      >
        <div className="bg-white rounded-2xl p-4 md:p-6 max-w-4xl w-full mx-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              All Pod Activities ({activities.length})
            </h3>
            <button
              type="button"
              onClick={() => setActivitiesModalVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {remainingActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Showing all activities. No additional items.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {activities.map((activity) => (
                <ActivityDetailCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;

// Helper Components
function PodActivityCard({
  activities,
  loading,
  error,
  hasMore,
  onSeeMore,
}: {
  activities: PodActivityItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onSeeMore: () => void;
}) {
  const { emailVerified } = useDashboard();
  const isLocked = !emailVerified;

  return (
    <div className="relative">
      <Card
        title="Pod Activity"
        tooltip="Recent pod activity and member interactions"
        className={`relative ${
          isLocked
            ? "[&>div:not(:first-child)]:blur-sm [&>div:not(:first-child)]:select-none [&>div:not(:first-child)]:pointer-events-none"
            : ""
        }`}
      >
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-100 p-4 space-y-3"
              >
                <SkeletonLine className="w-36 h-4" />
                <SkeletonLine className="w-48" />
                <SkeletonBlock className="h-2 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : activities.length === 0 ? (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-text-400 font-medium">No pod activity yet</p>
            <p className="text-text-500 text-sm mt-1">
              Activity will appear here as members interact with the pod
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            {hasMore && (
              <button
                onClick={onSeeMore}
                className="w-full mt-4 px-4 py-3 text-sm font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>See all activities</span>
                <svg
                  className="w-4 h-4"
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
              </button>
            )}
          </div>
        )}
      </Card>
      <LockedOverlay />
    </div>
  );
}

function ActivityCard({ activity }: { activity: PodActivityItem }) {
  const details = getActivityDetails(activity);

  return (
    <div className="group relative p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200">
      {/* Activity Icon */}
      <div className="flex items-start gap-3">
        {/* <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${details.iconBg}`}
        >
          {details.icon}
        </div> */}
        <ActivityActorAvatar activity={activity} size="md" />

        <div className="flex-1 min-w-0">
          {/* Main Content */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {details.title}
              </p>
              {activity.type === "member_joined" ? (
                <div className="flex items-center gap-2 mt-0.5">
                  {/* <ActivityActorAvatar activity={activity} size="sm" /> */}
                  <p className="text-xs text-gray-600">{details.description}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-600 mt-0.5">
                  {details.description}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${details.badgeBg} ${details.badgeText}`}
            >
              {details.badge}
            </span>
          </div>

          {/* Metadata */}
          {details.metadata && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-3 text-xs">
                {details.metadata.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-gray-500">{item.label}:</span>
                    <span className="font-medium text-gray-700">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatActivityTime(activity.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailCard({ activity }: { activity: PodActivityItem }) {
  const details = getActivityDetails(activity);

  return (
    <div className="p-4 md:p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${details.iconBg}`}
        >
          {details.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {details.title}
              </h4>
              {activity.type === "member_joined" ? (
                <div className="flex items-center gap-3 mt-1">
                  <ActivityActorAvatar activity={activity} size="md" />
                  <p className="text-sm text-gray-600">{details.description}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">{details.description}</p>
              )}
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${details.badgeBg} ${details.badgeText}`}
            >
              {details.badge}
            </span>
          </div>

          {details.metadata && details.metadata.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.metadata.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {item.label}:
                    </span>
                    <span className="text-xs font-medium text-gray-800 break-all">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatActivityTimeFull(activity.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityActorAvatar({
  activity,
  size = "sm",
}: {
  activity: PodActivityItem;
  size?: "sm" | "md";
}) {
  const avatarId =
    typeof activity.actor?.avatarUrl === "string"
      ? activity.actor?.avatarUrl
      : null;
  const avatarUrl = avatarId ? getAvatarUrl(avatarId) : null;

  const dimensions = size === "md" ? "w-10 h-10" : "w-8 h-8";
  const iconSize = size === "md" ? "w-5 h-5" : "w-4 h-4";
  const imageSize = size === "md" ? "40px" : "32px";

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${dimensions}`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Activity actor avatar"
          fill
          sizes={imageSize}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <UserIcon className={`${iconSize} text-gray-400`} />
      )}
    </div>
  );
}

// Helper Functions
function getActivityDetails(activity: PodActivityItem) {
  const actorName = formatActivityActor(activity);
  const type = activity.type;
  const metadata = activity.metadata;

  switch (type) {
    case "pod_created":
      return {
        title: "Pod Created",
        description: `${actorName} created this pod`,
        badge: "Created",
        badgeBg: "bg-green-100",
        badgeText: "text-green-700",
        iconBg: "bg-green-100",
        icon: (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        ),
        metadata: [
          { label: "Amount", value: `$${metadata?.amount || "N/A"}` },
          { label: "Cadence", value: String(metadata?.cadence || "N/A") },
          {
            label: "Expected Members",
            value: String(metadata?.expectedMemberCount || "N/A"),
          },
        ],
      };

    case "member_joined": {
      const goalType =
        typeof metadata?.goalType === "string"
          ? (metadata.goalType as string)
          : undefined;

      return {
        title: "Member Joined",
        description: `${actorName} joined the pod`,
        badge: "Joined",
        badgeBg: "bg-orange-100",
        badgeText: "text-orange-700",
        iconBg: "bg-orange-100",
        icon: <UserIcon className="h-5 w-5 text-orange-400" />,
      };
    }

    case "invite_sent":
      const inviteeEmail = String(metadata?.email || "Unknown");
      return {
        title: "Invite Sent",
        description: `${actorName} invited ${inviteeEmail}`,
        badge: "Invited",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-700",
        iconBg: "bg-purple-100",
        icon: (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
        metadata: [
          { label: "Invitee", value: inviteeEmail },
          { label: "Position", value: String(metadata?.inviteOrder || "N/A") },
        ],
      };

    case "contribution_made":
      return {
        title: "Contribution Made",
        description: `${actorName} made a contribution`,
        badge: "Contributed",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-700",
        iconBg: "bg-emerald-100",
        icon: (
          <svg
            className="w-5 h-5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        metadata: metadata
          ? Object.entries(metadata).map(([key, value]) => ({
              label: key.replace(/_/g, " "),
              value: String(value),
            }))
          : undefined,
      };

    case "payout_received":
      return {
        title: "Payout Received",
        description: `${actorName} received a payout`,
        badge: "Payout",
        badgeBg: "bg-yellow-100",
        badgeText: "text-yellow-700",
        iconBg: "bg-yellow-100",
        icon: (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        metadata: metadata
          ? Object.entries(metadata).map(([key, value]) => ({
              label: key.replace(/_/g, " "),
              value: String(value),
            }))
          : undefined,
      };

    default:
      return {
        title: formatActivityType(type),
        description: `${actorName} performed an action`,
        badge: formatActivityType(type),
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-700",
        iconBg: "bg-gray-100",
        icon: (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        metadata: metadata
          ? Object.entries(metadata).map(([key, value]) => ({
              label: key.replace(/_/g, " "),
              value: String(value),
            }))
          : undefined,
      };
  }
}

const capitalize = (value: string): string =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const formatActivityType = (type: string): string =>
  capitalize(type.replace(/_/g, " "));

const formatGoalType = (goalType: string): string =>
  capitalize(goalType.replace(/_/g, " "));

const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatActivityTimeFull = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const DEFAULT_ACTIVITY_ACTOR = "USER00000";

const formatActivityActor = (activity: PodActivityItem): string => {
  const accountId =
    activity.actor && typeof activity.actor.accountId === "string"
      ? activity.actor.accountId
      : null;

  if (!accountId) {
    return DEFAULT_ACTIVITY_ACTOR;
  }

  const numericSegment = accountId.replace(/\D/g, "").slice(0, 5);
  if (numericSegment) {
    return `USER${numericSegment}`;
  }

  const sanitized = accountId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5);
  if (sanitized) {
    return `USER${sanitized.toUpperCase()}`;
  }

  return DEFAULT_ACTIVITY_ACTOR;
};
