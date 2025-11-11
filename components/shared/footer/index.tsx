import Link from "next/link";
import { Button } from "../../utils";
import Image from "next/image";
import MainLinks from "./main-links";

export default function Footer() {
  return (
    <footer className="w-full bg-gray pt-7 md:pt-15 lg:pt-25">
      <div className="page_container flex flex-col items-center gap-6 lg:gap-7.5 pb-9 lg:max-w-full lg:px-4">
        <div className="flex flex-col items-center relative px-6 py-15 lg:pt-25 lg:pb-12.5 lg:w-full bg-[image:linear-gradient(250deg,#E78D5C_1.2%,#2F8488_43.67%,#000_96.25%),linear-gradient(107deg,#672706_-2.13%,#024044_46.9%,#3A1E10_94.01%)] rounded-xl">
          {/* Background */}
          <div className="size-full absolute inset-0 z-0 rounded-[inherit]">
            <Image
              src="/media/images/background-grid-dark.svg"
              alt="Footer Background"
              fill
              className="object-cover"
            />
          </div>

          {/* Header Section */}
          <div className="relative text-center text-white mb-9 lg:mb-22.5 lg:max-w-[calc(940rem/16)]  mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 mx-auto">
              Ready for financial possibilities ?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-white mb-8 lg:mb-6 max-w-[calc(800rem/16)] mx-auto">
              Every dollar saved is a step toward a future of security,
              independence, and possibility. No matter how small, your savings
              today will shape a brighter tomorrow.
            </p>
            <Button text="Join the Community" href="/register" />
          </div>

          <div className="lg:max-w-[calc(1140rem/16)] w-full  lg:mx-inner-offset-horizontal lg:flex relative lg:border-t lg:border-[rgba(217,217,217,0.25)]">
            {/* Logo and Tagline */}
            <div className="flex flex-col items-center lg:items-start grow gap-2 lg:gap-2.5 mb-5 lg:mb-0 lg:pt-11.5 lg:pr-20 w-fit lg:border-r lg:border-[rgba(217,217,217,0.25)]">
              <Image
                src="/media/icons/logo-white.svg"
                alt="Koajo"
                width={115}
                height={32}
                className="lg:h-[calc(45rem/16)] w-auto"
              />
              <span className="text-lg lg:text-base text-text-300">
                Built for you.
              </span>
            </div>

            {/* Contact & Links */}
            <MainLinks />
          </div>
        </div>

        <div className="lg:max-w-page-max-width">
          {/* Copyright & Socials */}
          <div className="w-full flex flex-col mb-2.5">
            <div className="flex flex-wrap justify-between items-center gap-2.5">
              <div className="flex gap-2.5  text-base text-text-400 ">
                ©2025, Koajo
                <span className="text-black">All Rights Reserved.</span>
              </div>
              <div className="flex gap-2.5">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href || "#"}
                    aria-label={link.label}
                    className="size-6 p-[1.25px] hover:opacity-90"
                  >
                    <Image
                      src={link.icon}
                      alt={link.label || "Social Icon"}
                      width={22}
                      height={22}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-sm text-text-400">
            Koajo is a fintech company, not a bank, lender, advisor, broker,
            fund manager, investment firm, MLM scheme, credit repair service,
            credit reporting agency, money service business, money transmitter,
            financial institution or issuer of stored valued products. Koajo
            does not control user behavior and disclaims any liability in this
            regard. Koajo is not designed to pool funds for investment or
            generate profits for users. We do not offer investment returns or
            shares on savings. Users&apos; relationship with Koajo is
            independent, and their savings are paid out either in advance or
            arrears, based solely on their own contributions, with no reliance
            on the efforts of others.
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialLinks = [
  {
    label: "Instagram",
    icon: "/media/icons/social-instagram.svg",
    href: "https://www.instagram.com/koajo",
  },
  {
    label: "Facebook",
    icon: "/media/icons/social-facebook.svg",
    href: "https://www.facebook.com/koajo",
  },
  {
    label: "WhatsApp",
    icon: "/media/icons/social-whatsapp.svg",
    href: "https://wa.me/koajo",
  },
  {
    label: "LinkedIn",
    icon: "/media/icons/social-linkedin.svg",
    href: "https://www.linkedin.com/company/koajo",
  },
];
