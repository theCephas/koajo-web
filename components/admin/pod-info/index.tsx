"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./pod-info.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";
import { Button } from "@/components/utils";

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

const PodInfo = ({ percent }: PodInfoProps) => {
  const [card, setCard] = useState<string>(cards[0].value);

  const handleChange = (value: string) => setCard(value);

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
      <div
        className={cn(
          styles.price,
          "text-transparent bg-clip-text bg-[image:linear-gradient(107deg,#FD8B51_-2.13%,_#469DA3_49.87%,_#FD8B51_94.01%)]"
        )}
      >
        No Pods Found
      </div>
      <Button text="Join More Pods" className="w-full mt-4" />
    </Card>
  );
};

export default PodInfo;
