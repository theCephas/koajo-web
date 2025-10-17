
// import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import styles from "./ExpenseAnalysis.module.sass";
import Analysis from "@/components2/usefull/Analysis";

type ExpenseAnalysisType = {
    name: string;
    value: number;
};

type ExpenseAnalysisProps = {
    items: ExpenseAnalysisType[];
    expense?: string;
    row?: boolean;
};

const ExpenseAnalysis = ({ items, expense, row }: ExpenseAnalysisProps) => {
    return (
        <Analysis
            title="Circle Duration"
            tooltip="Small description"
            price="$2,056,123"
            percent={-2.1}
            expense={expense}
            row={row}
        >
             <div className={styles.chart}>
           {/*     <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={730}
                        height={250}
                        data={items}
                        margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="color"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#B2E0FF"
                                    stopOpacity={0.9}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#B2E0FF"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide={true} />
                        <YAxis hide={true} />
                        <Area
                            dot={{
                                stroke: "#4D81E7",
                                fill: "#fff",
                                strokeWidth: 3,
                                r: 5,
                            }}
                            type="linear"
                            dataKey="value"
                            stroke="#4D81E7"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#color)"
                        />
                    </AreaChart>
                </ResponsiveContainer> */}
            </div>
        </Analysis>
    );
};

export default ExpenseAnalysis;
