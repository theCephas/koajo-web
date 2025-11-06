"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from "@/lib/constants/api";
import { TokenManager } from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import type { RegistrationStage } from "@/lib/constants/dashboard";
import type { User } from "@/lib/types/api";
import { setOnboardingPrerequisitesChecker } from "./provider-onboarding";

type DashboardSummary = Record<string, unknown>;

interface DashboardContextValue {
  loading: boolean;
  error: string | null;
  data: DashboardSummary | null;
  refresh: () => Promise<void>;
  registrationStage: RegistrationStage | null;
  setRegistrationStage: (stage: RegistrationStage) => void;
  // User status tracking
  user: User | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  // Computed status
  emailVerified: boolean;
  kycStatus: "document_verified" | "id_number_verified" | "all_verified" | null;
  kycCompleted: boolean;
  bankConnected: boolean;
  setupCompleted: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}

interface DashboardProviderProps {
  children: React.ReactNode;
  autoFetch?: boolean;
}

export function DashboardProvider({ children, autoFetch = true }: DashboardProviderProps) {
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [registrationStage, _setRegistrationStage] = useState<RegistrationStage | null>(TokenManager.getRegistrationStage());
  
  // User status state
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);

  const setRegistrationStage = (stage: RegistrationStage) => {
    _setRegistrationStage(stage);
    TokenManager.setRegistrationStage(stage);
  };

  const refreshUser = async () => {
    const token = TokenManager.getToken();
    if (!token) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    try {
      const response = await AuthService.getMe(token);
      if (response && "error" in response) {
        setUser(null);
      } else {
        const userData = response as User;
        setUser(userData);
        TokenManager.setUser(userData);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const refresh = async () => {
    const token = TokenManager.getToken();
    if (!token) {
      setError("Not authenticated");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = getApiUrl(API_ENDPOINTS.ADMIN.DASHBOARD);
      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed to fetch dashboard (${res.status})`);
      }

      const json = (await res.json()) as DashboardSummary;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Computed status values
  const emailVerified = user?.emailVerified ?? false;
  const kycStatus = user?.identity_verification ?? null;
  const kycCompleted = kycStatus === "all_verified";
  const bankConnected = !!user?.bankAccount?.id;
  const setupCompleted = emailVerified && kycCompleted && bankConnected;

  // Register prerequisites checker for onboarding provider
  useEffect(() => {
    setOnboardingPrerequisitesChecker(() => ({
      emailVerified,
      kycCompleted,
    }));
  }, [emailVerified, kycCompleted]);

  useEffect(() => {
    if (!autoFetch) return;
    const isAuthed = TokenManager.isAuthenticated();
    if (!isAuthed) return;
    void refresh();
    void refreshUser();
  }, [autoFetch]);

  // Refresh user periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const token = TokenManager.getToken();
      if (token) {
        void refreshUser();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = useMemo<DashboardContextValue>(() => ({
    loading,
    error,
    data,
    refresh,
    registrationStage,
    setRegistrationStage,
    user,
    userLoading,
    refreshUser,
    emailVerified,
    kycStatus,
    kycCompleted,
    bankConnected,
    setupCompleted,
  }), [loading, error, data, registrationStage, user, userLoading, emailVerified, kycStatus, kycCompleted, bankConnected, setupCompleted]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}


