import { useState } from 'react';

interface ConfigFormData {
  platformName: string;
  supportEmail: string;
  sessionTimeout: number;
  minPasswordLength: number;
  maxLoginAttempts: number;
  require2FA: boolean;
  rateLimit: number;
  apiVersion: string;
  logRetention: number;
  backupFrequency: string;
}

export default function SystemConfiguration() {
  const initialConfig: ConfigFormData = {
    platformName: 'Aivo Learning',
    supportEmail: 'support@aivo.com',
    sessionTimeout: 30,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    require2FA: true,
    rateLimit: 1000,
    apiVersion: 'v1',
    logRetention: 90,
    backupFrequency: 'Daily'
  };

  const [config, setConfig] = useState<ConfigFormData>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInputChange = (field: keyof ConfigFormData, value: any) => {
    setConfig({ ...config, [field]: value });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    // Simulate API call
    console.log('Saving configuration:', config);
    alert('Configuration saved successfully!');
    setHasChanges(false);
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setConfig(initialConfig);
        setHasChanges(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">System Configuration</h1>
        <p className="text-neutral-600 mt-1">Global settings and platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Platform Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Platform Name</label>
              <input 
                type="text" 
                value={config.platformName}
                onChange={(e) => handleInputChange('platformName', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Support Email</label>
              <input 
                type="email" 
                value={config.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Session Timeout (minutes)</label>
              <input 
                type="number" 
                value={config.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Security Policies</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Min Password Length</label>
              <input 
                type="number" 
                value={config.minPasswordLength}
                onChange={(e) => handleInputChange('minPasswordLength', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Max Login Attempts</label>
              <input 
                type="number" 
                value={config.maxLoginAttempts}
                onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={config.require2FA}
                  onChange={(e) => handleInputChange('require2FA', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                />
                <span className="text-sm font-medium text-neutral-700">Require 2FA for Admin</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">API Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Rate Limit (requests/min)</label>
              <input 
                type="number" 
                value={config.rateLimit}
                onChange={(e) => handleInputChange('rateLimit', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">API Version</label>
              <select 
                value={config.apiVersion}
                onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>v1</option>
                <option>v2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Data Retention</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Log Retention (days)</label>
              <input 
                type="number" 
                value={config.logRetention}
                onChange={(e) => handleInputChange('logRetention', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Backup Frequency</label>
              <select 
                value={config.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          onClick={handleCancel}
          className="px-6 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-neutral-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveChanges}
          disabled={!hasChanges}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">Confirm Configuration Changes</h3>
              <p className="text-neutral-600 text-center text-sm mb-6">
                Are you sure you want to save these system configuration changes? This will affect all users on the platform.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Confirm Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
