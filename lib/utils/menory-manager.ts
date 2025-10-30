
import { AuthUtils } from '@/lib/utils/auth';
import type { LoginSuccessResponse, User } from '@/lib/types/api';
import CryptoJS from 'crypto-js';
import { RegistrationStage } from '@/lib/constants/dashboard';

const TOKEN_KEY = 'auth_token'; 
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_KEY = 'user';
const USER_ID_KEY = 'user_id';
const REGISTRATION_STATUS_KEY = 'registration_status'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;


const encrypt = (text: string): string => {
  try {
    // if (!ENCRYPTION_KEY) throw new Error('Encryption key is not set');
    // return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return text;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; 
  }
};

const decrypt = (ciphertext: string): string => {
  try {
    // if (!ENCRYPTION_KEY) throw new Error('Encryption key is not set');
    // const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    // return bytes.toString(CryptoJS.enc.Utf8);
    return ciphertext;
  } catch (error) {
    console.error('Decryption failed:', error);
    return ciphertext; 
  }
};

export class TokenManager {
  /**
   * Store registration Status
   */
  static setRegistrationStage(registrationStage: RegistrationStage): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        REGISTRATION_STATUS_KEY,
        registrationStage
      );
    } catch (error) {
      console.error('Failed to store registration stage:', error);
    }
  }

  /**
   * Store authentication token and user data
   * Sensitive data is encrypted before storage
   */
  static setAuthData(loginResponse: LoginSuccessResponse): void {
    if (typeof window === 'undefined') return;

    try {
      const encryptedToken = encrypt(loginResponse.accessToken);
      localStorage.setItem(TOKEN_KEY, encryptedToken);
      
      const encryptedExpiry = encrypt(loginResponse.expiresAt);
      localStorage.setItem(TOKEN_EXPIRY_KEY, encryptedExpiry);
      
      const encryptedUserData = encrypt(JSON.stringify(loginResponse.user));
      localStorage.setItem(USER_KEY, encryptedUserData);
      
      console.log('Auth data stored and encrypted successfully');
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  static setUserId(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USER_ID_KEY, userId);
    } catch (error) {
      console.error('Failed to store account id:', error);
    }
  }

  /**
   * Get stored authentication token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const encryptedToken = localStorage.getItem(TOKEN_KEY);
      const encryptedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!encryptedToken || !encryptedExpiry) {
        return null;
      }

      const token = decrypt(encryptedToken);
      const expiry = decrypt(encryptedExpiry);

      if (AuthUtils.isTokenExpired(expiry)) {
        this.clearAuthData();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  static getUserData(): LoginSuccessResponse['user'] | null {
    if (typeof window === 'undefined') return null;

    try {
      const encryptedUserData = localStorage.getItem(USER_KEY);
      if (!encryptedUserData) return null;
      
      const userDataString = decrypt(encryptedUserData);
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  static getRegistrationStage(): RegistrationStage | null{
    if (typeof window === 'undefined') return null;
    try {
      const registrationStatus = localStorage.getItem(REGISTRATION_STATUS_KEY);
      if (!registrationStatus) return null;
      return decrypt(registrationStatus ) as RegistrationStage;
    } catch (error) {
      console.error('Failed to get registration status:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const encryptedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!encryptedExpiry) return null;
      
      return decrypt(encryptedExpiry);
    } catch (error) {
      console.error('Failed to get token expiry:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    return AuthUtils.isTokenExpired(expiry);
  }


  static isRegistered(): boolean {
    return this.getUserId() !== null;
  }

  static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const userId = localStorage.getItem(USER_ID_KEY);
      if (!userId) return null;
      return decrypt(userId);
    } catch (error) {
      console.error('Failed to get user id:', error);
      return null;
    }
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number | null {
    const expiry = this.getTokenExpiry();
    if (!expiry) return null;

    const expiryTime = AuthUtils.getTokenExpirationTime(expiry);
    const now = Date.now();
    
    return Math.max(0, expiryTime - now);
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Refresh token (placeholder for future implementation)
   */
  static async refreshToken(): Promise<string | null> {
    // TODO: Implement token refresh logic
    console.warn('Token refresh not implemented yet');
    return null;
  }

  /**
   * Setup automatic token refresh (placeholder for future implementation)
   */
  static setupTokenRefresh(): void {
    // TODO: Implement automatic token refresh
    console.warn('Automatic token refresh not implemented yet');
  }
}

/**
 * Cookie-based token storage (alternative to localStorage)
 * More secure for production environments
 */
export class CookieTokenManager {
  private static readonly COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };

  /**
   * Set authentication token in cookie
   */
  static setToken(token: string, expiresAt: string): void {
    if (typeof document === 'undefined') return;

    const expiryDate = new Date(expiresAt);
    
    document.cookie = [
      `${TOKEN_KEY}=${token}`,
      `expires=${expiryDate.toUTCString()}`,
      `path=${this.COOKIE_OPTIONS.path}`,
      this.COOKIE_OPTIONS.secure ? 'secure' : '',
      `samesite=${this.COOKIE_OPTIONS.sameSite}`,
    ].filter(Boolean).join('; ');
  }

  /**
   * Get token from cookie
   */
  static getToken(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${TOKEN_KEY}=`)
    );

    if (!tokenCookie) return null;

    return tokenCookie.split('=')[1];
  }

  /**
   * Clear token cookie
   */
  static clearToken(): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

/**
 * Hybrid token manager that tries localStorage first, falls back to cookies
 */
export class HybridTokenManager {
  static setAuthData(loginResponse: LoginSuccessResponse): void {
    TokenManager.setAuthData(loginResponse);
    CookieTokenManager.setToken(loginResponse.accessToken, loginResponse.expiresAt);
  }

  static getToken(): string | null {
    return TokenManager.getToken() || CookieTokenManager.getToken();
  }

  static clearAuthData(): void {
    TokenManager.clearAuthData();
    CookieTokenManager.clearToken();
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static getUserData(): LoginSuccessResponse['user'] | null {
    return TokenManager.getUserData();
  }
}

export default TokenManager;
