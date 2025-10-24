/**
 * Secure Storage Service
 * 
 * Provides secure token storage using:
 * - iOS: Keychain Services
 * - Android: Android Keystore System
 * 
 * Also provides MMKV for encrypted general storage
 */

import {MMKV} from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

// MMKV instance for encrypted general storage
const storage = new MMKV({
  id: 'aivo-secure-storage',
  encryptionKey: 'aivo-learning-2024', // TODO: Use from environment variable
});

/**
 * Save sensitive token to platform secure storage
 * iOS: Keychain, Android: Keystore
 */
export const saveSecureToken = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: `com.aivolearning.${key}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch (error) {
    console.error('Error saving secure token:', error);
    throw new Error('Failed to save secure token');
  }
};

/**
 * Retrieve token from platform secure storage
 */
export const getSecureToken = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `com.aivolearning.${key}`,
    });
    return credentials ? credentials.password : null;
  } catch (error) {
    console.error('Error retrieving secure token:', error);
    return null;
  }
};

/**
 * Delete token from platform secure storage
 */
export const deleteSecureToken = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: `com.aivolearning.${key}`,
    });
  } catch (error) {
    console.error('Error deleting secure token:', error);
  }
};

/**
 * Check if biometric authentication is available
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return biometryType !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get biometric type (Face ID, Touch ID, Fingerprint, etc.)
 */
export const getBiometricType = async (): Promise<string | null> => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return biometryType;
  } catch (error) {
    return null;
  }
};

/**
 * Save credentials with biometric protection
 */
export const saveBiometricCredentials = async (
  username: string,
  password: string
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(username, password, {
      service: 'com.aivolearning.biometric',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    throw new Error('Failed to save biometric credentials');
  }
};

/**
 * Retrieve credentials with biometric authentication
 */
export const getBiometricCredentials = async (): Promise<{
  username: string;
  password: string;
} | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.aivolearning.biometric',
      authenticationPrompt: {
        title: 'Authenticate',
        subtitle: 'Access your saved credentials',
      },
    });
    
    if (credentials) {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving biometric credentials:', error);
    return null;
  }
};

/**
 * Delete biometric credentials
 */
export const deleteBiometricCredentials = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: 'com.aivolearning.biometric',
    });
  } catch (error) {
    console.error('Error deleting biometric credentials:', error);
  }
};

/**
 * Save value to MMKV encrypted storage (deprecated - use mmkvStorage.set)
 */
export const saveToMMKV = (key: string, value: any): void => {
  storage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
};

/**
 * Get value from MMKV encrypted storage (deprecated - use mmkvStorage.getString)
 */
export const getFromMMKV = <T = any>(key: string): T | null => {
  const value = storage.getString(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

/**
 * Delete value from MMKV encrypted storage (deprecated - use mmkvStorage.delete)
 */
export const deleteFromMMKV = (key: string): void => {
  storage.delete(key);
};

/**
 * Clear all secure data (Keychain + MMKV)
 */
export const clearAllSecureData = async (): Promise<void> => {
  try {
    // Clear Keychain
    await deleteSecureToken('access_token');
    await deleteSecureToken('refresh_token');
    await deleteBiometricCredentials();
    
    // Clear MMKV
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing secure data:', error);
  }
};

/**
 * MMKV Storage helpers for general encrypted data
 */

export const mmkvStorage = {
  /**
   * Set value in MMKV encrypted storage
   */
  set: (key: string, value: string | number | boolean): void => {
    storage.set(key, value);
  },

  /**
   * Get string value from MMKV storage
   */
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  /**
   * Get number value from MMKV storage
   */
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  /**
   * Get boolean value from MMKV storage
   */
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  /**
   * Delete key from MMKV storage
   */
  delete: (key: string): void => {
    storage.delete(key);
  },

  /**
   * Check if key exists in MMKV storage
   */
  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  /**
   * Clear all MMKV storage
   */
  clearAll: (): void => {
    storage.clearAll();
  },

  /**
   * Get all keys in MMKV storage
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
};

/**
 * Session management helpers
 */

export const sessionStorage = {
  /**
   * Save last activity timestamp
   */
  updateLastActivity: (): void => {
    mmkvStorage.set('last_activity', Date.now());
  },

  /**
   * Get last activity timestamp
   */
  getLastActivity: (): number | undefined => {
    return mmkvStorage.getNumber('last_activity');
  },

  /**
   * Check if session has expired (default: 30 minutes)
   */
  isSessionExpired: (timeoutMinutes: number = 30): boolean => {
    const lastActivity = sessionStorage.getLastActivity();
    if (!lastActivity) return true;

    const now = Date.now();
    const elapsed = now - lastActivity;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    return elapsed > timeoutMs;
  },

  /**
   * Clear session data
   */
  clearSession: (): void => {
    mmkvStorage.delete('last_activity');
  },
};
