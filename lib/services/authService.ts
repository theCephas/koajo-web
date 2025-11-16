import {
  API_ENDPOINTS,
  getApiUrl,
  getDefaultHeaders,
  getAuthHeaders,
} from "@/lib/constants/api";
import type {
  LoginRequest,
  LoginSuccessResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateAvatarRequest,
  UpdateAvatarResponse,
  UpdateNotificationPreferencesRequest,
  UpdateNotificationPreferencesResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ApiError,
  ResendForgotPasswordRequest,
  ResendForgotPasswordResponse,
  ResendVerificationEmailRequest,
  ResendVerificationEmailResponse,
  PodActivitiesResponse,
  AchievementsSummary,
  RawUserProfileResponse,
  User,
  PodPlan,
  PodPlanOpenPod,
  CreateCustomPodRequest,
  CreateCustomPodResponse,
  JoinPodRequestPayload,
  AcceptCustomInviteRequest,
  IdentityVerificationRecord,
  RawIdentityVerificationRecord,
  LinkStripeBankAccountRequest,
  PodMembership,
  RefreshTokenRequest,
  RefreshTokenResponse,
  Avatar,
  RawAvatar,
  CreatePaymentRequest,
  RecordPaymentResponse,
} from "@/lib/types/api";
import { TokenManager } from "@/lib/utils/memory-manager";
import { ApiErrorClass } from "@/lib/utils/auth";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

const hasAuthorizationHeader = (headers?: HeadersInit): boolean => {
  if (!headers) {
    return false;
  }

  if (headers instanceof Headers) {
    return headers.has("Authorization");
  }

  if (Array.isArray(headers)) {
    return headers.some(
      ([key]) => key?.toLowerCase?.() === "authorization"
    );
  }

  const headerRecord = headers as Record<string, string>;
  return Object.keys(headerRecord).some(
    (key) => key.toLowerCase() === "authorization"
  );
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      TokenManager.clearAuthData();
      return null;
    }

    const data: RefreshTokenResponse = await response.json();

    // Update tokens in storage
    TokenManager.updateAccessToken(
      data.accessToken,
      data.expiresAt,
      data.refreshToken,
      data.refreshExpiresAt
    );

    // Update user data if provided
    if (data.user) {
      TokenManager.setUser(data.user);
    }

    return data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    TokenManager.clearAuthData();
    return null;
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T | ApiError> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: "Unknown error",
        message: "An unexpected error occurred",
        statusCode: response.status,
      }));
      const isProtectedRequest = hasAuthorizationHeader(options.headers);

      // Handle 401 with refresh token
      if (response.status === 401 && !isRetry) {
        const refreshToken = TokenManager.getRefreshToken();
        const shouldRedirectToLogin = isProtectedRequest || Boolean(refreshToken);

        if (refreshToken) {
          if (isRefreshing) {
            // Wait for the ongoing refresh
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken) => {
                // Retry the request with new token
                const updatedOptions = {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                };
                resolve(apiRequest<T>(url, updatedOptions, true));
              });
            });
          }

          isRefreshing = true;
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          if (newToken) {
            onTokenRefreshed(newToken);

            // Retry the original request with new token
            const updatedOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            return apiRequest<T>(url, updatedOptions, true);
          }
        }

        // No refresh token or refresh failed - redirect to login when appropriate
        if (shouldRedirectToLogin && typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      throw new ApiErrorClass(
        response.status,
        errorData.error,
        errorData.message
      );
    }

    const jsonResponse = await response.json();

    console.log("in apiRequest jsonResponse", jsonResponse);
    if (
      jsonResponse &&
      "error" in jsonResponse &&
      "message" in jsonResponse &&
      "statusCode" in jsonResponse
    ) {
      return jsonResponse as ApiError;
    }
    return jsonResponse as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiErrorClass) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiErrorClass(408, "Request timeout", "Request timeout");
      }
      throw new ApiErrorClass(
        0,
        error.message || "Unknown error",
        error.message || "Unknown error"
      );
    }

    throw new ApiErrorClass(
      0,
      "An unexpected error occurred",
      "An unexpected error occurred"
    );
  }
}

async function login(
  credentials: LoginRequest
): Promise<LoginSuccessResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);

  console.log("login credentials", credentials);
  return apiRequest<LoginSuccessResponse | ApiError>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(credentials),
  }).then((response) => {
    if (response && ("id" in response || "accountId" in response)) {
      const loginResponse = response as LoginSuccessResponse;
      return {
        ...loginResponse,
        user: {
          ...loginResponse.user,
          id: loginResponse.user.accountId,
        },
      } as LoginSuccessResponse;
    } else return response as ApiError;
  });
}

async function signup(
  userData: SignupRequest
): Promise<SignupResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.SIGNUP);

  console.log("signup userData", userData);
  return apiRequest<SignupResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(userData),
  })
    .then((response) => {
      console.log("signup response", response);
      return response;
    })
    .catch((error) => {
      console.error("signup error", error);
      throw error;
    });
}

async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL);

  return apiRequest<VerifyEmailResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  }).then((response) => {
    console.log("signup response", response);
    return response;
  });
}

async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD);

  return apiRequest<ForgotPasswordResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

async function resendForgotPassword(
  data: ResendForgotPasswordRequest
): Promise<ResendForgotPasswordResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD);

  return apiRequest<ResendForgotPasswordResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD);

  return apiRequest<ResetPasswordResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

async function changePassword(
  data: ChangePasswordRequest,
  token: string
): Promise<ChangePasswordResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD);

  return apiRequest<ChangePasswordResponse>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function resendVerificationEmail(
  data: ResendVerificationEmailRequest
): Promise<ResendVerificationEmailResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.RESEND_EMAIL);

  console.log("Resend verification email request:", {
    url,
    data,
    stringified: JSON.stringify(data),
  });

  return apiRequest<ResendVerificationEmailResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

async function updateAvatar(
  data: UpdateAvatarRequest,
  token: string
): Promise<UpdateAvatarResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.PROFILE.AVATAR);

  return apiRequest<UpdateAvatarResponse>(url, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function updateNotificationPreferences(
  data: UpdateNotificationPreferencesRequest,
  token: string
): Promise<UpdateNotificationPreferencesResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.PROFILE.NOTIFICATIONS);

  return apiRequest<UpdateNotificationPreferencesResponse>(url, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function completeStripeVerification(
  data: {
    email: string;
    firstName: string;
    lastName: string;
    stripeVerificationCompleted: boolean;
    sessionId: string;
    stripeReference: string;
    verificationType: string;
    verificationStatus: string;
  },
  token: string
): Promise<
  | {
      email: string;
      stripeVerificationCompleted: boolean;
      latestAttempt: {
        id: string;
        sessionId: string;
        stripeReference: string;
        status: string;
        type: string;
        recordedAt: string;
        completedAt?: string;
      };
      verification?: {
        expiresAt: string;
        sentAt: string;
      };
    }
  | ApiError
> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.IDENTITY_VERIFICATION);

  return apiRequest(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

function getAuthOrDefaultHeaders(token?: string): HeadersInit {
  return token ? getAuthHeaders(token) : getDefaultHeaders();
}

type PodActivitiesParams = {
  limit?: number;
  offset?: number;
};

async function getPodActivities(
  params: PodActivitiesParams = { limit: 6, offset: 0 },
  token?: string
): Promise<PodActivitiesResponse | ApiError> {
  const url = new URL(getApiUrl(API_ENDPOINTS.PODS.ACTIVITIES));

  if (typeof params.limit === "number") {
    url.searchParams.set("limit", String(params.limit));
  }

  if (typeof params.offset === "number") {
    url.searchParams.set("offset", String(params.offset));
  }

  return apiRequest<PodActivitiesResponse>(url.toString(), {
    method: "GET",
    headers: getAuthOrDefaultHeaders(token),
  });
}

async function getAchievementsSummary(
  token?: string
): Promise<AchievementsSummary | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.ACHIEVEMENTS.SUMMARY);

  return apiRequest<AchievementsSummary>(url, {
    method: "GET",
    headers: getAuthOrDefaultHeaders(token),
  });
}

async function getPodPlans(token?: string): Promise<PodPlan[] | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.PLANS);

  return apiRequest<PodPlan[]>(url, {
    method: "GET",
    headers: getAuthOrDefaultHeaders(token),
  });
}

async function getPlanOpenPods(
  planCode: string,
  token?: string
): Promise<PodPlanOpenPod[] | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.PLAN_OPEN(planCode));

  return apiRequest<PodPlanOpenPod[]>(url, {
    method: "GET",
    headers: getAuthOrDefaultHeaders(token),
  });
}

async function createCustomPod(
  data: CreateCustomPodRequest,
  token: string
): Promise<CreateCustomPodResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.CUSTOM);

  return apiRequest<CreateCustomPodResponse>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function joinPod(
  planCode: string,
  data: JoinPodRequestPayload,
  token: string
): Promise<Record<string, unknown> | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.JOIN(planCode));

  return apiRequest<Record<string, unknown>>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function acceptCustomInvite(
  data: AcceptCustomInviteRequest,
  token: string
): Promise<Record<string, unknown> | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.CUSTOM_INVITES_ACCEPT);

  return apiRequest<Record<string, unknown>>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function linkStripeBankAccount(
  data: LinkStripeBankAccountRequest,
  token: string
): Promise<Record<string, unknown> | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.STRIPE_BANK_ACCOUNT);

  return apiRequest<Record<string, unknown>>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

const transformIdentityVerification = (
  record?: RawIdentityVerificationRecord | null
): IdentityVerificationRecord | null => {
  if (!record) return null;

  return {
    id: record.id,
    resultId: record.result_id ?? null,
    sessionId: record.session_id,
    status: record.status,
    type: record.type,
    completedAt: record.completed_at ?? null,
    recordedAt: record.recorded_at ?? null,
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
  };
};

const transformUserProfile = (profile: RawUserProfileResponse): User => {
  return {
    id: profile.id,
    email: profile.email,
    phone: profile.phone ?? "",
    firstName:
      typeof profile.first_name === "string" ? profile.first_name : undefined,
    lastName:
      typeof profile.last_name === "string" ? profile.last_name : undefined,
    emailVerified: profile.email_verified,
    agreedToTerms: profile.agreed_to_terms,
    dateOfBirth: profile.date_of_birth,
    avatarId: profile.avatar_url,
    isActive: profile.is_active,
    lastLoginAt: profile.last_login_at,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    emailNotificationsEnabled: profile.emailNotificationsEnabled,
    transactionNotificationsEnabled: profile.transactionNotificationsEnabled,
    identityVerification: transformIdentityVerification(
      profile.identity_verification
    ),
    customer: profile.customer,
    bankAccount: profile.bank_account,
  };
};

async function updateUser(
  data: UpdateUserRequest,
  token: string
): Promise<UpdateUserResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.UPDATE_USER);

  return apiRequest<UpdateUserResponse>(url, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function getMe(token: string): Promise<User | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.ME);

  return apiRequest<RawUserProfileResponse>(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  }).then((response) => {
    if (response && "error" in response) {
      return response;
    }

    return transformUserProfile(response as RawUserProfileResponse);
  });
}

async function getMyPods(token: string): Promise<PodMembership[] | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PODS.MINE);

  return apiRequest<PodMembership[]>(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

async function getPodActivitiesById(
  podId?: string,
  params: { limit?: number; offset?: number } = {},
  token?: string
): Promise<PodActivitiesResponse | ApiError> {
  const url = new URL(getApiUrl(`/pods${podId ? `/${podId}` : ""}/activities`));

  if (typeof params.limit === "number") {
    url.searchParams.set("limit", String(params.limit));
  }

  if (typeof params.offset === "number") {
    url.searchParams.set("offset", String(params.offset));
  }

  return apiRequest<PodActivitiesResponse>(url.toString(), {
    method: "GET",
    headers: getAuthOrDefaultHeaders(token),
  });
}

async function getAvatars(): Promise<Avatar[] | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.AVATARS);

  const response = await apiRequest<RawAvatar[]>(url, {
    method: "GET",
    headers: getDefaultHeaders(),
  });

  if (response && "error" in response) {
    return response;
  }

  // Transform snake_case to camelCase
  return response.map((avatar: RawAvatar) => ({
    id: avatar.id,
    altText: avatar.alt_text,
    isDefault: avatar.is_default,
    gender: avatar.gender,
    createdAt: avatar.created_at,
    updatedAt: avatar.updated_at,
  }));
}

async function recordPayment(
  data: CreatePaymentRequest,
  token: string
): Promise<RecordPaymentResponse | ApiError> {
  const url = getApiUrl(API_ENDPOINTS.PAYMENTS.RECORD);

  return apiRequest<RecordPaymentResponse>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

export const AuthService = {
  login,
  signup,
  verifyEmail,
  forgotPassword,
  resendForgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  updateAvatar,
  updateNotificationPreferences,
  updateUser,
  completeStripeVerification,
  getPodActivities,
  getPodActivitiesById,
  getAchievementsSummary,
  getPodPlans,
  getPlanOpenPods,
  createCustomPod,
  joinPod,
  acceptCustomInvite,
  linkStripeBankAccount,
  getMe,
  getMyPods,
  getAvatars,
  recordPayment,
};
