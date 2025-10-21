/**
 * Intervention Alert Component
 * Displays alerts for students needing intervention with severity levels
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { InterventionAlert as InterventionAlertType } from '../utils/mockData';

interface InterventionAlertProps {
  alert: InterventionAlertType;
  onDismiss?: (alertId: string) => void;
  compact?: boolean;
}

export const InterventionAlert: React.FC<InterventionAlertProps> = ({
  alert,
  onDismiss,
  compact = false,
}) => {
  const severityConfig = {
    urgent: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-700',
      icon: '🚨',
      iconBg: 'bg-red-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-700',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
    },
  };

  const config = severityConfig[alert.type];

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (compact) {
    return (
      <div className={`${config.bg} border ${config.border} rounded-lg p-3 flex items-start gap-3`}>
        <div className={`${config.iconBg} rounded-lg p-2 flex-shrink-0`}>
          <span className="text-lg">{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{alert.studentName}</h4>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
              {alert.type}
            </span>
          </div>
          <p className="text-sm text-gray-700">{alert.reason}</p>
          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.createdAt)}</p>
        </div>
        <Link
          to={`/students/${alert.studentId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex-shrink-0"
        >
          View →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-xl p-6 transition-all hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`${config.iconBg} rounded-xl p-3 flex-shrink-0`}>
            <span className="text-3xl">{config.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-lg">{alert.studentName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.badge}`}>
                {alert.type}
              </span>
            </div>
            <p className="text-sm text-gray-600">{formatTimeAgo(alert.createdAt)}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Alert Reason */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-900 mb-1">Issue:</p>
        <p className={`font-medium ${config.text}`}>{alert.reason}</p>
      </div>

      {/* Alert Details */}
      <div className="bg-white/60 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">{alert.details}</p>
      </div>

      {/* Recommended Actions */}
      {alert.recommendedActions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions:</p>
          <ul className="space-y-2">
            {alert.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Link
          to={`/students/${alert.studentId}`}
          className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-center transition-colors"
        >
          View Student Profile
        </Link>
        <button className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 transition-colors">
          Schedule Meeting
        </button>
        <button className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 transition-colors">
          Add Note
        </button>
      </div>
    </div>
  );
};

interface InterventionAlertListProps {
  alerts: InterventionAlertType[];
  maxDisplay?: number;
}

export const InterventionAlertList: React.FC<InterventionAlertListProps> = ({
  alerts,
  maxDisplay = 5,
}) => {
  const displayedAlerts = alerts.slice(0, maxDisplay);
  const urgentCount = alerts.filter((a) => a.type === 'urgent').length;

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <span className="text-5xl mb-4 block">✅</span>
        <h3 className="font-bold text-green-900 text-lg mb-2">All Students On Track!</h3>
        <p className="text-green-700">No intervention alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Intervention Alerts</h3>
          <p className="text-sm text-gray-600">
            {alerts.length} students need attention
            {urgentCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                {urgentCount} urgent
              </span>
            )}
          </p>
        </div>
        {alerts.length > maxDisplay && (
          <Link
            to="/students?filter=alerts"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View All ({alerts.length}) →
          </Link>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {displayedAlerts.map((alert) => (
          <InterventionAlert key={alert.id} alert={alert} compact />
        ))}
      </div>
    </div>
  );
};
