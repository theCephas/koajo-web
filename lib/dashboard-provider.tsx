"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from "@/lib/constants/api";
import { TokenManager } from "@/lib/utils/menory-manager";
import type { RegistrationStage } from "@/lib/constants/dashboard";

type DashboardSummary = Record<string, unknown>;

interface DashboardContextValue {
  loading: boolean;
  error: string | null;
  data: DashboardSummary | null;
  refresh: () => Promise<void>;
  registrationStage: RegistrationStage | null;
  setRegistrationStage: (stage: RegistrationStage) => void;
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

  const setRegistrationStage = (stage: RegistrationStage) => {
    _setRegistrationStage(stage);
    TokenManager.setRegistrationStage(stage);
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

  useEffect(() => {
    if (!autoFetch) return;
    const isAuthed = TokenManager.isAuthenticated();
    if (!isAuthed) return;
    void refresh();
  }, [autoFetch]);

  const value = useMemo<DashboardContextValue>(() => ({
    loading,
    error,
    data,
    refresh,
    registrationStage,
    setRegistrationStage,
  }), [loading, error, data, registrationStage]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}


