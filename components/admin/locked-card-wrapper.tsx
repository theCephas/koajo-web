"use client";

import { ReactNode } from "react";
import Image from "next/image";
import cn from "clsx";
import { useDashboard } from "@/lib/provider-dashboard";

interface LockedCardWrapperProps {
  children: ReactNode;
  className?: string;
  showLockIcon?: boolean;
  // For pod-info: don't blur button, only blur content text
  keepButtonVisible?: boolean;
}

/**
 * Wrapper component to show a locked card with a lock icon overlay.
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - The content to wrap
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showLockIcon=true] - Whether to show the lock icon
 * @param {boolean} [props.keepButtonVisible=false] - Whether to keep the button visible
 */
const LockedCardWrapper = ({
  children,
  className,
  showLockIcon = true,
  keepButtonVisible = false,
}: LockedCardWrapperProps) => {
  const { emailVerified } = useDashboard();
  const isLocked = !emailVerified;

  if (!isLocked) {
    return <>{children}</>;
  }

  if (keepButtonVisible) {
    return (
      <div className={cn("relative", className)}>
        <div className="[&>div>div:first-child]:blur-0 [&>div>div:first-child]:select-auto [&>div>div:first-child]:pointer-events-auto [&>div>*:not(:first-child):not(:last-child)]:blur-sm [&>div>*:not(:first-child):not(:last-child)]:select-none [&>div>*:not(:first-child):not(:last-child)]:pointer-events-none [&>div>*:last-child]:blur-0 [&>div>*:last-child]:select-auto [&>div>*:last-child]:pointer-events-auto">
          {children}
        </div>

        {showLockIcon && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg pointer-events-none z-10"
            style={{ clipPath: "inset(60px 0 60px 0)" }}
          >
            <div className="flex flex-col items-center gap-2 opacity-70">
              <Image
                src="/media/icons/lock.svg"
                alt="Lock icon"
                width={44}
                height={52}
                className="size-5"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="[&>div>div:first-child]:blur-0 [&>div>div:first-child]:select-auto [&>div>div:first-child]:pointer-events-auto [&>div>*:not(:first-child)]:blur-sm [&>div>*:not(:first-child)]:select-none [&>div>*:not(:first-child)]:pointer-events-none">
        {children}
      </div>

      {showLockIcon && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg pointer-events-none z-10"
          style={{ clipPath: "inset(60px 0 0 0)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/media/icons/security.svg"
              alt="Security"
              width={44}
              height={52}
              className="w-11 h-13"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LockedCardWrapper;

