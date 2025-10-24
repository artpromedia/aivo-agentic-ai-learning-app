/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls:
 * - Login (parent/learner)
 * - Parent code verification
 * - Token refresh
 * - Get current user
 * - Logout
 */

import apiClient, {parseApiError} from './apiClient';
import {
  saveSecureToken,
  deleteSecureToken,
  getSecureToken,
} from '../storage/secureStorage';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'parent' | 'teacher';
  grade_level?: number;
  theme?: 'K5' | 'MS' | 'HS';
  avatar_url?: string;
  profile?: {
    interests?: string[];
    learning_style?: string;
    accessibility_settings?: Record<string, unknown>;
  };
}

/**
 * Login response interface
 */
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

/**
 * Parent code verification response
 */
interface ParentCodeResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  parent: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Token refresh response
 */
interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const {access_token, refresh_token, user} = response.data;

      // Save tokens securely
      await saveSecureToken('access_token', access_token);
      await saveSecureToken('refresh_token', refresh_token);

      return user;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Verify 6-digit parent code for child login
   */
  async verifyParentCode(code: string, learnerId?: string): Promise<User> {
    try {
      const response = await apiClient.post<ParentCodeResponse>(
        '/auth/verify-code',
        {
          code,
          learner_id: learnerId,
        }
      );

      const {access_token, refresh_token, user} = response.data;

      // Save tokens securely
      await saveSecureToken('access_token', access_token);
      await saveSecureToken('refresh_token', refresh_token);

      return user;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<void> {
    try {
      const refreshToken = await getSecureToken('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
        }
      );

      const {access_token, refresh_token: newRefreshToken} = response.data;

      // Save new access token
      await saveSecureToken('access_token', access_token);

      // Update refresh token if provided
      if (newRefreshToken) {
        await saveSecureToken('refresh_token', newRefreshToken);
      }
    } catch (error) {
      // Delete tokens if refresh fails
      await deleteSecureToken('access_token');
      await deleteSecureToken('refresh_token');

      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{user: User}>('/auth/me');
      return response.data.user;
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Logout - clear tokens
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server call fails
      console.error('Logout API error:', error);
    } finally {
      // Always delete local tokens
      await deleteSecureToken('access_token');
      await deleteSecureToken('refresh_token');
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', {email});
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', {token});
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      await apiClient.post('/auth/resend-verification');
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{available: boolean}>(
        '/auth/check-email',
        {
          params: {email},
        }
      );
      return response.data.available;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
