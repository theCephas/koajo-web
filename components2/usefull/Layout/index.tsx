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
import AnnouncementBar from "@/components/admin/announcement-bar";
import { useDashboard } from "@/lib/provider-dashboard";

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
  const { emailVerified, kycCompleted } = useDashboard();

  const getAnnouncement = () => {
    if (!emailVerified) {
      return {
        type: "warning" as const,
        message: "Verify your email to activate your account",
      };
    }
    if (!kycCompleted) {
      return {
        type: "warning" as const,
        message: "Complete KYC verification to join pods",
      };
    }
    return null;
  };

  const announcement = getAnnouncement();

 
  useEffect(() => {
    // clearQueueScrollLocks();
    enablePageScroll();
  }, [pathname]);


  return (
    <div className={styles.layout}>
      <div className={cn(styles.head, classHead)}>
        <div className={cn("page_dashboard_container", styles.container)}>
          <Header />
           {/* Announcement Bar */}
        {announcement && (
          <div className="mb-6">
            <AnnouncementBar
              type={announcement.type}
              message={announcement.message}
              // onClose={() => {
              //   if (!emailVerified) return;
              // }}
            />
          </div>
        )}

          <div className={styles.title}>{title}</div>
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((item, index) => {
              const trimmedTitle = item.title.replace("/", "").trim();
            
              return item.url ? (
                <Link className={cn(styles.link, "flex items-center")} href={item.url} key={index}>
                  {" "}{index !== 0 && <><Icon name="arrow-next" size="12" />{" "}</>}
                  {trimmedTitle}{index < breadcrumbs.length - 1 }
                </Link>
              ) : (
                <div className={styles.text} key={index}>
                  {trimmedTitle}{index < breadcrumbs.length - 1}
                </div>
              )
            })}
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
