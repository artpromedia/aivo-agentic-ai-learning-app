import React, { useState } from 'react';

/**
 * Licensing Management Page
 * Manage license pools, assignments, and billing
 */

interface LicensePoolData {
  name: string;
  quantity: number;
  type: string;
  expirationDate: string;
}

interface BulkAssignmentData {
  csvFile: File | null;
  licenseType: string;
}

interface TransferData {
  fromTenant: string;
  toTenant: string;
  quantity: number;
  licenseType: string;
}

export const Licensing: React.FC = () => {
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReclaimModal, setShowReclaimModal] = useState(false);

  const [poolData, setPoolData] = useState<LicensePoolData>({
    name: '',
    quantity: 100,
    type: 'student',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [bulkData, setBulkData] = useState<BulkAssignmentData>({
    csvFile: null,
    licenseType: 'student'
  });

  const [transferData, setTransferData] = useState<TransferData>({
    fromTenant: '',
    toTenant: '',
    quantity: 0,
    licenseType: 'student'
  });

  const handleCreatePool = () => {
    alert(`Creating license pool: ${poolData.name} with ${poolData.quantity} licenses`);
    setShowCreatePoolModal(false);
    setPoolData({
      name: '',
      quantity: 100,
      type: 'student',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleBulkAssign = () => {
    if (!bulkData.csvFile) {
      alert('Please upload a CSV file');
      return;
    }
    alert(`Processing bulk assignment from ${bulkData.csvFile.name}`);
    setShowBulkAssignModal(false);
  };

  const handleTransfer = () => {
    if (!transferData.fromTenant || !transferData.toTenant) {
      alert('Please select both source and destination tenants');
      return;
    }
    alert(`Transferring ${transferData.quantity} licenses from ${transferData.fromTenant} to ${transferData.toTenant}`);
    setShowTransferModal(false);
  };

  const handleReclaim = (inactiveDays: number) => {
    alert(`Reclaiming licenses inactive for ${inactiveDays}+ days`);
    setShowReclaimModal(false);
  };
  const licenseStats = {
    totalSold: 156420,
    active: 142890,
    trial: 4830,
    expired: 8700,
  };

  const licenseTypes = [
    {
      type: 'Student Licenses',
      total: 120000,
      active: 108500,
      revenue: '$2.4M/mo',
      avgPrice: '$20',
    },
    {
      type: 'Teacher Licenses',
      total: 25000,
      active: 23100,
      revenue: 'Included',
      avgPrice: 'Free',
    },
    {
      type: 'Parent Licenses',
      total: 11420,
      active: 11290,
      revenue: '$342K/mo',
      avgPrice: '$29.99',
    },
  ];

  const recentActivity = [
    {
      tenant: 'Springfield District',
      action: 'Purchased 500 licenses',
      date: '2 hours ago',
      value: '$10,000',
      status: 'completed',
    },
    {
      tenant: 'Oakwood School',
      action: 'Trial expired',
      date: '5 hours ago',
      value: '-',
      status: 'attention',
    },
    {
      tenant: 'Metro District',
      action: 'Renewed 2,500 licenses',
      date: '1 day ago',
      value: '$50,000',
      status: 'completed',
    },
    {
      tenant: 'Riverside Schools',
      action: 'Added 200 licenses',
      date: '1 day ago',
      value: '$4,000',
      status: 'completed',
    },
    {
      tenant: 'Central District',
      action: 'Transferred 100 licenses',
      date: '2 days ago',
      value: '-',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
        <p className="text-gray-600 mt-1">Manage license pools, assignments, and allocation</p>
      </div>

      {/* License Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Licenses Sold</span>
            <span className="text-2xl">🔑</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {licenseStats.totalSold.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">+12.5% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Licenses</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {licenseStats.active.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {((licenseStats.active / licenseStats.totalSold) * 100).toFixed(1)}% utilization
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Trial Licenses</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {licenseStats.trial.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 mt-1">Converting soon</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Expired/Unused</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {licenseStats.expired.toLocaleString()}
          </div>
          <div className="text-sm text-orange-600 mt-1">Reclaim eligible</div>
        </div>
      </div>

      {/* License Breakdown by Type */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">License Distribution</h2>
        <div className="grid grid-cols-3 gap-6">
          {licenseTypes.map((license, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">{license.type}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{license.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active:</span>
                  <span className="font-medium text-green-600">
                    {license.active.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{license.revenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Price:</span>
                  <span className="font-medium">{license.avgPrice}</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(license.active / license.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* License Operations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">License Operations</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowCreatePoolModal(true)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📦</span>
              <span className="font-semibold text-gray-900">Create License Pool</span>
            </div>
            <p className="text-sm text-gray-600">Create a new pool of licenses for allocation</p>
          </button>

          <button 
            onClick={() => setShowBulkAssignModal(true)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📤</span>
              <span className="font-semibold text-gray-900">Bulk License Assignment</span>
            </div>
            <p className="text-sm text-gray-600">Upload CSV to assign licenses in bulk</p>
          </button>

          <button 
            onClick={() => setShowTransferModal(true)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <span className="font-semibold text-gray-900">License Transfer</span>
            </div>
            <p className="text-sm text-gray-600">Move licenses between tenants or users</p>
          </button>

          <button 
            onClick={() => setShowReclaimModal(true)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">↩️</span>
              <span className="font-semibold text-gray-900">License Reclamation</span>
            </div>
            <p className="text-sm text-gray-600">Reclaim inactive or unused licenses</p>
          </button>
        </div>
      </div>

      {/* Recent License Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent License Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activity.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create License Pool Modal */}
      {showCreatePoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreatePoolModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create License Pool</h2>
              <p className="text-gray-600 mt-1">Create a new pool of licenses</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pool Name</label>
                <input
                  type="text"
                  value={poolData.name}
                  onChange={(e) => setPoolData({ ...poolData, name: e.target.value })}
                  placeholder="e.g., Q1 2024 Student Licenses"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={poolData.quantity}
                  onChange={(e) => setPoolData({ ...poolData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select
                  value={poolData.type}
                  onChange={(e) => setPoolData({ ...poolData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student License</option>
                  <option value="teacher">Teacher License</option>
                  <option value="parent">Parent License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={poolData.expirationDate}
                  onChange={(e) => setPoolData({ ...poolData, expirationDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreatePoolModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePool}
                disabled={!poolData.name}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Pool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowBulkAssignModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Bulk License Assignment</h2>
              <p className="text-gray-600 mt-1">Upload CSV to assign licenses in bulk</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select
                  value={bulkData.licenseType}
                  onChange={(e) => setBulkData({ ...bulkData, licenseType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student License</option>
                  <option value="teacher">Teacher License</option>
                  <option value="parent">Parent License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkData({ ...bulkData, csvFile: e.target.files?.[0] || null })}
                    className="hidden"
                    id="csvUpload"
                  />
                  <label htmlFor="csvUpload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📤</div>
                    <div className="text-sm font-medium text-gray-900">
                      {bulkData.csvFile ? bulkData.csvFile.name : 'Click to upload CSV'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      CSV should include: email, tenant_id, license_type
                    </div>
                  </label>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <strong>CSV Format:</strong>
                  <pre className="mt-2 text-xs bg-white p-2 rounded">email,tenant_id,license_type{'\n'}user@example.com,tenant-123,student</pre>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkData.csvFile}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Transfer Licenses</h2>
              <p className="text-gray-600 mt-1">Move licenses between tenants</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Tenant</label>
                <select
                  value={transferData.fromTenant}
                  onChange={(e) => setTransferData({ ...transferData, fromTenant: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select source tenant --</option>
                  <option value="Springfield District">Springfield District</option>
                  <option value="Metro Schools">Metro Schools</option>
                  <option value="Riverside District">Riverside District</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Tenant</label>
                <select
                  value={transferData.toTenant}
                  onChange={(e) => setTransferData({ ...transferData, toTenant: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select destination tenant --</option>
                  <option value="Springfield District">Springfield District</option>
                  <option value="Metro Schools">Metro Schools</option>
                  <option value="Riverside District">Riverside District</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select
                  value={transferData.licenseType}
                  onChange={(e) => setTransferData({ ...transferData, licenseType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student License</option>
                  <option value="teacher">Teacher License</option>
                  <option value="parent">Parent License</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferData.fromTenant || !transferData.toTenant || transferData.quantity <= 0}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Transfer Licenses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reclaim Modal */}
      {showReclaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowReclaimModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reclaim Inactive Licenses</h2>
              <p className="text-gray-600 mt-1">Reclaim licenses from inactive users</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-amber-900">Warning</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      This will revoke licenses from users who haven't logged in for the specified period. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleReclaim(90)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900">Inactive 90+ days</div>
                  <div className="text-sm text-gray-600 mt-1">~{licenseStats.expired} licenses eligible</div>
                </button>
                <button
                  onClick={() => handleReclaim(180)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900">Inactive 180+ days</div>
                  <div className="text-sm text-gray-600 mt-1">~{Math.floor(licenseStats.expired * 0.6)} licenses eligible</div>
                </button>
                <button
                  onClick={() => handleReclaim(365)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900">Inactive 365+ days</div>
                  <div className="text-sm text-gray-600 mt-1">~{Math.floor(licenseStats.expired * 0.3)} licenses eligible</div>
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowReclaimModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Licensing;
