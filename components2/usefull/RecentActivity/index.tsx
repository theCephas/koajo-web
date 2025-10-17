import styles from "./RecentActivity.module.sass";
import Card from "@/components2/usefull/Card";
import Image from "@/components2/usefull/Image";
import Icon from "@/components2/usefull/Icon";

type ActivityType = {
    id: string;
    title: string;
    price: string;
    description: string;
    time: string;
    image: string;
};

type RecentActivityProps = {
    viewItems?: number;
    items: ActivityType[];
};

const RecentActivity = ({ viewItems, items }: RecentActivityProps) => (
    <Card
        title="Pod Activity"
        tooltip="Recent Pod activity"
    >
        <div className={styles.list}>
            {items.slice(0, viewItems || 5).map((item) => (
                <div className={styles.item} key={item.id}>
                    {/* <div className={styles.logo}>
                        <Image src={item.image} width={24} height={24} alt="" />
                    </div> */}
                    <div className={styles.details}>
                        <div className={styles.line}>
                            <div className={styles.title}>{item.title}</div>
                            <div className={styles.price}>{item.price}</div>
                        </div>
                        <div className={styles.line}>
                            {/* <div className={styles.description}>
                                {item.description}
                            </div> */}
                            <div className={styles.time}>{item.time}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

export default RecentActivity;
