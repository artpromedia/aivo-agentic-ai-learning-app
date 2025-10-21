/**
 * Password Reset Utilities
 * Handles password reset request, verification, and completion
 */

import type { 
  PasswordResetRequest, 
  PasswordResetVerify, 
  PasswordResetComplete,
  PasswordChangeRequest 
} from '../types/security';

/**
 * Request a password reset email
 */
export async function requestPasswordReset(
  data: PasswordResetRequest,
  apiBaseUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request password reset');
    }

    return await response.json();
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
}

/**
 * Verify password reset token
 */
export async function verifyResetToken(
  data: PasswordResetVerify,
  apiBaseUrl: string
): Promise<{ valid: boolean; message?: string }> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/password-reset/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid or expired token');
    }

    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

/**
 * Complete password reset with new password
 */
export async function resetPassword(
  data: PasswordResetComplete,
  apiBaseUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    if (data.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const response = await fetch(`${apiBaseUrl}/auth/password-reset/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: data.token,
        email: data.email,
        newPassword: data.newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    return await response.json();
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  data: PasswordChangeRequest,
  accessToken: string,
  apiBaseUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    if (data.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Ensure new password is different
    if (data.currentPassword === data.newPassword) {
      throw new Error('New password must be different from current password');
    }

    const response = await fetch(`${apiBaseUrl}/auth/password/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Password change failed:', error);
    throw error;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Strength determination
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (score >= 6) strength = 'very-strong';
  else if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  // Feedback messages
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

  return {
    isValid: password.length >= 8 && score >= 3,
    strength,
    feedback,
  };
}
