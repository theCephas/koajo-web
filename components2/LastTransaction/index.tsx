"use client";
import { useState } from "react";
import styles from "./LastTransaction.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";
import Transaction from "./Transaction";

const durationOptions = [
    {
        title: "Monthly",
        value: "monthly",
    },
    {
        title: "Annually",
        value: "annually",
    },
];

type LastTransactionType = {
    id: string;
    name: string;
    image: string;
    business: string;
    date: string;
    time: string;
    amount: string;
    status: string;
};

type LastTransactionProps = {
    items: LastTransactionType[];
};

const LastTransaction = ({ items }: LastTransactionProps) => {
    const [duration, setDuration] = useState<string>(durationOptions[0].value);

    const handleChange = (value: string) => setDuration(value);

    return (
        <Card
            title="Last Transaction"
            tooltip="Small description"
            right={
                <Select
                    className={styles.select}
                    value={duration}
                    onChange={handleChange}
                    options={durationOptions}
                    small
                />
            }
        >
            <div className={styles.transactions}>
                <div className={styles.table}>
                    {items.map((transaction) => (
                        <Transaction item={transaction} key={transaction.id} />
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default LastTransaction;
