import Image from "next/image";
import { Button } from "../utils";
import { MyImage, MyCldImage } from "../utils";

export default function Hero() {
  return (
    <section className="w-full bg-gray pt-2.5 pb-7.5 md:pb-10 lg:pb-15">
      <div className="page_container lg:max-w-full lg:px-4 -mb-[calc(124rem/16)] md:-mb-[calc(180rem/16)] lg:-mb-[calc((346rem - 72rem)/16)]">
        <div className="relative flex flex-col items-center w-full pt-15 md:pt-20 lg:pt-29.5 pb-[calc(124rem/16)] md:pb-[calc(180rem/16)] lg:pb-[calc((346rem - 72rem)/16)] rounded-lg md:rounded-xl lg:rounded-[0.875rem] bg-[image:linear-gradient(250deg,#E78D5C_1.2%,#2F8488_43.67%,#000_96.25%),linear-gradient(107deg,#672706_-2.13%,#024044_46.9%,#3A1E10_94.01%)]">
          {/* Background */}
          <div className="size-full absolute inset-0 z-0 rounded-[inherit] overflow-hidden">
            <Image
              src="/media/images/background-grid-dark.svg"
              alt="Hero Background"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col items-center lg:max-w-[calc(1078rem/16)]">
            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-5 relative z-10">
              <span className="text-xs md:text-sm lg:text-md text-white/90">
                1200+ 5 Stars Reviews
              </span>
              <MyCldImage
                src="users-avatars_bwcuqz"
                alt="Users avatars"
                width={100}
                height={29.4}
                crop="fit"
                gravity="center"
                className="w-auto  h-7.5 object-contain"
                quality={100}
              />
            </div>

            {/* Headline */}
            <h1 className="text-xl md:text-3xl lg:text-5xl font-semibold text-white text-center  mb-5 lg:mb-6 relative z-10">
              Savings. Financial Security.{" "}
              <span className="text-highlight">Financial</span> Freedom
            </h1>
            {/* Subheading */}
            <p className="text-sm md:text-md lg:text-lg text-white/90 text-center mb-6 lg:mb-8 relative z-10">
              We are on a mission to redefine savings and wealth-building for
              millions.
            </p>

            <Button
              text="Join the Community"
              className="mb-9 font-semibold relative z-10"
            />
          </div>
        </div>

        {/* Stats Card */}
        <div className="inner_container lg:max-w-[calc(1078rem/16)] mx-auto">
          <MyImage
            src="hero-home_zafbgr"
            alt="Users avatars"
            width={293}
            height={347}
            desktop={{
              width: 1078,
              height: 571,
              src: "hero-home-desktop_iy9o4j",
            }}
            className="rounded-lg size-auto relative -top-[calc(124rem/16)] mx-auto z-10"
            isCloudinary
            quality={100}
            priority
          />
        </div>
      </div>
    </section>
  );
}
