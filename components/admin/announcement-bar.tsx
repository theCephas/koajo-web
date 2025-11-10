"use client";

import { useState } from "react";
import cn from "clsx";

export type AnnouncementType = "warning" | "success" | "alert";

interface AnnouncementBarProps {
  type: AnnouncementType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const AnnouncementBar = ({
  type,
  message,
  onClose,
  className,
}: AnnouncementBarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const styles = {
    warning: {
      bg: "bg-yellow-50/50 border-yellow-200",
      text: "text-yellow-800",
      icon: "i",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    success: {
      bg: "bg-green-50/50 border-green-200",
      text: "text-green-800",
      icon: "✓",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    alert: {
      bg: "bg-red-50/50 border-red-200",
      text: "text-red-800",
      icon: "⚠",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  };

  const style = styles[type] || styles.warning;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        style.bg,
        style.text,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0",
          style.iconBg,
          style.iconColor
        )}
      >
        <span className="text-sm font-bold">{style.icon}</span>
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors",
            style.text
          )}
          aria-label="Close announcement"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;

