import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:9000/api/v1/admin';

interface HITLQueueItem {
  id: number;
  type: string;
  content: string;
  context: Record<string, unknown> | null;
  ai_metadata: Record<string, unknown> | null;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface HITLStats {
  total: number;
  pending: number;
  in_review: number;
  approved_today: number;
  rejected_today: number;
}

/**
 * HITL Operations - Human-in-the-Loop Operations
 * Manage human review queue for AI model outputs
 */

interface ReviewData {
  decision: string;
  confidence: number;
  feedback: string;
  escalate: boolean;
}

export const HITLOps: React.FC = () => {
  const [queueItems, setQueueItems] = useState<HITLQueueItem[]>([]);
  const [stats, setStats] = useState<HITLStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HITLQueueItem | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({
    decision: '',
    confidence: 0,
    feedback: '',
    escalate: false
  });

  useEffect(() => {
    fetchQueueItems();
    fetchStats();
  }, []);

  const fetchQueueItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/hitl?status=pending&status=in_review&limit=50`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch queue items: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQueueItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch queue items';
      setError(errorMessage);
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hitl/stats/summary`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleReview = (item: HITLQueueItem) => {
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.decision || !selectedItem) {
      alert('Please select a decision');
      return;
    }

    try {
      const endpoint = reviewData.decision === 'approve' 
        ? `${API_BASE_URL}/hitl/${selectedItem.id}/approve`
        : `${API_BASE_URL}/hitl/${selectedItem.id}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: reviewData.feedback || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }

      // Refresh queue after successful review
      await fetchQueueItems();
      await fetchStats();

      setShowReviewModal(false);
      setReviewData({
        decision: '',
        confidence: 0,
        feedback: '',
        escalate: false
      });
      setSelectedItem(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      alert(`Error: ${errorMessage}`);
      console.error('Error submitting review:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceFromMetadata = (item: HITLQueueItem): number => {
    if (item.ai_metadata && typeof item.ai_metadata === 'object' && 'confidence' in item.ai_metadata) {
      return typeof item.ai_metadata.confidence === 'number' ? item.ai_metadata.confidence : 0;
    }
    return 0;
  };

  const getWaitTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return '< 1 hour';
    if (diffHours === 1) return '1 hour';
    return `${diffHours} hours`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading HITL queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchQueueItems}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const queueMetrics = {
    pending: stats?.pending || 0,
    reviewedToday: (stats?.approved_today || 0) + (stats?.rejected_today || 0),
    target: 200,
    lowConfidence: queueItems.filter(item => getConfidenceFromMetadata(item) < 70).length,
    reviewerAccuracy: 96.5,
  };

  const reviewers = [
    { name: 'Sarah Chen', reviewed: 45, accuracy: 98.2, avgTime: '2.1 min', status: 'active' },
    { name: 'Michael Brown', reviewed: 38, accuracy: 95.8, avgTime: '2.8 min', status: 'active' },
    { name: 'Emily Davis', reviewed: 32, accuracy: 96.5, avgTime: '2.4 min', status: 'break' },
    { name: 'James Wilson', reviewed: 41, accuracy: 97.1, avgTime: '2.0 min', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HITL Operations</h1>
        <p className="text-gray-600 mt-1">Human-in-the-Loop review queue and quality management</p>
      </div>

      {/* Queue Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Items Pending Review</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">{queueMetrics.pending}</div>
          <div className="text-sm text-gray-600 mt-1">High priority: {Math.floor(queueMetrics.pending * 0.3)}</div>
          <div className="text-xs text-gray-500 mt-2">Avg wait: 4.2 hours</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Reviewed Today</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{queueMetrics.reviewedToday}</div>
          <div className="text-sm text-gray-600 mt-1">Target: {queueMetrics.target}/day</div>
          <div className="text-xs text-green-600 mt-2">{((queueMetrics.reviewedToday / queueMetrics.target) * 100).toFixed(0)}% of target</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">AI Confidence &lt; 70%</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{queueMetrics.lowConfidence}</div>
          <div className="text-sm text-gray-600 mt-1">Escalated: 12</div>
          <div className="text-xs text-orange-600 mt-2">Requires attention</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Reviewer Accuracy</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{queueMetrics.reviewerAccuracy}%</div>
          <div className="text-sm text-gray-600 mt-1">Target: &gt; 95%</div>
          <div className="text-xs text-green-600 mt-2">Excellent performance</div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Review Queue - Assessments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queueItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No items in queue
                  </td>
                </tr>
              ) : (
                queueItems.map((item) => {
                  const confidence = getConfidenceFromMetadata(item);
                  const context = item.context as Record<string, string> | null;
                  const student = context?.learner_id || context?.student || 'Unknown';
                  const subject = context?.subject || item.type;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${confidence < 70 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {confidence}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.type.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getWaitTime(item.created_at)}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleReview(item)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviewer Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reviewer Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed Today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviewers.map((reviewer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{reviewer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{reviewer.reviewed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{reviewer.accuracy}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{reviewer.avgTime}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${reviewer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {reviewer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Human Review Required</h2>
              <p className="text-gray-600 mt-1">Item ID: {selectedItem.id} | Type: {selectedItem.type.replace(/_/g, ' ')}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Item Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedItem.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Confidence:</span>
                    <span className={`ml-2 font-medium ${getConfidenceFromMetadata(selectedItem) < 70 ? 'text-red-600' : 'text-amber-600'}`}>
                      {getConfidenceFromMetadata(selectedItem)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Wait Time:</span>
                    <span className="ml-2 font-medium text-gray-900">{getWaitTime(selectedItem.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Content to Review</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">Content:</span>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-200">
                      <p className="text-gray-900">{selectedItem.content}</p>
                    </div>
                  </div>
                  {selectedItem.context && (
                    <div>
                      <span className="text-gray-600">Context:</span>
                      <div className="mt-1 p-2 bg-white rounded border border-blue-200">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedItem.context, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  {selectedItem.ai_metadata && (
                    <div>
                      <span className="text-gray-600">AI Metadata:</span>
                      <div className="mt-1 p-2 bg-white rounded border border-blue-200 text-xs">
                        <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedItem.ai_metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Decision *</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="approve"
                        checked={reviewData.decision === 'approve'}
                        onChange={(e) => setReviewData({ ...reviewData, decision: e.target.value })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">✅ Approve - AI prediction is correct</span>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="reject"
                        checked={reviewData.decision === 'reject'}
                        onChange={(e) => setReviewData({ ...reviewData, decision: e.target.value })}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">❌ Reject - AI prediction is incorrect</span>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-amber-500 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="decision"
                        value="partial"
                        checked={reviewData.decision === 'partial'}
                        onChange={(e) => setReviewData({ ...reviewData, decision: e.target.value })}
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">⚠️ Partial Credit - Response is partially correct</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Confidence Level
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={reviewData.confidence}
                    onChange={(e) => setReviewData({ ...reviewData, confidence: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0%</span>
                    <span className="font-semibold text-gray-900">{reviewData.confidence}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback / Notes</label>
                  <textarea
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                    placeholder="Provide additional context or feedback for the AI model..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={reviewData.escalate}
                      onChange={(e) => setReviewData({ ...reviewData, escalate: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🚨 Escalate to senior reviewer (complex case)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewData.decision}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HITLOps;


