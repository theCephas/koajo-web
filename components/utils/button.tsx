"use client";

import React from "react";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import ArrowRightIcon from "@/public/media/icons/arrow-right.svg";
import cn from "clsx";
import Image from "next/image";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  linkClassName?: string;
  showArrow?: boolean;
  icon?: "arrow-right" | "plus" | React.ReactNode;
  variant?: "primary" | "secondary" | "gradient";
  href?: string;
  type?: "button" | "submit" | "reset";
  text?: string;
  disabled?: boolean;
}

export function Button({
  className = "",
  linkClassName = "",
  showArrow = true,
  icon = "arrow-right",
  variant = "primary",
  href,
  type = "button",
  text = "",
  disabled = false,
  ...props
}: ButtonProps) {
  // Base button classes
  const baseClasses =
    "inline-flex items-center justify-center gap-2.5 px-6 py-3 w-fit rounded-[0.875rem] text-sm lg:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";

  // Variant-specific classes
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 ",
    secondary:
      "bg-white border border-text-200 text-text-500 hover:text-text-500/60",
    gradient:
      "bg-[image:linear-gradient(107deg,#FD8B51_-2.13%,#469DA3_49.87%,#FD8B51_94.01%)] text-white hover:bg-primary/90",
  };

  // Combine classes
  const buttonClasses = cn(
    baseClasses,
    disabled && "disabled",
    variantClasses[variant],
    className
  );

  const iconJsx = (color: "white" | "dark" = "white") => {
    const colorMap = {
      white: "#fff",
      dark: "#1A1C1E",
    };
    const className = cn("size-6", {
      "[&_path]:stroke-[#1A1C1E]": color === "dark",
      "[&_path]:stroke-[#fff]": color === "white",
    });
    if (icon === "plus") {
      return <PlusIcon color={colorMap[color]} />;
    }
    if (typeof icon !== "string") {
      return <> {icon} </>;
    }
    return <ArrowRightIcon className={className} />;
  };

  // Button content
  const buttonJsx = (
    <button type={type} className={buttonClasses} aria-label={text} disabled={disabled} {...props}>
      {text && <span>{text}</span>}
      {showArrow &&
        iconJsx(["primary", "gradient"].includes(variant) ? "white" : "dark")}
    </button>
  );

  if (href) {
    return <Link href={href} className={linkClassName}>{buttonJsx}</Link>;
  }

  return buttonJsx;
}
