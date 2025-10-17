"use client";
import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import millify from "millify";
import styles from "./BalanceAnalytics.module.sass";
import Card from "@/components2/usefull/Card";
import Select from "@/components2/usefull/Select";
import Toggle from "@/components2/Toggle";

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

type BalanceAnalyticsType = {
    name: string;
    value: number;
};

type BalanceAnalyticsProps = {
    items: BalanceAnalyticsType[];
};

const BalanceAnalytics = ({ items }: BalanceAnalyticsProps) => {
    const [duration, setDuration] = useState<string>(durationOptions[0].value);
    const [incomeStatistics, setIncomeStatistics] = useState<boolean>(true);
    const [expenseStatistics, setExpenseStatistics] = useState<boolean>(false);

    const handleChange = (value: string) => setDuration(value);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <div className={styles.tooltipTitle}>Total Income</div>
                    <div className={styles.tooltipValue}>
                        ${payload[0].value}
                    </div>
                </div>
            );
        }

        return null;
    };

    const formatterYAxis = (value: number) => {
        if (value === 0) {
            return "";
        }
        return `$${millify(value)}`;
    };

    return (
        <Card
            className={styles.card}
            title="Balance Analytics"
            tooltip="Small description"
            center={
                <div className={styles.settings}>
                    <Toggle
                        className={styles.toggle}
                        title="Income Statistics"
                        value={incomeStatistics}
                        onChange={() => setIncomeStatistics(!incomeStatistics)}
                    />
                    <Toggle
                        className={styles.toggle}
                        title="Expense Statistics"
                        value={expenseStatistics}
                        onChange={() =>
                            setExpenseStatistics(!expenseStatistics)
                        }
                    />
                </div>
            }
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
            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={500}
                        height={300}
                        data={items}
                        margin={{
                            top: 5,
                            right: 0,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="6 6" stroke="#DCE4E8" />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{
                                fontSize: 12,
                                fontWeight: "400",
                                fill: "#ACB5BB",
                            }}
                            dy={5}
                        />
                        <YAxis
                            tickFormatter={formatterYAxis}
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tick={{
                                fontSize: 12,
                                fontWeight: "400",
                                fill: "#ACB5BB",
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: "#828282",
                                strokeWidth: 1,
                                strokeDasharray: "6 6",
                                fill: "transparent",
                            }}
                        />
                        <Line
                            dot={{
                                stroke: "transparent",
                                fill: "transparent",
                                strokeWidth: 3,
                                r: 6,
                            }}
                            activeDot={{
                                stroke: "#23978D",
                                fill: "#23978D",
                            }}
                            type="linear"
                            dataKey="value"
                            stroke="#31B099"
                            strokeWidth={5}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceAnalytics;
