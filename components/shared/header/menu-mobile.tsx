"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useState, useEffect } from "react";
import cn from "clsx";
import Link from "next/link";
import { Button } from "@/components/utils";
import { menuItems } from "@/data/navigation";
import { TokenManager } from "@/lib/utils/memory-manager";

export default function MenuMobile() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount and after storage changes
    const checkAuth = () => {
      setIsAuthenticated(TokenManager.isAuthenticated());
    };

    checkAuth();

    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);

    // Also listen for custom auth events
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Hamburger Button */}
      <Dialog.Trigger asChild>
        <button aria-label="Open menu" className="lg:hidden cursor-pointe">
          <Image
            src="/media/icons/menu.svg"
            alt="Menu"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=closed]:pointer-events-none" />
        <Dialog.Content
          className={cn(
            "fixed top-0 right-0 z-50 size-full min-w-[260px] min-h-fit bg-[image:linear-gradient(250deg,#000_1.2%,#032425_43.67%,#000_96.25%)] flex flex-col",
            "transition-transform duration-300",
            "data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full"
          )}
        >
          <div className="header_container py-7 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
              <Image
                src="/media/icons/logo-light-gradient.svg"
                alt="Koajo Logo"
                width={100}
                height={28}
                className="h-7 w-auto"
              />
            </Link>

            {/* Close Button */}
            <Dialog.Close asChild>
              <button
                aria-label="Close menu"
                className="rounded-full border cursor-pointer"
              >
                <span className="sr-only">Close</span>
                <Image
                  src="/media/icons/close.svg"
                  alt="Close"
                  width={48}
                  height={48}
                  className="size-12 object-contain"
                />
              </button>
            </Dialog.Close>
          </div>

          {/* Menu Items */}
          <nav className="header_container flex flex-col gap-6 ">
            <ul className="flex flex-col gap-4 mb-2.5">
            {menuItems
              .filter((item) => isAuthenticated ? item.label.toLowerCase() !== "login" : true)
              .map((item, i) => (
                <li key={i}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-xl text-text-200 hover:text-primary transition",
                    item.label.toLocaleLowerCase() === "login" && "mt-1"
                  )}
                  onClick={() => setOpen(false)}
                >
                    {item.label}
                  </Link>
                  </li>
                ))}
            </ul>
            {isAuthenticated ? (
              <Button
                href="/dashboard"
                className="w-full"
                text="Go to Dashboard"
                onClick={() => setOpen(false)}
              />
            ) : (
              <Button
                href="/register"
                className="w-full"
                text="Get Started"
                onClick={() => setOpen(false)}
              />
            )}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


