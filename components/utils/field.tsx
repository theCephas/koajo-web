import { forwardRef, ReactNode, InputHTMLAttributes } from "react";
import { Label } from "./label";
import { Input } from "./input";
import cn from "clsx";
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  showError?: boolean;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  (
    {
      name,
      label,
      placeholder,
      type = "text",
      required = false,
      className,
      labelClassName,
      inputClassName,
      errorClassName,
      error,
      onChange,
      children,
      showError = true,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={name} required={required} className={labelClassName}>
          {label}
        </Label>

        <div className="relative">
          <Input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            className={cn("placeholder:text-text-400/50",
              hasError &&
                "border-red-500 focus:ring-red-500 focus:border-red-500",
              inputClassName
            )}
            onChange={onChange}
            {...props}
          />
          {children}
        </div>

        {hasError && showError && (
          <div
            className={cn(
              "flex items-center gap-2 text-red-500 text-sm",
              errorClassName
            )}
          >
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
