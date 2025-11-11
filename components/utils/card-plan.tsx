import { Button } from "./button";

interface PlanCardProps {
  title: string;
  description: string;
}

export default function PlanCard({ title, description }: PlanCardProps) {
  return (
    <div
      className={`rounded-[1.25rem] p-2 bg-[linear-gradient(0deg,rgba(255,255,255,0.60)_0%,rgba(255,255,255,0.60)_100%),radial-gradient(177.62%_109.85%_at_50%_50%,rgba(70,157,163,0.75)_0%,#FFF_100%)]`}
    >
      <div className="flex flex-col gap-4 rounded-[inherit] px-6 py-7.5 bg-white">
        <h3 className="text-xl font-semibold text-text-500">
          {title} <span className="text-md font-normal">Pod Plan</span>
        </h3>
        <div className="w-full h-px bg-gray-400" />
        <p className="text-black text-base mb-6 leading-relaxed">
          {description}
        </p>
        <Button href="/register" text="Get Started" />
      </div>
    </div>
  );
}
