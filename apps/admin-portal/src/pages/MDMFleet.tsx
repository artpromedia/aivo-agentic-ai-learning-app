import React from 'react';

/**
 * MDM / Fleet Management Page
 * Mobile Device Management for student devices
 */
export const MDMFleet: React.FC = () => {
  const fleetMetrics = {
    total: 14950,
    active: 12480,
    offline: 420,
    compliance: 64,
  };

  const deviceTypes = [
    { type: 'iPad', count: 8500, os: 'iPadOS 17', percentage: 57, avgAge: '2.3 years' },
    { type: 'Aivo Pad', count: 2500, os: 'Aivo OS 1.2', percentage: 17, avgAge: '0.8 years' },
    { type: 'Chromebook', count: 3200, os: 'ChromeOS 120', percentage: 21, avgAge: '1.8 years' },
    { type: 'Android Tablet', count: 750, os: 'Android 13', percentage: 5, avgAge: '3.1 years' },
  ];

  const policies = [
    { name: 'App Restrictions', description: 'Only allow AIVO app and approved educational apps', applied: 14950, status: 'active' },
    { name: 'Screen Time Limits', description: 'Enforce screen time limits based on parent settings', applied: 11200, status: 'active' },
    { name: 'Content Filtering', description: 'Block inappropriate content', applied: 14950, status: 'active' },
    { name: 'Aivo OS Updates', description: 'Automatic OS updates for Aivo Pad devices', applied: 2500, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MDM / Fleet Management</h1>
        <p className="text-gray-600 mt-1">Mobile Device Management for student devices</p>
      </div>

      {/* Device Fleet Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Devices</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{fleetMetrics.total.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">All types</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Active Devices</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{fleetMetrics.active.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">{((fleetMetrics.active / fleetMetrics.total) * 100).toFixed(1)}% of fleet</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Offline &gt; 7 days</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">{fleetMetrics.offline}</div>
          <div className="text-sm text-orange-600 mt-1">Send notification</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Compliance Issues</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{fleetMetrics.compliance}</div>
          <div className="text-sm text-red-600 mt-1">Review required</div>
        </div>
      </div>

      {/* Device Fleet Composition */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Fleet Composition</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {deviceTypes.map((device, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{device.type}</h3>
                <span className="text-2xl">
                  {device.type === 'iPad' ? '📱' : 
                   device.type === 'Aivo Pad' ? '🎓' : 
                   device.type === 'Chromebook' ? '💻' : '📟'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Count:</span>
                  <span className="font-medium">{device.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary OS:</span>
                  <span className="font-medium">{device.os}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Age:</span>
                  <span className="font-medium">{device.avgAge}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${device.percentage}%` }} />
                </div>
                <div className="text-xs text-gray-600 mt-1">{device.percentage}% of fleet</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MDM Policies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">MDM Policies</h2>
        <div className="space-y-3">
          {policies.map((policy, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{policy.name}</div>
                <div className="text-sm text-gray-600">{policy.description}</div>
                <div className="text-xs text-gray-500 mt-1">Applied to {policy.applied.toLocaleString()} devices</div>
              </div>
              <div className="ml-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {policy.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Health Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Health Metrics</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Battery Health</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '92%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">92% avg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Storage Available</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '76%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">76% avg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Network Connectivity</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '98%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">98% uptime</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">App Crash Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '99.2%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">0.8% (excellent)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDMFleet;
