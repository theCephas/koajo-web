"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DatePicker from "react-datepicker";
import cn from "clsx";
import styles from "./Navigation.module.sass";
import Icon from "@/components2/usefull/Icon";

const navigation = [
  {
    title: "Overview",
    url: "/dashboard",
  },
  {
    title: "Pod Information & Transactions",
    url: "/dashboard/pod-info-and-transactions",
  },
];

type NavigationProps = Record<string, never>;

const Navigation = ({}: NavigationProps) => {
  const pathname = usePathname();

  const [startDate, setStartDate] = useState<Date>(new Date());

  return (
    <div className={styles.navigation}>
      <nav className={styles.menu}>
        {navigation.map((link, index) => (
          <Link
            className={cn(styles.link, {
              [styles.active]: pathname === link.url,
            })}
            href={link.url}
            key={index}
          >
            {link.title}
          </Link>
        ))}
      </nav>
      <div className={styles.date}>
        <DatePicker
          dateFormat="MMM dd,yyyy"
          selected={startDate}
          onChange={(date) => date && setStartDate(date)}
        />
        <Icon name="calendar" />
      </div>
    </div>
  );
};

export default Navigation;
