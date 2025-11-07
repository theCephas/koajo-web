"use client";
import { useState, forwardRef, useEffect } from "react";
import { Field } from "./field";
import cn from "clsx";
import * as Toast from "@radix-ui/react-toast";
import USFlagIcon from "@/public/media/icons/flag-usa.svg";

interface PhoneNumberFieldProps {
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

export const PhoneNumberField = forwardRef<HTMLInputElement, PhoneNumberFieldProps>(
  (
    {
      name,
      label,
      placeholder = "(650) 555-1234",
      required = false,
      className,
      labelClassName,
      inputClassName,
      errorClassName,
      error,
      value,
      onChange,
      disabled = false,
      ...otherProps
    },
    ref
  ) => {
    const [showToast, setShowToast] = useState(false);
    const [localValue, setLocalValue] = useState("");
    const [isMetaKeyPressed, setIsMetaKeyPressed] = useState(false);
    const countryCode = "+1";

    // Sync local value with external value
    useEffect(() => {
      console.log("phone number field value", value);
      if (value) {
        // Convert stored value (digits only) to formatted display
        const digitsOnly = value.replace(/\D/g, "");
        setLocalValue(formatPhoneNumber(digitsOnly));
      }
      console.log("phone number field local value", localValue);
    }, [value, localValue]);

    const formatPhoneNumber = (phone: string): string => {
      // Remove all non-digit characters
      const digits = phone.replace(/\D/g, "");
      
      // Format as (XXX) XXX-XXXX
      if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      }
    };

    const handleChangeInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Check if user is trying to enter non-digit characters
      // const hasNonDigit = /[^\d() -]/.test(inputValue);
      // if (hasNonDigit) {
      //   setShowToast(true);
      //   setTimeout(() => setShowToast(false), 1500);
      //   return;
      // }

      // Format the phone number for display
      const digitsOnly = inputValue.replace(/\D/g, "");
      
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      const formattedValue = formatPhoneNumber(limitedDigits);
      setLocalValue(formattedValue);

      // Create a synthetic event with the numeric value (country code + digits)
      const numericValue = countryCode + limitedDigits;
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numericValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(syntheticEvent);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow clipboard operations (copy, paste, cut, select all, etc.)
      if (e.ctrlKey || e.metaKey) {
        setIsMetaKeyPressed(true);
        // Allow Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut), Ctrl+A (Select All), Ctrl+Z (Undo)
        if (["c", "v", "x", "a", "z", "y", "r", "p", "t"].includes(e.key.toLowerCase())) {
          return;
        }
      }
      
      // Allow backspace, delete, tab, escape, enter, and arrow keys
      if (
        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(
          e.key
        )
      ) {
        return;
      }
      
      // Allow digits, parentheses, space, and hyphen
      if (!/[\d() \-]/.test(e.key)) {
        if (isMetaKeyPressed) {
          setIsMetaKeyPressed(false);
          return;
        }
        setShowToast(true);
        setTimeout(() => {
          Promise.resolve().then(() => setShowToast(false));
        }, 2500);
        e.preventDefault();
      }
    };

    const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
      // Get the input element
      const inputElement = e.currentTarget as HTMLInputElement;
      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;
      
      // Get the selected text from the input
      const selectedText = inputElement.value.substring(start, end);
      
      // If there's selected text, use it; otherwise use the full value
      const textToCopy = selectedText || inputElement.value;
      
      // Extract only digits (remove formatting)
      const digitsOnly = textToCopy.replace(/\D/g, "");
      
      // Set the clipboard data with only digits
      e.clipboardData.setData("text/plain", digitsOnly);
      e.preventDefault();
    };

    return (
      <div className="relative h-full">
        <Field
          ref={ref}
          name={name}
          label={label}
          placeholder={placeholder}
          type="tel"
          required={required}
          className={className}
          labelClassName={labelClassName}
          inputClassName={cn("pl-15", inputClassName)}
          errorClassName={errorClassName}
          error={error}
          value={localValue}
          onKeyDown={handleKeyDown}
          onCopy={handleCopy}
          onChange={handleChangeInternal}
          disabled={disabled}
          chlidrenPosition="left"
          showError={true}
          {...otherProps}
        >
          {/* Country Code Selector with Flag */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <div className="flex items-center gap-1">
                <USFlagIcon
                className="rounded-sm w-5 h-4"
              />
              <span className="text-text-400 text-sm font-medium">{countryCode}</span>
            </div>
          </div>
        </Field>

        {/* Toast notification */}
        {showToast && (
          <Toast.Provider swipeDirection="up">
            <Toast.Root
              className="text-center rounded-md bg-white p-4 shadow-md data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
              open={true}
            >
              <Toast.Title className="text-sm text-text-500 text-bold">
                Invalid character
              </Toast.Title>
              <Toast.Description className="text-sm text-text-400">
                Only digits are allowed
              </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="absolute -bottom-25 right-1/2 translate-x-1/2 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
          </Toast.Provider>
        )}
      </div>
    );
  }
);

PhoneNumberField.displayName = "PhoneNumberField";

