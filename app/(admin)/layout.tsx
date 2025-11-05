"use client";

import { ReactNode, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TokenManager } from "@/lib/utils/menory-manager";
import { DashboardProvider } from "@/lib/provider-dashboard";
import { OnboardingProvider } from "@/lib/provider-onboarding";
import Onboarding from "@/components/admin/onbording";
import OnboardingProgressButton from "@/components/admin/onboarding-progress-button";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const isAuthed = TokenManager.isAuthenticated();
    if (!isAuthed) {
      router.replace("/auth/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <DashboardProvider>
      <OnboardingProvider defaultVisible={true}>
        <Onboarding>
          {children}
          <OnboardingProgressButton />
        </Onboarding>
      </OnboardingProvider>
    </DashboardProvider>
  );
}
