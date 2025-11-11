import Image from "next/image";
import cn from "clsx";
import Link from "next/link";
import MenuMobile from "./menu-mobile";
import { menuItems } from "@/data/navigation";
import { Button } from "@/components/utils";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const loginItem = menuItems.find( 
    (item) => item.label.toLowerCase() === "login"
  );

  return (
    <header
      className={cn(
        `
        fixed
        top-0
        left-0
        z-50
        w-full
        shadow-[0px_18px_84px_-20px_rgba(0,0,0,0.04)]
        bg-white
      `,
        className
      )}
    >
      <div className="header_container py-7 flex justify-between items-center gap-9">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/media/icons/logo-dark-gradient.svg"
            alt="Koajo Logo"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </Link>

        {/* Menu */}
        <ul className="hidden lg:flex items-center gap-8">
          {menuItems.map(
            (item, index) =>
              item.label.toLowerCase() !== "login" && (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-base text-gray-900 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              )
          )}
        </ul>

        {/* Login  &  CTA Button*/}
        <div className="hidden lg:flex items-center gap-8">
          {loginItem && (
            <Link
              href="/auth/login"
              className="text-base text-gray-900 hover:text-primary transition-colors"
            >
              Login
            </Link>
          )}
          <Button href="/register" text="Get Started" />
        </div>

        <MenuMobile />
      </div>
    </header>
  );
}
