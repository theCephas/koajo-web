"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import cn from "clsx";
import styles from "./pod-info.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";
import { Button, ButtonProps } from "@/components/utils";
import { useDashboard } from "@/lib/provider-dashboard";
import { useOnboarding } from "@/lib/provider-onboarding";
import LockedOverlay from "@/components/admin/locked-overlay";
import {
  SkeletonBlock,
  SkeletonLine,
} from "@/components/admin/dashboard-skeletons";

type PodInfoProps = {
  percent?: number;
};

const PodInfo = ({}: PodInfoProps) => {
  const router = useRouter();
  const {
    emailVerified,
    kycCompleted,
    kycStatus,
    bankConnected,
    pods,
    currentPod,
    setCurrentPod,
    hasPods,
    podsLoading,
    userLoading,
  } = useDashboard();
  const isLoading = podsLoading || userLoading;
  const { open, setStep } = useOnboarding();
  const isLocked = !emailVerified;

  // Create pod options for the selector
  const podOptions = useMemo(() => {
    return pods.map((pod) => ({
      title: `Pod #${pod.podId.slice(0, 8)}`,
      value: pod.podId,
    }));
  }, [pods]);

  const handlePodChange = (podId: string) => {
    const selected = pods.find((p) => p.podId === podId);
    if (selected) {
      setCurrentPod(selected);
    }
  };

  const getButtonProps = (): ButtonProps => {
    // Step 1: Email & KYC must be completed first
    if (!emailVerified) {
      return {
        text: "Verify Email First",
        disabled: true,
        onClick: () => {},
        variant: "secondary",
      };
    }

    if (!kycCompleted) {
      const kycFailed =
        !kycStatus ||
        (kycStatus.status === "verified" && kycStatus.type === "document");
      return {
        text: kycFailed ? "Retry KYC" : "Complete KYC",
        disabled: false,
        onClick: () => router.push("/register/kyc"),
        href: "/register/kyc",
        variant: "secondary",
      };
    }

    // Step 2: After KYC, connect bank if not connected yet
    if (!bankConnected) {
      return {
        text: "Connect Bank Account",
        disabled: false,
        onClick: () => {
          setStep("bank_connection");
          open();
        },
        variant: "secondary",
      };
    }

    // Step 3: Once bank is connected, enable "Join a Pod"
    return {
      text: "Join a Pod",
      disabled: false,
      onClick: () => {
        setStep("pod_plan_selection");
        open();
      },
      variant: "primary",
    };
  };

  const buttonProps = getButtonProps();

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <Card
      title={hasPods ? `Your Pods (${pods.length})` : "Current Pod"}
      tooltip={
        hasPods ? "Manage your pods and join new ones" : "Join your first pod"
      }
      right={
        isLoading ? (
          <SkeletonLine className="h-5 w-28 rounded-full" />
        ) : hasPods && pods.length > 1 && currentPod ? (
          <Select
            className={styles.select}
            titlePrefix="ID:"
            value={currentPod.podId}
            onChange={handlePodChange}
            options={podOptions}
            small
          />
        ) : null
      }
      className="relative"
    >
      {isLoading ? (
        <div className="space-y-4 mt-2">
          <SkeletonBlock className="h-10 w-2/3 rounded-2xl" />
          <div className="space-y-3">
            <SkeletonLine className="w-3/4" />
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-2/3" />
            <SkeletonLine className="w-1/3" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-2xl" />
        </div>
      ) : hasPods && currentPod ? (
        <>
          <div
            className={cn(
              styles.price,
              "text-transparent bg-clip-text bg-[linear-gradient(107deg,#FD8B51_-2.13%,#469DA3_49.87%,#FD8B51_94.01%)]",
              isLocked && "blur-sm select-none pointer-events-none"
            )}
          >
            {formatCurrency(currentPod.amount)}
          </div>
          {/* <div className="mt-2 text-sm text-gray-600">
            <p>
              <strong>Status:</strong> {currentPod.status}
            </p>
            <p>
              <strong>Members:</strong> {currentPod.orderedMembers?.length || 0}
              /{currentPod.maxMembers}
            </p>
            {currentPod.payoutOrder && (
              <p>
                <strong>Your Position:</strong> #{currentPod.payoutOrder}
              </p>
            )}
            {currentPod.nextPayoutDate && (
              <p>
                <strong>Next Payout:</strong>{" "}
                {new Date(currentPod.nextPayoutDate).toLocaleDateString()}
              </p>
            )}
          </div> */}

          {/* Join More Pods Button */}
          {pods.length >= 1 && (
            <Button
              text="Join More Pods"
              className="w-full mt-4"
              onClick={() => {
                setStep("pod_plan_selection");
                open();
              }}
            />
          )}
        </>
      ) : (
        <>
          <div
            className={cn(
              styles.price,
              "text-transparent bg-clip-text bg-[linear-gradient(107deg,#FD8B51_-2.13%,#469DA3_49.87%,#FD8B51_94.01%)]",
              isLocked && "blur-sm select-none pointer-events-none"
            )}
          >
            No Pods Found
          </div>
          <Button
            text={buttonProps.text}
            className="w-full mt-4"
            disabled={buttonProps.disabled}
            onClick={buttonProps.onClick}
            variant={buttonProps.variant}
          />
        </>
      )}

      <LockedOverlay className="h-[60%]" />
    </Card>
  );
};

export default PodInfo;
