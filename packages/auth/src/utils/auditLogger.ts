/**
 * Audit Logger for RBAC Impersonation
 * Tracks all impersonation actions for security and debugging
 */

export interface AuditLogEntry {
  timestamp: string;
  action: 'impersonate_start' | 'impersonate_stop' | 'role_toggle' | 'user_add' | 'user_remove';
  originalUserId?: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  targetUserRoles?: string[];
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export class AuditLogger {
  private static readonly STORAGE_KEY = 'aivo_audit_log';
  private static readonly MAX_ENTRIES = 1000;

  /**
   * Log an impersonation action
   */
  static log(entry: Omit<AuditLogEntry, 'timestamp' | 'sessionId'>): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
    };

    // Get existing logs
    const logs = this.getLogs();
    
    // Add new entry at the beginning
    logs.unshift(fullEntry);
    
    // Keep only the most recent entries
    if (logs.length > this.MAX_ENTRIES) {
      logs.splice(this.MAX_ENTRIES);
    }

    // Save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('[AuditLogger] Failed to save logs:', error);
    }

    // Also log to console for immediate debugging
    this.logToConsole(fullEntry);
  }

  /**
   * Get all audit logs
   */
  static getLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('[AuditLogger] Failed to retrieve logs:', error);
      return [];
    }
  }

  /**
   * Clear all audit logs
   */
  static clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[AuditLogger] All logs cleared');
    } catch (error) {
      console.error('[AuditLogger] Failed to clear logs:', error);
    }
  }

  /**
   * Get logs for a specific user
   */
  static getLogsForUser(userId: string): AuditLogEntry[] {
    return this.getLogs().filter(
      log => log.originalUserId === userId || log.targetUserId === userId
    );
  }

  /**
   * Get logs for a specific action type
   */
  static getLogsByAction(action: AuditLogEntry['action']): AuditLogEntry[] {
    return this.getLogs().filter(log => log.action === action);
  }

  /**
   * Get recent logs (last N entries)
   */
  static getRecentLogs(count: number = 50): AuditLogEntry[] {
    return this.getLogs().slice(0, count);
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Export logs as CSV
   */
  static exportLogsAsCSV(): string {
    const logs = this.getLogs();
    if (logs.length === 0) return '';

    const headers = [
      'Timestamp',
      'Action',
      'Original User ID',
      'Target User ID',
      'Target User Name',
      'Target User Email',
      'Target User Roles',
      'Session ID',
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.action,
      log.originalUserId || '',
      log.targetUserId || '',
      log.targetUserName || '',
      log.targetUserEmail || '',
      log.targetUserRoles?.join('; ') || '',
      log.sessionId || '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    const SESSION_KEY = 'aivo_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Log to console with formatting
   */
  private static logToConsole(entry: AuditLogEntry): void {
    const styles = {
      impersonate_start: 'background: #fbbf24; color: #000; padding: 2px 6px; border-radius: 3px;',
      impersonate_stop: 'background: #10b981; color: #fff; padding: 2px 6px; border-radius: 3px;',
      role_toggle: 'background: #3b82f6; color: #fff; padding: 2px 6px; border-radius: 3px;',
      user_add: 'background: #8b5cf6; color: #fff; padding: 2px 6px; border-radius: 3px;',
      user_remove: 'background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 3px;',
    };

    const style = styles[entry.action];
    console.log(
      `%c[AUDIT] ${entry.action}`,
      style,
      entry
    );
  }
}

/**
 * Hook for easy access to audit logger in components
 */
export const useAuditLogger = () => {
  return {
    log: AuditLogger.log,
    getLogs: AuditLogger.getLogs,
    clearLogs: AuditLogger.clearLogs,
    getLogsForUser: AuditLogger.getLogsForUser,
    getLogsByAction: AuditLogger.getLogsByAction,
    getRecentLogs: AuditLogger.getRecentLogs,
    exportLogs: AuditLogger.exportLogs,
    exportLogsAsCSV: AuditLogger.exportLogsAsCSV,
  };
};
