"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./Export.module.sass";
import Select from "@/components2/usefull/Select";
import Icon from "@/components2/usefull/Icon";

type ExportProps = {
    onConfirm?: () => void;
    result?: boolean;
    onDone?: () => void;
};

const Export = ({ onConfirm, result, onDone }: ExportProps) => {
    const files = [
        {
            title: "PDF",
            value: "pdf",
        },
        {
            title: "DOC",
            value: "doc",
        },
    ];

    const [exportData, setExportData] = useState<string>(files[0].value);

    const handleChange = (value: string) => setExportData(value);

    return result ? (
        <div className={styles.success}>
            <div className={styles.icon}>
                <Icon name="check-circle" size="51" />
            </div>
            <div className={styles.title}>Export Sucessfully</div>
            <div className={styles.info}>
                Please check your document, and open your document file
            </div>
            <button
                className={cn("button-wide", styles.button)}
                onClick={onDone}
            >
                Done
            </button>
        </div>
    ) : (
        <div className={styles.export}>
            <div className={styles.title}>Export Data</div>
            <div className={styles.info}>export data into document form</div>
            <Select
                className={styles.select}
                label="Choose type of document"
                value={exportData}
                onChange={handleChange}
                options={files}
            />
            <button
                className={cn("button-wide", styles.button)}
                onClick={onConfirm}
            >
                Confirm
            </button>
        </div>
    );
};

export default Export;
