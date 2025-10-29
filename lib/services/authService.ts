import {
  API_ENDPOINTS,
  getApiUrl,
  getDefaultHeaders,
  getAuthHeaders,
} from "@/lib/config/api";
import type {
  LoginRequest,
  LoginResponse,
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
  ApiError,
} from "@/lib/types/api";
import { ApiErrorClass } from "@/lib/utils/auth";

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch((er) => ({
        error: "Unknown error",
        message: ["An unexpected error occurred"],
        statusCode: response.status,
      }));

      throw new ApiErrorClass(
        response.status,
        errorData.error,
        errorData.message
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiErrorClass) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiErrorClass(408, "Request timeout", ["Request timeout"]);
      }
      throw new ApiErrorClass(0, error.message, [error.message]);
    }

    throw new ApiErrorClass(0, "An unexpected error occurred", [
      "An unexpected error occurred",
    ]);
  }
}

async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);

  return apiRequest<LoginSuccessResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(credentials),
  }).then((response) => ({
    ...response,
    user: {
      ...response.user,
      id: response.user.accountId,
    },
  }));
}

async function signup(userData: SignupRequest): Promise<SignupResponse> {
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
      console.log("signup error", error);
      console.error("signup error", error);
      throw error;
    });
}

async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
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
): Promise<ForgotPasswordResponse> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD);

  return apiRequest<ForgotPasswordResponse>(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify(data),
  });
}

async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
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
): Promise<ChangePasswordResponse> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD);

  return apiRequest<ChangePasswordResponse>(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
}

async function resendVerificationEmail(email: string): Promise<{
  email: string;
  verification: { expiresAt: string; sentAt: string };
}> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.RESEND_EMAIL);

  return apiRequest(url, {
    method: "POST",
    headers: getDefaultHeaders(),
    body: JSON.stringify({ email }),
  });
}

async function updateAvatar(
  data: UpdateAvatarRequest,
  token: string
): Promise<UpdateAvatarResponse> {
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
): Promise<UpdateNotificationPreferencesResponse> {
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
): Promise<{
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
}> {
  const url = getApiUrl(API_ENDPOINTS.AUTH.STRIPE_VERIFICATION);

  return apiRequest(url, {
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
  resetPassword,
  changePassword,
  resendVerificationEmail,
  updateAvatar,
  updateNotificationPreferences,
  completeStripeVerification,
};
