import type { AuditEvent, AuditLogFilters } from '@aivo/types';

export class AuditLogger {
  private static instance: AuditLogger;
  private events: AuditEvent[] = [];
  private readonly STORAGE_KEY = 'audit_logs';
  private readonly MAX_EVENTS = 10000; // Keep last 10k events in localStorage

  private constructor() {
    this.loadEvents();
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuditEvent[];
        this.events = parsed.map((e) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load audit events:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      // Keep only the most recent events
      const eventsToSave = this.events.slice(-this.MAX_EVENTS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save audit events:', error);
    }
  }

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.events.push(auditEvent);
    this.saveEvents();

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', auditEvent);
    }
  }

  query(filters: AuditLogFilters = {}): AuditEvent[] {
    let filtered = [...this.events];

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(e => e.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(e => e.timestamp <= filters.dateTo!);
    }

    // Filter by event types
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter(e => filters.eventTypes!.includes(e.eventType));
    }

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(e => filters.categories!.includes(e.category));
    }

    // Filter by severities
    if (filters.severities && filters.severities.length > 0) {
      filtered = filtered.filter(e => e.severity && filters.severities!.includes(e.severity));
    }

    // Filter by actor
    if (filters.actorId) {
      filtered = filtered.filter(e => e.actor?.id === filters.actorId);
    }

    // Filter by target
    if (filters.targetId) {
      filtered = filtered.filter(e => e.target?.id === filters.targetId);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    // Search in action and metadata
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.action.toLowerCase().includes(query) ||
        e.actor?.name.toLowerCase().includes(query) ||
        e.actor?.email?.toLowerCase().includes(query) ||
        JSON.stringify(e.metadata).toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  export(filters: AuditLogFilters = {}, format: 'json' | 'csv' = 'json'): string {
    const events = this.query(filters);

    if (format === 'csv') {
      return this.exportAsCSV(events);
    }

    return JSON.stringify(events, null, 2);
  }

  private exportAsCSV(events: AuditEvent[]): string {
    const headers = [
      'Timestamp',
      'Event Type',
      'Category',
      'Severity',
      'Actor',
      'Action',
      'Status',
      'IP Address',
      'Target',
    ];

    const rows = events.map(e => [
      e.timestamp.toISOString(),
      e.eventType,
      e.category,
      e.severity || '',
      e.actor ? `${e.actor.name} (${e.actor.email || e.actor.id})` : '',
      e.action,
      e.status || '',
      e.actor?.ipAddress || '',
      e.target ? `${e.target.type}:${e.target.id}` : '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  clear(): void {
    if (window.confirm('Clear all audit logs? This cannot be undone.')) {
      this.events = [];
      this.saveEvents();
    }
  }

  getStats() {
    return {
      totalEvents: this.events.length,
      eventsByCategory: this.groupBy(this.events, 'category'),
      eventsBySeverity: this.groupBy(this.events, 'severity'),
      recentErrors: this.events
        .filter(e => e.status === 'failure')
        .slice(0, 10),
    };
  }

  private groupBy(events: AuditEvent[], key: keyof AuditEvent): Record<string, number> {
    return events.reduce((acc, event) => {
      const value = String(event[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Convenience function
export const auditLog = AuditLogger.getInstance();

// Helper to get current user context
export function getCurrentActor(): AuditEvent['actor'] {
  // In a real app, get from auth context
  const currentUser = JSON.parse(localStorage.getItem('rbac_current_user_id') || '{}');
  
  return {
    id: currentUser.id || 'system',
    type: 'user',
    name: currentUser.name || 'System',
    email: currentUser.email,
    ipAddress: '127.0.0.1', // Would get from server in real implementation
    userAgent: navigator.userAgent,
  };
}
