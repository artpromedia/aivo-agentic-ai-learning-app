import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:9000/api/v1/admin';

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles: string[] | null;
  target_districts: string[] | null;
  target_users: string[] | null;
  environment: 'development' | 'staging' | 'production';
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface FlagFormData {
  key: string;
  name: string;
  description: string;
  environment: string;
  target_roles: string[];
  rollout_percentage: number;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState<FlagFormData>({
    key: '',
    name: '',
    description: '',
    environment: 'staging',
    target_roles: [],
    rollout_percentage: 0,
  });

  // Fetch flags on mount
  useEffect(() => {
    fetchFlags();
  }, []);

  // Fetch flags on mount
  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/feature-flags`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch flags: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFlags(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feature flags';
      setError(errorMessage);
      console.error('Error fetching flags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFlag = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      environment: 'staging',
      target_roles: [],
      rollout_percentage: 0,
    });
    setShowCreateModal(true);
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      environment: flag.environment,
      target_roles: flag.target_roles || [],
      rollout_percentage: flag.rollout_percentage,
    });
    setShowEditModal(true);
  };

  const handleToggleFlag = async (flagId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-flags/${flagId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle flag');
      }

      const updatedFlag = await response.json();
      setFlags(flags.map(f => f.id === flagId ? updatedFlag : f));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle flag';
      alert(`Error: ${errorMessage}`);
      console.error('Error toggling flag:', err);
    }
  };

  const handleSaveFlag = async () => {
    try {
      if (showCreateModal) {
        // Create new flag
        const response = await fetch(`${API_BASE_URL}/feature-flags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: formData.key,
            name: formData.name,
            description: formData.description,
            environment: formData.environment,
            rollout_percentage: formData.rollout_percentage,
            target_roles: formData.target_roles.length > 0 ? formData.target_roles : null,
            enabled: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create flag');
        }

        const newFlag = await response.json();
        setFlags([...flags, newFlag]);
        setShowCreateModal(false);
      } else if (selectedFlag) {
        // Update existing flag
        const response = await fetch(`${API_BASE_URL}/feature-flags/${selectedFlag.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            rollout_percentage: formData.rollout_percentage,
            target_roles: formData.target_roles.length > 0 ? formData.target_roles : null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update flag');
        }

        const updatedFlag = await response.json();
        setFlags(flags.map(f => f.id === selectedFlag.id ? updatedFlag : f));
        setShowEditModal(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save flag';
      alert(`Error: ${errorMessage}`);
      console.error('Error saving flag:', err);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedFlag(null);
  };

  const getTargetAudience = (flag: FeatureFlag): string => {
    if (flag.target_roles && flag.target_roles.length > 0) {
      return flag.target_roles.join(', ');
    }
    if (flag.target_districts && flag.target_districts.length > 0) {
      return 'Specific Districts';
    }
    if (flag.target_users && flag.target_users.length > 0) {
      return 'Specific Users';
    }
    return 'All Users';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchFlags}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags & Experiments</h1>
          <p className="text-gray-600 mt-1">Manage feature rollouts and A/B tests</p>
        </div>
        <button 
          onClick={handleCreateFlag}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex items-center gap-2">
            <span>+</span>
            <span>New Feature Flag</span>
          </span>
        </button>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 gap-4">
        {flags.map((flag) => (
          <div key={flag.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    flag.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                    {flag.environment}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Target:</span>
                    <span className="font-medium text-gray-700 capitalize">{getTargetAudience(flag)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Rollout:</span>
                    <span className="font-medium text-gray-700">{flag.rollout_percentage}%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Modified:</span>
                    <span className="font-medium text-gray-700">{new Date(flag.updated_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={flag.enabled} 
                    onChange={() => handleToggleFlag(flag.id)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <button 
                  onClick={() => handleEditFlag(flag)}
                  className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            {flag.enabled && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all"
                        style={{ width: `${flag.rollout_percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[45px] text-right">{flag.rollout_percentage}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Flag Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Create New Feature Flag' : 'Edit Feature Flag'}
              </h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flag Key (unique identifier)</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., new-assessment-engine"
                  disabled={showEditModal}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
                {showEditModal && (
                  <p className="text-xs text-gray-500 mt-1">Key cannot be changed after creation</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flag Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Assessment Engine"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this feature flag controls..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
                  <select
                    multiple
                    value={formData.target_roles}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, target_roles: selected });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    size={4}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="district_admin">District Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. Leave empty for all users.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rollout Percentage: {formData.rollout_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.rollout_percentage}
                  onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {formData.rollout_percentage > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    <span className="font-semibold">Rollout Preview:</span> This feature will be visible to approximately {formData.rollout_percentage}% of {formData.target_roles.length === 0 ? 'all users' : `users with roles: ${formData.target_roles.join(', ')}`}.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={closeModals}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveFlag}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all hover:shadow-md"
              >
                {showCreateModal ? 'Create Flag' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
