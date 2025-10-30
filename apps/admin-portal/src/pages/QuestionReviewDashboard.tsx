/**
 * Question Review Dashboard
 * Interface for expert educators to review AI-generated questions
 */
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    MessageSquare,
    Star,
    ThumbsDown,
    ThumbsUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PendingReview {
  reviewId: string;
  itemId: string;
  domain: string;
  gradeBand: string;
  stem: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: string;
  automatedValidation: {
    overallScore: number;
    clarityScore: number;
    biasScore: number;
    pedagogicalScore: number;
    accessibilityScore: number;
  };
}

interface ReviewFormData {
  approved: boolean;
  feedback: string;
  qualityRatings: {
    clarity: number;
    pedagogy: number;
    accuracy: number;
    bias: number;
    accessibility: number;
  };
  suggestedRevisions?: {
    stem?: string;
    options?: any[];
    hint?: string;
  };
}

export function QuestionReviewDashboard() {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(
    null
  );
  const [fullQuestion, setFullQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    domain: 'all',
    priority: 'all',
    gradeBand: 'all',
  });

  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    approved: false,
    feedback: '',
    qualityRatings: {
      clarity: 5,
      pedagogy: 5,
      accuracy: 5,
      bias: 5,
      accessibility: 5,
    },
  });

  useEffect(() => {
    loadPendingReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadPendingReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.domain !== 'all') params.append('domain', filter.domain);
      if (filter.priority !== 'all')
        params.append('priority', filter.priority);

      const response = await fetch(
        `http://localhost:9000/api/v1/baseline/review-queue?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data.pendingReviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFullQuestion = async (itemId: string) => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/v1/baseline/items/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFullQuestion(data);
      }
    } catch (error) {
      console.error('Failed to load question:', error);
    }
  };

  const handleSelectReview = (review: PendingReview) => {
    setSelectedReview(review);
    loadFullQuestion(review.itemId);

    // Reset form
    setReviewForm({
      approved: false,
      feedback: '',
      qualityRatings: {
        clarity: Math.round(review.automatedValidation.clarityScore / 10),
        pedagogy: Math.round(
          review.automatedValidation.pedagogicalScore / 10
        ),
        accuracy: 5,
        bias: Math.round(review.automatedValidation.biasScore / 10),
        accessibility: Math.round(
          review.automatedValidation.accessibilityScore / 10
        ),
      },
    });
  };

  const handleSubmitReview = async () => {
    if (!selectedReview) return;

    try {
      const response = await fetch(
        `http://localhost:9000/api/v1/baseline/review/${selectedReview.reviewId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            reviewer_id: localStorage.getItem('user_id'),
            approved: reviewForm.approved,
            feedback: reviewForm.feedback,
            quality_ratings: reviewForm.qualityRatings,
            suggested_revisions: reviewForm.suggestedRevisions,
          }),
        }
      );

      if (response.ok) {
        alert('Review submitted successfully!');
        setSelectedReview(null);
        setFullQuestion(null);
        loadPendingReviews();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      normal: 'text-blue-600 bg-blue-50',
      low: 'text-gray-600 bg-gray-50',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Question Review Dashboard
          </h1>
          <p className="text-gray-600">
            Review AI-generated questions before they're used in assessments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingReviews.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    pendingReviews.filter(
                      (r) => r.priority === 'high' || r.priority === 'urgent'
                    ).length
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-green-600">
                  {pendingReviews.length > 0
                    ? Math.round(
                        pendingReviews.reduce(
                          (sum, r) =>
                            sum + r.automatedValidation.overallScore,
                          0
                        ) / pendingReviews.length
                      )
                    : 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Reviews</p>
                <p className="text-2xl font-bold text-purple-600">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Review Queue */}
          <div className="rounded-lg bg-white shadow lg:col-span-1">
            <div className="border-b p-6">
              <h2 className="mb-4 text-xl font-bold">Review Queue</h2>

              {/* Filters */}
              <div className="space-y-3">
                <select
                  value={filter.domain}
                  onChange={(e) =>
                    setFilter({ ...filter, domain: e.target.value })
                  }
                  className="w-full rounded-lg border p-2"
                >
                  <option value="all">All Domains</option>
                  <option value="reading">Reading</option>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                  <option value="writing">Writing</option>
                  <option value="sel">SEL</option>
                  <option value="speech">Speech</option>
                </select>

                <select
                  value={filter.priority}
                  onChange={(e) =>
                    setFilter({ ...filter, priority: e.target.value })
                  }
                  className="w-full rounded-lg border p-2"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : pendingReviews.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
                  <p>No pending reviews!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingReviews.map((review) => (
                    <button
                      key={review.reviewId}
                      onClick={() => handleSelectReview(review)}
                      className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                        selectedReview?.reviewId === review.reviewId
                          ? 'border-l-4 border-blue-600 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${getPriorityColor(review.priority)}`}
                        >
                          {review.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-600">
                          {review.domain} • {review.gradeBand}
                        </span>
                      </div>

                      <p className="mb-2 line-clamp-2 text-sm text-gray-700">
                        {review.stem}
                      </p>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${getScoreColor(review.automatedValidation.overallScore)}`}
                        >
                          Quality: {review.automatedValidation.overallScore}
                          /100
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question Detail & Review Form */}
          <div className="rounded-lg bg-white shadow lg:col-span-2">
            {!selectedReview ? (
              <div className="p-12 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="text-lg">Select a question to review</p>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {/* Question Preview */}
                <div>
                  <h3 className="mb-4 text-lg font-bold">Question Preview</h3>

                  <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-gray-600">
                        {selectedReview.domain.toUpperCase()} •{' '}
                        {selectedReview.gradeBand}
                      </span>
                    </div>

                    <p className="mb-4 text-xl font-semibold text-gray-900">
                      {selectedReview.stem}
                    </p>

                    {fullQuestion?.stimulus && (
                      <div className="mb-4 rounded-lg border bg-white p-4">
                        <p className="text-gray-700">
                          {fullQuestion.stimulus}
                        </p>
                      </div>
                    )}

                    {fullQuestion?.options && (
                      <div className="space-y-2">
                        {fullQuestion.options.map((option: any) => (
                          <div
                            key={option.id}
                            className={`rounded-lg border-2 p-4 ${
                              option.correct
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {option.correct ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <span className="font-medium">{option.label}</span>
                            </div>
                            {option.rationale && (
                              <p className="ml-8 mt-2 text-sm text-gray-600">
                                {option.rationale}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {fullQuestion?.hintText && (
                      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="mb-1 text-sm font-semibold text-yellow-800">
                          💡 Hint:
                        </p>
                        <p className="text-sm text-yellow-700">
                          {fullQuestion.hintText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Automated Validation Scores */}
                <div>
                  <h3 className="mb-4 text-lg font-bold">
                    Automated Validation
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedReview.automatedValidation).map(
                      ([key, value]) => {
                        if (key === 'overallScore') return null;
                        return (
                          <div key={key} className="rounded-lg bg-gray-50 p-4">
                            <p className="mb-1 text-sm capitalize text-gray-600">
                              {key.replace('Score', '')}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${
                                    value >= 80
                                      ? 'bg-green-500'
                                      : value >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span
                                className={`text-sm font-bold ${getScoreColor(value)}`}
                              >
                                {value}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Review Form */}
                <div>
                  <h3 className="mb-4 text-lg font-bold">Your Review</h3>

                  {/* Quality Ratings */}
                  <div className="mb-6 space-y-4">
                    {Object.entries(reviewForm.qualityRatings).map(
                      ([key, value]) => (
                        <div key={key}>
                          <label className="mb-2 block text-sm font-medium capitalize text-gray-700">
                            {key} (1-10)
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={value}
                              onChange={(e) =>
                                setReviewForm({
                                  ...reviewForm,
                                  qualityRatings: {
                                    ...reviewForm.qualityRatings,
                                    [key]: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="flex-1"
                            />
                            <span className="w-8 text-lg font-bold text-gray-900">
                              {value}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Feedback */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Feedback & Comments
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          feedback: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full rounded-lg border p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide detailed feedback about quality, accuracy, potential issues..."
                    />
                  </div>

                  {/* Approval Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setReviewForm({ ...reviewForm, approved: true });
                        handleSubmitReview();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Approve Question
                    </button>

                    <button
                      onClick={() => {
                        setReviewForm({ ...reviewForm, approved: false });
                        handleSubmitReview();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      Reject / Request Revision
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


