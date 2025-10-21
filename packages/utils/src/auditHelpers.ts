import { auditLog, getCurrentActor } from './auditLogger';
import type { AuditEventType, AuditCategory } from '@aivo/types';

/**
 * Helper functions to log audit events throughout the application
 */

// Authentication Events
export function logUserLogin(userId: string, userName: string, email: string) {
  auditLog.log({
    eventType: 'user.login',
    category: 'authentication',
    severity: 'info',
    actor: {
      ...getCurrentActor(),
      id: userId,
      name: userName,
      email,
    },
    action: `User ${userName} logged in`,
    metadata: {
      loginTime: new Date().toISOString(),
    },
    status: 'success',
  });
}

export function logUserLogout(userId: string, userName: string) {
  auditLog.log({
    eventType: 'user.logout',
    category: 'authentication',
    severity: 'info',
    actor: {
      ...getCurrentActor(),
      id: userId,
      name: userName,
    },
    action: `User ${userName} logged out`,
    metadata: {},
    status: 'success',
  });
}

// User Management Events
export function logUserCreated(userId: string, userName: string, createdBy: { id: string; name: string }) {
  auditLog.log({
    eventType: 'user.created',
    category: 'user_management',
    severity: 'info',
    actor: {
      ...getCurrentActor(),
      id: createdBy.id,
      name: createdBy.name,
    },
    target: {
      type: 'user',
      id: userId,
      name: userName,
    },
    action: `Created new user: ${userName}`,
    metadata: {
      userId,
      userName,
    },
    status: 'success',
  });
}

export function logUserRoleChanged(
  userId: string, 
  userName: string, 
  oldRoles: string[], 
  newRoles: string[],
  changedBy: { id: string; name: string }
) {
  auditLog.log({
    eventType: 'user.role_changed',
    category: 'authorization',
    severity: 'warning',
    actor: {
      ...getCurrentActor(),
      id: changedBy.id,
      name: changedBy.name,
    },
    target: {
      type: 'user',
      id: userId,
      name: userName,
    },
    action: `Changed roles for user ${userName}`,
    metadata: {
      userId,
      userName,
    },
    changes: {
      before: { roles: oldRoles },
      after: { roles: newRoles },
    },
    status: 'success',
  });
}

// Data Events
export function logDataExport(dataType: string, recordCount: number) {
  auditLog.log({
    eventType: 'data.exported',
    category: 'data_access',
    severity: 'warning',
    actor: getCurrentActor(),
    action: `Exported ${recordCount} ${dataType} records`,
    metadata: {
      dataType,
      recordCount,
      exportTime: new Date().toISOString(),
    },
    status: 'success',
  });
}

// Settings Events
export function logSettingsUpdate(settingName: string, oldValue: unknown, newValue: unknown) {
  auditLog.log({
    eventType: 'settings.updated',
    category: 'settings',
    severity: 'info',
    actor: getCurrentActor(),
    action: `Updated setting: ${settingName}`,
    metadata: {
      settingName,
    },
    changes: {
      before: { [settingName]: oldValue },
      after: { [settingName]: newValue },
    },
    status: 'success',
  });
}

// Billing Events
export function logPaymentSucceeded(amount: number, currency: string, invoiceId: string) {
  auditLog.log({
    eventType: 'billing.payment_succeeded',
    category: 'billing',
    severity: 'info',
    actor: getCurrentActor(),
    action: `Payment of ${amount} ${currency} succeeded`,
    metadata: {
      amount,
      currency,
      invoiceId,
      paymentTime: new Date().toISOString(),
    },
    status: 'success',
  });
}

export function logPaymentFailed(amount: number, currency: string, errorMessage: string) {
  auditLog.log({
    eventType: 'billing.payment_failed',
    category: 'billing',
    severity: 'error',
    actor: getCurrentActor(),
    action: `Payment of ${amount} ${currency} failed`,
    metadata: {
      amount,
      currency,
      errorMessage,
    },
    status: 'failure',
    errorMessage,
  });
}

// Compliance Events
export function logDSRSubmitted(requestType: string, requestId: string, userEmail: string) {
  auditLog.log({
    eventType: 'compliance.dsr_submitted',
    category: 'compliance',
    severity: 'warning',
    actor: getCurrentActor(),
    action: `Data Subject Request submitted: ${requestType}`,
    metadata: {
      requestType,
      requestId,
      userEmail,
      submittedAt: new Date().toISOString(),
    },
    status: 'success',
  });
}

// System Events
export function logSystemBackup(backupId: string, size: number) {
  auditLog.log({
    eventType: 'system.backup_created',
    category: 'system',
    severity: 'info',
    actor: {
      ...getCurrentActor(),
      type: 'system',
      name: 'System',
    },
    action: 'System backup created',
    metadata: {
      backupId,
      size,
      timestamp: new Date().toISOString(),
    },
    status: 'success',
  });
}

// Error logging
export function logFailedAction(
  eventType: AuditEventType,
  category: AuditCategory,
  action: string,
  errorMessage: string
) {
  auditLog.log({
    eventType,
    category,
    severity: 'error',
    actor: getCurrentActor(),
    action,
    metadata: {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    },
    status: 'failure',
    errorMessage,
  });
}
