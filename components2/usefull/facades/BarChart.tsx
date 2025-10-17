'use client';

import React from 'react';
import { BarChart as RechartsBarChart } from 'recharts';

interface BarChartFacadeProps extends React.ComponentProps<typeof RechartsBarChart> {
    // Add any additional props specific to your facade
    className?: string;
    children?: React.ReactNode;
}

const BarChartFacade = ({ className, children, ...props }: BarChartFacadeProps) => {
    return (
        <RechartsBarChart
            className={className}
            {...props}
        >
            {children}
        </RechartsBarChart>
    );
};

export default BarChartFacade;
