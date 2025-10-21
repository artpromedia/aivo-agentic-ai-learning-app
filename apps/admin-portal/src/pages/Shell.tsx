import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { EnvironmentStatus, SystemMetric, PlatformActivity } from '@aivo/types';

/**
 * Super Admin Shell / Environment Dashboard
 * Main landing page showing platform health and environment status
 */
export const Shell: React.FC = () => {
  const [envStatus] = useState<EnvironmentStatus>({
    environment: 'production',
    errorBudget: 48, // percentage remaining
    deployStatus: 'guarded',
    uptime: 99.97,
    apiLatency: 124,
    errorRate: 0.03,
    activeIncidents: 0,
    lastDeploy: {
      version: 'v2.4.1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deployedBy: 'auto-deploy',
    },
  });

  const metrics: SystemMetric[] = [
    {
      label: 'Uptime',
      value: '99.97%',
      trend: 'up',
      target: '99.95%',
      status: 'healthy',
      unit: 'percentage',
    },
    {
      label: 'API Latency (p95)',
      value: 124,
      trend: 'stable',
      target: '< 200ms',
      status: 'healthy',
      unit: 'ms',
    },
    {
      label: 'Error Rate',
      value: '0.03%',
      trend: 'down',
      target: '< 0.1%',
      status: 'healthy',
      unit: 'percentage',
    },
    {
      label: 'Active Incidents',
      value: 0,
      trend: 'stable',
      status: 'healthy',
      unit: 'count',
    },
  ];

  const recentActivity: PlatformActivity[] = [
    {
      id: '1',
      type: 'deploy',
      user: 'auto-deploy',
      message: 'v2.4.1 deployed to production',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'info',
    },
    {
      id: '2',
      type: 'alert',
      user: 'system',
      message: 'Error rate spike detected (resolved)',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      severity: 'warning',
    },
    {
      id: '3',
      type: 'feature',
      user: 'admin@aivo.ai',
      message: 'Feature flag "new-assessment" enabled for 25% rollout',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      severity: 'info',
    },
    {
      id: '4',
      type: 'security',
      user: 'security-scan',
      message: 'Weekly security scan completed - no vulnerabilities found',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      severity: 'info',
    },
    {
      id: '5',
      type: 'maintenance',
      user: 'system',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      severity: 'info',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getDeployStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'guarded':
        return 'bg-orange-100 text-orange-700';
      case 'frozen':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deploy':
        return '🚀';
      case 'alert':
        return '⚠️';
      case 'feature':
        return '🎛️';
      case 'incident':
        return '🚨';
      case 'maintenance':
        return '🔧';
      case 'security':
        return '🔒';
      default:
        return '📋';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Environment</h1>
        <p className="text-gray-600 mt-1">Platform health monitoring and status</p>
      </div>

      {/* Environment Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="text-sm text-gray-600">Error Budget:</span>
            <div className="mt-1">
              <span className="text-3xl font-bold text-red-600">{envStatus.errorBudget}%</span>
              <span className="text-sm text-gray-600 ml-2">remaining</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${envStatus.errorBudget}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-600">Deploy Status:</span>
            <div className="mt-1">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium inline-block ${getDeployStatusColor(envStatus.deployStatus)}`}
              >
                {envStatus.deployStatus.charAt(0).toUpperCase() + envStatus.deployStatus.slice(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {envStatus.deployStatus === 'guarded' && 'Deploys require manual approval'}
              {envStatus.deployStatus === 'open' && 'Deploys are fully automated'}
              {envStatus.deployStatus === 'frozen' && 'Deploys are currently blocked'}
            </p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Environment:</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${envStatus.environment === 'production' ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              <span className="text-xl font-semibold">
                {envStatus.environment.charAt(0).toUpperCase() + envStatus.environment.slice(1)}
              </span>
            </div>
            {envStatus.lastDeploy && (
              <p className="text-xs text-gray-500 mt-2">
                Last deploy: {envStatus.lastDeploy.version} ({formatTimestamp(envStatus.lastDeploy.timestamp)})
              </p>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(metric.status)}`}
                >
                  {metric.status === 'healthy' ? '✓' : '!'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500">{getTrendIcon(metric.trend)}</span>
              </div>
              {metric.target && (
                <p className="text-xs text-gray-500 mt-1">Target: {metric.target}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/slo"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Error Budget</h3>
              <p className="text-sm text-orange-600">48% remaining</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Error budget is below 50%. Monitor SLO compliance carefully.
          </p>
          <div className="mt-4 text-sm font-medium text-indigo-600">View SLO Board →</div>
        </Link>

        <Link
          to="/governance"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-xl">
              🚨
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Subject Requests</h3>
              <p className="text-sm text-red-600">3 overdue</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Three DSRs have passed their deadline and require immediate attention.
          </p>
          <div className="mt-4 text-sm font-medium text-indigo-600">View DSRs →</div>
        </Link>

        <Link
          to="/hitl"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">HITL Review Queue</h3>
              <p className="text-sm text-blue-600">247 items pending</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Human review queue has 247 items waiting. Average wait time: 4.2 hours.
          </p>
          <div className="mt-4 text-sm font-medium text-indigo-600">View Queue →</div>
        </Link>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{activity.user}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        activity.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : activity.severity === 'warning'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shell;
