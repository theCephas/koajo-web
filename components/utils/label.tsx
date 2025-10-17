import { ReactNode } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import cn from "clsx";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export function Label({
  htmlFor,
  children,
  className,
  required = false,
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      htmlFor={htmlFor}
      className={cn("text-xs  text-text-300 cursor-pointer", className)}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </LabelPrimitive.Root>
  );
}
