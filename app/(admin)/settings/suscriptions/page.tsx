"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/utils";
import CardAuth from "@/components/auth/card-auth";
import { useOnboarding } from "@/lib/provider-onboarding";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import type { User } from "@/lib/types/api";
import BankIcon from "@/public/media/icons/bank.svg";

export default function SubscriptionsPage() {
  const { open, setStep } = useOnboarding();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = TokenManager.getToken();
      if (!token) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const response = await AuthService.getMe(token);
        if (response && "error" in response) {
          setError("Failed to fetch user data");
        } else {
          setUser(response as User);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const bankConnection = searchParams.get("bank_connection");
    if (bankConnection === "complete") {
      const token = TokenManager.getToken();
      if (token) {
        AuthService.getMe(token).then((response) => {
          if (response && !("error" in response)) {
            setUser(response as User);
          }
        });
      }
    }
  }, [searchParams]);

  const handleConnectBank = () => {
    setStep("bank_connection");
    open();
  };

  const hasBankAccount = user?.bankAccount?.id;

  if (isLoading) {
    return (
      <CardAuth title="Subscriptions" description="Loading...">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </CardAuth>
    );
  }

  if (error) {
    return (
      <CardAuth title="Subscriptions" description={error}>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </CardAuth>
    );
  }

  return (
    <CardAuth
      title="Connected Banks"
      description="Manage your connected bank accounts for automated contributions and payouts."
    >
      <div className="space-y-6">
        {hasBankAccount ? (
          <div className="space-y-4">
            <div className="border border-secondary-100 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BankIcon className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-text-900">Bank Account</p>
                  <p className="text-sm text-text-400">
                    Connected on {user.bankAccount?.createdAt 
                      ? new Date(user.bankAccount.createdAt).toLocaleDateString()
                      : 'Unknown date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
            </div>
            <Button
              onClick={handleConnectBank}
              text="Add Another Bank Account"
              variant="secondary"
              className="w-full"
              showArrow={false}
            />
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <BankIcon className="w-16 h-16 text-text-400 mx-auto" />
            <div>
              <p className="text-text-900 font-semibold mb-2">No Bank Accounts Connected</p>
              <p className="text-text-400 text-sm mb-6">
                Connect your bank account to enable automated contributions and payouts.
              </p>
            </div>
            <Button
              onClick={handleConnectBank}
              text="Connect Bank Account"
              variant="primary"
              className="w-full"
              showArrow
            />
          </div>
        )}
      </div>
    </CardAuth>
  );
}
