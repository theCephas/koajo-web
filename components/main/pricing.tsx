import { PlanCard } from "@/components/utils";
import cn from "clsx";

export default function Pricing() {
  return (
    <div className={`w-full bg-gray py-7.5`}>
      <div className="page_container">
        {/* Header Section */}
        <div className="text-center mb-15">
          <h2 className="text-xl md:text-2xl lg:text-3xl text-medium text-color-gray-900 mb-4">
            Choose your <span className="text-highlight">plan</span>
          </h2>
          <p className="text-text-400 text-base">
            Our mission is to empower individuals financially and build wealth
            within our communities...
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {plans.map((plan, idx) => {
            const isLast = idx === plans.length - 1;
            const isOdd = plans.length % 2 !== 0;
            return (
              <div key={plan.id} className={cn(isLast && isOdd && "md:col-span-2")}>
                <PlanCard
                  title={plan.title}
                  description={plan.description}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const plans = [
  {
    id: "100",
    title: "$100",
    description:
      "$100 contribution payment due on the 1st & 16th of each month for 3 months.",
  },
  {
    id: "200",
    title: "$200",
    description:
      "$100 contribution payment due on the 1st & 16th of each month for 3 months.",
  },
  {
    id: "500",
    title: "$500",
    description:
      "$100 contribution payment due on the 1st & 16th of each month for 3 months.",
  },
  {
    id: "1000",
    title: "$1000",
    description:
      "$100 contribution payment due on the 1st & 16th of each month for 3 months.",
  },
  {
    id: "custom",
    title: "Custom",
    description:
      "Choose your contribution payments, however, all bi-weekly payment options are due on the 1st & 16th of each month, monthly payments are due on the 1st and you choose the length and members for your pod.",
  },
];
