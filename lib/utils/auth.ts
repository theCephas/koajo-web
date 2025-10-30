import { LoginResponse, LoginSuccessResponse, LoginVerificationRequiredResponse, ApiError, SignupResponse } from "../types/api";

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
export const AuthUtils = {
  /**
   * Check if login response indicates successful authentication
   */
  isLoginSuccess(response: LoginResponse): response is LoginSuccessResponse {
    return "accessToken" in response;
  },

  isRegisterSuccess(response: SignupResponse): response is SignupResponse {
    return "accountId" in response || "id" in response;
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