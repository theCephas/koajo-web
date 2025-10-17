'use client';

import { ResponsiveContainer as RechartsResponsiveContainer, ResponsiveContainerProps } from 'recharts';

interface ResponsiveContainerFacadeProps extends ResponsiveContainerProps {
    // Add any additional props specific to your facade
    className?: string;
}

const ResponsiveContainerFacade = ({ className, ...props }: ResponsiveContainerFacadeProps) => {
    return (
        <RechartsResponsiveContainer
            className={className}
            {...props}
        />
    );
};

export default ResponsiveContainerFacade;

