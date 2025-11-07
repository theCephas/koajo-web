"use client";

import { useMemo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import cn from "clsx";
import ProfileAddIcon from "@/public/media/icons/profile-add.svg";
import WalletMinusIcon from "@/public/media/icons/wallet-minus.svg";
import VerifiedIcon from "@/public/media/icons/verified.svg";
import BankIcon from "@/public/media/icons/bank.svg";

interface Step {
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * Vertical registration steps with animated progress indicator.
 * It infers the active step from the current pathname.
 */
export default function RegistrationSteps() {
  const pathname = usePathname() || "/register";
  const [activeIndex, setActiveIndex] = useState(0);
  // Define the ordered steps and their expected paths
  const steps: Step[] = useMemo(
    () => [
      {
        label: "Create Account",
        description: "Create your account or log in to start.",
        href: "/register",
        Icon: ProfileAddIcon,
      },
      
      {
        label: "KYC",
        description: "Verify your identity to Continue with Koajo",
        href: "/register/kyc",
        Icon: WalletMinusIcon,
      },
      {
        label: "Verify Email",
        description: "Verify your email with the code sent to your inbox.",
        href: "/register/verify-email",
        Icon: VerifiedIcon,
      },
      {
        label: "Complete",
        description: "Add your account to Continue",
        href: "/register/complete",
        Icon: BankIcon,
      },
    ],
    []
  );

  useEffect(() => {
    console.log("current pathname", pathname);
    setActiveIndex(steps.findIndex(s => pathname === s.href || pathname.startsWith(`${s.href}/`)));
  }, [pathname]);

  // Find active index by matching the beginning of the pathname
  const activeIndexMemo = useMemo(() => {
    const index = steps.findIndex(
      (s) => pathname === s.href || pathname.startsWith(`${s.href}/`)
    );
    return index === -1 ? 0 : index;
  }, [pathname, steps]);

  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <ul className="w-full max-w-[calc(364rem/16)]">
      {steps.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <li
            key={step.href}
            className="relative flex items-center gap-4 py-6"
          >
            {/* Step marker */}
            <div className="relative">
              <div
                className={cn(
                  "p-2 border rounded-lg size-10 flex items-center justify-center",
                  isCompleted || isActive
                    ? "border-white/70"
                    : "border-green-700"
                )}
              >
                <step.Icon className="size-6" />
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-10 w-[1px] h-14 bg-green-700">
                  <div
                    className={cn(
                      "w-full h-0 transition-all duration-300 ease-in-out",
                      isActive
                        ? "bg-white/70 h-1/2"
                        : isCompleted
                        ? "bg-white/70 h-full"
                        : "bg-transparent h-0"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="flex flex-col gap-1 items-start">
              <div
                className={cn(
                  "text-base font-semibold",
                  isActive ? "text-white" : "text-white/50"
                )}
              >
                {step.label}
              </div>
              <p
                className={cn(
                  "text-xs",
                  isActive ? "text-white/80" : "text-white/50"
                )}
              >
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
