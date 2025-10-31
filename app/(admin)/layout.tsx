"use client";

import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/menory-manager";
import { DashboardProvider } from "@/lib/provider-dashboard";
import { OnboardingProvider } from "@/lib/provider-onboarding";
import Onboarding from "@/components/admin/onbording";
import { ApiErrorClass } from "@/lib/utils/auth";
import type { User } from "@/lib/types/api";

interface AdminLayoutProps {
  children: ReactNode;
}

const resolveApiMessage = (
  message: string | string[] | undefined,
  fallback: string
): string => {
  if (Array.isArray(message)) {
    const first = message.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return first ? first.trim() : fallback;
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return fallback;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const isAuthed = TokenManager.isAuthenticated();
    if (!isAuthed) {
      // router.replace("/auth/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const token = TokenManager.getToken() || undefined;
    if (!token) {
      // Using default DEV token in headers during integration, so we can still proceed if needed.
      // Return here if you want to strictly require a stored token.
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await AuthService.getMe(token);

        if (!isMounted) return;

        if (response && "error" in response) {
          console.error(
            "Failed to fetch profile:",
            resolveApiMessage(response.message, "Unable to fetch profile")
          );
          return;
        }

        TokenManager.updateUserData(response as User);
      } catch (error) {
        if (error instanceof ApiErrorClass) {
          console.error(
            "Profile fetch error:",
            resolveApiMessage(error.message, "Unable to fetch profile")
          );
        } else {
          console.error("Profile fetch error:", error);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!ready) {
    // return null;
  }

  return (
    <DashboardProvider>
      <OnboardingProvider defaultVisible={true}>
        <Onboarding>{children}</Onboarding>
      </OnboardingProvider>
    </DashboardProvider>
  );
}
