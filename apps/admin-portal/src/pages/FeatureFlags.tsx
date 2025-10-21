import { useState } from 'react';
import { getFeatureFlags } from '../utils/mockData';

interface FlagFormData {
  name: string;
  description: string;
  environment: string;
  targetAudience: string;
  rolloutPercentage: number;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState(getFeatureFlags());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [formData, setFormData] = useState<FlagFormData>({
    name: '',
    description: '',
    environment: 'staging',
    targetAudience: 'all',
    rolloutPercentage: 0,
  });

  const handleCreateFlag = () => {
    setFormData({
      name: '',
      description: '',
      environment: 'staging',
      targetAudience: 'all',
      rolloutPercentage: 0,
    });
    setShowCreateModal(true);
  };

  const handleEditFlag = (flag: any) => {
    setSelectedFlag(flag);
    setFormData({
      name: flag.name,
      description: flag.description,
      environment: flag.environment,
      targetAudience: flag.targetAudience,
      rolloutPercentage: flag.rolloutPercentage,
    });
    setShowEditModal(true);
  };

  const handleToggleFlag = (flagId: string) => {
    setFlags(flags.map(f => 
      f.id === flagId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const handleSaveFlag = () => {
    if (showCreateModal) {
      const newFlag = {
        id: `flag-${Date.now()}`,
        ...formData,
        enabled: false,
        createdAt: new Date(),
        createdBy: 'Super Admin',
        modifiedBy: 'Super Admin',
        modifiedAt: new Date(),
        targetAudience: formData.targetAudience as "all" | "districts" | "schools" | "specific-users",
        environment: formData.environment as "production" | "staging" | "development",
      };
      setFlags([...flags, newFlag] as any);
      setShowCreateModal(false);
    } else {
      setFlags(flags.map(f => 
        f.id === selectedFlag?.id ? { 
          ...f, 
          name: formData.name,
          description: formData.description,
          rolloutPercentage: formData.rolloutPercentage,
          modifiedAt: new Date(),
          modifiedBy: 'Super Admin'
        } : f
      ));
      setShowEditModal(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedFlag(null);
  };

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
                    <span className="font-medium text-gray-700 capitalize">{flag.targetAudience}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Rollout:</span>
                    <span className="font-medium text-gray-700">{flag.rolloutPercentage}%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Modified:</span>
                    <span className="font-medium text-gray-700">{flag.modifiedAt.toLocaleDateString()}</span>
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
                        style={{ width: `${flag.rolloutPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 min-w-[45px] text-right">{flag.rolloutPercentage}%</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Flag Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., new-assessment-engine"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="districts">Districts Only</option>
                    <option value="beta">Beta Testers</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="parents">Parents Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rollout Percentage: {formData.rolloutPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.rolloutPercentage}
                  onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
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

              {formData.rolloutPercentage > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    <span className="font-semibold">Rollout Preview:</span> This feature will be visible to approximately {formData.rolloutPercentage}% of {formData.targetAudience === 'all' ? 'all users' : formData.targetAudience}.
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
