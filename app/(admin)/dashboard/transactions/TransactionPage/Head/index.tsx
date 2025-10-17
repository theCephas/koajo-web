"use client";
import { Dispatch, SetStateAction, useState } from "react";
import cn from "clsx";
import styles from "./Head.module.sass";
import Search from "@/components2/usefull/Search";
import Icon from "@/components2/usefull/Icon";
import Modal from "@/components2/usefull/Modal";
import Export from "../Export";

type HeadProps = {
    search: string;
    setSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onFilter: () => void;
    visible: boolean;
};

const Head = ({
    search,
    setSearch,
    onSubmit,
    onFilter,
    visible,
}: HeadProps) => {
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [result, setResult] = useState<boolean>(false);

    const handleClick = () => {
        setVisibleModal(true);
        setResult(false);
    };

    return (
        <>
            <div className={styles.head}>
                <Search
                    className={styles.search}
                    classInput={styles.input}
                    placeholder="Search for transaction here"
                    value={search}
                    onChange={setSearch}
                    onSubmit={onSubmit}
                />
                <div className={styles.btns}>
                    <button
                        className={cn("button-stroke", styles.button, {
                            [styles.active]: visible,
                        })}
                        onClick={onFilter}
                    >
                        <Icon name="filter" />
                        <span>Filter</span>
                    </button>
                    <button
                        className={cn("button-stroke", styles.button)}
                        onClick={handleClick}
                    >
                        <Icon name="export" />
                        <span>Export</span>
                    </button>
                </div>
            </div>
            <Modal
                className={styles.modal}
                closeClassName={styles.close}
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
                hideClose={result}
            >
                <Export
                    onConfirm={() => setResult(true)}
                    result={result}
                    onDone={() => setVisibleModal(false)}
                />
            </Modal>
        </>
    );
};

export default Head;
