/**
 * Security-related types for password reset, 2FA, and other auth features
 */

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerify {
  token: string;
  email: string;
}

export interface PasswordResetComplete {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerify {
  code: string;
  trustDevice?: boolean;
}

export interface TwoFactorEnable {
  code: string;
  password: string;
}

export interface TwoFactorDisable {
  code: string;
  password: string;
}

export interface SessionInfo {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActivity: Date;
  isCurrent: boolean;
  createdAt: Date;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  trustedDevices: string[];
  lastPasswordChange?: Date;
  activeSessions: number;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

export interface AccountActivity {
  id: string;
  type: 'login' | 'logout' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'profile_update';
  description: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  timestamp: Date;
  success: boolean;
}
