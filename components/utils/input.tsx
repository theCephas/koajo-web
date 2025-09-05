import { forwardRef, InputHTMLAttributes } from "react";
import cn from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full px-6 py-4 border border-text-200 rounded-2xl focus:outline-none focus:ring focus:ring-primary/50 transition-all",
          "text-text-500 placeholder:text-text-400 text-sm font-medium",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
