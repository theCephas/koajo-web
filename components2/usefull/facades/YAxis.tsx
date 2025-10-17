'use client';

import { YAxis as RechartsYAxis, YAxisProps } from 'recharts';

interface YAxisFacadeProps extends YAxisProps {
    // Add any additional props specific to your facade
    className?: string;
}

const YAxisFacade = ({ className, ...props }: YAxisFacadeProps) => {
    return (
        <RechartsYAxis
            className={className}
            {...props}
        />
    );
};

export default YAxisFacade;

