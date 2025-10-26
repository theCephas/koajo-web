/**
 * Example usage and testing of the Auth Service
 * This file demonstrates how to use the auth service
 */

import { AuthService, ApiErrorClass, AuthUtils } from '@/lib/services/authService';
import TokenManager from '@/lib/utils/tokenManager';

/**
 * Example login function
 */
export async function exampleLogin(email: string, password: string) {
  try {
    console.log('Attempting login...');
    
    const response = await AuthService.login({ email, password });
    
    if (AuthUtils.isLoginSuccess(response)) {
      console.log('Login successful!');
      
      // Store authentication data
      TokenManager.setAuthData(response);
      
      // Extract user data
      const user = response.user;
      const token = AuthUtils.extractToken(response);
      
      console.log('User:', user);
      console.log('Token:', token.substring(0, 20) + '...');
      
      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } else if (AuthUtils.requiresVerification(response)) {
      console.log('Email verification required');
      
      return {
        success: false,
        requiresVerification: true,
        email: response.email,
        message: 'Please verify your email address',
      };
    }
  } catch (error) {
    console.error('Login failed:', error);
    
    if (error instanceof ApiErrorClass) {
      return {
        success: false,
        error: error.error,
        status: error.statusCode,
        message: `Login failed: ${error.message}`,
      };
    }
    
    return {
      success: false,
      error: 'Unknown error',
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Example signup function
 */
export async function exampleSignup(userData: {
  email: string;
  phoneNumber: string;
  password: string;
}) {
  try {
    console.log('Attempting signup...');
    
    const response = await AuthService.signup(userData);
    
    console.log('Signup successful!');
    console.log("signup response user ", response?.user);
    console.log('Account ID:', response?.user?.accountId);
    console.log('Email verified:', response?.user?.emailVerified);
    
    return {
      success: true,
      accountId: response.accountId,
      emailVerified: response.emailVerified,
      message: 'Account created successfully',
    };
  } catch (error) {
    console.error('Signup failed:', error);
    
    if (error instanceof ApiErrorClass) {
      return {
        success: false,
        error: error.error,
        status: error.statusCode,
        message: `Signup failed: ${error.message}`,
      };
    }
    
    return {
      success: false,
      error: 'Unknown error',
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Example token validation
 */
export function exampleTokenValidation() {
  console.log('Checking authentication status...');
  
  const isAuthenticated = TokenManager.isAuthenticated();
  console.log('Is authenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    const user = TokenManager.getUserData();
    const token = TokenManager.getToken();
    const timeUntilExpiry = TokenManager.getTimeUntilExpiry();
    
    console.log('User data:', user);
    console.log('Token:', token?.substring(0, 20) + '...');
    console.log('Time until expiry:', timeUntilExpiry, 'ms');
    
    if (TokenManager.isTokenExpired()) {
      console.log('Token is expired!');
      TokenManager.clearAuthData();
    }
  }
}

/**
 * Example error handling
 */
export function exampleErrorHandling() {
  // Test different error scenarios
  const testCases = [
    { email: 'invalid-email', password: 'short' },
    { email: 'nonexistent@example.com', password: 'wrongpassword' },
    { email: 'user@example.com', password: 'Test@123&' }, // This might require verification
  ];
  
  testCases.forEach(async (testCase, index) => {
    console.log(`\n--- Test Case ${index + 1} ---`);
    const result = await exampleLogin(testCase.email, testCase.password);
    console.log('Result:', result);
  });
}

/**
 * Example API testing function
 * Call this to test the auth service with real API
 */
export async function testAuthService() {
  console.log('=== Testing Auth Service ===\n');
  
  // Test 1: Check current authentication status
  exampleTokenValidation();
  
  // Test 2: Try login with test credentials
  // Replace with real test credentials
  await exampleLogin('test@example.com', 'TestPassword123!');
  
  // Test 3: Try signup with test data
  await exampleSignup({
    email: 'newuser@example.com',
    phoneNumber: '+2348012345678',
    password: 'TestPassword123!',
  });
  
  console.log('\n=== Auth Service Test Complete ===');
}

// Export for use in components
export {
  AuthService,
  AuthUtils,
  TokenManager,
};
