"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import cn from "clsx";
import Image from "next/image";
import { MyImage } from "../utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Steps() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progressMaxHeight, setProgressMaxHeight] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleStepClick = (idx: number) => {
    setActiveIdx(idx);
  };

  const progressHeight = useMemo(() => {
    if (activeIdx === 0) return "2%";
    return activeIdx === steps.length - 1 ? "100%" : `${((activeIdx + 1) * 100) / steps.length}%`;
  }, [activeIdx]);

  useEffect(() => {
    const scrollerEl = document.getElementById("steps-info-container");

    // Create ScrollTrigger for each step
    stepRefs.current.forEach((ref, idx) => {
      if (ref) {
        ScrollTrigger.create({
          trigger: ref,
          scroller: scrollerEl || undefined,
          start: "top 50%",
          end: "bottom 52%",
          onEnter: () => handleStepClick(idx),
          onEnterBack: () => handleStepClick(idx),
          markers: true,
          onLeave: () => {
            // Only change if we're leaving to the next step
            if (idx < steps.length - 1) {
              handleStepClick(idx + 1);
            }
          },
          onLeaveBack: () => {
            // Only change if we're going back to previous step
            if (idx > 0) {
              handleStepClick(idx - 1);
            }
          },
        });
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const stepTextContainers = document.querySelectorAll(".step-text-container");
    const maxHeight = Array.from(stepTextContainers).reduce((acc, container) =>  acc + container.clientHeight, 0);
    setProgressMaxHeight(maxHeight);
    console.log("maxHeight", maxHeight);
  }, []);

  return (
    <section className="w-full bg-[image:linear-gradient(250deg,#000_1.2%,#032425_43.67%,#000_96.25%)]">
      <div className="page_container py-15 relative">
        {/* Background */}
        <div className="size-full -z-10 absolute inset-0  rounded-[inherit] overflow-hidden">
          <Image
            src="/media/images/background-grid-dark.svg"
            alt="Hero Background"
            width={1920}
            height={1080}
            className="size-full object-cover"
          />
        </div>

        {/* headings */}
        <div className="flex flex-col gap-5 md:gap-6 items-center text-center mb-10 lg:mb-15 max-w-[calc(940rem/16)] mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white">
            See How We Are{" "}
            <span className="text-highlight">Empowering Millions...</span>
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray max-w-200 mx-auto">
            Koajo modernizes the rotating savings model to help people save
            consistently, access money when needed, and break the cycle of
            financial insecurity.
          </p>
        </div>

        {/* steps */}
        <div className="flex  lg:gap-28">
          <div className="relative hidden lg:flex flex-col gap-4 shrink-0 grow-0 rounded-[1.5rem] w-full lg:max-w-[calc(621rem/16)] lg:h-[calc(640rem/16)]">
            {steps.map((step, idx) => (
              <MyImage
                key={idx}
                src={step.cldImgId}
                alt={step.title}
                width={621}
                height={640}
                className={cn(
                  "absolute top-0 left-0 transition-all duration-300 ease-in-out rounded-[inherit]",
                  {
                    "opacity-0 scale-95": activeIdx !== idx,
                    "opacity-100 scale-100": activeIdx === idx,
                  }
                )}
                isCloudinary
              />
            ))}
          </div>
          <div
            className="relative flex flex-col overflow-auto lg:h-[calc(677rem/16)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-300"
            id="steps-info-container"
          >
            {/* Progress Bar */}
            <div className="absolute z-0 top-0 left-4.5 w-[1px] h-full bg-gray-100/25" style={{ height: progressMaxHeight > 0 ? `${progressMaxHeight}px` : "100%" }}>
              <div
                className="bg-white h-[2%]"
                style={{ height: progressHeight }}
              />
            </div>

            {/* steps */}
            {steps.map((step, idx) => (
              <div
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                key={idx}
                className="flex gap-14"
              >
                <div className="relative z-10 size-fit px-2 py-1 bg-white text-black text-md font-medium  rounded-[0.625rem]">
                  {idx < 8 && "0"}
                  {idx + 1}
                </div>
                <div className={cn("step-text-container flex flex-col gap-4 lg:gap-6 pb-7.5 lg:pb-50", idx === steps.length - 1 && "pb-0")}>
                  <h3 className="text-2lg md:text-xl lg:text-2xl font-semibold text-transparent bg-clip-text w-full bg-[image:linear-gradient(90deg,#5A606C_0%,#FFFFFF_50%,#5A606C_100%)]">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base lg:text-md text-gray">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Choose or Create a Pod",
    description:
      "Join a savings pod that fits your saving & financial goals or start your own with people you trust. Each pod runs for 12 weeks at a time, giving you short term access to the Lumpsum.",
    cldImgId: "create-account_qgdks3",
  },
  {
    title: "Commit & Contribute",
    description:
      "Set your savings amount and contribute on schedule; stay consistent, stay in control. Most members will receive their lump-sum payout before the pod cycle is complete.",
    cldImgId: "choose-pod_p95naa",
  },
  {
    title: "Receive Payout & Keep Building",
    description:
      "Monitor your savings in each pod in real-time, create multiple savings pods for different goals, and view upcoming payment schedules and payout dates from your account dashboard. You can use your payout to reach your financial goals faster.",
    cldImgId: "payment_wo9ymm",
  },

  {
    title: "Receive Payout & Keep Building",
    description:
      "Monitor your savings in each pod in real-time, create multiple savings pods for different goals, and view upcoming payment schedules and payout dates from your account dashboard. You can use your payout to reach your financial goals faster.",
    cldImgId: "keep-building_w2r1yi",
  },
];
