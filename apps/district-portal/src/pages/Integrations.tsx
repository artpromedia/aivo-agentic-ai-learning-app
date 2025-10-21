import { useState } from 'react';
import { getIntegrations } from '../utils/mockData';

export default function Integrations() {
  const [integrations, setIntegrations] = useState(getIntegrations());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    provider: '',
    type: 'Student Information System',
    syncFrequency: 'Every 6 hours',
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    enableStudents: true,
    enableStaff: true,
    enableGrades: true,
    enableAttendance: true,
  });

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-700', icon: '✓', label: 'Active' },
    error: { color: 'bg-red-100 text-red-700', icon: '⚠️', label: 'Error' },
    inactive: { color: 'bg-neutral-100 text-neutral-700', icon: '○', label: 'Inactive' },
    syncing: { color: 'bg-blue-100 text-blue-700', icon: '↻', label: 'Syncing' },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Integration Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage connections to external systems and data sources
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Add Integration
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Integrations</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{integrations.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {integrations.filter((i) => i.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Errors</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {integrations.filter((i) => i.status === 'error').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Records Synced Today</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {integrations.reduce((sum, i) => sum + i.recordsSynced, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const config = statusConfig[integration.status];
          const timeSinceSync = Math.floor(
            (Date.now() - integration.lastSync.getTime()) / (1000 * 60)
          );
          const timeUntilSync = Math.floor(
            (integration.nextScheduledSync.getTime() - Date.now()) / (1000 * 60)
          );

          return (
            <div
              key={integration.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{integration.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {integration.type} • {integration.provider}
                  </p>
                </div>
              </div>

              {/* Sync Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Last Sync:</span>
                  <span className="font-medium text-neutral-900">
                    {timeSinceSync < 60
                      ? `${timeSinceSync}m ago`
                      : `${Math.floor(timeSinceSync / 60)}h ago`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next Sync:</span>
                  <span className="font-medium text-neutral-900">
                    {timeUntilSync < 0
                      ? 'Overdue'
                      : timeUntilSync < 60
                      ? `in ${timeUntilSync}m`
                      : `in ${Math.floor(timeUntilSync / 60)}h`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Frequency:</span>
                  <span className="font-medium text-neutral-900">{integration.syncFrequency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Records Synced:</span>
                  <span className="font-medium text-neutral-900">
                    {integration.recordsSynced.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Data Mapping */}
              <div className="mb-4 pb-4 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-700 mb-2">Data Mapping:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(integration.dataMapping).map(([key, enabled]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className={enabled ? 'text-green-600' : 'text-neutral-400'}>
                        {enabled ? '✓' : '○'}
                      </span>
                      <span className="text-xs text-neutral-600 capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {integration.errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Error:</span> {integration.errorMessage}
                  </p>
                  {integration.errorCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {integration.errorCount} error{integration.errorCount !== 1 ? 's' : ''}{' '}
                      detected
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
                  Sync Now
                </button>
                <button className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium text-sm">
                  View Logs
                </button>
                <button className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                  ⚙️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Integrations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Clever', 'Schoology', 'Zoom', 'Remind', 'ClassDojo', 'Seesaw', 'Khan Academy', 'IXL'].map(
            (service) => (
              <button
                key={service}
                onClick={() => {
                  setNewIntegration({ ...newIntegration, provider: service });
                  setShowAddModal(true);
                }}
                className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
              >
                <p className="font-medium text-neutral-900 text-sm">{service}</p>
                <p className="text-xs text-neutral-500 mt-1">Click to connect</p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Add New Integration</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Connect a third-party system to sync data with your district
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Map user-friendly type names to type codes
              const typeMap: Record<string, 'SIS' | 'LMS' | 'Communication' | 'Assessment' | 'Authentication'> = {
                'Student Information System': 'SIS',
                'Learning Management System': 'LMS',
                'Video Conferencing': 'Communication',
                'Assessment Platform': 'Assessment',
                'Communication Tool': 'Communication',
                'Single Sign-On': 'Authentication',
              };
              
              const newInt = {
                id: `int-${integrations.length + 1}`,
                name: newIntegration.provider,
                provider: newIntegration.provider,
                type: typeMap[newIntegration.type] || 'LMS',
                status: 'inactive' as const,
                lastSync: new Date(),
                nextScheduledSync: new Date(Date.now() + 6 * 60 * 60 * 1000),
                syncFrequency: newIntegration.syncFrequency,
                recordsSynced: 0,
                dataMapping: {
                  students: newIntegration.enableStudents,
                  teachers: newIntegration.enableStaff,
                  classes: newIntegration.enableAttendance,
                  grades: newIntegration.enableGrades,
                },
                errorMessage: undefined,
                errorCount: 0,
              };
              setIntegrations([...integrations, newInt]);
              setShowAddModal(false);
              setNewIntegration({
                provider: '',
                type: 'Student Information System',
                syncFrequency: 'Every 6 hours',
                apiKey: '',
                apiSecret: '',
                baseUrl: '',
                enableStudents: true,
                enableStaff: true,
                enableGrades: true,
                enableAttendance: true,
              });
            }} className="p-6 space-y-6">
              
              {/* Provider Selection */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-neutral-700 mb-2">
                  Provider *
                </label>
                <select
                  id="provider"
                  required
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegration({ ...newIntegration, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a provider...</option>
                  <option value="Google Classroom">Google Classroom</option>
                  <option value="Clever">Clever</option>
                  <option value="Schoology">Schoology</option>
                  <option value="Canvas">Canvas</option>
                  <option value="PowerSchool">PowerSchool</option>
                  <option value="Infinite Campus">Infinite Campus</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="ClassDojo">ClassDojo</option>
                  <option value="Seesaw">Seesaw</option>
                </select>
              </div>

              {/* Integration Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
                  Integration Type *
                </label>
                <select
                  id="type"
                  required
                  value={newIntegration.type}
                  onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Student Information System">Student Information System</option>
                  <option value="Learning Management System">Learning Management System</option>
                  <option value="Video Conferencing">Video Conferencing</option>
                  <option value="Assessment Platform">Assessment Platform</option>
                  <option value="Communication Tool">Communication Tool</option>
                  <option value="Single Sign-On">Single Sign-On</option>
                </select>
              </div>

              {/* API Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-neutral-700 mb-2">
                    API Key *
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    required
                    value={newIntegration.apiKey}
                    onChange={(e) => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="apiSecret" className="block text-sm font-medium text-neutral-700 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    id="apiSecret"
                    value={newIntegration.apiSecret}
                    onChange={(e) => setNewIntegration({ ...newIntegration, apiSecret: e.target.value })}
                    placeholder="Enter API secret (if required)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium text-neutral-700 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  id="baseUrl"
                  value={newIntegration.baseUrl}
                  onChange={(e) => setNewIntegration({ ...newIntegration, baseUrl: e.target.value })}
                  placeholder="https://api.provider.com (optional)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Sync Frequency */}
              <div>
                <label htmlFor="syncFrequency" className="block text-sm font-medium text-neutral-700 mb-2">
                  Sync Frequency *
                </label>
                <select
                  id="syncFrequency"
                  required
                  value={newIntegration.syncFrequency}
                  onChange={(e) => setNewIntegration({ ...newIntegration, syncFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Real-time">Real-time (when possible)</option>
                  <option value="Every hour">Every hour</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Daily at midnight">Daily at midnight</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              {/* Data Mapping */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Data to Sync
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIntegration.enableStudents}
                      onChange={(e) => setNewIntegration({ ...newIntegration, enableStudents: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Student Information</p>
                      <p className="text-xs text-neutral-500">Names, IDs, enrollment status, demographics</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIntegration.enableStaff}
                      onChange={(e) => setNewIntegration({ ...newIntegration, enableStaff: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Staff Information</p>
                      <p className="text-xs text-neutral-500">Teachers, administrators, support staff</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIntegration.enableGrades}
                      onChange={(e) => setNewIntegration({ ...newIntegration, enableGrades: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Grades & Assessments</p>
                      <p className="text-xs text-neutral-500">Assignment scores, report cards, test results</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIntegration.enableAttendance}
                      onChange={(e) => setNewIntegration({ ...newIntegration, enableAttendance: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Attendance Records</p>
                      <p className="text-xs text-neutral-500">Daily attendance, tardies, absences</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">🔒</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p className="text-blue-700">
                      All API credentials are encrypted and stored securely. Integration data is transferred 
                      over HTTPS and complies with FERPA and COPPA regulations. You can revoke access at any time 
                      from the integration settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewIntegration({
                      provider: '',
                      type: 'Student Information System',
                      syncFrequency: 'Every 6 hours',
                      apiKey: '',
                      apiSecret: '',
                      baseUrl: '',
                      enableStudents: true,
                      enableStaff: true,
                      enableGrades: true,
                      enableAttendance: true,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Connect Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
