"use client";
import cn from "clsx";
import { useEffect, useState } from "react";
import { Button } from "../utils/button";
import { Field } from "../utils/field";
import { useOnboarding } from "@/lib/provider-onboarding";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import { resolveApiMessage } from "@/lib/utils/api-helpers";
import { ApiErrorClass } from "@/lib/utils/auth";

export default function PodInviteAcceptance() {
  const { close, inviteToken, refreshPodPlans } = useOnboarding();
  const [tokenValue, setTokenValue] = useState<string>(inviteToken ?? "");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTokenValue(inviteToken ?? "");
  }, [inviteToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tokenValue.trim()) {
      setStatus({
        type: "error",
        message: "Invitation token is required.",
      });
      return;
    }

    const token = TokenManager.getToken();
    if (!token) {
      setStatus({
        type: "error",
        message: "Please sign in to accept this invitation.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await AuthService.acceptCustomInvite(
        {
          token: tokenValue.trim(),
        },
        token
      );

      if (response && typeof response === "object" && "error" in response) {
        setStatus({
          type: "error",
          message: resolveApiMessage(
            response.message as string,
            "Unable to accept this invitation right now."
          ),
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Invitation accepted. Welcome to the pod!",
      });

      await refreshPodPlans();

      setTimeout(() => {
        close();
      }, 1500);
    } catch (error) {
      const fallback = "Unable to accept this invitation right now.";
      const message =
        error instanceof ApiErrorClass
          ? resolveApiMessage(error.message, fallback)
          : error instanceof Error
          ? error.message
          : fallback;

      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6.5 w-full max-w-[calc(640rem/16)] relative p-6 md:p-8 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex justify-between gap-4 items-start">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold text-gray-900">
            Accept pod invitation
          </div>
          <p className="text-sm text-gray-500 max-w-[52ch]">
            Paste the invitation token from your email to join this pod
            instantly.
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-gray-700 hover:text-gray-900 border border-gray-100 px-6 py-2 rounded-full"
          onClick={close}
        >
          Close
        </button>
      </div>

      <Field
        name="inviteToken"
        label="Invitation token"
        placeholder="b2d1c5e4f7a8…"
        value={tokenValue}
        onChange={(e) => setTokenValue(e.target.value)}
        required
      />

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

      <div className="flex items-center justify-end gap-4">
        <Button
          type="submit"
          text={loading ? "Accepting…" : "Accept invite"}
          variant="primary"
          disabled={loading}
        />
      </div>
    </form>
  );
}
