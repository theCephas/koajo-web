"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import cn from "clsx";
import TokenManager from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import type { User } from "@/lib/types/api";
import ProfileAddIcon from "@/public/media/icons/profile-add.svg";
import WalletMinusIcon from "@/public/media/icons/wallet-minus.svg";
import VerifiedIcon from "@/public/media/icons/verified.svg";
import BankIcon from "@/public/media/icons/bank.svg";

type StepStatus = "complete" | "active" | "upcoming";

interface Step {
  id: "account" | "kyc" | "email" | "complete";
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const STEPS: Step[] = [
  {
    id: "account",
    label: "Create Account",
    description: "Create your account or log in to start.",
    href: "/register",
    Icon: ProfileAddIcon,
  },
  {
    id: "kyc",
    label: "Identification",
    description: "Complete identity verification to continue.",
    href: "/register/kyc",
    Icon: WalletMinusIcon,
  },
  {
    id: "email",
    label: "Verify Email",
    description: "Confirm the link from your inbox.",
    href: "/register/verify-email",
    Icon: VerifiedIcon,
  },
];

const STEP_STATUS_COPY: Record<
  StepStatus,
  { badge: string; text: string; pulse?: string }
> = {
  complete: {
    badge: "bg-white/90 text-green-700",
    text: "text-white",
  },
  active: {
    badge: "bg-white/20 text-white",
    text: "text-white",
    pulse:
      "after:absolute after:inset-0 after:rounded-xl after:border after:border-white/40 after:animate-ping after:-z-10",
  },
  upcoming: {
    badge: "bg-white/10 text-white/70",
    text: "text-white/50",
  },
};

interface ProgressState {
  account: boolean;
  kyc: boolean;
  email: boolean;
  bank: boolean;
}

const isIdentityComplete = (status: User["identityVerification"]) =>
  Boolean(
    status && status.status === "verified" && status.type === "id_number"
  );

const deriveProgressFromUser = (user: User | null): ProgressState => ({
  account: Boolean(user),
  kyc: Boolean(user && isIdentityComplete(user.identityVerification)),
  email: Boolean(user?.emailVerified),
  bank: Boolean(user?.bankAccount?.id),
});

const determineNextStepIndex = (progress: ProgressState): number => {
  if (!progress.account) return 0;
  if (!progress.kyc) return 1;
  if (!progress.email) return 2;
  return 3;
};

export default function RegistrationSteps() {
  const pathname = usePathname() || "/register";
  const [user, setUser] = useState<User | null>(() => {
    try {
      return TokenManager.getUserData() as User | null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = TokenManager.getToken();
    if (!token) return;

    let cancelled = false;

    const hydrateProfile = async () => {
      try {
        const response = await AuthService.getMe(token);
        if (cancelled || !response) {
          return;
        }

        if ("error" in response) {
          console.warn(
            "Unable to fetch user profile for registration steps:",
            response.message
          );
          return;
        }

        const profile = response as User;
        TokenManager.setUser(profile);
        if (!cancelled) {
          setUser(profile);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to refresh registration steps:", error);
        }
      }
    };

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useMemo(() => deriveProgressFromUser(user), [user]);

  const derivedActiveIndex = useMemo(
    () => determineNextStepIndex(progress),
    [progress]
  );

  const routeIndex = useMemo(() => {
    const index = STEPS.findIndex(
      (step) => pathname === step.href || pathname.startsWith(`${step.href}/`)
    );
    return index === -1 ? 0 : index;
  }, [pathname]);

  const activeIndex = user ? derivedActiveIndex : routeIndex;

  const statuses: StepStatus[] = useMemo(() => {
    return STEPS.map((step, index) => {
      const isComplete =
        step.id === "account"
          ? progress.account
          : step.id === "kyc"
          ? progress.kyc
          : step.id === "email"
          ? progress.email
          : progress.bank;

      if (isComplete || index < activeIndex) return "complete";
      if (index === activeIndex) return "active";
      return "upcoming";
    });
  }, [activeIndex, progress]);

  const progressPercent = useMemo(() => {
    if (STEPS.length <= 1) return 0;

    const segments = STEPS.length - 1;
    let filledSegments = 0;

    for (let i = 0; i < segments; i++) {
      const current = statuses[i];
      const next = statuses[i + 1];

      if (current === "complete" && next === "complete") {
        filledSegments += 1;
        continue;
      }

      if (current === "complete" && next === "active") {
        filledSegments += 0.7;
        continue;
      }

      if (current === "active") {
        filledSegments += 0.3;
      }
    }

    return Math.min(100, (filledSegments / segments) * 100);
  }, [statuses]);

  return (
    <div className="relative w-full">
      {/* Desktop: Vertical layout with connector line */}
      <div className="hidden lg:block absolute left-6 top-12 bottom-12 w-px bg-white/15">
        <div
          className="w-full origin-top bg-linear-to-b from-white to-tertiary-100 transition-all duration-500 ease-out"
          style={{ height: `${progressPercent}%` }}
        />
      </div>

      {/* Desktop: Vertical steps */}
      <ul className="hidden lg:block space-y-8">
        {STEPS.map((step, index) => {
          const status = statuses[index];
          const Icon = step.Icon;
          const statusCopy = STEP_STATUS_COPY[status];

          const isComplete = status === "complete";
          return (
            <li key={step.id} className="relative flex items-start gap-4">
              <div className="relative">
                <div
                  className={cn(
                    " rounded-[8px] h-[40px] w-[40px] border flex items-center justify-center transition-colors duration-300",
                    status === "complete"
                      ? "border-white bg-white/10"
                      : status === "active"
                      ? "border-white text-white bg-white/10"
                      : "border-white/30 text-white/40"
                  )}
                >
                  <Icon />
                </div>
                {status === "active" && (
                  <span className="absolute inset-0 rounded-xl border border-white/30 animate-pulse" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-base font-semibold flex items-center gap-1",
                      statusCopy.text,
                      isComplete && "line-through text-white/60"
                    )}
                  >
                    {isComplete && (
                      <span className="text-green-400 text-sm leading-none">
                        ✓
                      </span>
                    )}
                    {step.label}
                  </span>
                </div>
                <p
                  className={cn("text-[13px] leading-relaxed", statusCopy.text)}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Mobile: Horizontal layout with connector line */}
      <div className="lg:hidden">
        <div className="relative flex items-center justify-center pb-4">
          {STEPS.map((step, index) => {
            const status = statuses[index];
            const Icon = step.Icon;
            const isComplete = status === "complete";
            const isActive = status === "active";

            return (
              <div key={step.id} className="flex items-center">
                <div className="relative">
                  <div
                    className={cn(
                      "h-[40px] w-[40px] rounded-[8px] border flex items-center justify-center transition-colors duration-300",
                      status === "complete"
                        ? "border-white bg-white/10"
                        : status === "active"
                        ? "border-white text-white bg-white/10"
                        : "border-white/30 text-white/40"
                    )}
                  >
                    <Icon className="size4" />
                  </div>
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl border border-white/30 animate-pulse" />
                  )}
                </div>

                {/* Connector line between icons */}
                {index < STEPS.length - 1 && (
                  <div className="w-16 h-px bg-white/15 relative">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out",
                        isComplete
                          ? "w-full bg-linear-to-r from-white to-tertiary-100"
                          : isActive
                          ? "w-1/2 bg-linear-to-r from-white to-tertiary-100"
                          : "w-0 bg-transparent"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
