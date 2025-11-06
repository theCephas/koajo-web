"use client";

import cn from "clsx";
import Card from "@/components2/usefull/Card";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";

export default function CycleDuration() {
  const { emailVerified } = useDashboard();
  const isLocked = !emailVerified;

  return (
    <div className="relative">
      <Card
        title="Cycle Duration"
        tooltip="The days left in the current cycle"
        className={cn(
          isLocked &&
            "[&>div:not(:first-child)]:blur-sm [&>div:not(:first-child)]:select-none [&>div:not(:first-child)]:pointer-events-none"
        )}
      >
        <div className="text-2xl font-bold mt-4">
          {/* 36 days remaining */}
          No cycle duration yet
        </div>
        <p className="text-base text-text-500 font-medium mt-4">
          {/* Expense increased by <span className="text-primary">$1000 </span>
          this month. */}
          No expense yet
        </p>
      </Card>
      {isLocked && <LockedOverlay />}
    </div>
  );
}
