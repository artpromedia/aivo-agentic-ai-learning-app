// Audit and logging types
export type AuditEventType =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'role.assigned'
  | 'role.removed'
  | 'permission.granted'
  | 'permission.revoked'
  | 'data.accessed'
  | 'data.modified'
  | 'data.deleted'
  | 'data.exported'
  | 'security.violation'
  | 'config.changed'
  | 'settings.updated'
  | 'billing.payment_succeeded'
  | 'billing.payment_failed'
  | 'compliance.dsr_submitted'
  | 'system.backup_created'
  | 'system.maintenance_started'
  | 'system.error';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'user_management'
  | 'security'
  | 'configuration'
  | 'system'
  | 'settings'
  | 'billing'
  | 'compliance';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditActor {
  id: string;
  type?: string;
  name: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditTarget {
  type: string;
  id: string;
  name?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  category: AuditCategory;
  severity?: AuditSeverity;
  actor?: AuditActor;
  target?: AuditTarget;
  action: string;
  status?: AuditStatus;
  metadata?: Record<string, unknown>;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  errorMessage?: string;
  // Legacy fields for backwards compatibility
  userId?: string;
  userName?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
}

export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  actorId?: string;
  targetId?: string;
  eventType?: AuditEventType;
  eventTypes?: AuditEventType[];
  category?: AuditCategory;
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  status?: AuditStatus;
  resourceType?: string;
  success?: boolean;
  searchQuery?: string;
}
