"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import cn from "clsx";
import styles from "./Notifications.module.sass";
import Modal from "@/components2/usefull/Modal";
import Notification from "@/components2/usefull/Notification";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import type {
  NotificationItem,
  NotificationsResponse,
  NotificationReadResponse,
  NotificationReadAllResponse,
} from "@/lib/types/api";
import { resolveApiMessage, resolveApiErrorMessage } from "@/lib/utils/api-helpers";

type NotificationsModalProps = {
  visible: boolean;
  onClose: () => void;
};

const NotificationsModal = ({ visible, onClose }: NotificationsModalProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token) {
      if (isMountedRef.current) {
        setNotifications([]);
        setError("You need to sign in to view notifications.");
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.getNotifications(token);
      if (!isMountedRef.current) {
        return;
      }

      if (response && "error" in response) {
        setNotifications([]);
        setError(
          resolveApiMessage(
            response.message,
            "Unable to load notifications at the moment."
          )
        );
        return;
      }

      const data = response as NotificationsResponse;
      setNotifications(data.notifications ?? []);
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      setNotifications([]);
      setError(
        resolveApiErrorMessage(
          err,
          "Unable to load notifications at the moment."
        )
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const handleMarkRead = useCallback(
    async (notificationId: string) => {
      const token = TokenManager.getToken();
      if (!token) {
        return;
      }

      setMarkingId(notificationId);
      setError(null);

      try {
        const response = await AuthService.markNotificationRead(
          notificationId,
          token
        );

        if (!isMountedRef.current) {
          return;
        }

        if (response && "error" in response) {
          setError(
            resolveApiMessage(
              response.message,
              "Unable to update notification."
            )
          );
          return;
        }

        const data = response as NotificationReadResponse;
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === data.id
              ? { ...notification, readAt: data.readAt }
              : notification
          )
        );
      } catch (err) {
        if (!isMountedRef.current) {
          return;
        }
        setError(
          resolveApiErrorMessage(err, "Unable to update notification.")
        );
      } finally {
        if (isMountedRef.current) {
          setMarkingId(null);
        }
      }
    },
    []
  );

  const handleMarkAllRead = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token || unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    setError(null);

    try {
      const response = await AuthService.markAllNotificationsRead(token);
      if (!isMountedRef.current) {
        return;
      }

      if (response && "error" in response) {
        setError(
          resolveApiMessage(
            response.message,
            "Unable to mark all notifications as read."
          )
        );
        return;
      }

      const { readAt } = response as NotificationReadAllResponse;
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        }))
      );
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      setError(
        resolveApiErrorMessage(
          err,
          "Unable to mark all notifications as read."
        )
      );
    } finally {
      if (isMountedRef.current) {
        setMarkingAll(false);
      }
    }
  }, [unreadCount]);

  const handleRefresh = useCallback(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      containerClassName={styles.modalContainer}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>All Notifications</div>
            <div className={styles.unreadCount}>
              Unread <span>{unreadCount}</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={cn(styles.actionButton, styles.refreshButton)}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              className={styles.actionButton}
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>You're all caught up!</div>
        ) : (
          <div className={styles.modalList}>
            {notifications.map((notification) => (
              <Notification
                key={notification.id}
                item={notification}
                onMarkRead={handleMarkRead}
                isMarking={markingId === notification.id}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationsModal;
