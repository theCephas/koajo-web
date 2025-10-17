'use client';

import { Bar as RechartsBar, BarProps } from 'recharts';

interface BarFacadeProps extends BarProps {
    // Add any additional props specific to your facade
    className?: string;
}

const BarFacade = ({ className, ...props }: BarFacadeProps) => {
    return (
        <RechartsBar
            className={className}
            {...props}
        />
    );
};

export default BarFacade;

