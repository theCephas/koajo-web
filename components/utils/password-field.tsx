"use client";
import { useState, forwardRef } from "react";
import { Field } from "./field";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import cn from "clsx";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  disabled?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      name,
      label,
      placeholder,
      required = false,
      className,
      labelClassName,
      inputClassName,
      errorClassName,
      error,
      value,
      onChange,
      disabled = false,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Field
        ref={ref}
        name={name}
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        required={required}
        className={className}
        labelClassName={labelClassName}
        inputClassName={cn("pr-12", inputClassName)}
        errorClassName={errorClassName}
        error={error}
        value={value}
        onChange={onChange}
        
        disabled={disabled}
      >
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-400)] hover:text-[var(--color-text-500)] disabled:opacity-50"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeNoneIcon className="w-5 h-5" />
          ) : (
            <EyeOpenIcon className="w-5 h-5" />
          )}
        </button>
      </Field>
    );
  }
);

PasswordField.displayName = "PasswordField";
