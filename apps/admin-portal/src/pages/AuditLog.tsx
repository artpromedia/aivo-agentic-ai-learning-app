import React, { useState, useMemo } from 'react';
import { auditLog } from '@aivo/utils';
import type { AuditLogFilters, AuditEvent, AuditCategory, AuditSeverity } from '@aivo/types';
import { Button, Card, Input } from '@aivo/ui';

export function AuditLogPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const events = useMemo(() => auditLog.query(filters), [filters]);
  const stats = useMemo(() => auditLog.getStats(), []);

  const handleExport = (format: 'json' | 'csv') => {
    const data = auditLog.export(filters, format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="audit-log-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-neutral-600 mt-1">
            Track all platform activities and security events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            data-testid="export-csv"
          >
            📄 Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            data-testid="export-json"
          >
            📋 Export JSON
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-neutral-600 mb-1">Total Events</div>
          <div className="text-3xl font-bold">{stats.totalEvents.toLocaleString()}</div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 mb-1">Critical Events</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.eventsBySeverity['critical'] || 0}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 mb-1">Failed Actions</div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.recentErrors.length}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 mb-1">Last 24h</div>
          <div className="text-3xl font-bold text-blue-600">
            {events.filter(e => 
              e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search events..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            data-testid="audit-search"
          />

          <select
            value={filters.categories?.[0] || 'all'}
            onChange={(e) => setFilters({
              ...filters,
              categories: e.target.value === 'all' ? undefined : [e.target.value as AuditCategory]
            })}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="category-filter"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="user_management">User Management</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="settings">Settings</option>
            <option value="billing">Billing</option>
            <option value="compliance">Compliance</option>
            <option value="system">System</option>
          </select>

          <select
            value={filters.severities?.[0] || 'all'}
            onChange={(e) => setFilters({
              ...filters,
              severities: e.target.value === 'all' ? undefined : [e.target.value as AuditSeverity]
            })}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="severity-filter"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({
              ...filters,
              status: e.target.value === 'all' ? undefined : e.target.value as 'success' | 'failure'
            })}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">From</label>
            <Input
              type="date"
              value={filters.dateFrom?.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                dateFrom: e.target.value ? new Date(e.target.value) : undefined
              })}
              data-testid="date-from"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">To</label>
            <Input
              type="date"
              value={filters.dateTo?.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                dateTo: e.target.value ? new Date(e.target.value) : undefined
              })}
              data-testid="date-to"
            />
          </div>
        </div>

        {Object.keys(filters).length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              data-testid="clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Events Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b sticky top-0">
              <tr>
                <th className="text-left p-4 font-semibold">Timestamp</th>
                <th className="text-left p-4 font-semibold">Event</th>
                <th className="text-left p-4 font-semibold">Actor</th>
                <th className="text-left p-4 font-semibold">Action</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map(event => (
                <AuditEventRow
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              No events found matching your filters
            </div>
          )}
        </div>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <AuditEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

const AuditEventRow: React.FC<{
  event: AuditEvent;
  onClick: () => void;
}> = ({ event, onClick }) => {
  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: 'success' | 'failure') => {
    return status === 'success' ? '✓' : '✗';
  };

  return (
    <tr
      className="hover:bg-neutral-50 cursor-pointer"
      onClick={onClick}
      data-testid={`event-${event.id}`}
    >
      <td className="p-4 text-sm">
        <div>{new Date(event.timestamp).toLocaleDateString()}</div>
        <div className="text-xs text-neutral-500">
          {new Date(event.timestamp).toLocaleTimeString()}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
            {event.category}
          </span>
          <span className="text-xs text-neutral-600">{event.eventType}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="text-sm font-medium">{event.actor.name}</div>
        <div className="text-xs text-neutral-500">{event.actor.email || event.actor.id}</div>
      </td>

      <td className="p-4 text-sm">
        {event.action}
      </td>

      <td className="p-4">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 rounded text-xs
          ${event.status === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
          }
        `}>
          {getStatusIcon(event.status)} {event.status}
        </span>
      </td>

      <td className="p-4 text-right">
        <button className="text-sm text-blue-600 hover:underline">
          View Details →
        </button>
      </td>
    </tr>
  );
};

const AuditEventDetailModal: React.FC<{
  event: AuditEvent;
  onClose: () => void;
}> = ({ event, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="event-detail-modal"
      >
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Event Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold mb-3">Basic Information</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-600">Event ID</dt>
                <dd className="font-mono">{event.id}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Timestamp</dt>
                <dd>{new Date(event.timestamp).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Event Type</dt>
                <dd className="font-mono">{event.eventType}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Category</dt>
                <dd className="capitalize">{event.category}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Severity</dt>
                <dd className="capitalize">{event.severity}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Status</dt>
                <dd className="capitalize">{event.status}</dd>
              </div>
            </dl>
          </div>

          {/* Actor */}
          <div>
            <h3 className="font-semibold mb-3">Actor</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-600">Name</dt>
                <dd>{event.actor.name}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Email</dt>
                <dd>{event.actor.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">IP Address</dt>
                <dd className="font-mono">{event.actor.ipAddress}</dd>
              </div>
              <div>
                <dt className="text-neutral-600">Type</dt>
                <dd className="capitalize">{event.actor.type}</dd>
              </div>
            </dl>
          </div>

          {/* Target */}
          {event.target && (
            <div>
              <h3 className="font-semibold mb-3">Target</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-neutral-600">Type</dt>
                  <dd className="capitalize">{event.target.type}</dd>
                </div>
                <div>
                  <dt className="text-neutral-600">ID</dt>
                  <dd className="font-mono">{event.target.id}</dd>
                </div>
                {event.target.name && (
                  <div className="col-span-2">
                    <dt className="text-neutral-600">Name</dt>
                    <dd>{event.target.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action */}
          <div>
            <h3 className="font-semibold mb-3">Action</h3>
            <p className="text-sm">{event.action}</p>
          </div>

          {/* Changes */}
          {event.changes && (
            <div>
              <h3 className="font-semibold mb-3">Changes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {event.changes.before && (
                  <div>
                    <div className="text-sm font-medium mb-2">Before</div>
                    <pre className="bg-neutral-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(event.changes.before, null, 2)}
                    </pre>
                  </div>
                )}
                {event.changes.after && (
                  <div>
                    <div className="text-sm font-medium mb-2">After</div>
                    <pre className="bg-neutral-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(event.changes.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {Object.keys(event.metadata).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Metadata</h3>
              <pre className="bg-neutral-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {event.errorMessage && (
            <div>
              <h3 className="font-semibold mb-3 text-red-600">Error</h3>
              <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                {event.errorMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
