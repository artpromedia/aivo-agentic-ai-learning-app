import { useState, type FormEvent } from 'react';
import { useAuth, changePassword, validatePasswordStrength, setup2FA, enable2FA, TokenManager } from '@aivo/auth';
import type { TwoFactorSetup as TwoFactorSetupData } from '@aivo/auth';

type SettingsTab = 'general' | 'security' | 'notifications' | 'preferences';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: '⚙️' },
            { id: 'security', label: 'Security', icon: '🔒' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'preferences', label: 'Preferences', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'preferences' && <PreferenceSettings />}
      </div>
    </div>
  );
}

// General Settings Tab
function GeneralSettings() {
  const [formData, setFormData] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Save settings
    console.log('General settings saved:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date Format
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Time Format
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Security Settings Tab
function SecuritySettings() {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Security Settings</h2>
        <p className="text-neutral-600 text-sm">
          Manage your password and enable additional security features
        </p>
      </div>

      {/* Password Change Section */}
      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Password</h3>
            <p className="text-sm text-neutral-600">Change your account password</p>
          </div>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            {showPasswordChange ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordChange && <PasswordChangeForm onCancel={() => setShowPasswordChange(false)} />}
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Two-Factor Authentication</h3>
            <p className="text-sm text-neutral-600">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={() => {
              if (twoFactorEnabled) {
                // Show disable confirmation
                setTwoFactorEnabled(false);
              } else {
                setShow2FASetup(true);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              twoFactorEnabled
                ? 'border border-red-300 text-red-700 hover:bg-red-50'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">Two-factor authentication is enabled</span>
            </div>
          </div>
        )}

        {show2FASetup && !twoFactorEnabled && (
          <TwoFactorSetup
            onComplete={() => {
              setTwoFactorEnabled(true);
              setShow2FASetup(false);
            }}
            onCancel={() => setShow2FASetup(false)}
          />
        )}
      </div>

      {/* Active Sessions Section */}
      <div className="border-t border-neutral-200 pt-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-neutral-900">Current Session</p>
                <p className="text-sm text-neutral-600">Windows • Chrome • New York, NY</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Password Change Form Component
function PasswordChangeForm({ onCancel }: { onCancel: () => void }) {
  const { tokens } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = validatePasswordStrength(formData.newPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!tokens?.accessToken) {
        throw new Error('Not authenticated');
      }

      await changePassword(formData, tokens.accessToken, '/api');
      setSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-neutral-50 rounded-lg">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Password changed successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Current Password
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          New Password
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-1">
              <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength.strength === 'very-strong'
                      ? 'bg-green-500 w-full'
                      : passwordStrength.strength === 'strong'
                      ? 'bg-blue-500 w-3/4'
                      : passwordStrength.strength === 'medium'
                      ? 'bg-yellow-500 w-1/2'
                      : 'bg-red-500 w-1/4'
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-neutral-600 capitalize">
                {passwordStrength.strength.replace('-', ' ')}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="text-xs text-neutral-600 space-y-1">
                {passwordStrength.feedback.map((msg, i) => (
                  <li key={i}>• {msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !passwordStrength.isValid}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}

// Two-Factor Setup Component
function TwoFactorSetup({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const { tokens } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify'>(TokenManager.getTokens() ? 'setup' : 'verify');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!tokens?.accessToken) {
        throw new Error('Not authenticated');
      }

      const data = await setup2FA(tokens.accessToken, '/api');
      setSetupData(data);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!tokens?.accessToken) {
        throw new Error('Not authenticated');
      }

      await enable2FA(
        { code: verificationCode, password },
        tokens.accessToken,
        '/api'
      );
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <div className="p-6 bg-neutral-50 rounded-lg space-y-4">
        <p className="text-sm text-neutral-600">
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password when signing in.
        </p>
        <button
          onClick={handleSetup}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Start Setup'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="p-6 bg-neutral-50 rounded-lg space-y-4">
      <div>
        <h4 className="font-semibold text-neutral-900 mb-2">Scan QR Code</h4>
        <p className="text-sm text-neutral-600 mb-4">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
        {setupData?.qrCode && (
          <div className="bg-white p-4 rounded-lg inline-block">
            <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        )}
        <p className="text-xs text-neutral-500 mt-2">
          Secret Key: <code className="bg-neutral-200 px-2 py-1 rounded">{setupData?.secret}</code>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\s/g, ''))}
          placeholder="000 000"
          maxLength={6}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Enable 2FA'}
        </button>
      </div>
    </form>
  );
}

// Notification Settings Tab
function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newMessages: true,
    progressReports: true,
    iepReminders: true,
    milestoneAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Notification Settings</h2>
        <p className="text-neutral-600 text-sm">
          Choose how you want to be notified about updates and activity
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries({
          emailNotifications: 'Email Notifications',
          pushNotifications: 'Push Notifications',
          newMessages: 'New Messages',
          progressReports: 'Progress Reports',
          iepReminders: 'IEP Reminders',
          milestoneAlerts: 'Milestone Alerts',
          weeklyDigest: 'Weekly Digest',
          marketingEmails: 'Marketing Emails',
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-200">
            <span className="text-neutral-900">{label}</span>
            <button
              onClick={() => handleToggle(key as keyof typeof settings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Preference Settings Tab
function PreferenceSettings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    dashboardLayout: 'detailed',
    defaultView: 'dashboard',
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Preferences</h2>
        <p className="text-neutral-600 text-sm">
          Customize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dashboard Layout
          </label>
          <select
            value={settings.dashboardLayout}
            onChange={(e) => setSettings({ ...settings, dashboardLayout: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="compact">Compact</option>
            <option value="detailed">Detailed</option>
            <option value="visual">Visual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Default View
          </label>
          <select
            value={settings.defaultView}
            onChange={(e) => setSettings({ ...settings, defaultView: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="dashboard">Dashboard</option>
            <option value="students">Students</option>
            <option value="messages">Messages</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
