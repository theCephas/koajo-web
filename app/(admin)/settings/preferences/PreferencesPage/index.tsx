"use client";
import { FormEvent, useMemo, useState } from "react";
import cn from "clsx";
import styles from "./PreferencesPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Settings from "@/components2/Settings";
import Toggle from "@/components2/Toggle";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/menory-manager";
import { ApiError } from "@/lib/types/api";
import { ApiErrorClass } from "@/lib/utils/auth";

const breadcrumbs = [
  {
    title: "Settings",
    url: "/settings",
  },
  {
    title: "Preferences",
  },
];

type StatusState = {
  type: "success" | "error";
  message: string;
} | null;

type StoredPreferences = {
  emailNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
};

const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? first.trim() : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return fallback;
};

const getStoredPreferences = (): StoredPreferences => {
  const stored = TokenManager.getUserData();
  const legacyPreferences = (stored as {
    notificationPreferences?: {
      emailNotificationsEnabled?: boolean;
      transactionNotificationsEnabled?: boolean;
    };
  } | null)?.notificationPreferences;

  const emailEnabled =
    typeof stored?.emailNotificationsEnabled === "boolean"
      ? stored.emailNotificationsEnabled
      : legacyPreferences?.emailNotificationsEnabled;

  const transactionEnabled =
    typeof stored?.transactionNotificationsEnabled === "boolean"
      ? stored.transactionNotificationsEnabled
      : legacyPreferences?.transactionNotificationsEnabled;

  return {
    emailNotificationsEnabled:
      typeof emailEnabled === "boolean" ? emailEnabled : true,
    transactionNotificationsEnabled:
      typeof transactionEnabled === "boolean" ? transactionEnabled : true,
  };
};

const PreferencesPage = () => {
  const [initialPreferences, setInitialPreferences] =
    useState<StoredPreferences>(getStoredPreferences);
  const [transactions, setTransactions] = useState<boolean>(
    initialPreferences.transactionNotificationsEnabled
  );
  const [emailNotification, setEmailNotification] = useState<boolean>(
    initialPreferences.emailNotificationsEnabled
  );
  const [status, setStatus] = useState<StatusState>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const notifications = useMemo(
    () => [
      {
        title: "Transactions",
        content: "tell me about the information after making the transaction",
        value: transactions,
        onToggle: () => {
          setStatus(null);
          setTransactions((prev) => !prev);
        },
      },
      {
        title: "Email Notification",
        content: "notify me of all notifications via email",
        value: emailNotification,
        onToggle: () => {
          setStatus(null);
          setEmailNotification((prev) => !prev);
        },
      },
    ],
    [emailNotification, transactions]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus(null);

    const token = TokenManager.getToken();

    if (!token) {
      setStatus({
        type: "error",
        message: "You need to be logged in to update preferences.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AuthService.updateNotificationPreferences(
        {
          emailNotificationsEnabled: emailNotification,
          transactionNotificationsEnabled: transactions,
        },
        token
      );

      if (response && "error" in response) {
        const apiResponse = response as ApiError;
        setStatus({
          type: "error",
          message: resolveApiMessage(
            apiResponse.message,
            "Unable to update preferences. Please try again."
          ),
        });
        return;
      }

      setTransactions(response.transactionNotificationsEnabled);
      setEmailNotification(response.emailNotificationsEnabled);
      setInitialPreferences({
        emailNotificationsEnabled: response.emailNotificationsEnabled,
        transactionNotificationsEnabled:
          response.transactionNotificationsEnabled,
      });
      TokenManager.updateUserData({
        emailNotificationsEnabled: response.emailNotificationsEnabled,
        transactionNotificationsEnabled:
          response.transactionNotificationsEnabled,
      });
      setStatus({
        type: "success",
        message: "Preferences updated successfully.",
      });
    } catch (error) {
      const fallback = "Unable to update preferences right now. Please try again.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setStatus({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTransactions(initialPreferences.transactionNotificationsEnabled);
    setEmailNotification(initialPreferences.emailNotificationsEnabled);
    setStatus(null);
  };

  return (
    <Layout title="Settings" breadcrumbs={breadcrumbs}>
      <Settings title="Preferences" tooltip="Update preferences">
        <form onSubmit={handleSubmit}>
          <div className={styles.notifications}>
            <div className={styles.label}>Notification</div>
            <div className={styles.list}>
              {notifications.map((notification, index) => (
                <div className={styles.notification} key={index}>
                  <div className={styles.box}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.content}>{notification.content}</div>
                  </div>
                  <Toggle
                    className={styles.toggle}
                    value={notification.value}
                    onChange={notification.onToggle}
                  />
                </div>
              ))}
            </div>
          </div>
          {status && (
            <div
              className={cn(styles.status, {
                [styles.statusSuccess]: status.type === "success",
                [styles.statusError]: status.type === "error",
              })}
            >
              {status.message}
            </div>
          )}
          <div className={styles.btns}>
            <button
              type="button"
              className={cn("button-stroke", styles.button)}
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn("button", styles.button)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </Settings>
    </Layout>
  );
};

export default PreferencesPage;
