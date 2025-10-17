"use client";
import { PlacesType, Tooltip as ReactTooltip, VariantType } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import cn from "clsx";
import styles from "./Tooltip.module.sass";
import Icon from "@/components2/usefull/Icon";
import { generateUid } from "@/lib/utils";

type TooltipProps = {
  className?: string;
  icon?: string;
  content: string;
  place?: PlacesType | undefined;
  variant?: VariantType;
};

const Tooltip = ({ className, icon, content, place, variant = "light" }: TooltipProps) => {
  const uid = generateUid();
  return (
    <>
      <span className={cn("inline-flex ml-1.5", styles.icon, className)}>
        <Icon
          name={icon || "info-circle"}
          size="18"
          data-tooltip-id={`tooltip-${uid}`}
        />
      </span>

      <ReactTooltip
        id={`tooltip-${uid}`}
        className={cn( styles.tooltip)}
        place={place || "bottom"}
        content={content}
        variant={variant}
      />
    </>
  );
};

export default Tooltip;
