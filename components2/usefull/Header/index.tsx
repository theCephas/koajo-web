"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import cn from "clsx";
import styles from "./Header.module.sass";
import Image from "@/components2/usefull/Image";
import Search from "@/components2/usefull/Search";
import Icon from "@/components2/usefull/Icon";
import Notifications from "./Notifications";
import { useDashboard } from "@/lib/provider-dashboard";
import { getAvatarUrl, getDefaultAvatarUrl } from "@/lib/utils/avatar";

import { notifications } from "@/mocks/notifications";

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  // {
  //     title: "Wallets",
  //     url: "/wallets",
  // },
  {
    title: "Settings",
    url: "/settings",
  },
  {
    title: "Help & Center",
    url: "/help-center",
  },
];

// type HeaderProps = {};

const Header = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [visibleSearch, setVisibleSearch] = useState<boolean>(false);
  const { kycCompleted, logout, user } = useDashboard();

  const pathname = usePathname();

  const avatarUrl = user?.avatarId
    ? getAvatarUrl(user.avatarId)
    : getDefaultAvatarUrl();

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const toggleMenu = () => {
    setVisible(!visible);
    if (visible) {
      enablePageScroll();
    } else {
      disablePageScroll();
    }
  };

  const closeMenu = () => {
    setVisible(false);
    enablePageScroll();
  };

  return (
    <>
      <header className={styles.header}>
        <button
          className={cn(styles.burger, {
            [styles.active]: visible,
          })}
          onClick={toggleMenu}
        >
          <Icon name="burger" />
        </button>
        <div
          className={cn(styles.wrap, {
            [styles.visible]: visible,
          })}
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/media/icons/logo-light-gradient.svg"
              alt="Koajo Logo"
              width={100}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <nav className={styles.navigation}>
            {navigation.map((link, index) => (
              <Link
                className={cn(styles.link, {
                  [styles.active]:
                    pathname === link.url || pathname.startsWith(link.url),
                })}
                href={link.url}
                key={index}
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <button className={styles.logout} onClick={handleLogout}>
            Log Out
          </button>
          <button className={styles.close} onClick={closeMenu}>
            <Icon name="close" />
          </button>
        </div>
        <div className={styles.control}>
          <button
            className={cn(styles.openSearch)}
            onClick={() => setVisibleSearch(true)}
          >
            <Icon name="search" size="22" />
          </button>
          <div
            className={cn(styles.box, {
              [styles.visible]: visibleSearch,
            })}
          >
            <Search
              className={styles.search}
              classInput={styles.input}
              placeholder="Search anything here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={() => console.log("Submit")}
              light
            />
            <button
              className={cn(styles.closeSearch)}
              onClick={() => setVisibleSearch(false)}
            >
              <Icon name="close" size="22" />
            </button>
          </div>
          <Notifications items={notifications} />
          <Link className={cn(styles.avatar, "relative")} href="/settings">
            <Image
              src={avatarUrl}
              fill
              style={{ objectFit: "cover" }}
              alt="Avatar"
            />
            {kycCompleted && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </Link>
        </div>
        <div
          className={cn(styles.overlay, {
            [styles.visible]: visible,
          })}
          onClick={closeMenu}
        ></div>
      </header>
    </>
  );
};

export default Header;
