import Image from "next/image";
import { ReactNode } from "react";
import LogoGradientSmallIcon from "@/public/media/icons/logo-gradient-small.svg";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh w-full bg-gray overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-25%] h-[60%] bg-[radial-gradient(circle_at_top,rgba(70,157,163,0.35),transparent_65%)] blur-3xl"
        aria-hidden
      />

      <div className="page_auth_container relative z-10 flex min-h-dvh flex-col gap-8 py-8 lg:flex-row lg:items-stretch">
        <div className="relative isolate flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#469DA3_0%,#1C2634_100%)] px-6 py-8 text-white shadow-2xl lg:w-[45%]">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/media/images/background-grid-light.svg"
              alt="Background Grid"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-10 flex flex-col gap-6 text-center lg:text-left">
            <LogoGradientSmallIcon className="mx-auto h-8 w-auto lg:mx-0" />
            <p className="text-xl font-semibold text-white/90 sm:text-2xl">
              One dashboard to start, track, and grow your savings.
            </p>
            <p className="text-sm text-white/70">
              Access Koajo anywhere, on any device, with bank-grade security.
            </p>
          </div>
          <div className="relative z-10 mt-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/60 lg:text-left">
            Trusted by smart savers.
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center pb-6">
          <div className="w-full max-w-[480px]">{children}</div>
          <div className="mt-8 text-center text-sm text-text-400">
            © Koajo. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
