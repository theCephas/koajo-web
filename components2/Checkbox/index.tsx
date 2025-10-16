import cn from "clsx";
import styles from "./Checkbox.module.sass";
import { ChangeEventHandler } from "react";

export type CheckboxProps = {
    className?: string;
    label?: string;
    value: "checked" | "unchecked";
    onChange: ChangeEventHandler<HTMLInputElement>;
};

const Checkbox = ({ className, label, value, onChange }: CheckboxProps) => {
    return (
        <label className={cn(styles.checkbox, className)}>
            <input
                className={styles.input}
                type="checkbox"
                value={value}
                onChange={onChange}
                checked={value === "checked"}
            />
            <span className={styles.inner}>
                <span className={styles.tick}></span>
                {label && <span className={styles.label}>{label}</span>}
            </span>
        </label>
    );
};

export default Checkbox;
