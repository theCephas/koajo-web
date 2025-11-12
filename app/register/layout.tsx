import { ReactNode } from "react";
import RegistrationSteps from "@/components/admin/registration-steps";
import Link from "next/link";
import Image from "next/image";
import { StripeProvider } from "@/lib/provider-stripe";

interface RegisterLayoutProps {
  children: ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <StripeProvider>
      <div className="relative w-full min-h-dvh lg:h-dvh bg-[#F5F5F5] overflow-auto lg:overflow-hidden">
        <div className="flex h-full flex-col lg:flex-row">
          {/* Left Panel - Registration Steps */}
          <div className="relative z-0 flex w-full min-h-[200px] flex-col lg:items-start items-center justify-start pt-6 pb-8 md:justify-start overflow-hidden bg-[linear-gradient(180deg,#134446_0%,#010E0F_100%)] lg:m-2 lg:rounded-[16px] px-8 text-white lg:w-[40%] lg:max-w-[420px] lg:py-8 lg:h-[calc(100vh-16px)]">
            {/* Grid Background Effect */}
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/media/images/background-grid-light.svg"
                alt="Background Grid"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content */}
            <Link href="/" className="relative z-10 mb-8 lg:mb-12">
              <Image
                src="/media/icons/logo-light-gradient.svg"
                alt="Koajo Logo"
                width={128}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            <div className="relative z-10 flex-1 w-full flex items-center lg:items-start">
              <RegistrationSteps />
            </div>
          </div>

          {/* Right Panel - Form Section */}
          <div className="-mt-12 lg:mt-0 flex w-full lg:flex-1 flex-col bg-[#F5F5F5] px-3 pb-6 pt-2 lg:px-12 lg:py-8 overflow-visible lg:overflow-y-auto">
            <div className="relative w-full max-w-[1200px] mx-auto flex flex-col lg:flex-1 justify-between gap-6 lg:gap-8 min-h-full">
              {/* Main Content */}
              <div className="flex-1 flex items-center justify-center py-4 lg:py-6">
                {children}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 lg:pt-6 pb-4 text-center text-xs lg:text-sm text-secondary-300">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  <span>© Koajo. All rights reserved.</span>
                  <Link
                    href="/legals/terms-of-use"
                    className="text-tertiary-100 hover:text-tertiary-100/80"
                  >
                    Term & Condition
                  </Link>
                  <span className="hidden sm:inline">|</span>
                  <Link
                    href="/legals/privacy-policy"
                    className="text-tertiary-100 hover:text-tertiary-100/80"
                  >
                    Privacy & Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StripeProvider>
  );
}
