"use client";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import cn from "clsx";
import styles from "./Search.module.sass";
import Icon from "@/components2/usefull/Icon";

type SearchProps = {
    className?: string;
    classInput?: string;
    placeholder: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onSubmit: FormEventHandler<HTMLFormElement>;
    light?: boolean;
    large?: boolean;
};

const Search = ({
    className,
    classInput,
    placeholder,
    value,
    onChange,
    onSubmit,
    light,
    large,
}: SearchProps) => {
    return (
        <form
            className={cn(
                styles.search,
                { [styles.searchLight]: light, [styles.searchLarge]: large },
                className
            )}
            action=""
            onSubmit={onSubmit}
        >
            <input
                className={cn(styles.input, classInput)}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <button className={styles.button}>
                <Icon name="search" />
            </button>
        </form>
    );
};

export default Search;
