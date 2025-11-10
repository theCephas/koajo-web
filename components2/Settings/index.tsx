"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import cn from "clsx";
import styles from "./Settings.module.sass";
import Card from "@/components2/usefull/Card";
import Icon from "@/components2/usefull/Icon";
import { useDashboard } from "@/lib/provider-dashboard";

const navigation = [
    {
        title: "Personal Information",
        icon: "user",
        url: "/settings",
    },
    {
        title: "Preferences",
        icon: "preferences",
        url: "/settings/preferences",
    },
    {
        title: "Security",
        icon: "security",
        url: "/settings/security",
    },
    {
        title: "Log Out",
        icon: "logout",
        url: "/auth/login",
        isLogout: true,
    },
];

type SettingsProps = {
    title: string;
    tooltip: string;
    children: React.ReactNode;
};

const Settings = ({ title, tooltip, children }: SettingsProps) => {
    const pathname = usePathname();
    const { logout } = useDashboard();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
    };

    return (
        <div className={styles.settings}>
            <div className={styles.menu}>
                {navigation.map((link, index) => {
                    if (link.isLogout) {
                        return (
                            <button
                                className={cn(styles.link, {
                                    [styles.active]: pathname === link.url,
                                })}
                                onClick={handleLogout}
                                key={index}
                            >
                                <div className={styles.icon}>
                                    <Icon name={link.icon} size="20" />
                                </div>
                                {link.title}
                                <Icon
                                    className={styles.arrow}
                                    name="arrow-next"
                                    size="20"
                                />
                            </button>
                        );
                    }
                    return (
                        <Link
                            className={cn(styles.link, {
                                [styles.active]: pathname === link.url,
                            })}
                            href={link.url}
                            key={index}
                        >
                            <div className={styles.icon}>
                                <Icon name={link.icon} size="20" />
                            </div>
                            {link.title}
                            <Icon
                                className={styles.arrow}
                                name="arrow-next"
                                size="20"
                            />
                        </Link>
                    );
                })}
            </div>
            <Card className={styles.card} title={title} tooltip={tooltip}>
                <div className={styles.wrap}>{children}</div>
            </Card>
        </div>
    );
};

export default Settings;
