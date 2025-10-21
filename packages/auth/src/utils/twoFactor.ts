/**
 * Two-Factor Authentication (2FA) Utilities
 * Handles 2FA setup, verification, and management
 */

import type { 
  TwoFactorSetup, 
  TwoFactorVerify, 
  TwoFactorEnable,
  TwoFactorDisable 
} from '../types/security';

/**
 * Initialize 2FA setup - generates secret and QR code
 */
export async function setup2FA(
  accessToken: string,
  apiBaseUrl: string
): Promise<TwoFactorSetup> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to setup 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('2FA setup failed:', error);
    throw error;
  }
}

/**
 * Verify 2FA code during login
 */
export async function verify2FACode(
  data: TwoFactorVerify,
  email: string,
  tempToken: string,
  apiBaseUrl: string
): Promise<{ success: boolean; accessToken?: string; refreshToken?: string }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({
        email,
        code: data.code,
        trustDevice: data.trustDevice,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid 2FA code');
    }

    return await response.json();
  } catch (error) {
    console.error('2FA verification failed:', error);
    throw error;
  }
}

/**
 * Enable 2FA for user account
 */
export async function enable2FA(
  data: TwoFactorEnable,
  accessToken: string,
  apiBaseUrl: string
): Promise<{ success: boolean; backupCodes: string[] }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enable 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('2FA enable failed:', error);
    throw error;
  }
}

/**
 * Disable 2FA for user account
 */
export async function disable2FA(
  data: TwoFactorDisable,
  accessToken: string,
  apiBaseUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disable 2FA');
    }

    return await response.json();
  } catch (error) {
    console.error('2FA disable failed:', error);
    throw error;
  }
}

/**
 * Generate backup codes for 2FA
 */
export async function generateBackupCodes(
  accessToken: string,
  apiBaseUrl: string
): Promise<{ backupCodes: string[] }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/backup-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate backup codes');
    }

    return await response.json();
  } catch (error) {
    console.error('Backup codes generation failed:', error);
    throw error;
  }
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(
  code: string,
  email: string,
  tempToken: string,
  apiBaseUrl: string
): Promise<{ success: boolean; accessToken?: string; refreshToken?: string }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/2fa/verify-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid backup code');
    }

    return await response.json();
  } catch (error) {
    console.error('Backup code verification failed:', error);
    throw error;
  }
}

/**
 * Format 2FA code for display (adds spaces for readability)
 */
export function format2FACode(code: string): string {
  // Remove any existing spaces
  const cleaned = code.replace(/\s/g, '');
  
  // Add space every 3 digits (e.g., "123456" -> "123 456")
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * Validate 2FA code format
 */
export function validate2FACode(code: string): boolean {
  // Remove spaces and check if it's 6 digits
  const cleaned = code.replace(/\s/g, '');
  return /^\d{6}$/.test(cleaned);
}
