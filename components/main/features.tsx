import { MyImage, Donot } from "../utils";
import cn from "clsx"

export default function Features() {
  const renderFeature = (feature: Feature, idx?: number, className = "") => {
    return (
      <div
        key={idx}
        className={cn("px-5 py-10 bg-teal-800 rounded-[calc(22.5rem/16)] border-2 border-teal-800", className)}
      >
        {feature.Visual && (
          <div className="size-[calc(221rem/16)] mb-6 mx-auto">
            <feature.Visual />
          </div>
        )}
        <h3 className="text-2lg font-semibold text-white mb-4">
          {feature.title}
        </h3>
        <p className="text-sm text-text-200">{feature.description}</p>
      </div>
    );
  };
  return (
    <section className="w-full bg-gray">
      <div className="page_container py-15">
        {/* headings */}
        <div className="flex flex-col gap-5 md:gap-6 items-center text-center mb-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
            Financial security isn&apos;t just about
            <span className="text-highlight">wealth</span> it&apos;s about
            mental <span className="text-highlight">peace</span>
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-text-400">
            Unlike informal rotating savings, we are revolutionizing the way you
            experience savings
          </p>
        </div>

        {/* features */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          {renderFeature(features[0])}
          <div className="flex flex-col gap-5">
            {features
              .slice(1, 3)
              .map((feature, idx) => renderFeature(feature, idx, "h-full"))}
          </div>
          {renderFeature(features[3])}
        </div>

        <div className="flex lg:hidden flex-col gap-5">
          {features.map((feature, idx) => renderFeature(feature, idx))}
        </div>
      </div>
    </section>
  );
}

interface Feature {
  title: string;
  description: string;
  Visual?: () => React.ReactNode;
}

export const features = [
  {
    title: "12 or 24 Week Structured Pod Cycle",
    description:
      "Stay on track with a predictable 90-day savings cycle, ensuring consistency and financial growth.",

    Visual: () => (
      <Donot
        data={{
          id: "progress",
          label: "Runtime",
          value: 85,
          color: "#E7854D",
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-sm font-semibold text-white">Runtime</span>
          <span className="text-xl text-white">12 Weeks or 24 Weeks</span>
        </div>
      </Donot>
    ),
  },
  {
    title: "Secure Verification & Fraud Prevention",
    description:
      "With verified users, secure platform and third party industry leading payment processors, we ensure a safe and reliable experience.",
  },
  {
    title: "Debt-Free Wealth Building",
    description:
      "Build your finances without loans or credit, breaking free from the cycle of debt. Grow your savings and stay debt-free, without the worry of high interest rates.",
  },
  {
    title: "Automated Contributions and Payouts",
    description:
      "Enjoy a smooth, hands-free experience with automated transactions. Monitor your savings, contributions, and upcoming payouts anytime through your dashboard.",
    Visual: () => (
      <MyImage
        src="payouts_x8jwu8"
        alt="Payment flow"
        width={221}
        height={221}
        className="max-h-[calc(221rem/16)] size-auto"
        isCloudinary
      />
    ),
  },
];
