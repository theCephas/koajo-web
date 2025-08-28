import Card from "@/components2/usefull/Card";

export default function CycleDuration() {
  return (
    <Card
      title="Cycle Duration"
      tooltip="The days left in the current cycle"
    >
      <div className="text-2xl font-bold mt-4">36 days remaining</div>
      <p className="text-base text-text-500 font-medium mt-4">
        Expense increased by <span className="text-primary">$1000 </span>
        this month.
      </p>
    </Card>
  );
}
