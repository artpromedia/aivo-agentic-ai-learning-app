import { AuthTokens } from '../types/auth';

const TOKEN_KEY = 'aivo_auth_tokens';
const USER_KEY = 'aivo_auth_user';

export class TokenManager {
  /**
   * Store tokens in localStorage
   */
  static setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Retrieve tokens from localStorage
   */
  static getTokens(): AuthTokens | null {
    try {
      const tokensStr = localStorage.getItem(TOKEN_KEY);
      if (!tokensStr) return null;
      
      const tokens: AuthTokens = JSON.parse(tokensStr);
      
      // Check if token is expired
      if (tokens.expiresAt && Date.now() > tokens.expiresAt) {
        this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Clear tokens from localStorage
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refreshToken || null;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;
    return Date.now() > tokens.expiresAt;
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number {
    const tokens = this.getTokens();
    if (!tokens) return 0;
    return Math.max(0, tokens.expiresAt - Date.now());
  }

  /**
   * Store user data
   */
  static setUser(user: unknown): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  }

  /**
   * Retrieve user data
   */
  static getUser<T>(): T | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr) as T;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }
}
