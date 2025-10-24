/**
 * Authentication Store (Zustand)
 * 
 * Global auth state management with:
 * - User state
 * - Authentication methods
 * - Session management
 * - Biometric authentication
 * - Persistent storage
 */

import React from 'react';
import {AppState} from 'react-native';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi, User} from '../services/api/authApi';
import {
  saveBiometricCredentials,
  getBiometricCredentials,
  deleteBiometricCredentials,
  isBiometricAvailable,
  sessionStorage,
} from '../services/storage/secureStorage';

/**
 * Login credentials (kept for compatibility)
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data (kept for compatibility)
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: 'parent' | 'learner';
}

/**
 * Auth state interface
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // minutes

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  verifyParentCode: (code: string, learnerId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Biometric
  enableBiometric: (email: string, password: string) => Promise<void>;
  disableBiometric: () => Promise<void>;
  checkBiometricAvailability: () => Promise<boolean>;
  
  // Session
  updateActivity: () => void;
  checkSession: () => boolean;
  setSessionTimeout: (minutes: number) => void;
  
  // Compatibility methods
  register: (data: RegisterData) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
}

/**
 * Create auth store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      biometricEnabled: false,
      sessionTimeout: 30, // 30 minutes default

      /**
       * Login with email and password
       */
      login: async (email, password, rememberMe = false) => {
        set({isLoading: true, error: null});
        try {
          const user = await authApi.login(email, password);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            rememberMe,
          });

          // Update last activity
          sessionStorage.updateLastActivity();

          // Save credentials for biometric if enabled
          if (get().biometricEnabled) {
            await saveBiometricCredentials(email, password);
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      /**
       * Login with biometric authentication
       */
      loginWithBiometric: async () => {
        set({isLoading: true, error: null});
        try {
          const credentials = await getBiometricCredentials();
          if (!credentials) {
            throw new Error('No saved credentials found');
          }

          const user = await authApi.login(
            credentials.username,
            credentials.password
          );

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          sessionStorage.updateLastActivity();
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Biometric authentication failed',
          });
          throw error;
        }
      },

      /**
       * Verify 6-digit parent code
       */
      verifyParentCode: async (code, learnerId) => {
        set({isLoading: true, error: null});
        try {
          const user = await authApi.verifyParentCode(code, learnerId);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          sessionStorage.updateLastActivity();
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Code verification failed',
          });
          throw error;
        }
      },

      /**
       * Logout
       */
      logout: async () => {
        set({isLoading: true});
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          sessionStorage.clearSession();
        }
      },

      /**
       * Refresh user data from API
       */
      refreshUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          set({user});
        } catch (error) {
          // Token expired or invalid - logout
          console.error('Refresh user error:', error);
          await get().logout();
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({error: null});
      },

      /**
       * Update user data locally
       */
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? {...state.user, ...updates} : null,
        }));
      },

      /**
       * Enable biometric authentication
       */
      enableBiometric: async (email, password) => {
        try {
          const available = await isBiometricAvailable();
          if (!available) {
            throw new Error('Biometric authentication not available');
          }

          await saveBiometricCredentials(email, password);
          set({biometricEnabled: true});
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : 'Failed to enable biometric authentication'
          );
        }
      },

      /**
       * Disable biometric authentication
       */
      disableBiometric: async () => {
        try {
          await deleteBiometricCredentials();
          set({biometricEnabled: false});
        } catch (error) {
          console.error('Error disabling biometric:', error);
        }
      },

      /**
       * Check if biometric authentication is available
       */
      checkBiometricAvailability: async () => {
        try {
          return await isBiometricAvailable();
        } catch (error) {
          return false;
        }
      },

      /**
       * Update last activity timestamp
       */
      updateActivity: () => {
        sessionStorage.updateLastActivity();
      },

      /**
       * Check if session is still valid
       */
      checkSession: () => {
        const timeout = get().sessionTimeout;
        const isExpired = sessionStorage.isSessionExpired(timeout);

        if (isExpired && get().isAuthenticated) {
          get().logout();
          return false;
        }

        return !isExpired;
      },

      /**
       * Set session timeout in minutes
       */
      setSessionTimeout: (minutes) => {
        set({sessionTimeout: minutes});
      },

      /**
       * Register action (compatibility method)
       */
      register: async (_data: RegisterData) => {
        // TODO: Implement registration API call
        throw new Error('Registration not yet implemented');
      },

      /**
       * Refresh access token (compatibility method)
       */
      refreshAccessToken: async () => {
        try {
          await authApi.refreshToken();
        } catch (error) {
          await get().logout();
          throw error;
        }
      },

      /**
       * Set user (compatibility method)
       */
      setUser: (user: User) => {
        set({user});
      },
    }),
    {
      name: 'aivo-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        biometricEnabled: state.biometricEnabled,
        sessionTimeout: state.sessionTimeout,
      }),
    }
  )
);

/**
 * Session monitor hook
 * Automatically checks session validity and updates activity
 */
export const useSessionMonitor = () => {
  const {checkSession, updateActivity, isAuthenticated} = useAuthStore();

  // Check session on mount and activity
  React.useEffect(() => {
    if (!isAuthenticated) return;

    // Check session validity
    const isValid = checkSession();
    if (!isValid) return;

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, checkSession, updateActivity]);
};

export default useAuthStore;
