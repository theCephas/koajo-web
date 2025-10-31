import { ReactNode } from "react";
import { StripeProvider } from "@/lib/provider-stripe";

interface KycLayoutProps {
  children: ReactNode;
}

export default function KycLayout({ children }: KycLayoutProps) {
  return (
    <>{children}</>
  );
}
