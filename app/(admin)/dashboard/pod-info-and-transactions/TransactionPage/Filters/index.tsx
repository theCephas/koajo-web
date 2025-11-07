"use client";
import { useState } from "react";
import styles from "./Filters.module.sass";
import Select from "@/components2/usefull/Select";
import DatePicker from "@/components2/usefull/DatePicker";


export interface FilterOption {
    title: string;
    value: string;
}


const Filters = () => {
    const [transactionType, setTransactionType] = useState<FilterOption["title"]>("");
    const [businessType, setBusinessType] = useState<FilterOption["title"]>("");
    const [statusType, setStatusType] = useState<FilterOption["title"]>("");
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = dateRange;


    const handleChangeTransaction = (value: FilterOption["title"]) =>
        setTransactionType(value);
    const handleChangeBusiness = (value: FilterOption["title"]) => setBusinessType(value);
    const handleChangeStatus = (value: FilterOption["title"]) => setStatusType(value);

    return (
        <div className={styles.filters}>
            <Select
                className={styles.field}
                classToggle={styles.toggleSelect}
                title="Transaction Type"
                value={transactionType || ""}
                onChange={handleChangeTransaction}
                options={transactionOptions}
                medium
            />
            <Select
                className={styles.field}
                classToggle={styles.toggleSelect}
                title="Business type"
                value={businessType || ""}
                onChange={handleChangeBusiness}
                options={businessOptions}
                medium
            />
            <DatePicker
                className={styles.field}
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) => {
                    setDateRange(update);
                }}
                dateFormat="MM.dd.yyyy"
                placeholderText="Date range"
                medium
                icon
            />
            <Select
                className={styles.field}
                classToggle={styles.toggleSelect}
                title="Status"
                value={statusType || ""}
                onChange={handleChangeStatus}
                options={statusOptions}
                medium
            />
        </div>
    );
};


export const transactionOptions: FilterOption[] = [
    {
        title: "Subscribe",
        value: "subscribe",
    },
    {
        title: "Receive",
        value: "receive",
    },
    {
        title: "Transfer",
        value: "transfer",
    },
];

export const businessOptions: FilterOption[] = [
    {
        title: "Software",
        value: "software",
    },
    {
        title: "Freelance platform",
        value: "freelance-platform",
    },
    {
        title: "Coffehouse",
        value: "coffehouse",
    },
    {
        title: "Fast Food Restaurant",
        value: "fast-food-restaurant",
    },
    {
        title: "E-Commerce Company",
        value: "e-commerce-company",
    },
];
export const statusOptions: FilterOption[] = [
    {
        title: "Success",
        value: "success",
    },
    {
        title: "Pending",
        value: "pending",
    },
    {
        title: "Canceled",
        value: "canceled",
    },
];

export default Filters;
