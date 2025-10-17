"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import cn from "clsx";
import styles from "./Header.module.sass";
import Logo from "@/components2/usefull/Logo";
import Image from "@/components2/usefull/Image";
import Search from "@/components2/usefull/Search";
import Icon from "@/components2/usefull/Icon";
import Notifications from "./Notifications";

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

  const pathname = usePathname();

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
          <Link className={styles.logout} href="/auth/login">
            Log Out
          </Link>
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
          <Link className={styles.avatar} href="/settings">
            <Image
              src="/media/images/avatar.jpg"
              fill
              style={{ objectFit: "cover" }}
              alt="Avatar"
            />
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
