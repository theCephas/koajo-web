import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Header />
        <main className="mt-header-height px-[3px]">{children}</main>
        <Footer />
    </>
  );
}
