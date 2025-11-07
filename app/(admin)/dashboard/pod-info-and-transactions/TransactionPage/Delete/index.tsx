"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./Delete.module.sass";
import Modal from "@/components2/usefull/Modal";
import Icon from "@/components2/usefull/Icon";


const Delete = () => {
    const [visibleModal, setVisibleModal] = useState<boolean>(false);

    return (
        <>
            <button
                className={styles.action}
                onClick={() => setVisibleModal(true)}
            >
                <Icon name="trash" size="20" />
            </button>
            <Modal
                className={styles.modal}
                closeClassName={styles.close}
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
                hideClose
            >
                <div className={styles.icon}>
                    <Icon name="trash" size="51" />
                </div>
                <div className={styles.title}>Delete Transaction ?</div>
                <div className={styles.info}>
                    Are you sure you want to delete this transaction history?
                </div>
                <div className={styles.btns}>
                    <button
                        className={cn("button-stroke", styles.button)}
                        onClick={() => setVisibleModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className={cn("button", styles.button)}
                        onClick={() => setVisibleModal(false)}
                    >
                        Yes
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Delete;
