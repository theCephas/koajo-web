"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/utils";
import cn from "clsx";
import Link from "next/link";
import { CldImage } from "next-cloudinary";

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageId: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Results happen here",
    description: "Savings requires consistency, and Koajo makes it possible..",
    imageId: "hero-home-desktop_iy9o4j",
  },
  {
    id: 2,
    title: "Pod Goals",
    description: "Set and achieve your financial goals with structured savings",
    imageId: "hero-home_zafbgr",
  },
  {
    id: 3,
    title: "Achievements",
    description: "Earn badges and track your progress on your savings journey",
    imageId: "choose-pod_p95naa",
  },
  {
    id: 4,
    title: "Achievements",
    description: "Earn badges and track your progress on your savings journey",
    imageId: "choose-pod_p95naa",
  },
];

export default function GetStartedPage() {
  const [activeItem, setActiveItem] = useState(0);

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleProgressClick = (index: number) => {
    setActiveItem(index);
  };

  return (
    <div className="bg-gray w-full h-screen min-h-[calc(700rem/16)]">
      {/* Background */}
      <div className="absolute inset-0 flex gap-10 h-full p-page-auth-offset-horizontal">
        {/* Left Column - Marketing Content */}
        <div className="flex-1 flex flex-col  px-8.5 relative" />

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

      <div className="page_auth_container flex gap-10 h-full">
        {/* Left Column - Marketing Content */}
        <div className="flex-1 flex flex-col justify-center h-full px-8.5 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/media/icons/logo-dark-gradient.svg"
              alt="Koajo Logo"
              width={100}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <div className="h-full flex justify-center items-center">
            <div className="flex flex-col gap-6">
              {/* Headline */}
              <h1 className="text-xl font-bold text--text-500">
                Let&apos;s start YOUR journey to unlocking financial
                possibilities with Koajo.
              </h1>

              {/* Description */}
              <p className="text-base lg:text-lg text-text-400">
                The ONLY modernized, secure and simple rotating savings platform
                to help you save more and hit your LOFTY financial goals.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col lg:flex-row gap-6 w-full">
                <Button
                  text="Learn More"
                  variant="secondary"
                  linkClassName="w-full grow"
                  className="w-full"
                  showArrow={false}
                  href={"/"}
                />
                <Button
                  text="Create An Account"
                  variant="primary"
                  linkClassName="w-full grow"
                  className="w-full"
                  href="/register"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Dashboard Preview with Carousel */}
        <div className="flex justify-center flex-1 rounded-2xl relative overflow-hidden ">
          {/* Carousel Content */}
          <div className="relative z-10 size-full px-5 py-4 flex flex-col items-center justify-center">
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-white transition-all duration-500 ease-in-out",
                  {
                    "opacity-100 translate-y-0": activeItem === index,
                    "opacity-0 translate-y-8": activeItem !== index,
                  }
                )}
              >
                <div className="max-w-[calc(524rem/16)] w-full  max-h-[calc(560rem/16)] h-fit flex items-center justify-center">
                  <CldImage
                    src={item.imageId}
                    alt={item.title}
                    width={524}
                    height={560}
                    crop="fit"
                    gravity="center"
                    className="size-auto max-w-full max-h-full object-contain"
                    quality={100}
                  />
                </div>

                {/* Content */}
                <span className="text-xl  text-text-200 font-bold">
                  {item.title}
                </span>
                <p className="text-base text-white font-semibold ">
                  {item.description}
                </p>
              </div>
            ))}

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-1/2 px-5 py-4  w-full transform -translate-x-1/2 text-center text-white">
              {/* Progress Indicators */}
              <div className="flex justify-center gap-2">
                {carouselItems.map((_, index) => (
                  <span
                    key={index}
                    onClick={() => handleProgressClick(index)}
                    className={cn(
                      "w-full flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer",
                      {
                        "bg-white": activeItem === index,
                        "bg-white/40 hover:bg-white/60": activeItem !== index,
                      }
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
