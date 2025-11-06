"use client";
import cn from "clsx";
import { useMemo, useState } from "react";
import { Button } from "../utils/button";
import { useOnboarding, CUSTOM_POD_PLAN_CODE } from "@/lib/provider-onboarding";
import { Field } from "../utils/field";
import { MaximumMembers, PodSchedule } from "@/lib/types/pod";
import { Label } from "../utils/label";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import { resolveApiMessage } from "@/lib/utils/api-helpers";
import { ApiErrorClass } from "@/lib/utils/auth";

const MIN_AMOUNT_CENTS = 10000; // $100

export default function PodForm() {
  const {
    prev,
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
    refreshPodPlans,
    setSelectedPlanCode,
  } = useOnboarding();

  const [inviteInput, setInviteInput] = useState<string>("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canProceed = useMemo(() => {
    if (podName.trim().length === 0) return false;
    if (contributionAmountCents < MIN_AMOUNT_CENTS) return false;
    return true;
  }, [podName, contributionAmountCents]);

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

  const handleSubmit = async () => {
    if (!canProceed) {
      setStatus({
        type: "error",
        message: "Please provide a pod name and a contribution amount of at least $100.",
      });
      return;
    }

    const token = TokenManager.getToken();
    if (!token) {
      setStatus({
        type: "error",
        message: "You need to be logged in to create a custom pod.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await AuthService.createCustomPod(
        {
          name: podName.trim(),
          amount: Math.round(contributionAmountCents / 100),
          cadence: schedule,
          randomizePositions: randomPosition,
          invitees: invitedEmails,
        },
        token
      );

      if (response && typeof response === "object" && "error" in response) {
        setStatus({
          type: "error",
          message: resolveApiMessage(
            response.message,
            "Unable to create this pod right now. Please try again."
          ),
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Your custom pod has been created. Invites have been sent to your participants.",
      });

      await refreshPodPlans();
      setSelectedPlanCode(CUSTOM_POD_PLAN_CODE);
      setTimeout(() => {
        close();
      }, 1800);
    } catch (error) {
      const fallback = "Unable to create this pod right now. Please try again.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6.5 w-full max-w-[calc(720rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg h-[700px] overflow-y-scroll">
      <div className="flex flex-col justify-between gap-4">
        <button
          className="text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center border border-gray-100 size-12 gap-2 px-2 py-4 rounded-2xl"
          aria-label="Go back"
          onClick={prev}
        >
          <span className="inline-block -ml-1 rotate-180">➜</span>
        </button>

        <div className="text-center grow mr-16 w-full">
          <div className="text-2xl font-bold text-gray-900">Pod details</div>
          <p className="text-sm text-gray-500 mt-1">
            Configure your custom pod. Contributions determine payouts and invitations are sent automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5">
        <div className="md:col-span-2">
          <Field
            name="podName"
            label="Pod name"
            placeholder="The Gunners"
            value={podName}
            onChange={(e) => setPodName(e.target.value)}
            required
          />
        </div>

        <Field
          name="amount"
          label="Amount"
          placeholder="$500"
          value={
            contributionAmountCents
              ? `$${(contributionAmountCents / 100).toLocaleString()}`
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setContributionAmountCents(Number(raw || 0));
          }}
          required
        />

        <div>
          <Label htmlFor="schedule">Cadence</Label>
          <select
            id="schedule"
            className="mt-2 w-full px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
            value={schedule}
            onChange={(e) =>
              setSchedule(e.target.value as PodSchedule)
            }
          >
            <option value="bi-weekly">bi-weekly</option>
            <option value="monthly">monthly</option>
          </select>
        </div>

        <Field
          name="members"
          label="Number of members"
          placeholder="6"
          type="number"
          value={String(maxMembers ?? "")}
          onChange={(e) =>
            setMaxMembers(Number(e.target.value) as MaximumMembers)
          }
          required
        />

        <div>
          <label className="text-xs text-text-300">Pod cycle</label>
          <select
            className="mt-2 w-full px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
            value={selectedCycleWeeks}
            onChange={(e) =>
              setSelectedCycleWeeks(Number(e.target.value) as 12 | 24)
            }
          >
            <option value={12}>12 weeks</option>
            <option value={24}>24 weeks</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs text-text-300">Invite by email</label>
          <div className="flex flex-wrap items-stretch gap-2">
            <input
              className="flex-1 px-6 py-4 border border-text-200 rounded-2xl text-sm font-medium text-text-500"
              placeholder="Enter email address"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
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
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              randomPosition ? "bg-tertiary-100" : "bg-text-200"
            )}
            aria-pressed={randomPosition}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                randomPosition ? "translate-x-5" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      <p className="text-xs text-text-300 mt-2">
        NOTE: Please enter individual emails in order of their preferred payout position. The first email will receive the first payout, the second email will receive the second payout, and so on. Alternatively, toggle Random position to let Koajo assign positions automatically.
      </p>

      {status && (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            status.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600"
          )}
        >
          {status.message}
        </div>
      )}

      <div className="flex items-center justify-end gap-4 mt-4">
        <Button text="Close" variant="secondary" onClick={close} />
        <Button
          disabled={!canProceed || isSubmitting}
          text={isSubmitting ? "Creating…" : "Create pod"}
          variant="primary"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
