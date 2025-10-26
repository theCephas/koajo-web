/**
 * Authentication Service for Koajo API
 * Handles all authentication-related API calls
 */

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
  LoginVerificationRequiredResponse,
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
  User,
} from "@/lib/types/api";

export class ApiErrorClass implements ApiError {
  public statusCode: number;
  public error: string;
  public message: string[];

  constructor(statusCode: number, error: string, message: string[]) {
    this.error = error;
    this.message = message;
    this.statusCode = statusCode;
  }
}

/**
 * Generic API request handler with error handling
 */
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

/**
 * Authentication Service Class
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);

    return apiRequest<LoginSuccessResponse>(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(credentials),
    }).then(response => ({
      ...response,
      user: {
        ...response.user,
        id: response.user.accountId,
      },
    }));
  }

  /**
   * Register a new user account
   */
  static async signup(userData: SignupRequest): Promise<any> {
    const url = getApiUrl(API_ENDPOINTS.AUTH.SIGNUP);

    return apiRequest<any>(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(userData),
    });
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(
    data: VerifyEmailRequest
  ): Promise<VerifyEmailResponse> {
    const url = getApiUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL);

    return apiRequest<VerifyEmailResponse>(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(response => {console.log("signup response", response); return response;});
  }

  /**
   * Request password reset
   */
  static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const url = getApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD);

    return apiRequest<ForgotPasswordResponse>(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const url = getApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD);

    return apiRequest<ResetPasswordResponse>(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Change password (requires authentication)
   */
  static async changePassword(
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

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    email: string
  ): Promise<{
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

  /**
   * Update user avatar (requires authentication)
   */
  static async updateAvatar(
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

  /**
   * Update notification preferences (requires authentication)
   */
  static async updateNotificationPreferences(
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

  /**
   * Complete Stripe verification (requires authentication)
   */
  static async completeStripeVerification(
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
}

/**
 * Utility functions for authentication
 */
export const AuthUtils = {
  /**
   * Check if login response indicates successful authentication
   */
  isLoginSuccess(response: LoginResponse): response is LoginSuccessResponse {
    return "accessToken" in response;
  },

  /**
   * Check if login response indicates verification is required
   */
  requiresVerification(
    response: LoginResponse
  ): response is LoginVerificationRequiredResponse {
    return "requiresVerification" in response && response.requiresVerification;
  },

  /**
   * Extract token from successful login response
   */
  extractToken(response: LoginSuccessResponse): string {
    return response.accessToken;
  },

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  },

  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpirationTime(expiresAt: string): number {
    return new Date(expiresAt).getTime();
  },
};

export default AuthService;
