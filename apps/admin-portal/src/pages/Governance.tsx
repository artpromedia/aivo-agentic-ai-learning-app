import React, { useState } from 'react';

/**
 * Governance & DSRs Page
 * GDPR/CCPA compliance and data governance
 */
export const Governance: React.FC = () => {
  const [showNewDSRModal, setShowNewDSRModal] = useState(false);
  const compliance = [
    { regulation: 'COPPA', status: 'compliant', lastAudit: 'Dec 15, 2024', nextAudit: 'Jun 15, 2025' },
    { regulation: 'FERPA', status: 'compliant', lastAudit: 'Dec 10, 2024', nextAudit: 'Jun 10, 2025' },
    { regulation: 'SOC 2 Type II', status: 'compliant', lastAudit: 'Nov 1, 2024', nextAudit: 'Nov 1, 2025' },
    { regulation: 'CCPA', status: 'action-required', lastAudit: 'Dec 1, 2024', nextAudit: 'Jun 1, 2025', openDSRs: 3 },
  ];

  const dsrs = [
    { id: 'DSR-2024-001', type: 'Right to Access', requester: 'jane.doe@email.com', submitted: '2024-01-15', deadline: '2024-02-14', status: 'in-progress', assignee: 'Sarah Chen' },
    { id: 'DSR-2024-002', type: 'Right to be Forgotten', requester: 'john.smith@email.com', submitted: '2024-01-16', deadline: '2024-02-15', status: 'pending-review' },
    { id: 'DSR-2024-003', type: 'Data Portability', requester: 'maria.garcia@email.com', submitted: '2024-01-14', deadline: '2024-02-13', status: 'overdue', assignee: 'Michael Brown', daysOverdue: 2 },
  ];

  const retentionPolicies = [
    { dataType: 'Student Activity Data', retention: '7 years after graduation', autoDelete: true, records: 45000000, storage: '1.2 TB' },
    { dataType: 'IEP Documents', retention: '5 years after student exits', autoDelete: false, records: 128000, storage: '45 GB' },
    { dataType: 'User Login Logs', retention: '2 years', autoDelete: true, records: 8900000, storage: '120 GB' },
  ];

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'action-required': return 'bg-orange-100 text-orange-700';
      case 'non-compliant': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDSRStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending-review': return 'bg-gray-100 text-gray-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Governance & DSRs</h1>
        <p className="text-gray-600 mt-1">Data governance and compliance management</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-4 gap-6">
        {compliance.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{item.regulation}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getComplianceColor(item.status)}`}>
                {item.status === 'compliant' ? '✓' : '!'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Last audit: {item.lastAudit}</div>
              <div>Next audit: {item.nextAudit}</div>
              {item.openDSRs && (
                <div className="text-orange-600 font-medium mt-2">{item.openDSRs} open DSRs</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Subject Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Subject Requests (DSRs)</h2>
              <p className="text-sm text-gray-600 mt-1">Open requests: <span className="font-semibold text-gray-900">7</span></p>
            </div>
            <button 
              onClick={() => setShowNewDSRModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + New DSR
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dsrs.map((dsr) => (
                <tr key={dsr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dsr.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dsr.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dsr.requester}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dsr.submitted}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {dsr.deadline}
                    {dsr.daysOverdue && (
                      <div className="text-red-600 text-xs font-semibold mt-1">
                        {dsr.daysOverdue} days overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDSRStatusColor(dsr.status)}`}>
                      {dsr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dsr.assignee || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Retention Policies */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Data Retention Policies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Delete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records Stored</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage Size</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retentionPolicies.map((policy, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{policy.dataType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{policy.retention}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${policy.autoDelete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {policy.autoDelete ? 'Enabled' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{policy.records.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{policy.storage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New DSR Modal */}
      {showNewDSRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewDSRModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Create New Data Subject Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Request Type</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Right to Access</option>
                  <option>Right to be Forgotten</option>
                  <option>Data Portability</option>
                  <option>Right to Rectification</option>
                  <option>Right to Object</option>
                  <option>Right to Restrict Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Requester Email</label>
                <input type="email" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="requester@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Requester Name</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">District (if applicable)</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option value="">Select district...</option>
                  <option>Springfield USD</option>
                  <option>Riverside County Schools</option>
                  <option>Metro Charter Network</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Request Details</label>
                <textarea className="w-full px-3 py-2 border border-neutral-300 rounded-lg" rows={4} placeholder="Detailed description of the data subject request..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Assign To</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option value="">Unassigned</option>
                  <option>Sarah Chen</option>
                  <option>Michael Brown</option>
                  <option>Lisa Martinez</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">💡 Standard deadline: 30 days from submission date</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewDSRModal(false)} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('DSR created successfully'); setShowNewDSRModal(false); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Create DSR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Governance;
