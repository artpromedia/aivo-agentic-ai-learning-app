/**
 * Difficulty Approval Card Component
 * 
 * Displays difficulty change requests for parents/teachers with:
 * - Performance evidence and mastery indicators
 * - Side-by-side content comparison
 * - Visual charts and trends
 * - Approval/decline workflow
 * - Full transparency into learner progress
 * 
 * Part of Aivo's core philosophy: Never increase difficulty without parent/teacher approval
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Calendar,
    Check,
    CheckCircle,
    Clock,
    Info,
    Target,
    TrendingDown,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ChartDataPoint {
  session: number;
  success_rate: number;
  hint_usage: number;
  accuracy: number;
  date: string;
}

interface MasteryEvidence {
  assessment_id: string;
  success_rate: number;
  sessions_analyzed: number;
  hint_usage_trend: 'decreasing' | 'stable' | 'increasing';
  error_patterns: string[];
  mastery_score: number;
  ready_indicators: string[];
  performance_chart_data: ChartDataPoint[];
  confidence: number;
  created_at: string;
}

interface ContentSample {
  current: string;
  proposed: string;
  adaptations: string[];
  complexity_difference: number;
}

interface DifficultyChangeRequest {
  request_id: string;
  brain_id: string;
  learner_id: string;
  learner_name: string;
  subject: string;
  current_level: number;
  proposed_level: number;
  change_type: 'increase' | 'decrease' | 'maintain';
  evidence: MasteryEvidence;
  sample_content: ContentSample;
  reasoning: string;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  notification_sent: boolean;
}

interface DifficultyApprovalCardProps {
  request: DifficultyChangeRequest;
  onApprove?: (requestId: string) => void;
  onDecline?: (requestId: string, reason: string) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

function formatTimeRemaining(expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'expired';
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
}

function getHintTrendIcon(trend: string) {
  switch (trend) {
    case 'decreasing':
      return <TrendingDown className="w-5 h-5 text-green-600" />;
    case 'increasing':
      return <TrendingUp className="w-5 h-5 text-orange-600" />;
    default:
      return <ArrowRight className="w-5 h-5 text-gray-600" />;
  }
}

function getHintTrendText(trend: string): string {
  switch (trend) {
    case 'decreasing':
      return 'Improving! Using fewer hints over time';
    case 'increasing':
      return 'Needs more support';
    case 'stable':
      return 'Consistent support needed';
    default:
      return 'Unknown trend';
  }
}

// ============================================================================
// PERFORMANCE CHART COMPONENT
// ============================================================================

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No performance data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="session"
            label={{ value: 'Session Number', position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis
            label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    Session {data.session}
                  </p>
                  <p className="text-xs text-gray-600">{data.date}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">
                      Success: {data.success_rate}%
                    </p>
                    <p className="text-sm text-blue-700">
                      Accuracy: {data.accuracy}%
                    </p>
                    <p className="text-sm text-orange-700">
                      Hints: {data.hint_usage}
                    </p>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="success_rate"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorSuccess)"
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// DETAILED EVIDENCE MODAL
// ============================================================================

interface DetailedEvidenceModalProps {
  request: DifficultyChangeRequest;
  onClose: () => void;
}

function DetailedEvidenceModal({ request, onClose }: DetailedEvidenceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Performance Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {request.learner_name} • {request.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* AI Reasoning */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📊 AI Brain Analysis
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {request.reasoning}
              </p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📈 Performance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-xs font-semibold text-green-700 mb-1">
                  SUCCESS RATE
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {request.evidence.success_rate}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {request.evidence.sessions_analyzed} sessions analyzed
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-xs font-semibold text-purple-700 mb-1">
                  MASTERY SCORE
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {(request.evidence.mastery_score * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Confidence: {(request.evidence.confidence * 100).toFixed(0)}%
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 mb-1">
                  HINT USAGE
                </div>
                <div className="flex items-center gap-2">
                  {getHintTrendIcon(request.evidence.hint_usage_trend)}
                  <span className="text-xl font-bold text-blue-900 capitalize">
                    {request.evidence.hint_usage_trend}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getHintTrendText(request.evidence.hint_usage_trend)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📉 Performance Over Time
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <PerformanceChart data={request.evidence.performance_chart_data} />
            </div>
          </div>

          {/* Error Patterns */}
          {request.evidence.error_patterns && request.evidence.error_patterns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Error Patterns Identified
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {request.evidence.error_patterns.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Content Adaptations */}
          {request.sample_content.adaptations && request.sample_content.adaptations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔄 How Content Will Change
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {request.sample_content.adaptations.map((adaptation, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{adaptation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Gradual Transition Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎯 Implementation Plan
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">
                Gradual 5-Session Transition:
              </p>
              <div className="space-y-2">
                {[
                  { session: 1, old: 80, new: 20 },
                  { session: 2, old: 60, new: 40 },
                  { session: 3, old: 40, new: 60 },
                  { session: 4, old: 20, new: 80 },
                  { session: 5, old: 0, new: 100 },
                ].map((step) => (
                  <div key={step.session} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-20">
                      Session {step.session}:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="bg-blue-600 h-6 rounded-l transition-all"
                        style={{ width: `${step.old}%` }}
                      />
                      <div
                        className="bg-green-600 h-6 rounded-r transition-all"
                        style={{ width: `${step.new}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-24">
                      {step.old}% / {step.new}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">
                  We'll gradually blend content from current level (
                  {request.current_level}) to new level ({request.proposed_level}) over
                  5 sessions. If {request.learner_name} struggles (accuracy below 60%),
                  we'll automatically roll back to the previous level.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DifficultyApprovalCard({
  request,
  onApprove,
  onDecline,
}: DifficultyApprovalCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/v1/difficulty/approve/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to approve request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficulty-requests'] });
      if (onApprove) onApprove(request.request_id);
      // Show success toast (would integrate with your toast system)
      console.log(
        `✅ ${request.learner_name} will start ${request.subject} at level ${request.proposed_level}!`
      );
    },
    onError: (error) => {
      console.error('Failed to approve:', error);
      alert('Failed to approve request. Please try again.');
    },
  });

  const declineMutation = useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => {
      const response = await fetch(`/api/v1/difficulty/decline/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to decline request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficulty-requests'] });
      if (onDecline) onDecline(request.request_id, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
      console.log('ℹ️ Request declined. Brain will continue at current level.');
    },
    onError: (error) => {
      console.error('Failed to decline:', error);
      alert('Failed to decline request. Please try again.');
    },
  });

  const timeRemaining = formatTimeRemaining(request.expires_at);
  const isExpiringSoon = timeRemaining.includes('hour') || timeRemaining === 'expired';

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 hover:shadow-xl transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">
                🎉 {request.learner_name} is Ready for a Challenge!
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Subject: {request.subject}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(request.created_at)}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold whitespace-nowrap">
            Ready to Advance
          </span>
        </div>

        {/* Level Change Visualization */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Current Level
              </label>
              <div className="px-4 py-4 bg-blue-100 rounded-lg text-center border-2 border-blue-300">
                <span className="text-3xl font-bold text-blue-900">
                  {request.current_level.toFixed(1)}
                </span>
                <p className="text-xs text-blue-700 mt-1">Grade Level</p>
              </div>
            </div>

            <div className="flex flex-col items-center pt-8">
              <ArrowRight className="w-10 h-10 text-green-600" />
              <span className="text-xs text-gray-500 mt-1 font-medium">+0.5</span>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Proposed Level
              </label>
              <div className="px-4 py-4 bg-green-100 rounded-lg text-center border-2 border-green-300">
                <span className="text-3xl font-bold text-green-900">
                  {request.proposed_level.toFixed(1)}
                </span>
                <p className="text-xs text-green-700 mt-1">Grade Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Evidence */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Why {request.learner_name} is Ready:
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">
                {request.evidence.success_rate}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Last {request.evidence.sessions_analyzed} sessions
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Mastery Score</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">
                {(request.evidence.mastery_score * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Confidence: {(request.evidence.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Ready Indicators */}
          <div className="space-y-2">
            {request.evidence.ready_indicators.slice(0, 4).map((indicator, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{indicator}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        {request.evidence.performance_chart_data &&
          request.evidence.performance_chart_data.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Performance Trend
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <PerformanceChart data={request.evidence.performance_chart_data} />
              </div>
            </div>
          )}

        {/* Content Comparison */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Sample Content Comparison
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-xs font-semibold text-blue-700 mb-3 flex items-center justify-between">
                <span>CURRENT LEVEL ({request.current_level})</span>
                <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                  Current
                </span>
              </div>
              <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded border border-blue-200">
                {request.sample_content.current}
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <div className="text-xs font-semibold text-green-700 mb-3 flex items-center justify-between">
                <span>NEW LEVEL ({request.proposed_level})</span>
                <span className="px-2 py-1 bg-green-100 rounded text-green-800">
                  Proposed
                </span>
              </div>
              <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded border border-green-200">
                {request.sample_content.proposed}
              </div>
            </div>
          </div>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">
                Notice: Slightly more complex vocabulary and longer sentences, but
                still appropriate for {request.learner_name}'s growing skills. The
                increase is gradual to maintain confidence and prevent frustration.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => approveMutation.mutate(request.request_id)}
              disabled={approveMutation.isPending}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="approve-difficulty-change"
            >
              {approveMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Approve Increase
                </>
              )}
            </button>

            <button
              onClick={() => setShowDetails(true)}
              className="px-6 py-3 border-2 border-blue-300 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center gap-2"
              data-testid="review-more-data"
            >
              <BarChart3 className="w-5 h-5" />
              Review Details
            </button>
          </div>

          <button
            onClick={() => setShowDeclineModal(true)}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            data-testid="decline-difficulty-change"
          >
            Not Yet - Keep Current Level
          </button>
        </div>

        {/* Expiration Notice */}
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            isExpiringSoon
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <Calendar
            className={`w-4 h-4 flex-shrink-0 ${
              isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
            }`}
          />
          <p
            className={`text-xs ${
              isExpiringSoon ? 'text-orange-700' : 'text-gray-600'
            }`}
          >
            {isExpiringSoon ? '⚠️ ' : ''}This request expires in {timeRemaining}. If no
            action is taken, the current level will be maintained and we'll reassess
            readiness in 2 weeks.
          </p>
        </div>
      </div>

      {/* Detailed View Modal */}
      {showDetails && (
        <DetailedEvidenceModal request={request} onClose={() => setShowDetails(false)} />
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Decline Difficulty Increase?
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700 mb-4">
                {request.learner_name} will continue at the current level (
                {request.current_level}). We'll reassess readiness in 2 weeks.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining (optional):
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Want to see more consistency first, or concerns about upcoming events..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  declineMutation.mutate({
                    requestId: request.request_id,
                    reason: declineReason,
                  })
                }
                disabled={declineMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {declineMutation.isPending ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DifficultyApprovalCard;
