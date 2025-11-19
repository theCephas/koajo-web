import cn from "clsx";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import styles from "./Notification.module.sass";
import type { NotificationItem } from "@/lib/types/api";

const severityConfig: Record<
  NotificationItem["severity"],
  { icon: any; className: string }
> = {
  info: {
    icon: <Info size={18} />,
    className: "icon--info",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    className: "icon--success",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    className: "icon--warning",
  },
  error: {
    icon: <XCircle size={18} />,
    className: "icon--error",
  },
  critical: {
    icon: <ShieldAlert size={18} />,
    className: "icon--critical",
  },
};

const formatTimestamp = (timestamp?: string | null): string => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

type NotificationProps = {
  item: NotificationItem;
  onMarkRead?: (notificationId: string) => void;
  isMarking?: boolean;
};

const Notification = ({ item, onMarkRead, isMarking }: NotificationProps) => {
  const severity = severityConfig[item.severity] ?? severityConfig.info;

  return (
    <div
      className={cn(styles.notification, " mb-4", {
        [styles.notificationUnread]: !item.readAt,
      })}
    >
      <div className={cn(styles.icon, styles[severity.className])}>
        {severity.icon}
      </div>
      <div className={styles.details}>
        <div className={styles.line}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.time}>{formatTimestamp(item.createdAt)}</div>
          {!item.readAt && <span className={styles.unreadDot} />}
        </div>
        <div className={styles.info}>{item.body}</div>
        <div className={styles.meta}>
          {item.actionUrl && (
            <a
              href={item.actionUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.actionLink}
            >
              View details
            </a>
          )}
          {!item.readAt && onMarkRead && (
            <button
              type="button"
              className={styles.markReadButton}
              onClick={() => onMarkRead(item.id)}
              disabled={isMarking}
            >
              {isMarking ? "Marking..." : "Mark as read"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
