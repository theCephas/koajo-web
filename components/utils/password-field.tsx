"use client";
import { useState, forwardRef } from "react";
import { Field } from "./field";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { Tooltip } from "react-tooltip";
import * as Toast from "@radix-ui/react-toast";

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
    const [showToast, setShowToast] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " ") {
        e.preventDefault();
      }
    };

    const handleChangeInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.includes(" ")) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          e.target.value = e.target.value.replace(/\s+/g, "");
        }, 1500);
      }
      onChange?.(e);
    };

    return (
      <div className="relative h-full">
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
          onKeyDown={handleKeyDown}
          onChange={handleChangeInternal}
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

        {/* Tooltip */}
        {showToast && (
          <Toast.Provider swipeDirection="up">
            <Toast.Root
              className="text-center rounded-md bg-white p-4 shadow-md data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
              open={true}
            >
              <Toast.Title className="text-sm text-text-500 text-bold">
                Spaces not allowed
              </Toast.Title>
              <Toast.Description className="text-sm text-text-400">
                Removing spaces from password...
              </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="absolute -bottom-25 right-1/2 translate-x-1/2 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
          </Toast.Provider>
        )}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
