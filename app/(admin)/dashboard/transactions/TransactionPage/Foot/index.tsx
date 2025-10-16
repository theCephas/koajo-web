"use client";
import { useState } from "react";
import styles from "./Foot.module.sass";
import Pagination from "@/components2/Pagination";
import Select from "@/components2/usefull/Select";

const Foot = () => {
    const showOptions = [
        {
            title: "Show 10",
            value: "10",
        },
        {
            title: "Show 20",
            value: "20",
        },
        {
            title: "Show 30",
            value: "30",
        },
    ];

    const [show, setShow] = useState<string>(showOptions[0].value);

    const handleChange = (value: string) => setShow(value);

    return (
        <div className={styles.foot}>
            <Pagination />
            <div className={styles.sorting}>
                <div className={styles.text}>Showing 6 of 50 entries</div>
                <Select
                    className={styles.select}
                    classToggle={styles.toggleSelect}
                    value={show}
                    onChange={handleChange}
                    options={showOptions}
                    medium
                    dropdownUp
                />
            </div>
        </div>
    );
};

export default Foot;
