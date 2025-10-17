import type { Metadata } from "next";
import "./globals.css";
import { geistSans } from "./fonts";
import { AuthProvider } from "@/lib/hooks/useAuth";

export const metadata: Metadata = {
  title: "Koajo",
  description: "Koajo is a fintech platform that helps you save money and invest in your future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased transition-all duration-300`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
