"use client";
import { useState } from "react";
import { MyImage } from "../utils";
import ChevronUpIcon from "@/public/media/icons/chevron-up.svg";
import cn from "clsx";

export default function Solutions() {
  const [activeSolution, setActiveSolution] = useState(0);

  const handleSolutionClick = (idx: number) => {
    setActiveSolution(idx);
  };

  return (
    <section className="w-full bg-gray">
      <div className="page_container py-15">
        {/* headings */}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-600 text-center mb-10 mx-auto max-w-[calc(940rem/16)]">
          Solving real challenges Reshaping{" "}
          <span className="text-highlight">financial</span> freedom at scale!
        </h2>

        {/* solutions */}
        <div className="flex items-center lg:gap-9">
          <div className="relative hidden lg:flex flex-col gap-4 shrink-0 grow-0 rounded-[0.875rem] w-full lg:max-w-[calc(621rem/16)] lg:h-[calc(640rem/16)]">
            {solutions.map((solution, idx) =>
              solution.image(
                cn("absolute top-0 left-0 transition-all duration-300 ease-in-out", {
                  "opacity-0 scale-95": activeSolution !== idx,
                  "opacity-100 scale-100": activeSolution === idx,
                })
              )
            )}
          </div>
          <div className="flex flex-col gap-10 lg:gap-7.5 ">
            {solutions.map((solution, idx) => (
              <div key={idx} className="lg:pb-12.5 border-b border-text-200">
                <div className="flex flex-col gap-4 mb-7.5 lg:hidden">
                  {solution.image()}
                </div>
                <div
                  className="w-full gap-5 flex items-center justify-center cursor-pointer"
                  onClick={() => handleSolutionClick(idx)}
                >
                  <h3 className="text-2lg md:text-xl font-semibold mb-4 text-gray-900 w-full">
                    {solution.title}
                  </h3>
                  <ChevronUpIcon
                    className={cn("size-6 shrink-0 grow-0 transition-transform duration-300 ease-in-out", activeSolution === idx ? "rotate-0" : "rotate-180")}
                  />
                </div>
                <p className={cn("text-sm md:text-base lg:text-md text-gray-700 lg:max-h-0 overflow-hidden transition-all duration-300 ease-in-out", activeSolution === idx && "lg:max-h-96")}>
                  {solution.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const solutions = [
  {
    title: "Financial Foundation",
    image: (className = "") => (
      <MyImage
        src="financial-foundation_x73wx5"
        alt="Financial foundation"
        key={1}
        width={343}
        height={353}
        className={cn("w-[calc(343rem/16)] h-[calc(353rem/16)] lg:w-full lg:max-w-[calc(621rem/16)] lg:h-[calc(640rem/16)]", className)}
        isCloudinary
      />
    ),
    description:
      "Most people let bills, debt, and lifestyle expenses dictate their money for them. Without a plan, their income disappears before they can use it to build security.  Koajo helps break the Paycheck-to-Paycheck Cycle by making saving structured, intentional, and community-driven.",
  },
  {
    title: "Financial Freedom",
    image: (className = "") => (
      <MyImage
        src="financial-freedom_k4dzys"
        alt="Financial foundation"
        key={2}
        width={343}
        height={353}
        className={cn("w-[calc(343rem/16)] h-[calc(353rem/16)] lg:w-full lg:max-w-[calc(621rem/16)] lg:h-[calc(640rem/16)]", className)}
        isCloudinary
      />
    ),
    description:
      "People struggle to save! not because they don’t want to, but because they don’t have a system that works. Access Lump Sum Savings Without Loans; think of it as borrowing money from your ",
  },
  {
    title: "Financial Fluidity",
    image: (className = "") => (
      <MyImage
        src="financial-fluidity_uyshzl"
        alt="Financial foundation"
        key={3}
        width={343}
        height={353}
        desktop={{
          width: 621,
          height: 640,
        }}
        className={cn("w-[calc(343rem/16)] h-[calc(353rem/16)] lg:w-full lg:max-w-[calc(621rem/16)] lg:h-[calc(640rem/16)]", className)}
        isCloudinary
      />
    ),
    description:
      "Existing financial systems benefit those who are already ahead; charging the highest fees to those who can least afford them. Koajo levels the playing field. Users can use their lump-sum savings for emergencies, major payments, business growth, or faster debt payoff. Koajo makes saving structured, intentional, and easy without predatory practices.",
  },
];
