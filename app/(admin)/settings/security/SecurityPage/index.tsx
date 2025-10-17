"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./SecurityPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Settings from "@/components2/Settings";
import Field from "@/components2/usefull/Field";

const breadcrumbs = [
    {
        title: "Settings",
        url: "/settings",
    },
    {
        title: "Security",
    },
];

// type SecurityPageProps = {};

const SecurityPage = (
    // {}: SecurityPageProps
) => {
    const [oldPassword, setOldPassword] = useState<string>("eeqw567891");
    const [newPassword, setNewPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");

    return (
        <Layout title="Subscription" breadcrumbs={breadcrumbs}>
            <Settings title="Subscription" tooltip="Small description">
                <Field
                    className={styles.field}
                    label="Old Password"
                    type="password"
                    placeholder="Type old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                />
                <Field
                    className={styles.field}
                    label="New Password"
                    type="password"
                    placeholder="Type new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <Field
                    className={styles.field}
                    label="Repeat New Password"
                    type="password"
                    placeholder="Type repeat password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                />
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

export default SecurityPage;
