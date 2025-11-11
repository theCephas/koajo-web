"use client";

import cn from "clsx";
import Card from "@/components2/usefull/Card";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";
import { SkeletonLine } from "@/components/admin/dashboard-skeletons";

export default function CycleDuration() {
  const { emailVerified, podsLoading } = useDashboard();
  const isLocked = !emailVerified;
  const isLoading = podsLoading;

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
        {isLoading ? (
          <div className="mt-4 space-y-3">
            <SkeletonLine className="h-6 w-32" />
            <SkeletonLine className="w-24" />
          </div>
        ) : (
          <div className="text-2xl font-bold mt-4">
            {/* 36 days remaining */}
            No cycle yet
          </div>
        )}
      </Card>
     <LockedOverlay />
    </div>
  );
}
