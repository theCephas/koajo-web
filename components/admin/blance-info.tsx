import Tooltip from "@/components2/usefull/Tooltip";

export default function BalanceInfo() {
  return (
    <div className="mt-6 p-6 bg-white rounded-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center text-md font-semibold">
            <span>Total Contribution</span>
            <Tooltip content="Total amount you contributed into this pod since joining it" />
          </div>
          <div className="text-2xl font-bold">$0</div>
          <p className="text-base text-text-500 font-medium">
            {/* Your payout date is{" "}
            <span className="text-tertiary-100">Jun 30th, 2025</span> */}
            No payout date yet
          </p>
        </div>

        <div className="w-px self-stretch bg-gray-200" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center text-md font-semibold">
            <span>Total Payout</span>
            <Tooltip content="Total amount you will receive from this pod" />
          </div>
          <div className="text-2xl font-bold">$0</div>
          <p className="text-base text-text-500 font-medium">
            Payment less 2.5% transaction fee
          </p>
        </div>
      </div>
    </div>
  );
}
