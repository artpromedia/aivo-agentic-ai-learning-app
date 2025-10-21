export type AuditEventType =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.role_changed'
  | 'user.password_reset'
  | 'user.mfa_enabled'
  | 'user.mfa_disabled'
  | 'learner.created'
  | 'learner.updated'
  | 'learner.progress_updated'
  | 'iep.created'
  | 'iep.updated'
  | 'iep.goal_added'
  | 'iep.goal_completed'
  | 'activity.completed'
  | 'settings.updated'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.deleted'
  | 'billing.subscription_created'
  | 'billing.subscription_updated'
  | 'billing.payment_succeeded'
  | 'billing.payment_failed'
  | 'data.exported'
  | 'data.deleted'
  | 'compliance.dsr_submitted'
  | 'compliance.dsr_completed'
  | 'system.backup_created'
  | 'system.maintenance_started'
  | 'system.maintenance_ended';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'user_management'
  | 'data_access'
  | 'data_modification'
  | 'settings'
  | 'billing'
  | 'compliance'
  | 'system';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: {
    id: string;
    type: 'user' | 'system' | 'api';
    name: string;
    email?: string;
    ipAddress: string;
    userAgent?: string;
  };
  target?: {
    type: string; // e.g., 'user', 'learner', 'iep_goal'
    id: string;
    name?: string;
  };
  action: string; // Human-readable description
  metadata: Record<string, any>; // Event-specific data
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogFilters {
  dateFrom?: Date;
  dateTo?: Date;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  actorId?: string;
  targetId?: string;
  status?: 'success' | 'failure';
  searchQuery?: string;
}
