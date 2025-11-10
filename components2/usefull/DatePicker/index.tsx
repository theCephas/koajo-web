import DatePicker from "react-datepicker";
import cn from "clsx";
import styles from "./DatePicker.module.sass";
import Icon from "@/components2/usefull/Icon";
import { DatePickerProps } from "react-datepicker";

export type DateChoiceProps = DatePickerProps;

const DateChoice = ({
    className,
    label,
    selected,
    selectsRange,
    startDate,
    endDate,
    onChange,
    placeholderText,
    dateFormat,
    medium,
    icon,
    disabled,
}: DateChoiceProps & {
    label?: string;
    medium?: boolean;
    icon?: boolean;
    disabled?: boolean;
}) => (
    <div
        className={cn(
            styles.date,
            { [styles.dateIcon]: icon, [styles.dateMedium]: medium },
            disabled && "pointer-events-none opacity-50",
            className
        )}
    >
        {label && <div className={styles.label}>{label}</div>}
        <div className={styles.wrap}>
            {/* <DatePicker
                dateFormat={dateFormat}
                selected={selected}
                selectsRange={selectsRange}
                startDate={startDate}
                endDate={endDate}
                onChange={onChange}
                placeholderText={placeholderText}
                selectsMultiple={undefined}
                disabled={disabled}
            /> */}
            {icon && <Icon name="calendar" />}
        </div>
    </div>
);

export default DateChoice;
