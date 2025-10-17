"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  enablePageScroll,
  // clearQueueScrollLocks
} from "scroll-lock";
import cn from "clsx";
import styles from "./Layout.module.sass";
import Header from "@/components2/usefull/Header";
import Icon from "@/components2/usefull/Icon";

type BreadcrumbsType = {
  title: string;
  url?: string;
};

type LayoutProps = {
  classHead?: string;
  classBody?: string;
  title: string;
  breadcrumbs: BreadcrumbsType[];
  head?: React.ReactNode;
  children: React.ReactNode;
};

const Layout = ({
  classHead,
  classBody,
  title,
  breadcrumbs,
  head,
  children,
}: LayoutProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // clearQueueScrollLocks();
    enablePageScroll();
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <div className={cn(styles.head, classHead)}>
        <div className={cn("page_dashboard_container", styles.container)}>
          <Header />
          <div className={styles.title}>{title}</div>
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((item, index) =>
              item.url ? (
                <Link className={styles.link} href={item.url} key={index}>
                  {item.title}
                </Link>
              ) : (
                <div className={styles.text} key={index}>
                  <Icon name="arrow-next" size="12" />
                  {item.title}
                </div>
              )
            )}
          </div>
          {head}
        </div>
      </div>
      <div className={cn(styles.body, classBody)}>
        <div className={cn("page_dashboard_container", styles.container)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
