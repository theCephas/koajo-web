'use client';

import { CartesianGrid as RechartsCartesianGrid, CartesianGridProps } from 'recharts';

interface CartesianGridFacadeProps extends CartesianGridProps {
    // Add any additional props specific to your facade
    className?: string;
}

const CartesianGridFacade = ({ className, ...props }: CartesianGridFacadeProps) => {
    return (
        <RechartsCartesianGrid
            className={className}
            {...props}
        />
    );
};

export default CartesianGridFacade;

