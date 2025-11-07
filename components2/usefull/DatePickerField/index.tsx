"use client";

import { ReactNode } from "react";
import cn from "clsx";
import DatePicker from "react-datepicker";
import { DatePickerProps } from "react-datepicker";
import styles from "./DatePickerField.module.sass";
import Icon from "@/components2/usefull/Icon";

type DatePickerFieldProps = DatePickerProps & {
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: boolean;
  medium?: boolean;
  component?: ReactNode;
  componentPosition?: "prefix" | "suffix";
  error?: string;
  showError?: boolean;
};

const DatePickerField = ({
  className,
  label,
  required,
  disabled,
  icon,
  medium,
  component,
  componentPosition = "suffix",
  error,
  showError = true,
  ...props
}: DatePickerFieldProps) => {
  const hasPrefix = component && componentPosition === "prefix";
  const hasSuffix = component && componentPosition === "suffix";
  const hasError = !!error;

  return (
    <div
      className={cn(
        styles.datePickerField,
        {
          [styles.datePickerFieldMedium]: medium,
          [styles.datePickerFieldIcon]: icon,
        },
        className
      )}
    >
      {label && (
        <div className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      )}
      <div className={styles.wrap}>
        {hasPrefix && (
          <div className={cn(styles.prefix)}>{component}</div>
        )}
        <div className={cn(styles.inputWrapper, {
          [styles.inputWithPrefix]: hasPrefix,
          [styles.inputWithSuffix]: hasSuffix,
        }, disabled && "pointer-events-none bg-gray-200/7 cursor-not-allowed" )}>
          <DatePicker
            disabled={disabled}
            wrapperClassName={styles.datePickerWrapper}
            className={cn(styles.input, {
              [styles.inputError]: hasError,
            })}
            {...props}
          />
          {icon && (
            <div className={cn(styles.icon, disabled && "opacity-35" )}>
              <Icon name="calendar" />
            </div>
          )}
        </div>
        {hasSuffix && (
          <div className={cn(styles.suffix)}>{component}</div>
        )}
      </div>
      {hasError && showError && (
        <div className={cn(styles.error)}>
          <div className={styles.errorIcon}>!</div>
          {error}
        </div>
      )}
    </div>
  );
};

export default DatePickerField;