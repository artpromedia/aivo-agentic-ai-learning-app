import React, { useState } from 'react';

/**
 * Integrations Management Page
 * Third-party integrations like Twilio, SendGrid, Stripe, etc.
 */
export const Integrations: React.FC = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    category: 'Communication',
    description: '',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    environment: 'Production'
  });

  const handleConfigure = (name: string) => {
    setSelectedIntegration(name);
    setShowConfigModal(true);
  };

  const handleViewLogs = (name: string) => {
    setSelectedIntegration(name);
    setShowLogsModal(true);
  };

  const handleDisconnect = (name: string) => {
    setSelectedIntegration(name);
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = () => {
    // In a real app, this would make an API call
    alert(`Disconnecting ${selectedIntegration}...`);
    setShowDisconnectModal(false);
    setSelectedIntegration(null);
  };

  const closeModals = () => {
    setShowConfigModal(false);
    setShowLogsModal(false);
    setShowDisconnectModal(false);
    setShowAddModal(false);
    setSelectedIntegration(null);
  };

  const handleAddIntegration = () => {
    setShowAddModal(true);
  };

  const handleSaveNewIntegration = () => {
    // Validate form
    if (!newIntegration.name.trim() || !newIntegration.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would make an API call
    alert(`Integration "${newIntegration.name}" has been added successfully!`);
    
    // Reset form
    setNewIntegration({
      name: '',
      category: 'Communication',
      description: '',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      environment: 'Production'
    });
    
    closeModals();
  };

  const integrations = [
    {
      name: 'Twilio',
      category: 'Communication',
      status: 'connected',
      description: 'SMS and voice communication',
      apiCalls: 45230,
      lastSync: '5 minutes ago',
      credentials: 'Active',
      cost: '$1,245/mo',
    },
    {
      name: 'SendGrid',
      category: 'Email',
      status: 'connected',
      description: 'Transactional email delivery',
      apiCalls: 128450,
      lastSync: '2 minutes ago',
      credentials: 'Active',
      cost: '$450/mo',
    },
    {
      name: 'Stripe',
      category: 'Payments',
      status: 'connected',
      description: 'Payment processing and subscriptions',
      apiCalls: 2340,
      lastSync: '1 hour ago',
      credentials: 'Active',
      cost: '2.9% + $0.30',
    },
    {
      name: 'AWS S3',
      category: 'Storage',
      status: 'connected',
      description: 'Cloud object storage',
      apiCalls: 892340,
      lastSync: '30 seconds ago',
      credentials: 'Active',
      cost: '$1,890/mo',
    },
    {
      name: 'Google Cloud AI',
      category: 'AI/ML',
      status: 'connected',
      description: 'Speech-to-text and NLP services',
      apiCalls: 234560,
      lastSync: '10 minutes ago',
      credentials: 'Active',
      cost: '$4,200/mo',
    },
    {
      name: 'Clever',
      category: 'SSO',
      status: 'connected',
      description: 'Student information system sync',
      apiCalls: 1240,
      lastSync: '15 minutes ago',
      credentials: 'Active',
      cost: 'Free',
    },
    {
      name: 'Google Classroom',
      category: 'LMS',
      status: 'connected',
      description: 'Learning management system integration',
      apiCalls: 5680,
      lastSync: '20 minutes ago',
      credentials: 'Active',
      cost: 'Free',
    },
    {
      name: 'Datadog',
      category: 'Monitoring',
      status: 'connected',
      description: 'Application performance monitoring',
      apiCalls: 125000,
      lastSync: '1 minute ago',
      credentials: 'Active',
      cost: '$890/mo',
    },
    {
      name: 'Sentry',
      category: 'Error Tracking',
      status: 'connected',
      description: 'Error and performance monitoring',
      apiCalls: 45890,
      lastSync: '3 minutes ago',
      credentials: 'Active',
      cost: '$299/mo',
    },
    {
      name: 'Zoom',
      category: 'Video',
      status: 'disconnected',
      description: 'Video conferencing for virtual sessions',
      apiCalls: 0,
      lastSync: 'Never',
      credentials: 'Not configured',
      cost: '-',
    },
    {
      name: 'Slack',
      category: 'Communication',
      status: 'connected',
      description: 'Team communication and alerts',
      apiCalls: 8920,
      lastSync: '5 minutes ago',
      credentials: 'Active',
      cost: 'Free',
    },
    {
      name: 'PagerDuty',
      category: 'Incident Management',
      status: 'connected',
      description: 'On-call and incident response',
      apiCalls: 234,
      lastSync: '1 hour ago',
      credentials: 'Active',
      cost: '$399/mo',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700';
      case 'disconnected':
        return 'bg-red-100 text-red-700';
      case 'error':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Communication':
        return '📱';
      case 'Email':
        return '📧';
      case 'Payments':
        return '💳';
      case 'Storage':
        return '💾';
      case 'AI/ML':
        return '🤖';
      case 'SSO':
        return '🔐';
      case 'LMS':
        return '📚';
      case 'Monitoring':
        return '📊';
      case 'Error Tracking':
        return '🐛';
      case 'Video':
        return '🎥';
      case 'Incident Management':
        return '🚨';
      default:
        return '🔌';
    }
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const totalApiCalls = integrations.reduce((sum, i) => sum + i.apiCalls, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Third-Party Integrations</h1>
        <p className="text-gray-600 mt-1">
          Manage external services and API connections
        </p>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Integrations</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{integrations.length}</div>
          <div className="text-sm text-gray-600 mt-1">
            {connectedCount} connected
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">API Calls Today</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {(totalApiCalls / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-green-600 mt-1">All systems operational</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Active Services</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{connectedCount}</div>
          <div className="text-sm text-gray-600 mt-1">
            {integrations.length - connectedCount} inactive
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Health Status</div>
          <div className="text-3xl font-bold text-green-600 mt-1">100%</div>
          <div className="text-sm text-green-600 mt-1">No errors detected</div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Connected Services</h2>
            <button 
              onClick={handleAddIntegration}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              + Add Integration
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getCategoryIcon(integration.category)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-xs text-gray-500">{integration.category}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}
                >
                  {integration.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-500">API Calls</div>
                  <div className="font-semibold text-gray-900">
                    {integration.apiCalls.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Last Sync</div>
                  <div className="font-semibold text-gray-900">{integration.lastSync}</div>
                </div>
                <div>
                  <div className="text-gray-500">Credentials</div>
                  <div className="font-semibold text-gray-900">{integration.credentials}</div>
                </div>
                <div>
                  <div className="text-gray-500">Cost</div>
                  <div className="font-semibold text-gray-900">{integration.cost}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleConfigure(integration.name)}
                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Configure
                </button>
                <button 
                  onClick={() => handleViewLogs(integration.name)}
                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  View Logs
                </button>
                {integration.status === 'connected' && (
                  <button 
                    onClick={() => handleDisconnect(integration.name)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Health Metrics</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Response Time</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '92%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">145ms avg</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Success Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '99.8%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">99.8%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Uptime</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '99.97%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">99.97%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Error Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '99.5%' }} />
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">0.02%</div>
          </div>
        </div>
      </div>

      {/* Configure Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configure {selectedIntegration}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="text"
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://your-app.com/webhooks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Configuration saved for ${selectedIntegration}`);
                  closeModals();
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedIntegration} API Logs
            </h3>
            <div className="flex-1 overflow-auto bg-gray-900 text-green-400 p-4 rounded font-mono text-xs">
              <div className="space-y-1">
                <div>[2024-01-19 14:23:45] INFO: API request initiated</div>
                <div>[2024-01-19 14:23:45] INFO: Authentication successful</div>
                <div>[2024-01-19 14:23:46] INFO: Request: POST /api/v1/messages</div>
                <div>[2024-01-19 14:23:46] INFO: Response: 200 OK - Message sent successfully</div>
                <div>[2024-01-19 14:23:46] INFO: Latency: 145ms</div>
                <div className="text-gray-500">---</div>
                <div>[2024-01-19 14:20:12] INFO: API request initiated</div>
                <div>[2024-01-19 14:20:12] INFO: Authentication successful</div>
                <div>[2024-01-19 14:20:13] INFO: Request: GET /api/v1/status</div>
                <div>[2024-01-19 14:20:13] INFO: Response: 200 OK - Service operational</div>
                <div>[2024-01-19 14:20:13] INFO: Latency: 98ms</div>
                <div className="text-gray-500">---</div>
                <div>[2024-01-19 14:15:30] WARN: Rate limit approaching (85% of quota)</div>
                <div>[2024-01-19 14:15:30] INFO: Request: POST /api/v1/messages</div>
                <div>[2024-01-19 14:15:31] INFO: Response: 200 OK - Message sent successfully</div>
                <div>[2024-01-19 14:15:31] INFO: Latency: 167ms</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => alert('Downloading logs...')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Download Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Disconnect {selectedIntegration}?
              </h3>
              <p className="text-gray-600 mb-6">
                This will stop all API calls and data synchronization. Your configuration will be saved
                and you can reconnect at any time.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Integration
            </h3>
            <p className="text-gray-600 mb-6">
              Configure a new third-party integration to extend Aivo Learning's capabilities.
            </p>

            <div className="space-y-4">
              {/* Integration Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Integration Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="e.g., Microsoft Teams, Salesforce"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newIntegration.category}
                  onChange={(e) => setNewIntegration({ ...newIntegration, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Communication">📱 Communication</option>
                  <option value="Email">📧 Email</option>
                  <option value="Payments">💳 Payments</option>
                  <option value="Storage">💾 Storage</option>
                  <option value="AI/ML">🤖 AI/ML</option>
                  <option value="SSO">🔐 SSO</option>
                  <option value="LMS">📚 LMS</option>
                  <option value="Monitoring">📊 Monitoring</option>
                  <option value="Error Tracking">🐛 Error Tracking</option>
                  <option value="Video">🎥 Video</option>
                  <option value="Incident Management">🚨 Incident Management</option>
                  <option value="Other">🔌 Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newIntegration.description}
                  onChange={(e) => setNewIntegration({ ...newIntegration, description: e.target.value })}
                  placeholder="Brief description of what this integration provides"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={newIntegration.apiKey}
                  onChange={(e) => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key / API Secret
                </label>
                <input
                  type="password"
                  value={newIntegration.secretKey}
                  onChange={(e) => setNewIntegration({ ...newIntegration, secretKey: e.target.value })}
                  placeholder="Enter secret key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={newIntegration.webhookUrl}
                  onChange={(e) => setNewIntegration({ ...newIntegration, webhookUrl: e.target.value })}
                  placeholder="https://your-app.com/webhooks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Environment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environment <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newIntegration.environment}
                  onChange={(e) => setNewIntegration({ ...newIntegration, environment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              {/* Information Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-blue-500 text-xl">ℹ️</div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Note</h4>
                    <p className="text-sm text-blue-700">
                      All credentials are encrypted at rest and in transit. Make sure to use environment-specific
                      credentials and rotate keys regularly following security best practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewIntegration}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Add Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
