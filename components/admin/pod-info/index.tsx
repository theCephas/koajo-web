"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import cn from "clsx";
import styles from "./pod-info.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";
import { Button } from "@/components/utils";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";

const cards = [
  {
    title: "#94044940",
    value: "94044940",
  },
  {
    title: "#42344234",
    value: "42344234",
  },
  {
    title: "#12311231",
    value: "12311231",
  },
  {
    title: "#56435643",
    value: "56435643",
  },
];

type PodInfoProps = {
  percent?: number;
};

const PodInfo = ({}: PodInfoProps) => {
  const router = useRouter();
  const { emailVerified, kycCompleted, kycStatus } = useDashboard();
  const [card, setCard] = useState<string>(cards[0].value);

  const handleChange = (value: string) => setCard(value);

  const getButtonProps = () => {
    if (!emailVerified) {
      return {
        text: "Complete KYC",
        disabled: true,
        onClick: () => {},
      };
    }

    if (!kycCompleted) {
      const kycFailed = kycStatus === null || kycStatus === "document_verified";
      return {
        text: kycFailed ? "Retry KYC" : "Complete KYC",
        disabled: false,
        onClick: () => router.push("/register/kyc"),
        href: "/register/kyc",
      };
    }

    if (kycCompleted) {
      return {
        text: "Connect Bank",
        disabled: false,
        onClick: () => {
          
          // TODO: Navigate to bank connection
        },
      };
    }

    return {
      text: "Join More Pods",
      disabled: false,
      onClick: () => {},
    };
  };

  const buttonProps = getButtonProps();
  const isLocked = !emailVerified;

  return (
      <Card
        title="Current Pod"
        tooltip="The pod your are currently viewing"
        right={
          <Select
            className={styles.select}
            titlePrefix="ID:"
            value={card}
            onChange={handleChange}
            options={cards}
            small
          />
        }
      >
            <div className="relative">

        <div
          className={cn(
            styles.price,
            "text-transparent bg-clip-text bg-[image:linear-gradient(107deg,#FD8B51_-2.13%,_#469DA3_49.87%,_#FD8B51_94.01%)]",
            isLocked && "blur-sm select-none pointer-events-none"
          )}
        >
          No Pods Found
        </div>        {isLocked && <LockedOverlay />}
  </div>

        <Button
          text={buttonProps.text}
          className="w-full mt-4"
          disabled={buttonProps.disabled}
          onClick={buttonProps.onClick}
        />
      </Card>
  );
};

export default PodInfo;
