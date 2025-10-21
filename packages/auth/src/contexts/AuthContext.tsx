import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { UserRole } from '@aivo/types';
import type { AuthContextValue, AuthState, AuthTokens, AuthUser, LoginCredentials } from '../types/auth';
import { Permission, RolePermissions } from '../types/permissions';
import { TokenManager } from '../utils/tokenManager';
import { hasPermission as checkPermission } from '../utils/permissions';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
}

export function AuthProvider({ children, apiBaseUrl = '/api' }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  /**
   * Initialize auth state from stored tokens
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = TokenManager.getTokens();
        const user = TokenManager.getUser<AuthUser>();

        if (tokens && user) {
          setState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Mock authentication for demo purposes
        // TODO: Replace with actual API call when backend is ready
        const mockUsers: Record<string, { email: string; password: string; user: Omit<AuthUser, 'permissions'> }> = {
          'student@demo.com': {
            email: 'student@demo.com',
            password: 'demo123',
            user: {
              id: 'learner-1',
              email: 'student@demo.com',
              name: 'Alex Demo',
              role: 'learner',
              createdAt: new Date('2024-01-01'),
              lastLogin: new Date(),
              // @ts-expect-error - Adding gradeLevel for theme auto-switching
              gradeLevel: 7, // Middle School (6-8)
            },
          },
          'parent@demo.com': {
            email: 'parent@demo.com',
            password: 'demo123',
            user: {
              id: 'parent-1',
              email: 'parent@demo.com',
              name: 'Jane Doe',
              role: 'parent',
              createdAt: new Date('2024-01-01'),
              lastLogin: new Date(),
            },
          },
          'teacher@demo.com': {
            email: 'teacher@demo.com',
            password: 'demo123',
            user: {
              id: 'teacher-1',
              email: 'teacher@demo.com',
              name: 'Ms. Smith',
              role: 'teacher',
              createdAt: new Date('2024-01-01'),
              lastLogin: new Date(),
            },
          },
          'district@demo.com': {
            email: 'district@demo.com',
            password: 'demo123',
            user: {
              id: 'district-1',
              email: 'district@demo.com',
              name: 'Dr. Sarah Johnson',
              role: 'district-admin',
              createdAt: new Date('2024-01-01'),
              lastLogin: new Date(),
            },
          },
          'admin@demo.com': {
            email: 'admin@demo.com',
            password: 'demo123',
            user: {
              id: 'admin-1',
              email: 'admin@demo.com',
              name: 'Super Admin',
              role: 'super-admin',
              createdAt: new Date('2024-01-01'),
              lastLogin: new Date(),
            },
          },
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockUser = mockUsers[credentials.email];
        
        if (!mockUser || mockUser.password !== credentials.password) {
          throw new Error('Invalid email or password');
        }

        const tokens: AuthTokens = {
          accessToken: `mock-access-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
          expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
        };

        // Add permissions based on role
        const userWithPermissions: AuthUser = {
          ...mockUser.user,
          permissions: RolePermissions[mockUser.user.role as UserRole] || [],
        };

        TokenManager.setTokens(tokens);
        TokenManager.setUser(userWithPermissions);

        setState({
          user: userWithPermissions,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [apiBaseUrl]
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    TokenManager.clearTokens();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const currentTokens = TokenManager.getTokens();
      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // TODO: Replace with actual API call
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { tokens } = await response.json();
      TokenManager.setTokens(tokens);

      setState((prev) => ({
        ...prev,
        tokens,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [apiBaseUrl, logout]);

  /**
   * Update user data
   */
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      TokenManager.setUser(updatedUser);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  /**
   * Check if user has permission(s)
   */
  const hasPermission = useCallback(
    (permission: Permission | Permission[]): boolean => {
      if (!state.user) return false;
      return checkPermission(state.user.permissions, permission);
    },
    [state.user]
  );

  /**
   * Check if user has role(s)
   */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;

      if (Array.isArray(role)) {
        return role.includes(state.user.role);
      }

      return state.user.role === role;
    },
    [state.user]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Auto-refresh token before expiry
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens) return;

    const timeUntilExpiry = TokenManager.getTimeUntilExpiry();
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      const timeoutId = setTimeout(() => {
        refreshToken();
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [state.isAuthenticated, state.tokens, refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshToken,
      updateUser,
      hasPermission,
      hasRole,
      clearError,
    }),
    [state, login, logout, refreshToken, updateUser, hasPermission, hasRole, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
