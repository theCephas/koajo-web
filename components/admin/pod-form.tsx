"use client";
import { useMemo, useState } from "react";
import { Button } from "../utils/button";
import { useOnboarding } from "@/lib/provider-onboarding";
import { Field } from "../utils/field";
import { MaximumMembers } from "@/lib/types/pod";
import { Label } from "../utils/label";

export default function PodForm() {
  const {
    prev,
    next,
    close,
    podName,
    setPodName,
    contributionAmountCents,
    setContributionAmountCents,
    schedule,
    setSchedule,
    maxMembers,
    setMaxMembers,
    selectedCycleWeeks,
    setSelectedCycleWeeks,
    invitedEmails,
    setInvitedEmails,
    randomPosition,
    setRandomPosition,
  } = useOnboarding();

  const [inviteInput, setInviteInput] = useState<string>("");
  const canProceed = useMemo(() => podName.trim().length > 0, [podName]);

  const addInvite = () => {
    const email = inviteInput.trim();
    if (!email) return;
    if (!invitedEmails.includes(email)) {
      setInvitedEmails([...invitedEmails, email]);
    }
    setInviteInput("");
  };

  const removeInvite = (email: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== email));
  };

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col justify-between gap-4">
        <button
          className="text-sm text-gray-700 hover:text-gray-900  flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        <div className="text-center grow mr-16 w-full">
          <div className="text-2xl font-bold text-gray-900">Pod Details</div>
          <p className="text-sm text-gray-500 mt-1">
            Bi-weekly payments are due on the 1st and 16th of each month. Monthly
            payments are due on the 1st of each month. Bi-weekly Payouts are due on the
            15th and 30th of the month. Monthly payouts are done on the 30th of the month.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5">
        <div className="md:col-span-2">
          <Field
            name="podName"
            label="Pod Name"
            placeholder="The Gunners"
            value={podName}
            onChange={(e) => setPodName(e.target.value)}
          />
        </div>

        <Field
          name="amount"
          label="Amount"
          placeholder="$9,000"
          value={contributionAmountCents ? `$${(contributionAmountCents / 100).toLocaleString()}` : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setContributionAmountCents(Number(raw || 0));
          }}
        />

        <div>
          <Label htmlFor="schedule">Bi-weekly or monthly</Label>
          <select
            className="mt-2 w-full px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value as "bi_weekly" | "monthly")}
          >
            <option value="bi_weekly">bi-weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>

        <Field
          name="members"
          label="Number of members"
          placeholder="50"
          type="number"
          value={String(maxMembers ?? "")}
          onChange={(e) => setMaxMembers(Number(e.target.value) as MaximumMembers)}
        />

        <div>
          <label className="text-xs text-text-300">Pod Cycle</label>
          <select
            className="mt-2 w-full px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
            value={selectedCycleWeeks}
            onChange={(e) => setSelectedCycleWeeks(Number(e.target.value) as 12 | 24)}
          >
            <option value={12}>Select your Pod Cycle</option>
            <option value={12}>12 Weeks</option>
            <option value={24}>24 Weeks</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs text-text-300">Invite by email</label>
          <div className="flex items-stretch gap-2">
            <input
              className="flex-1 px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
              placeholder="Enter email address"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <select className="px-4 py-4 border border-text-200 rounded-2xl text-sm text-text-500">
              <option>Can Edit</option>
              <option>Can View</option>
            </select>
            <button
              type="button"
              onClick={addInvite}
              className="px-6 py-4 rounded-2xl bg-white border border-text-200 text-text-500"
            >
              Invite
            </button>
          </div>
          {invitedEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {invitedEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-text-100 text-text-500 text-xs"
                >
                  {email}
                  <button
                    type="button"
                    className="ml-1 text-text-400 hover:text-text-600"
                    onClick={() => removeInvite(email)}
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <label className="text-xs text-text-300">Random position</label>
          <button
            type="button"
            onClick={() => setRandomPosition(!randomPosition)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              randomPosition ? "bg-tertiary-100" : "bg-text-200"
            }`}
            aria-pressed={randomPosition}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                randomPosition ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-xs text-text-300 mt-2">
        NOTE: Please enter individual emails in order of their preferred payout position. The first email will receive the
        first payout, the second email will receive the second payout, and so on. Alternatively, click Random Position to let Koajo assign positions automatically.
      </p>

      <div className="flex items-center justify-end gap-4 mt-4">
        <Button text="Close" variant="secondary" onClick={close} />
        <Button disabled={!canProceed} text="Next" variant="primary" onClick={next} />
      </div>
    </div>
  );
}
