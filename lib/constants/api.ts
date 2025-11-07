export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.koajo.com",
  VERSION: "/v1",
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESEND_FORGOT_PASSWORD: '/auth/forgot-password/resend',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    RESEND_EMAIL: '/auth/resend-email',
    STRIPE_VERIFICATION: '/auth/stripe-verification',
    UPDATE_USER: '/auth/user', 
    CREATE_CUSTOMER: '/auth/create-customer', 
    PROFILE: {
      AVATAR: "/auth/profile/avatar",
      NOTIFICATIONS: "/auth/profile/notifications",
    },
    ME: "/auth/me",
  },
  PODS: {
    PLANS: "/pods/plans",
    MINE: "/pods/mine",
    CUSTOM: "/pods/custom",
    REFRESH: "/pods/refresh",
    PLAN_OPEN: (planCode: string) => `/pods/plans/${planCode}/open`,
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
