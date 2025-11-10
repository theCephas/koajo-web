"use client";
import { ChangeEventHandler, ReactNode, useState } from "react";
import cn from "clsx";
import styles from "./Field.module.sass";
import Icon from "@/components2/usefull/Icon";

type FieldProps = {
  className?: string;
  inputClassName?: string;
  label?: string;
  iconAfter?: string;
  iconBefore?: string;
  textarea?: boolean;
  type?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  component?: ReactNode;
  componentPosition?: "prefix" | "suffix";
  autoFocus?: boolean;
  medium?: boolean;
  hideValue?: boolean;
  disabled?: boolean;
};

const Field = ({
  className,
  inputClassName,
  label,
  iconAfter,
  iconBefore,
  textarea,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
  medium,
  hideValue,
  disabled,
  component,
  componentPosition = "suffix",
}: FieldProps) => {
  const [visiblePassword, setVisiblePassword] = useState<boolean>(false);
  const hasPrefix = component && componentPosition === "prefix";
  const hasSuffix = component && componentPosition === "suffix";

  return (
    <div
      className={cn(
        styles.field,
        {
          [styles.fieldTextarea]: textarea,
          [styles.fieldPassword]: type === "password",
          [styles.fieldMedium]: medium,
          [styles.fieldIconAfter]: iconAfter,
          [styles.fieldIconBefore]: iconBefore,
        },
        className
      )}
    >
      {label && <div className={styles.label}>{label}</div>}
      <div
        className={cn(
          styles.wrap,
          disabled && " bg-gray-200/7 cursor-not-allowed"
        )}
      >
        {component && componentPosition === "prefix" && (
          <div
            className={cn(styles.prefix, iconBefore && styles.prefixWithIcon)}
          >
            {component}
          </div>
        )}
        {textarea ? (
          <textarea
            className={cn(
              styles.textarea,
              hasPrefix && styles.inputWithPrefix,
              hasSuffix && styles.inputWithSuffix,
              disabled && "opacity-35"
            )}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            disabled={disabled}
          ></textarea>
        ) : (
          <input
            className={cn(
              styles.input,
              inputClassName,
              hasPrefix && styles.inputWithPrefix,
              hasSuffix && styles.inputWithSuffix,
              disabled && "opacity-35"
            )}
            type={
              (type === "password" &&
                (visiblePassword ? "text" : "password")) ||
              type ||
              "text"
            }
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            disabled={disabled}
          />
        )}
        {component && componentPosition === "suffix" && (
          <div className={cn(styles.suffix)}>{component}</div>
        )}
        {type === "password" && !hideValue && (
          <button
            className={styles.view}
            type="button"
            onClick={() => setVisiblePassword(!visiblePassword)}
          >
            <Icon name={visiblePassword ? "eye" : "eye-slash"} />
          </button>
        )}
        {(iconAfter || iconBefore) && (
          <div className={styles.icon}>
            <Icon name={iconAfter || iconBefore || ""} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Field;
