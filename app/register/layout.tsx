import { ReactNode } from "react";
import RegistrationSteps from "@/components/admin/registration-steps";
import Link from "next/link";
import Image from "next/image";

interface RegisterLayoutProps {
  children: ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <div className="bg-gray w-full h-dvh">
      {/* Background */}
      {/* <div className="absolute inset-0 flex gap-10 h-full p-page-auth-offset-horizontal"> */}
        {/* <div className="w-[calc((428/1396)*100%)] bg-[image:linear-gradient(180deg,#469DA3_0%,#1C2634_100%)] rounded-2xl" /> */}
      {/* </div> */}

      {/* Left Column - Branding */}
      <div className="page_auth_container flex gap-10 w-full h-full">
        <div className="lg:flex lg:w-full lg:max-w-[calc((428/1396)*100%)] sticky left-0 top-0 h-full justify-end bg-[image:linear-gradient(180deg,#469DA3_0%,#1C2634_100%)] rounded-2xl">
          <div className="relative flex flex-col gap-16 px-8 py-6 h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/media/icons/logo-light-gradient.svg"
                alt="Koajo Logo"
                width={100}
                height={28}
                className="h-7 w-auto"
              />
            </Link>

            {/* Registration Steps */}
            <RegistrationSteps />
          </div>
        </div>

        {/* Right Column  Forms */}
        <div className="w-full grow flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>

          {/* Copyright*/}
          <div className="text-center mt-8 mb-6 text-sm text-secondary-300 gap-3 flex justify-center">
            © Koajo. All rights reserved.
            <Link href="/legals/privacy-policy" className="text-tertiary-100 hover:text-tertiary-100/80">Privacy Policy</Link>
            |
            <Link href="/legals/terms-of-use" className="text-tertiary-100 hover:text-tertiary-100/80">Terms of Use</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
