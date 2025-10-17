import { ReactNode } from "react";
import { StripeProvider } from "@/lib/stripe-provider";

interface KycLayoutProps {
  children: ReactNode;
}

export default function KycLayout({ children }: KycLayoutProps) {
  return (
    <StripeProvider>
      {children}
    </StripeProvider>
  );
}
