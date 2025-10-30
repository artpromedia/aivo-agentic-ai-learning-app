import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    agenticAPI,
    type AgenticDashboard,
    type InterventionPolicy,
    type LearningGoal,
    type ProactiveIntervention,
    type ReasoningTrace,
} from '../services/agentic.api';

interface AIBrainDashboardProps {
  brainId?: string;
}

export function AIBrainDashboard({ brainId: propBrainId }: AIBrainDashboardProps) {
  const { brainId: paramBrainId } = useParams<{ brainId: string }>();
  const brainId = propBrainId || paramBrainId || 'default-brain';

  const [dashboard, setDashboard] = useState<AgenticDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'interventions' | 'reasoning' | 'settings'>('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agenticAPI.getDashboard(brainId);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI brain dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainId]);

  const handlePolicyUpdate = async (policy: InterventionPolicy) => {
    try {
      await agenticAPI.updatePolicy(brainId, policy);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy');
    }
  };

  const handleStartMonitoring = async () => {
    try {
      const sessionId = `session-${Date.now()}`;
      await agenticAPI.startMonitoring(brainId, sessionId, dashboard?.current_policy);
      setIsMonitoring(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
    }
  };

  const getTriggerIcon = (trigger: string): string => {
    const icons: Record<string, string> = {
      frustration: '😤',
      disengagement: '😴',
      success_momentum: '🚀',
      fatigue: '😓',
      stuck: '🤔',
      breakthrough: '💡',
    };
    return icons[trigger] || '🤖';
  };

  const getTriggerColor = (trigger: string): string => {
    const colors: Record<string, string> = {
      frustration: 'from-red-500 to-orange-500',
      disengagement: 'from-gray-500 to-slate-500',
      success_momentum: 'from-green-500 to-emerald-500',
      fatigue: 'from-yellow-500 to-amber-500',
      stuck: 'from-blue-500 to-indigo-500',
      breakthrough: 'from-purple-500 to-pink-500',
    };
    return colors[trigger] || 'from-gray-500 to-neutral-500';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading AI Brain Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <p className="text-yellow-800">No AI brain data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🧠</span>
              <h1 className="text-4xl font-bold">AI Brain Dashboard</h1>
            </div>
            <p className="text-lg text-purple-100">
              Autonomous monitoring and proactive support for your child's learning
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <div className="text-sm text-purple-100 mb-1">Autonomy Level</div>
              <div className="text-3xl font-bold">{dashboard.current_policy.autonomy_level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
              🎯
            </div>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {dashboard.summary.active_goals} Active
            </span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{dashboard.summary.total_goals}</h3>
          <p className="text-sm text-neutral-600">Learning Goals</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {dashboard.summary.achieved_goals} Achieved
            </span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">
            {dashboard.summary.acceptance_rate.toFixed(0)}%
          </h3>
          <p className="text-sm text-neutral-600">Acceptance Rate</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
              🤖
            </div>
            <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Today
            </span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">{dashboard.summary.total_interventions}</h3>
          <p className="text-sm text-neutral-600">AI Interventions</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl">
              ⭐
            </div>
            <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              High
            </span>
          </div>
          <h3 className="text-3xl font-bold text-neutral-900 mb-1">
            {(dashboard.summary.avg_confidence * 100).toFixed(0)}%
          </h3>
          <p className="text-sm text-neutral-600">Avg Confidence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100">
        <div className="border-b border-neutral-200">
          <div className="flex gap-1 p-2">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'goals', label: 'Goals', icon: '🎯' },
              { key: 'interventions', label: 'Interventions', icon: '🤖' },
              { key: 'reasoning', label: 'Reasoning', icon: '🧠' },
              { key: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab dashboard={dashboard} />}
          {activeTab === 'goals' && <GoalsTab goals={dashboard.active_goals} />}
          {activeTab === 'interventions' && (
            <InterventionsTab
              interventions={dashboard.recent_interventions}
              getTriggerIcon={getTriggerIcon}
              getTriggerColor={getTriggerColor}
              formatTimestamp={formatTimestamp}
            />
          )}
          {activeTab === 'reasoning' && (
            <ReasoningTab traces={dashboard.reasoning_traces} formatTimestamp={formatTimestamp} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              policy={dashboard.current_policy}
              onUpdate={handlePolicyUpdate}
              isMonitoring={isMonitoring}
              onStartMonitoring={handleStartMonitoring}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ dashboard }: { dashboard: AgenticDashboard }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {dashboard.recent_interventions.slice(0, 5).map((intervention) => (
            <div
              key={intervention.id}
              className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-neutral-900 capitalize">
                    {intervention.trigger_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(intervention.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 mb-2">{intervention.message}</p>
                {intervention.learner_response && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      intervention.learner_response === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : intervention.learner_response === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {intervention.learner_response}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-neutral-900 mb-4">Active Goals Progress</h3>
        <div className="space-y-3">
          {dashboard.active_goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-neutral-900">{goal.title}</h4>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {(goal.confidence_score * 100).toFixed(0)}% confident
                </span>
              </div>
              <p className="text-sm text-neutral-700 mb-3">{goal.description}</p>
              {goal.current_value !== undefined && goal.target_value !== undefined && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {goal.current_value} / {goal.target_value}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Goals Tab Component
function GoalsTab({ goals }: { goals: LearningGoal[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'achieved'>('all');

  const filteredGoals =
    filter === 'all' ? goals : goals.filter((g) => g.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900">Learning Goals</h3>
        <div className="flex gap-2">
          {['all', 'active', 'achieved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white border-2 border-neutral-200 rounded-xl p-5 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {goal.goal_type === 'skill_mastery'
                    ? '🎯'
                    : goal.goal_type === 'confidence_building'
                    ? '💪'
                    : goal.goal_type === 'engagement'
                    ? '🎮'
                    : '💡'}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    goal.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : goal.status === 'achieved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {goal.status}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {new Date(goal.created_at).toLocaleDateString()}
              </span>
            </div>

            <h4 className="font-bold text-neutral-900 mb-2">{goal.title}</h4>
            <p className="text-sm text-neutral-600 mb-3">{goal.description}</p>

            {goal.current_value !== undefined && goal.target_value !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>{goal.target_metric || 'Progress'}</span>
                  <span>
                    {goal.current_value} / {goal.target_value}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <details className="mt-3">
              <summary className="text-xs font-medium text-purple-600 cursor-pointer hover:text-purple-700">
                View AI Reasoning
              </summary>
              <p className="mt-2 text-xs text-neutral-600 bg-neutral-50 rounded-lg p-3">
                {goal.reasoning}
              </p>
            </details>
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🎯</span>
          <p className="text-neutral-600">No {filter !== 'all' ? filter : ''} goals yet</p>
        </div>
      )}
    </div>
  );
}

// Interventions Tab Component
function InterventionsTab({
  interventions,
  getTriggerIcon,
  getTriggerColor,
  formatTimestamp,
}: {
  interventions: ProactiveIntervention[];
  getTriggerIcon: (trigger: string) => string;
  getTriggerColor: (trigger: string) => string;
  formatTimestamp: (timestamp: string) => string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-neutral-900">Intervention History</h3>

      <div className="space-y-3">
        {interventions.map((intervention) => (
          <div
            key={intervention.id}
            className="border-2 border-neutral-200 rounded-xl p-5 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${getTriggerColor(
                  intervention.trigger_type
                )} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {getTriggerIcon(intervention.trigger_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-neutral-900 capitalize">
                      {intervention.trigger_type.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {formatTimestamp(intervention.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full">
                    {intervention.intervention_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-sm text-neutral-700 mb-3">{intervention.message}</p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Severity:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${
                            i < intervention.severity * 5
                              ? 'bg-orange-500'
                              : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {intervention.learner_response && (
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        intervention.learner_response === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : intervention.learner_response === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {intervention.learner_response}
                    </span>
                  )}
                </div>

                <details className="mt-3">
                  <summary className="text-xs font-medium text-purple-600 cursor-pointer hover:text-purple-700">
                    Why did AI intervene?
                  </summary>
                  <p className="mt-2 text-xs text-neutral-600 bg-purple-50 rounded-lg p-3">
                    {intervention.reasoning}
                  </p>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      {interventions.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🤖</span>
          <p className="text-neutral-600">No interventions yet</p>
        </div>
      )}
    </div>
  );
}

// Reasoning Tab Component
function ReasoningTab({
  traces,
  formatTimestamp,
}: {
  traces: ReasoningTrace[];
  formatTimestamp: (timestamp: string) => string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-neutral-900">AI Decision History</h3>

      <div className="space-y-3">
        {traces.map((trace) => (
          <div
            key={trace.id}
            className="border-2 border-neutral-200 rounded-xl p-5 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">{trace.decision_type}</h4>
                <p className="text-sm text-neutral-600">{trace.decision}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500 mb-1">
                  {formatTimestamp(trace.timestamp)}
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  {(trace.confidence * 100).toFixed(0)}% confident
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="text-xs font-bold text-purple-900 mb-2">🧠 Reasoning Steps:</h5>
              <ol className="space-y-1">
                {trace.reasoning_steps.map((step, idx) => (
                  <li key={idx} className="text-xs text-purple-800">
                    <span className="font-semibold">{idx + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>

            {trace.alternatives_considered && trace.alternatives_considered.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs font-medium text-neutral-600 cursor-pointer hover:text-neutral-700">
                  Other options considered ({trace.alternatives_considered.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {trace.alternatives_considered.map((alt, idx) => (
                    <li key={idx} className="text-xs text-neutral-600 bg-neutral-50 rounded p-2">
                      • {alt}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      {traces.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🧠</span>
          <p className="text-neutral-600">No reasoning traces yet</p>
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({
  policy,
  onUpdate,
  isMonitoring,
  onStartMonitoring,
}: {
  policy: InterventionPolicy;
  onUpdate: (policy: InterventionPolicy) => void;
  isMonitoring: boolean;
  onStartMonitoring: () => void;
}) {
  const [editedPolicy, setEditedPolicy] = useState(policy);

  const handleSave = () => {
    onUpdate(editedPolicy);
  };

  const triggerOptions = [
    { value: 'frustration', label: 'Frustration Detection', icon: '😤', desc: 'Detect when learner is frustrated' },
    { value: 'disengagement', label: 'Disengagement', icon: '😴', desc: 'Notice when attention drops' },
    { value: 'success_momentum', label: 'Success Momentum', icon: '🚀', desc: 'Amplify winning streaks' },
    { value: 'fatigue', label: 'Fatigue', icon: '😓', desc: 'Suggest breaks when tired' },
    { value: 'stuck', label: 'Stuck State', icon: '🤔', desc: 'Help when learner is stuck' },
    { value: 'breakthrough', label: 'Breakthrough', icon: '💡', desc: 'Celebrate aha moments' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-neutral-900 mb-4">AI Brain Settings</h3>
        <p className="text-sm text-neutral-600 mb-6">
          Control how proactively the AI helps your child. Higher autonomy means more independent decision-making.
        </p>
      </div>

      {/* Autonomy Level */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
        <h4 className="font-bold text-neutral-900 mb-4">Autonomy Level</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              level: 1,
              title: 'Ask First',
              desc: 'AI asks permission before helping',
              icon: '🤚',
            },
            {
              level: 2,
              title: 'Balanced',
              desc: 'AI helps proactively with limits',
              icon: '⚖️',
            },
            {
              level: 3,
              title: 'Full Trust',
              desc: 'AI acts independently',
              icon: '🚀',
            },
          ].map((option) => (
            <button
              key={option.level}
              onClick={() =>
                setEditedPolicy({ ...editedPolicy, autonomy_level: option.level as 1 | 2 | 3 })
              }
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                editedPolicy.autonomy_level === option.level
                  ? 'border-purple-600 bg-purple-100'
                  : 'border-neutral-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">{option.icon}</div>
              <div className="font-bold text-neutral-900 mb-1">
                Level {option.level}: {option.title}
              </div>
              <div className="text-xs text-neutral-600">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Trigger Types */}
      <div className="bg-white rounded-xl p-6 border-2 border-neutral-200">
        <h4 className="font-bold text-neutral-900 mb-4">Enabled Triggers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {triggerOptions.map((trigger) => (
            <label
              key={trigger.value}
              className="flex items-start gap-3 p-3 rounded-lg border-2 border-neutral-200 hover:border-purple-300 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={editedPolicy.enabled_triggers.includes(trigger.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEditedPolicy({
                      ...editedPolicy,
                      enabled_triggers: [...editedPolicy.enabled_triggers, trigger.value],
                    });
                  } else {
                    setEditedPolicy({
                      ...editedPolicy,
                      enabled_triggers: editedPolicy.enabled_triggers.filter(
                        (t) => t !== trigger.value
                      ),
                    });
                  }
                }}
                className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{trigger.icon}</span>
                  <span className="font-semibold text-sm text-neutral-900">{trigger.label}</span>
                </div>
                <p className="text-xs text-neutral-600">{trigger.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-white rounded-xl p-6 border-2 border-neutral-200">
        <h4 className="font-bold text-neutral-900 mb-4">Rate Limits</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Minimum time between interventions (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={editedPolicy.min_interval_minutes}
              onChange={(e) =>
                setEditedPolicy({
                  ...editedPolicy,
                  min_interval_minutes: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Maximum interventions per session
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={editedPolicy.max_per_session}
              onChange={(e) =>
                setEditedPolicy({
                  ...editedPolicy,
                  max_per_session: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onStartMonitoring}
          disabled={isMonitoring}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isMonitoring
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isMonitoring ? '✅ Monitoring Active' : '▶️ Start Monitoring'}
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          💾 Save Settings
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">About AI Autonomy</p>
            <p>
              These settings control how much the AI can help without asking. Level 1 requires your child's
              approval for every suggestion. Level 3 lets the AI act independently when it detects important
              moments. All actions are logged for your review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIBrainDashboard;
