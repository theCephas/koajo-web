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
    children?: ReactNode;
    autoFocus?: boolean;
    medium?: boolean;
    hideValue?: boolean;
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
}: FieldProps) => {
    const [visiblePassword, setVisiblePassword] = useState<boolean>(false);

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
            <div className={styles.wrap}>
                {textarea ? (
                    <textarea
                        className={styles.textarea}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        autoFocus={autoFocus}
                    ></textarea>
                ) : (
                    <input
                        className={cn(styles.input, inputClassName)}
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
                    />
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
