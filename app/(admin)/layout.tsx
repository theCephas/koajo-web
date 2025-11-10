"use client";

import { ReactNode, useLayoutEffect, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TokenManager } from "@/lib/utils/memory-manager";
import { DashboardProvider } from "@/lib/provider-dashboard";
import { OnboardingProvider } from "@/lib/provider-onboarding";
import Onboarding from "@/components/admin/onbording";
import OnboardingProgressButton from "@/components/admin/onboarding-progress-button";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const checkAuth = useCallback(() => {
    const isAuthed = TokenManager.isAuthenticated();
    if (!isAuthed) {
      setReady(false);
      router.replace("/auth/login");
      return false;
    }
    return true;
  }, [router]);

  useLayoutEffect(() => {
    if (checkAuth()) {
      setReady(true);
    }
  }, [checkAuth]);

  useEffect(() => {
    if (checkAuth()) {
      setReady(true);
    }
  }, [pathname, checkAuth]);

  if (!ready) {
    return null;
  }

  return (
    <DashboardProvider>
      <OnboardingProvider>
        <Onboarding>
          {children}
          <OnboardingProgressButton />
        </Onboarding>
      </OnboardingProvider>
    </DashboardProvider>
  );
}
