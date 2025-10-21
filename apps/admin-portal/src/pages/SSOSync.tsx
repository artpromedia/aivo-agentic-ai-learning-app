import React, { useState } from 'react';

/**
 * SSO & Sync Management Page
 * Configure SSO providers and data synchronization
 */

interface SSOConfigData {
  provider: string;
  protocol: string;
  entityId: string;
  ssoUrl: string;
  certificate: string;
}

export const SSOSync: React.FC = () => {
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [ssoConfig, setSsoConfig] = useState<SSOConfigData>({
    provider: '',
    protocol: 'SAML',
    entityId: '',
    ssoUrl: '',
    certificate: ''
  });

  const handleSyncNow = (source: string) => {
    setSyncingSource(source);
    setTimeout(() => {
      alert(`Sync completed for ${source}`);
      setSyncingSource(null);
    }, 2000);
  };

  const handleConfigureSSO = () => {
    if (!ssoConfig.provider || !ssoConfig.entityId || !ssoConfig.ssoUrl) {
      alert('Please fill in all required fields');
      return;
    }
    alert(`SSO Provider configured: ${ssoConfig.provider}`);
    setShowSSOModal(false);
    setSsoConfig({
      provider: '',
      protocol: 'SAML',
      entityId: '',
      ssoUrl: '',
      certificate: ''
    });
  };
  const ssoProviders = [
    { name: 'Google Workspace', status: 'operational', tenants: 45, logins: 1250 },
    { name: 'Microsoft 365', status: 'operational', tenants: 38, logins: 980 },
    { name: 'Okta', status: 'degraded', tenants: 12, logins: 340, alert: '3 failed auth attempts' },
    { name: 'Custom SAML', status: 'operational', tenants: 8, logins: 120 },
  ];

  const dataSyncs = [
    { source: 'Google Classroom', status: 'syncing', lastSync: '2 minutes ago', records: 1247, errors: 0 },
    { source: 'Clever', status: 'complete', lastSync: '15 minutes ago', records: 856, errors: 0 },
    { source: 'PowerSchool SIS', status: 'error', lastSync: '1 hour ago', records: 1024, errors: 12, errorMsg: 'API rate limit exceeded' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700';
      case 'degraded': return 'bg-orange-100 text-orange-700';
      case 'down': return 'bg-red-100 text-red-700';
      case 'syncing': return 'bg-blue-100 text-blue-700';
      case 'complete': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SSO & Sync Management</h1>
        <p className="text-gray-600 mt-1">Configure SSO providers and data synchronization</p>
      </div>

      {/* SSO Providers Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SSO Provider Status</h2>
        <div className="grid grid-cols-4 gap-4">
          {ssoProviders.map((provider, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(provider.status)}`}>
                  {provider.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>{provider.tenants} tenants</div>
                <div>{provider.logins} daily logins</div>
                {provider.alert && <div className="text-orange-600 text-xs mt-2">⚠️ {provider.alert}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Synchronization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Synchronization</h2>
        <div className="space-y-4">
          {dataSyncs.map((sync, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900">{sync.source}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(sync.status)}`}>
                    {sync.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Last sync: {sync.lastSync} • {sync.records} records • {sync.errors} errors
                </div>
                {sync.errorMsg && (
                  <div className="text-sm text-red-600 mt-1">Error: {sync.errorMsg}</div>
                )}
              </div>
              <button 
                onClick={() => handleSyncNow(sync.source)}
                disabled={syncingSource === sync.source}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {syncingSource === sync.source ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New SSO Provider */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New SSO Provider</h2>
        <button 
          onClick={() => setShowSSOModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all"
        >
          + Configure SSO Provider
        </button>
      </div>

      {/* SSO Configuration Modal */}
      {showSSOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowSSOModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Configure SSO Provider</h2>
              <p className="text-gray-600 mt-1">Set up a new SSO provider for authentication</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name *</label>
                <input
                  type="text"
                  value={ssoConfig.provider}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, provider: e.target.value })}
                  placeholder="e.g., Google Workspace, Azure AD"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protocol *</label>
                <select
                  value={ssoConfig.protocol}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, protocol: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SAML">SAML 2.0</option>
                  <option value="OAuth">OAuth 2.0</option>
                  <option value="OpenID">OpenID Connect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID / Client ID *</label>
                <input
                  type="text"
                  value={ssoConfig.entityId}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, entityId: e.target.value })}
                  placeholder="urn:example:entity-id or client-id-123"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SSO Login URL / Endpoint *</label>
                <input
                  type="url"
                  value={ssoConfig.ssoUrl}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, ssoUrl: e.target.value })}
                  placeholder="https://sso.example.com/login"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate / Secret {ssoConfig.protocol === 'SAML' ? '(X.509)' : '(Client Secret)'}
                </label>
                <textarea
                  value={ssoConfig.certificate}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, certificate: e.target.value })}
                  placeholder={ssoConfig.protocol === 'SAML' ? '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----' : 'Client secret or API key'}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <strong>SP Metadata URL:</strong>
                    <div className="mt-1 bg-white p-2 rounded border border-blue-200 font-mono text-xs break-all">
                      https://aivo.com/auth/saml/metadata
                    </div>
                    <div className="mt-2">
                      <strong>Callback URL:</strong>
                      <div className="mt-1 bg-white p-2 rounded border border-blue-200 font-mono text-xs break-all">
                        https://aivo.com/auth/callback
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSSOModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => alert('Testing SSO connection...')}
                className="px-5 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
              >
                Test Connection
              </button>
              <button
                onClick={handleConfigureSSO}
                disabled={!ssoConfig.provider || !ssoConfig.entityId || !ssoConfig.ssoUrl}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SSOSync;
