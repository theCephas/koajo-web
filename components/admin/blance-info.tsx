"use client";

import cn from "clsx";
import Tooltip from "@/components2/usefull/Tooltip";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";

export default function BalanceInfo({ inforType = "contribution-and-payout" }: { inforType?: "contribution" | "payout" | "contribution-and-payout" }) {
  const { emailVerified } = useDashboard();
  const isLocked = !emailVerified;

  return (
    <div className="relative">
      <div className={cn("mt-6 p-6 bg-white rounded-2xl")}>
        <div className="flex items-center justify-between gap-4">
          { inforType !== "payout" && <div className="flex flex-col gap-4">
            <div className="flex items-center text-md font-semibold">
              <span>Total Contribution</span>
              <Tooltip content="Total amount you contributed into this pod since joining it" />
            </div>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-base text-text-500 font-medium">
              {/* Your payout date is{" "}
              <span className="text-tertiary-100">Jun 30th, 2025</span> */}
              No payout date yet
            </p>
          </div>
          }
          {inforType === "contribution-and-payout" && (
            <div className="w-px self-stretch bg-gray-200" />
          )}

          { inforType !== "contribution" && <div className="flex flex-col gap-4">
            <div className="flex items-center text-md font-semibold">
              <span>Total Payout</span>
              <Tooltip content="Total amount you will receive from this pod" />
            </div>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-base text-text-500 font-medium">
              Payment less 2.5% transaction fee
            </p>
          </div>
          }
        </div>
      </div>
       <LockedOverlay />
    </div>
  );
}
