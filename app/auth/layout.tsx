import Image from "next/image";
import { ReactNode } from "react";
import KoajoLogoLarge from "@/public/media/icons/logo-gradient-small.svg";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5] overflow-hidden">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Panel - Hero Section */}
        <div className="relative z-0 flex w-full min-h-[280px] flex-col items-center justify-start pt-12 pb-28 md:justify-center overflow-hidden bg-linear-to-b from-[#134446] to-[#010E0F] lg:m-2 lg:rounded-[16px] px-8 text-white lg:w-[40%] lg:py-20">
          {/* Grid Background Effect */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="h-[70vh] w-full"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative mt-0 lg:mt-40 z-10 flex flex-col items-center justify-center space-y-6 lg:space-y-8">
            <KoajoLogoLarge className="h-auto w-40" />
            <h1 className="text-center hidden lg:flex leading-7 text-white/40 sm:leading-relaxed text-[28px] lg:leading-[1.3] max-w-md font-medium">
              One Dashboard To Start, Track And Grow Your Savings.
            </h1>
            <h1 className="text-center lg:hidden flex leading-7 text-white/40 sm:leading-relaxed text-base lg:leading-[1.3] max-w-md font-medium">
              One Dashboard To Start, Track And Grow Your Savings.
            </h1>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="-mt-28 flex w-full flex-col items-center justify-between bg-[#F5F5F5] px-3 py-8 sm:-mt-16 lg:mt-0 lg:w-1/2 lg:px-12 lg:py-12">
          <div className="w-full max-w-[480px] flex flex-col flex-1 justify-between gap-6">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center py-6">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 lg:pt-8 text-center text-xs lg:text-sm text-text-400">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>© Koajo. All rights reserved.</span>
                <span className="hidden sm:inline">|</span>
                <span className="text-tertiary-100 hover:underline cursor-pointer">
                  Term & Condition
                </span>
                <span>|</span>
                <span className="text-tertiary-100 hover:underline cursor-pointer">
                  Privacy & Policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
