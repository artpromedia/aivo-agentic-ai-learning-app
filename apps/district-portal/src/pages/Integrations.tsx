import { useState, useEffect } from 'react';
import { integrationsAPI, type Integration, type IntegrationSyncLog } from '../services/api';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, error: 0, syncing: 0, total_records_synced: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [newIntegration, setNewIntegration] = useState({
    provider: '',
    type: 'SIS',
    syncFrequency: 'Every 6 hours',
    apiKey: '',
    apiSecret: '',
    baseUrl: '',
    enableStudents: true,
    enableStaff: true,
    enableGrades: true,
    enableAttendance: true,
  });

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
    loadStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationsAPI.list();
      setIntegrations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await integrationsAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSync = async (integrationId: number) => {
    try {
      setSyncing({ ...syncing, [integrationId]: true });
      await integrationsAPI.sync(integrationId);
      // Reload integrations to show updated sync time
      await loadIntegrations();
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sync integration');
    } finally {
      setSyncing({ ...syncing, [integrationId]: false });
    }
  };

  const handleConnect = async (integrationId: number) => {
    try {
      await integrationsAPI.connect(integrationId);
      await loadIntegrations();
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to connect integration');
    }
  };

  const handleDisconnect = async (integrationId: number) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    try {
      await integrationsAPI.disconnect(integrationId);
      await loadIntegrations();
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to disconnect integration');
    }
  };

  const handleDelete = async (integrationId: number) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return;
    try {
      await integrationsAPI.delete(integrationId);
      await loadIntegrations();
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete integration');
    }
  };

  const handleViewLogs = async (integration: Integration) => {
    try {
      setSelectedIntegration(integration);
      const logs = await integrationsAPI.getLogs(integration.id);
      setSyncLogs(logs);
      setShowLogsModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load sync logs');
    }
  };

  const handleOpenSettings = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowSettingsModal(true);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    try {
      await integrationsAPI.update(selectedIntegration.id, {
        sync_frequency: selectedIntegration.sync_frequency,
        data_mapping: selectedIntegration.data_mapping,
      });
      await loadIntegrations();
      setShowSettingsModal(false);
      setSelectedIntegration(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-700', icon: '✓', label: 'Active' },
    error: { color: 'bg-red-100 text-red-700', icon: '⚠️', label: 'Error' },
    inactive: { color: 'bg-neutral-100 text-neutral-700', icon: '○', label: 'Inactive' },
    syncing: { color: 'bg-blue-100 text-blue-700', icon: '↻', label: 'Syncing' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-neutral-600 mt-4">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error Loading Integrations</h3>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={loadIntegrations}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

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
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Errors</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.error}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Records Synced</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {stats.total_records_synced.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const config = statusConfig[integration.status];
          const lastSync = integration.last_sync ? new Date(integration.last_sync) : null;
          const nextSync = integration.next_scheduled_sync ? new Date(integration.next_scheduled_sync) : null;
          const timeSinceSync = lastSync ? Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60)) : null;
          const timeUntilSync = nextSync ? Math.floor((nextSync.getTime() - Date.now()) / (1000 * 60)) : null;

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
                    {integration.integration_type} • {integration.provider}
                  </p>
                </div>
              </div>

              {/* Sync Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Last Sync:</span>
                  <span className="font-medium text-neutral-900">
                    {timeSinceSync !== null
                      ? timeSinceSync < 60
                        ? `${timeSinceSync}m ago`
                        : `${Math.floor(timeSinceSync / 60)}h ago`
                      : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next Sync:</span>
                  <span className="font-medium text-neutral-900">
                    {timeUntilSync !== null
                      ? timeUntilSync < 0
                        ? 'Overdue'
                        : timeUntilSync < 60
                        ? `in ${timeUntilSync}m`
                        : `in ${Math.floor(timeUntilSync / 60)}h`
                      : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Frequency:</span>
                  <span className="font-medium text-neutral-900">{integration.sync_frequency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Records Synced:</span>
                  <span className="font-medium text-neutral-900">
                    {integration.records_synced.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Data Mapping */}
              {integration.data_mapping && Object.keys(integration.data_mapping).length > 0 && (
                <div className="mb-4 pb-4 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Data Mapping:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(integration.data_mapping).map(([key, enabled]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className={enabled ? 'text-green-600' : 'text-neutral-400'}>
                          {enabled ? '✓' : '○'}
                        </span>
                        <span className="text-xs text-neutral-600 capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {integration.error_message && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Error:</span> {integration.error_message}
                  </p>
                  {integration.error_count > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {integration.error_count} error{integration.error_count !== 1 ? 's' : ''}{' '}
                      detected
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {integration.status === 'active' ? (
                  <>
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing[integration.id]}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                      {syncing[integration.id] ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      onClick={() => handleViewLogs(integration)}
                      className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium text-sm"
                    >
                      View Logs
                    </button>
                    <button
                      onClick={() => handleOpenSettings(integration)}
                      className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Settings"
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Disconnect"
                    >
                      🔌
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => handleOpenSettings(integration)}
                      className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium text-sm"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </>
                )}
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

            <form onSubmit={async (e) => {
              e.preventDefault();
              
              try {
                await integrationsAPI.create({
                  name: newIntegration.provider,
                  provider: newIntegration.provider,
                  integration_type: newIntegration.type,
                  base_url: newIntegration.baseUrl || undefined,
                  api_key: newIntegration.apiKey || undefined,
                  api_secret: newIntegration.apiSecret || undefined,
                  sync_frequency: newIntegration.syncFrequency,
                  data_mapping: {
                    students: newIntegration.enableStudents,
                    staff: newIntegration.enableStaff,
                    grades: newIntegration.enableGrades,
                    attendance: newIntegration.enableAttendance,
                  },
                  webhook_enabled: 'false',
                });
                
                await loadIntegrations();
                await loadStats();
                setShowAddModal(false);
                setNewIntegration({
                  provider: '',
                  type: 'SIS',
                  syncFrequency: 'Every 6 hours',
                  apiKey: '',
                  apiSecret: '',
                  baseUrl: '',
                  enableStudents: true,
                  enableStaff: true,
                  enableGrades: true,
                  enableAttendance: true,
                });
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to create integration');
              }
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
                  <option value="SIS">Student Information System</option>
                  <option value="LMS">Learning Management System</option>
                  <option value="Communication">Communication / Video Conferencing</option>
                  <option value="Assessment">Assessment Platform</option>
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
                      type: 'SIS',
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

      {/* Sync Logs Modal */}
      {showLogsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">
                Sync Logs - {selectedIntegration.name}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                View the history of sync operations for this integration
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {syncLogs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No sync logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : log.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-sm text-neutral-600 capitalize">{log.sync_type} sync</span>
                        </div>
                        <span className="text-sm text-neutral-500">
                          {new Date(log.started_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-neutral-500">Processed</p>
                          <p className="text-lg font-semibold text-neutral-900">{log.records_processed}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Created</p>
                          <p className="text-lg font-semibold text-green-600">{log.records_created}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Updated</p>
                          <p className="text-lg font-semibold text-blue-600">{log.records_updated}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Failed</p>
                          <p className="text-lg font-semibold text-red-600">{log.records_failed}</p>
                        </div>
                      </div>

                      {log.duration_seconds !== null && (
                        <p className="text-xs text-neutral-600">
                          Duration: {log.duration_seconds}s
                        </p>
                      )}

                      {log.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-700">{log.error_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedIntegration(null);
                  setSyncLogs([]);
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">
                Integration Settings - {selectedIntegration.name}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Configure sync frequency and data mapping
              </p>
            </div>

            <form onSubmit={handleUpdateSettings} className="p-6 space-y-6">
              {/* Sync Frequency */}
              <div>
                <label htmlFor="settings-sync-freq" className="block text-sm font-medium text-neutral-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  id="settings-sync-freq"
                  value={selectedIntegration.sync_frequency}
                  onChange={(e) => setSelectedIntegration({
                    ...selectedIntegration,
                    sync_frequency: e.target.value,
                  })}
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
                  {['students', 'staff', 'grades', 'attendance'].map((key) => (
                    <label
                      key={key}
                      className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIntegration.data_mapping?.[key] || false}
                        onChange={(e) => setSelectedIntegration({
                          ...selectedIntegration,
                          data_mapping: {
                            ...selectedIntegration.data_mapping,
                            [key]: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm font-medium text-neutral-900 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSelectedIntegration(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
