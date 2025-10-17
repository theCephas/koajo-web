import React from "react";
import Image from "next/image";
import { MyImage } from "../utils";

export default function Focus() {
  const renderFocus = (array: Focus[]) => {
    return (
      <div className="w-full flex flex-col gap-7.5 lg:max-w-[calc(338rem/16)]">
        {array.map((item, idx) => (
          <div key={item.title} className="w-full">
            <div className="size-12.5 lg:size-15 flex items-center justify-center  border-2 border-primary/10 rounded-xl mb-6 bg-[image:radial-gradient(111.8%_111.8%_at_50%_100%,_rgba(253,_139,_81,_0.20)_0%,_rgba(253,_139,_81,_0.00)_52%)]">
              <Image
                src={item.icon}
                alt={item.title}
                width={36}
                height={36}
                className="size-auto object-contain"
              />
            </div>
            <h3 className="font-medium text-2lg mb-4 text-gray-900">
              {item.title}
            </h3>
            <p className="text-base text-gray-700">{item.description}</p>
            {idx !== array.length - 1 && (
              <hr className="border-text-200 mt-7.5" />
            )}
          </div>
        ))}
      </div>
    );
  };
  return (
    <section className="w-full bg-gray py-15 md:py-20 lg:py-30">
      <div className="page_container">
        {/* Heading */}
        <div className="flex flex-col items-center  gap-5 mb-10 lg:mb-15">
          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 text-center">
            Why Choose <span className="text-highlight">koajo</span>
          </h2>
          <p className="text-center text-sm md:text-base lg:text-lg text-gray-400">
            Unlike informal rotating savings, we are revolutionizing the way you
            experience savings
          </p>
        </div>

        {/* Focus */}
        <div className="flex flex-col lg:flex-row gap-7.5 lg:gap-12 justify-between lg:items-center">
          {renderFocus(focus.slice(0, 2))}
          <div className="hidden lg:flex justify-center items-center w-full max-w-[calc(510rem/16)] h-[calc(500rem/16)]">
            <MyImage
              src="iphone-with-background_uimrlc"
              width={510}
              height={500}
              className="size-full object-cover rounded-xl"
              alt="Koajo website showing on an iphone"
              isCloudinary
            />
          </div>
          {renderFocus(focus.slice(2))}
        </div>
      </div>
    </section>
  );
}

interface Focus {
  icon: string;
  title: string;
  description: string;
}

const focus: Focus[] = [
  {
    icon: "/media/icons/mission.svg",
    title: "Mission",
    description:
      "Our drive is to help people break free from the cycle of debt, save consistently, and build wealth together. We're fueled by the belief that everyone deserves access to",
  },
  {
    icon: "/media/icons/vision.svg",
    title: "The Vision",
    description:
      "We are driven to become the trusted financial ecosystem for everyone, regardless of background or income level, to save, grow wealth, and achieve financial freedom",
  },
  {
    icon: "/media/icons/value.svg",
    title: "The Value",
    description:
      "We empower you to take control of your money and achieve your financial goals. Your needs drives us, every feature and decision is focused on your financial success.",
  },
  {
    icon: "/media/icons/promise.svg",
    title: "The Promise",
    description:
      "On this journey, Koajo’s promise is to provide a simple, secure, and transparent savings experience that helps you take control of your financial future.",
  },
];
