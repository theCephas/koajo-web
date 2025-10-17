import Image from "next/image";
import { ReactNode } from "react";
import LogoGradientSmallIcon from "@/public/media/icons/logo-gradient-small.svg";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-gray w-full h-screen min-h-[calc(700rem/16)]">
      {/* Background */}
      <div className="absolute inset-0 flex flex-row-reverse gap-10 h-full p-page-auth-offset-horizontal">
        {/* Left Column - Marketing Content */}
        <div className="flex-1 flex flex-col relative" />

        {/* Right Column - Dashboard Preview with Carousel */}
        <div className="flex justify-center flex-1 rounded-2xl relative overflow-hidden ">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-[image:linear-gradient(180deg,#469DA3_0%,#1C2634_100%)]" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 size-full flex items-center justify-center">
            <Image
              src="/media/images/background-grid-light.svg"
              alt="Background Grid"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      {/* Left Column - Branding */}
      <div className="page_auth_container flex gap-10 h-full">
        <div className="lg:flex lg:w-1/2 relative h-full items-end justify-end">
          <div className="relative flex bottom-[calc((168/992)*100%)] flex-col  items-center text-center mr-20 max-w-[calc(443rem/16)]">
            {/* Logo */}
            <LogoGradientSmallIcon />

            {/* Tagline */}
            <p className="text-xl text-transparent bg-clip-text bg-[image:linear-gradient(92deg,#FFF_4.62%,_rgba(255,255,255,0.40)_98.07%)]">
              ONE DASHBOARD to Start, Track and Grow your savings.
            </p>
          </div>
        </div>

        {/* Right Column - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative h-full">
          {children}

          {/* Copyright */}
          <div className="text-center absolute bottom-0 mt-8 text-sm text--text-400">
            © Koajo. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
