import React from "react";
import Image from "next/image";

export default function Benefits() {
  return (
    <section className="w-full bg-gray py-15 pb-7.5">
      <div className="page_container flex flex-col lg:flex-row gap-7.5 md:gap-10 lg:gap-28 ">
        {/* Heading */}
        <div className="flex flex-col gap-5 md:gap-6 min-w-[calc(150rem/16)] lg:max-w-[calc(434rem/16)]">
          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
            Why Choose <span className="text-highlight">koajo</span>
          </h2>
          <div className="flex flex-col gap-2.5 text-base text-text-500">
            <p className=" ">
              Koajo takes the time-tested & proven concept of rotating savings
              and modernizes it into a secure and seamless digital experience
            </p>

            <p className="text-gray-900 font-semibold lg:bg-clip-text lg:text-transparent lg:bg-[image:linear-gradient(107deg,#FD8B51_-2.13%,_#469DA3_49.87%,_#FD8B51_94.01%)]">
              Traditional Ajo systems have served communities for centuries, but
              they need to evolve to keep up with modern financial demands.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="w-full flex flex-col gap-7.5 lg:grid lg:grid-cols-2 lg:gap-12.5">
          {benefits.map((benefit, idx) => (
            <div key={benefit.title} className="w-full">
              <div className="flex items-center gap-3.5 lg:gap-4">
                <div className="size-11.5 lg:size-16 flex items-center justify-center shrink-0  border-2 border-primary/10 rounded-xl mb-5 bg-[image:radial-gradient(111.8%_111.8%_at_50%_100%,_rgba(253,_139,_81,_0.20)_0%,_rgba(253,_139,_81,_0.00)_52%)]">
                  <Image
                    src={benefit.icon}
                    alt={benefit.title}
                    width={36}
                    height={36}
                    className="size-auto object-contain"
                  />
                </div>
                <h3 className="font-medium text-2lg lg:text-xl mb-4 text-text-500">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-base text-text-700">{benefit.description}</p>
              {idx !== benefits.length - 1 && (
                <hr className="border-text-200 mt-7.5 lg:mt-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  {
    icon: "/media/icons/hourglass.svg",
    title: "Built for You, Not the Banks",
    description:
      "No hidden fees, no credit checks, Koajo is built for YOU. For the dreamers, the planners, and the wealth-builders. Millions have reached financial goals using this savings tradition, especially among immigrant communities.",
  },
  {
    icon: "/media/icons/separation.svg",
    title: "Freedom from Debt",
    description:
      "Access cash when it's your turn, without loans or high-interest traps. Loans can help in a pinch, but they come with interest, stress and strings attached. Savings, on the other hand, are YOURS to keep. No payback, no pressure.",
  },
  {
    icon: "/media/icons/power-up.svg",
    title: "Power Your Future",
    description:
      "Use your savings to invest in life's biggest moments, without debt or stress. With Koajo, saving is no longer a gamble. No excuses, just discipline and results. It's a structured, stress-free path to financial security and growth",
  },
  {
    icon: "/media/icons/reduce.svg",
    title: "Reduce Risk",
    description:
      "Our platform is built on trust, security, and reliability, unlike traditional Ajo. We ensure that payouts are always on schedule, with no manual tracking and no risk of members or leaders disappearing.",
  },
];
