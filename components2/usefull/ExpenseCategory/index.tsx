"use client";
import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import cn from "clsx";
import { useIsServerSide } from "@/lib/hooks/useIsServerSide";
import styles from "./ExpenseCategory.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";

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

type ExpenseCategoryType = {
    name: string;
    value: number;
    color: string;
};

type ExpenseCategoryProps = {
    items: ExpenseCategoryType[];
    column?: boolean;
};

const ExpenseCategory = ({ items, column }: ExpenseCategoryProps) => {
    const [duration, setDuration] = useState<string>(durationOptions[0].value);

    const handleChange = (value: string) => setDuration(value);

    const sum = items.reduce((n, { value }) => n + value, 0);

    const isServerSide = useIsServerSide();
    if (isServerSide) return null;
    return (
        <Card
            title="Circle Duration"
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
            <div className={cn(styles.row, { [styles.rowColumn]: column })}>
                <div className={styles.diagram}>
                    <PieChart className={styles.chart} width={190} height={190}>
                        <Pie
                            data={items}
                            cx={90}
                            cy={90}
                            innerRadius={65}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {items.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={items[index % items.length].color}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                    <div className={styles.box}>
                        <div className={styles.info}>100%</div>
                        <div className={styles.text}>Data Recorded</div>
                    </div>
                </div>
                <div className={styles.legend}>
                    {items.map((item, index) => (
                        <div className={styles.item} key={index}>
                            <div
                                className={styles.color}
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <div className={styles.title}>
                                {item.name}&nbsp; (
                                {((item.value / sum) * 100).toFixed(1)}%)
                            </div>
                            <div className={styles.value}>
                                ${item.value.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default ExpenseCategory;
