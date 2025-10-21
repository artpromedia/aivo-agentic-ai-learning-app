import React from 'react';

/**
 * SLO Board - Service Level Objectives
 * Monitor and manage service level objectives
 */
export const SLOBoard: React.FC = () => {
  const slos = [
    { name: 'API Availability', target: '99.95%', current: '99.97%', errorBudget: 48, status: 'healthy' },
    { name: 'API Latency (p95)', target: '< 200ms', current: '124ms', errorBudget: 76, status: 'healthy' },
    { name: 'Error Rate', target: '< 0.1%', current: '0.03%', errorBudget: 70, status: 'healthy' },
  ];

  const history = [
    { month: 'December 2024', availability: 99.98, latency: 118, errorRate: 0.02, compliance: 'met' },
    { month: 'November 2024', availability: 99.94, latency: 156, errorRate: 0.08, compliance: 'met' },
    { month: 'October 2024', availability: 99.89, latency: 187, errorRate: 0.14, compliance: 'missed', incident: 'Database outage (2h 15m)' },
  ];

  const alerts = [
    { rule: 'Fast Burn', description: 'Alert if error budget will exhaust in < 2 days', enabled: true, lastTriggered: 'Never' },
    { rule: 'Slow Burn', description: 'Alert if error budget will exhaust in < 7 days', enabled: true, lastTriggered: '15 days ago' },
    { rule: 'Budget Exhausted', description: 'Alert when error budget reaches 0%', enabled: true, lastTriggered: 'Never' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SLO Board</h1>
        <p className="text-gray-600 mt-1">Service Level Objectives - Current Period</p>
      </div>

      {/* SLO Overview */}
      <div className="grid grid-cols-3 gap-6">
        {slos.map((slo, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{slo.name}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Target</div>
                <div className="text-xl font-bold text-gray-900">{slo.target}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-2xl font-bold text-green-600">{slo.current}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Error Budget</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${slo.errorBudget > 50 ? 'bg-green-600' : 'bg-orange-600'}`} style={{ width: `${slo.errorBudget}%` }} />
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">{slo.errorBudget}% remaining</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLO History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">SLO Compliance History (Last 3 Months)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency (p95)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.availability}%</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.latency}ms</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.errorRate}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.compliance === 'met' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {row.compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.incident || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SLO Alert Configuration</h2>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{alert.rule}</div>
                <div className="text-sm text-gray-600">{alert.description}</div>
                <div className="text-xs text-gray-500 mt-1">Last triggered: {alert.lastTriggered}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={alert.enabled} readOnly className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SLOBoard;
