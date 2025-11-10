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
      <div className="relative min-h-[100dvh] w-full bg-gray overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-[-35%] h-[60%] bg-[radial-gradient(circle_at_top,_rgba(70,157,163,0.25),_transparent_65%)] blur-3xl"
          aria-hidden
        />

        <div className="page_auth_container relative z-10 flex min-h-[100dvh] flex-col gap-8 py-8 lg:flex-row">
          <div className="relative isolate flex w-full flex-col gap-10 overflow-hidden rounded-3xl bg-[image:linear-gradient(180deg,#469DA3_0%,#1C2634_100%)] px-6 py-8 text-white shadow-2xl lg:sticky lg:top-8 lg:max-w-[420px]">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/media/images/background-grid-light.svg"
                alt="Background Grid"
                fill
                className="object-cover"
                priority
              />
            </div>
            <Link
              href="/"
              className="relative z-10 flex items-center justify-center lg:justify-start"
            >
              <Image
                src="/media/icons/logo-light-gradient.svg"
                alt="Koajo Logo"
                width={128}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>

            <div className="relative z-10 flex-1">
              <RegistrationSteps />
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[520px]">{children}</div>
            </div>

            <div className="mt-8 mb-6 flex flex-wrap items-center justify-center gap-3 text-center text-sm text-secondary-300">
              <span>© Koajo. All rights reserved.</span>
              <Link
                href="/legals/privacy-policy"
                className="text-tertiary-100 hover:text-tertiary-100/80"
              >
                Privacy Policy
              </Link>
              <span className="hidden text-secondary-300 sm:inline">|</span>
              <Link
                href="/legals/terms-of-use"
                className="text-tertiary-100 hover:text-tertiary-100/80"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StripeProvider>
  );
}
