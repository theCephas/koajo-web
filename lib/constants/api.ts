export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com",
  VERSION: "/v1",
  TIMEOUT: 10000,
} as const;

// TEMP: Hardcoded dev token for integrating secured endpoints (remove for production)
export const DEV_AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZjI0NDBlNy04N2EwLTQ3ZjYtYTc3Mi03YzhiYzg0YTc3NDYiLCJlbWFpbCI6ImlzcmFlbG9iYW5pamVzdTJAZ21haWwuY29tIiwic2NvcGUiOiJ1c2VyIiwiaWF0IjoxNzYxODQ2Mjg4LCJleHAiOjE3NjE4NDk4ODgsImF1ZCI6ImtvYWpvLWNsaWVudHMiLCJpc3MiOiJrb2Fqby1hcGkifQ.uryMMps7VA9X1u1xl5JjHFTeMfLyaGqAJe762stiB3Y";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESEND_FORGOT_PASSWORD: "/auth/forgot-password/resend",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    RESEND_EMAIL: "/auth/resend-email",
    STRIPE_VERIFICATION: "/auth/stripe-verification",
    PROFILE: {
      AVATAR: "/auth/profile/avatar",
      NOTIFICATIONS: "/auth/profile/notifications",
    },
    ME: "/auth/me",
  },
  PODS: {
    PLANS: "/pods/plans",
    OPEN: "/pods/open",
    MINE: "/pods/mine",
    CUSTOM: "/pods/custom",
    REFRESH: "/pods/refresh",
    JOIN: (planCode: string) => `/pods/plans/${planCode}/join`,
    CUSTOM_INVITES_ACCEPT: "/pods/custom/invites/accept",
    ACTIVITIES: "/pods/activities",
  },
  PAYMENTS: {
    RECORD: "/payments",
  },
  PAYOUTS: {
    RECORD: "/payouts",
  },
  ACHIEVEMENTS: {
    SUMMARY: "/achievements/summary",
  },
  ADMIN: {
    LOGIN: "/admin/auth/login",
    USERS: "/admin/users",
    ACCOUNTS: "/admin/accounts",
    PODS: "/admin/pods",
    DASHBOARD: "/admin/dashboard",
    ACHIEVEMENTS: "/admin/achievements",
  },
} as const;

/**
 * Get full API URL for an endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}${endpoint}`;
};

/**
 * Default headers for API requests
 */
export const getDefaultHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${DEV_AUTH_TOKEN}`,
  };
};

/**
 * Headers with authorization token
 */
export const getAuthHeaders = (token: string): HeadersInit => {
  return {
    ...getDefaultHeaders(),
    Authorization: `Bearer ${token}`,
  };
};
