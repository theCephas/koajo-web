"use client";

import { ReactNode } from "react";
import cn from "clsx";
import styles from "./RecentActivity.module.sass";
import Card from "@/components2/usefull/Card";
import Image from "@/components2/usefull/Image";
import Icon from "@/components2/usefull/Icon";
import { useDashboard } from "@/lib/provider-dashboard";
import LockedOverlay from "@/components/admin/locked-overlay";

export type RecentActivityItem = {
    id: string;
    title: string;
    price: string;
    description: string;
    time: string;
    image: string;
};

type RecentActivityProps = {
    viewItems?: number;
    items: RecentActivityItem[];
    footer?: ReactNode;
    emptyPlaceholder?: ReactNode;
};

const RecentActivity = ({
    viewItems,
    items,
    footer,
    emptyPlaceholder,
}: RecentActivityProps) => {
    const visibleItems = items.slice(0, viewItems || 5);
    const { emailVerified } = useDashboard();
    const isLocked = !emailVerified;

    return (
        <div className="relative">
            <Card 
                title="Pod Activity" 
                tooltip="Recent Pod activity"
                className={cn(
                    isLocked &&
                        "[&>div:not(:first-child)]:blur-sm [&>div:not(:first-child)]:select-none [&>div:not(:first-child)]:pointer-events-none"
                )}
            >
            <div className={styles.list}>
                {visibleItems.length === 0 ? (
                    <div className={styles.empty}>
                        {emptyPlaceholder || "No activity yet."}
                    </div>
                ) : (
                    visibleItems.map((item) => (
                        <div className={styles.item} key={item.id}>
                            {/* <div className={styles.logo}>
                                <Image src={item.image} width={24} height={24} alt="" />
                            </div> */}
                            <div className={styles.details}>
                                <div className={styles.line}>
                                    <div className={styles.title}>
                                        {item.title}
                                    </div>
                                    <div className={styles.price}>
                                        {item.price}
                                    </div>
                                </div>
                                <div className={styles.line}>
                                    {/* <div className={styles.description}>
                                        {item.description}
                                    </div> */}
                                    <div className={styles.time}>
                                        {item.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {footer && <div className={styles.footer}>{footer}</div>}
        </Card>
            <LockedOverlay />
        </div>
    );
};

export default RecentActivity;
