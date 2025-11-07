"use client";

import Image from "next/image";
import { useDashboard } from "@/lib/provider-dashboard";
import cn from "clsx"

const LockedOverlay = ({className} : {className?: string}) => {
  const { emailVerified, kycCompleted } = useDashboard();
  const isLocked = !emailVerified;
  const isBlured = !emailVerified || !kycCompleted;

  return isBlured && (
    <div
      className={cn("absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg pointer-events-none z-10", className)}
      style={{ clipPath:  "inset(55px 0 0 0)"  }}
    >
      {isLocked && <div className={cn("flex flex-col items-center gap-2 opacity-70 relative top-4")}>
        <Image
          src="/media/icons/lock.svg"
          alt="Security"
          width={44}
          height={52}
          className="size-5"
        />
      </div>}
    </div>
  );
};

export default LockedOverlay;

