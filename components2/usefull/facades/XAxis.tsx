'use client';

import { XAxis as RechartsXAxis, XAxisProps } from 'recharts';

interface XAxisFacadeProps extends XAxisProps {
    // Add any additional props specific to your facade
    className?: string;
}

const XAxisFacade = ({ className, ...props }: XAxisFacadeProps) => {
    return (
        <RechartsXAxis
            className={className}
            {...props}
        />
    );
};

export default XAxisFacade;

