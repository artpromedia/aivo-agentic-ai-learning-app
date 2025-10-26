// Audit and logging types
export type AuditEventType =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'role.assigned'
  | 'role.removed'
  | 'permission.granted'
  | 'permission.revoked'
  | 'data.accessed'
  | 'data.modified'
  | 'data.deleted'
  | 'security.violation'
  | 'config.changed';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'user_management'
  | 'security'
  | 'configuration'
  | 'system';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  category: AuditCategory;
  userId?: string;
  userName?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  eventType?: AuditEventType;
  category?: AuditCategory;
  resourceType?: string;
  success?: boolean;
}
