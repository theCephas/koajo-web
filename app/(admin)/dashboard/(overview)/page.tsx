"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./DashboardV2Page.module.sass";
import Layout from "@/components2/usefull/Layout";
import Navigation from "@/components2/usefull/Navigation";
import PodInfo from "@/components/admin/pod-info";
import PodGoals from "@/components/admin/pod-goals";
import PodMembers from "@/components/admin/pod-members";
import Achievements from "@/components/admin/achievements";
import RecentActivity, {
  type RecentActivityItem,
} from "@/components2/usefull/RecentActivity";
import BalanceInfo from "@/components/admin/blance-info";
import CycleDuration from "@/components/admin/cycle-duration";
import Modal from "@/components/utils/modal";
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

const MAX_VISIBLE_ACTIVITIES = 6;

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

  const activityCards: RecentActivityItem[] = useMemo(
    () =>
      activities.map((item) => ({
        id: item.id,
        title: formatActivityActor(item),
        price: formatActivityType(item.type),
        description: "",
        time: formatActivityTime(item.createdAt),
        image: "",
      })),
    [activities]
  );

  const remainingActivities = useMemo(
    () => activities.slice(MAX_VISIBLE_ACTIVITIES),
    [activities]
  );

  const activityFooter =
    !activitiesLoading && remainingActivities.length > 0 && !activitiesError ? (
      <button
        type="button"
        className="button-stroke"
        onClick={() => setActivitiesModalVisible(true)}
      >
        See more
      </button>
    ) : null;

  const activityPlaceholder = activitiesLoading
    ? "Loading recent activity…"
    : activitiesError || "No activity yet.";

  return (
    <>
      <Layout
        title={`Welcome ${user?.lastLoginAt && "back"} ${
          user?.firstName ? ", " + user.firstName : ""
        } 👏🏻`}
        breadcrumbs={DASHBOARD_BREADCRUMBS.OVERVIEW}
        head={<Navigation />}
      >
        <div className={styles.row}>
          <div className={styles.col}>
            <PodInfo />
            <RecentActivity
              viewItems={MAX_VISIBLE_ACTIVITIES}
              items={activityCards}
              footer={activityFooter}
              emptyPlaceholder={activityPlaceholder}
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
        <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Pod Activity
            </h3>
            <button
              type="button"
              onClick={() => setActivitiesModalVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {remainingActivities.length === 0 ? (
            <div className="text-sm text-gray-500">No additional activity.</div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {remainingActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-gray-100 rounded-lg p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatActivityType(activity.type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatActivityActor(activity)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatActivityTime(activity.createdAt)}
                    </div>
                  </div>
                  {hasMetadata(activity.metadata) && (
                    <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600 overflow-x-auto">
                      <pre className="whitespace-pre-wrap wrap-break-word">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;

const capitalize = (value: string): string =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const formatActivityType = (type: string): string =>
  capitalize(type.replace(/_/g, " "));

const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatActivityActor = (activity: PodActivityItem): string => {
  if (!activity.actor) {
    return "Unknown actor";
  }

  const names = [activity.actor.firstName, activity.actor.lastName].filter(
    Boolean
  );
  if (names.length > 0) {
    return names.join(" ");
  }

  if (activity.actor.email && typeof activity.actor.email === "string") {
    return activity.actor.email;
  }

  return "Unknown actor";
};

const hasMetadata = (metadata?: Record<string, unknown> | null): boolean =>
  !!metadata && Object.keys(metadata).length > 0;
