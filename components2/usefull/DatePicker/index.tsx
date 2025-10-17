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
}: DateChoiceProps & {
    label?: string;
    medium?: boolean;
    icon?: boolean;
}) => (
    <div
        className={cn(
            styles.date,
            { [styles.dateIcon]: icon, [styles.dateMedium]: medium },
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
            /> */}
            {icon && <Icon name="calendar" />}
        </div>
    </div>
);

export default DateChoice;
