import React, { useState } from 'react';

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({
    decision: '',
    confidence: 0,
    feedback: '',
    escalate: false
  });

  const handleReview = (item: any) => {
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!reviewData.decision) {
      alert('Please select a decision');
      return;
    }
    alert(`Review submitted: ${reviewData.decision} for ${selectedItem.id}`);
    setShowReviewModal(false);
    setReviewData({
      decision: '',
      confidence: 0,
      feedback: '',
      escalate: false
    });
  };
  const queueMetrics = {
    pending: 247,
    reviewedToday: 156,
    target: 200,
    lowConfidence: 89,
    reviewerAccuracy: 96.5,
  };

  const queueItems = [
    { id: 'A-1234', student: 'Emma S.', subject: 'Reading', confidence: 65, reason: 'Low confidence score', priority: 'high', wait: '6 hours' },
    { id: 'A-1235', student: 'Liam T.', subject: 'Math', confidence: 68, reason: 'Conflicting responses', priority: 'medium', wait: '3 hours' },
    { id: 'A-1236', student: 'Olivia M.', subject: 'Writing', confidence: 62, reason: 'Unusual pattern detected', priority: 'high', wait: '8 hours' },
    { id: 'A-1237', student: 'Noah K.', subject: 'Science', confidence: 71, reason: 'Edge case detected', priority: 'medium', wait: '2 hours' },
  ];

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
              {queueItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.confidence < 70 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.confidence}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.wait}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleReview(item)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
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
              <p className="text-gray-600 mt-1">Assessment ID: {selectedItem.id}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Student:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedItem.student}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedItem.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Confidence:</span>
                    <span className={`ml-2 font-medium ${selectedItem.confidence < 70 ? 'text-red-600' : 'text-amber-600'}`}>
                      {selectedItem.confidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedItem.reason}</span>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">AI Prediction</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">Predicted Answer:</span>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-200">
                      <p className="text-gray-900">The answer is <strong>B: Photosynthesis</strong></p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Student Response:</span>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-200">
                      <p className="text-gray-900">"The process where plants make food from sunlight"</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reasoning:</span>
                    <div className="mt-1 p-2 bg-white rounded border border-blue-200 text-xs">
                      <p className="text-gray-700">Student's written response matches concept but doesn't use exact terminology. Confidence score reduced due to ambiguity.</p>
                    </div>
                  </div>
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
