"use client"
import { useState } from "react";
import { default as NextImage, ImageProps } from "next/image";
import cn from "clsx";
import styles from "./Image.module.sass";

const Image = ({ className, alt, ...props }: ImageProps) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <NextImage
            className={cn(styles.image, { [styles.loaded]: loaded }, className)}
            onLoadingComplete={() => setLoaded(true)}
            alt={alt}
            {...props}
        />
    );
};

export default Image;
