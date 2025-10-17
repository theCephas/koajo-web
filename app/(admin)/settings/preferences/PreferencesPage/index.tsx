"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./PreferencesPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Settings from "@/components2/Settings";
import Select from "@/components2/usefull/Select";
import Toggle from "@/components2/Toggle";

const breadcrumbs = [
    {
        title: "Settings",
        url: "/settings",
    },
    {
        title: "Preferences",
    },
];

const languages = [
    {
        title: "English ( Australia )",
        value: "English",
    },
    {
        title: "German",
        value: "german",
    },
    {
        title: "French",
        value: "french",
    },
];

const colors = [
    {
        title: "Dark blue ( 1C2634 )",
        value: "1C2634",
        color: "#1C2634",
    },
    {
        title: "Blue ( 4D81E7 )",
        value: "4D81E7",
        color: "#4D81E7",
    },
    {
        title: "Green ( 82AD0C )",
        value: "82AD0C",
        color: "#82AD0C",
    },
];


const PreferencesPage = () => {
    const [language, setLanguage] = useState<string>(languages[0].value);
    const [color, setColor] = useState<string>(colors[0].value);
    const [updateSystems, setUpdateSystems] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<boolean>(true);
    const [emailNotification, setEmailNotification] = useState<boolean>(true);

    const handleChangeLanguage = (value: string) => setLanguage(value);
    const handleChangeColor = (value: string) => setColor(value);

    const notifications = [
        {
            title: "Update Systems",
            content: "let me know if there is a new product update",
            value: updateSystems,
            setValue: setUpdateSystems,
        },
        {
            title: "Transactions",
            content:
                "tell me about the information after making the transaction",
            value: transactions,
            setValue: setTransactions,
        },
        {
            title: "Email Notification",
            content: "notify me of all notifications via email",
            value: emailNotification,
            setValue: setEmailNotification,
        },
    ];

    return (
        <Layout title="Settings" breadcrumbs={breadcrumbs}>
            <Settings title="Preferences" tooltip="Small description">
                <Select
                    className={styles.select}
                    label="Language"
                    value={language}
                    onChange={handleChangeLanguage}
                    options={languages}
                />
                <Select
                    className={styles.select}
                    label="Color themes"
                    value={color}
                    onChange={handleChangeColor}
                    options={colors}
                />
                <div className={styles.notifications}>
                    <div className={styles.label}>Notification</div>
                    <div className={styles.list}>
                        {notifications.map((notification, index) => (
                            <div className={styles.notification} key={index}>
                                <div className={styles.box}>
                                    <div className={styles.title}>
                                        {notification.title}
                                    </div>
                                    <div className={styles.content}>
                                        {notification.content}
                                    </div>
                                </div>
                                <Toggle
                                    className={styles.toggle}
                                    value={notification.value}
                                    onChange={() =>
                                        notification.setValue(
                                            !notification.value
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.btns}>
                    <button className={cn("button-stroke", styles.button)}>
                        Cancel
                    </button>
                    <button className={cn("button", styles.button)}>Yes</button>
                </div>
            </Settings>
        </Layout>
    );
};

export default PreferencesPage;
