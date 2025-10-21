import { getSecurityLogs } from '../utils/mockData';

export default function SecurityCompliance() {
  const logs = getSecurityLogs().slice(0, 20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Security & Compliance</h1>
        <p className="text-neutral-600 mt-1">Security monitoring and compliance tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">COPPA Compliance</h3>
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <p className="text-center text-sm text-green-600 font-medium mt-3">Compliant</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">FERPA Compliance</h3>
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <p className="text-center text-sm text-green-600 font-medium mt-3">Compliant</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">SOC 2 Type II</h3>
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
          </div>
          <p className="text-center text-sm text-green-600 font-medium mt-3">Certified</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Security Activity Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Event Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{log.eventType}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{log.userName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-neutral-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{log.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
