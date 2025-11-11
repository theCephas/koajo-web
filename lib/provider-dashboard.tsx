"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from "@/lib/constants/api";
import { TokenManager } from "@/lib/utils/memory-manager";
import { AuthService } from "@/lib/services/authService";
import type { RegistrationStage } from "@/lib/constants/dashboard";
import type {
  IdentityVerificationRecord,
  User,
  PodMembership,
} from "@/lib/types/api";
import { setOnboardingPrerequisitesChecker } from "./provider-onboarding";

type DashboardSummary = Record<string, unknown>;

interface DashboardContextValue {
  loading: boolean;
  error: string | null;
  data: DashboardSummary | null;
  refresh: () => Promise<void>;
  registrationStage: RegistrationStage | null;
  setRegistrationStage: (stage: RegistrationStage) => void;

  user: User | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;

  emailVerified: boolean;
  kycStatus: IdentityVerificationRecord | null;
  kycCompleted: boolean;
  bankConnected: boolean;
  setupCompleted: boolean;

  pods: PodMembership[];
  podsLoading: boolean;
  currentPod: PodMembership | null;
  setCurrentPod: (pod: PodMembership | null) => void;
  refreshPods: () => Promise<void>;
  hasPods: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}

interface DashboardProviderProps {
  children: React.ReactNode;
  autoFetch?: boolean;
}

export function DashboardProvider({
  children,
  autoFetch = true,
}: DashboardProviderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [registrationStage, _setRegistrationStage] =
    useState<RegistrationStage | null>(TokenManager.getRegistrationStage());

  const [user, setUser] = useState<User | null>(
    TokenManager.getUserData() || null
  );
  const [userLoading, setUserLoading] = useState<boolean>(true);

  const [pods, setPods] = useState<PodMembership[]>([]);
  const [podsLoading, setPodsLoading] = useState<boolean>(false);
  const [currentPod, setCurrentPod] = useState<PodMembership | null>(null);

  const setRegistrationStage = (stage: RegistrationStage) => {
    _setRegistrationStage(stage);
    TokenManager.setRegistrationStage(stage);
  };

  const refreshUser = useCallback(async () => {
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
  }, []);

  const refreshPods = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token) {
      setPods([]);
      setPodsLoading(false);
      setCurrentPod(null);
      return;
    }

    setPodsLoading(true);
    try {
      const response = await AuthService.getMyPods(token);
      if (response && "error" in response) {
        setPods([]);
        setCurrentPod(null);
      } else {
        const podData = response as PodMembership[];
        setPods(podData);
        // Set first pod as current if none selected
        if (!currentPod && podData.length > 0) {
          setCurrentPod(podData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching pods:", err);
      setPods([]);
      setCurrentPod(null);
    } finally {
      setPodsLoading(false);
    }
  }, [currentPod]);

  const logout = useCallback(() => {
    TokenManager.clearAuthData();

    setUser(null);
    setData(null);
    setError(null);
    setLoading(false);
    setUserLoading(false);
    setPods([]);
    setPodsLoading(false);
    setCurrentPod(null);
    _setRegistrationStage(null);

    router.replace("/auth/login");
  }, [router]);

  const refresh = useCallback(async () => {
    const token = TokenManager.getToken();
    if (!token) {
      setError("Not authenticated");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // const url = getApiUrl(API_ENDPOINTS.ADMIN.DASHBOARD);
      // const res = await fetch(url, {
      //   method: "GET",
      //   headers: getAuthHeaders(token),
      // });
      // if (!res.ok) {
      //   const text = await res.text().catch(() => "");
      //   throw new Error(text || `Failed to fetch dashboard (${res.status})`);
      // }
      // const json = (await res.json()) as DashboardSummary;
      // setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const emailVerified = user?.emailVerified ?? false;
  const kycStatus = user?.identityVerification ?? null;
  const kycCompleted = Boolean(
    kycStatus &&
      kycStatus.status === "verified" &&
      kycStatus.type === "id_number"
  );
  const bankConnected = !!user?.bankAccount?.id;
  const hasPods = pods.length > 0;
  const setupCompleted = emailVerified && kycCompleted && bankConnected;

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
    void refreshPods();
  }, [autoFetch, refresh, refreshUser, refreshPods]);

  // Removed polling interval that was causing continuous /auth/me calls
  // The user data will be refreshed on mount and when explicitly needed via refreshUser()

  const value = useMemo<DashboardContextValue>(
    () => ({
      loading,
      error,
      data,
      refresh,
      registrationStage,
      setRegistrationStage,
      user,
      userLoading,
      refreshUser,
      logout,
      emailVerified,
      kycStatus,
      kycCompleted,
      bankConnected,
      setupCompleted,
      pods,
      podsLoading,
      currentPod,
      setCurrentPod,
      refreshPods,
      hasPods,
    }),
    [
      loading,
      error,
      data,
      registrationStage,
      user,
      userLoading,
      refresh,
      refreshUser,
      logout,
      emailVerified,
      kycStatus,
      kycCompleted,
      bankConnected,
      setupCompleted,
      pods,
      podsLoading,
      currentPod,
      refreshPods,
      hasPods,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
