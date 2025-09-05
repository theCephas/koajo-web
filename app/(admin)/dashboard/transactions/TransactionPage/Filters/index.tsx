"use client";
import { useState } from "react";
import styles from "./Filters.module.sass";
import Select from "@/components2/usefull/Select";
import DatePicker from "@/components2/usefull/DatePicker";

type FiltersProps = {};

const Filters = ({}: FiltersProps) => {
    const [typeTransaction, setTypeTransaction] = useState<string>("");
    const [typeBusiness, setTypeBusiness] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const typeTransactionOptions = [
        {
            title: "Subscribe",
            value: "subscribe",
        },
        {
            title: "Receive",
            value: "teceive",
        },
        {
            title: "Transfer",
            value: "transfer",
        },
    ];

    const typeBusinessOptions = [
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
    const statusOptions = [
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

    const handleChangeTransaction = (value: string) =>
        setTypeTransaction(value);
    const handleChangeBusiness = (value: string) => setTypeBusiness(value);
    const handleChangeStatus = (value: string) => setStatus(value);

    return (
        <div className={styles.filters}>
            <Select
                className={styles.field}
                classToggle={styles.toggleSelect}
                title="Transaction Type"
                value={typeTransaction}
                onChange={handleChangeTransaction}
                options={typeTransactionOptions}
                medium
            />
            <Select
                className={styles.field}
                classToggle={styles.toggleSelect}
                title="Business type"
                value={typeBusiness}
                onChange={handleChangeBusiness}
                options={typeBusinessOptions}
                medium
            />
            <DatePicker
                className={styles.field}
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update: any) => {
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
                value={status}
                onChange={handleChangeStatus}
                options={statusOptions}
                medium
            />
        </div>
    );
};

export default Filters;
