"use client";

import cn from "clsx";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "positive" | "negative" | "neutral";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
        {
          "text-green-500 border-green-500 bg-transparent":
            variant === "positive",
          "text-orange-300 border-orange-300 bg-transparent":
            variant === "negative",
          "text-gray-600 border-gray-300 bg-transparent": variant === "neutral",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
