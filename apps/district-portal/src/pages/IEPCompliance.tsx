import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { iepAPI, type IEPGoal, type IEPStatsResponse } from '../services/api';

export default function IEPCompliance() {
  const [stats, setStats] = useState<IEPStatsResponse | null>(null);
  const [overdueGoals, setOverdueGoals] = useState<IEPGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats and overdue goals in parallel
      const [statsData, overdueData] = await Promise.all([
        iepAPI.getStats(),
        iepAPI.getOverdue({ limit: 10 })
      ]);
      
      setStats(statsData);
      setOverdueGoals(overdueData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load IEP data');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    try {
      await iepAPI.scheduleReport({
        report_type: 'iep_compliance',
        frequency: 'once',
        recipients: []
      });
      setShowScheduleModal(false);
      alert('Report scheduled successfully!');
    } catch (err) {
      alert('Failed to schedule report: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading IEP data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const complianceRate = stats.compliance_rate;


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">IEP Compliance Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Monitor IEP compliance across all schools
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          + Schedule New Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Overall Compliance</p>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{complianceRate.toFixed(1)}%</p>
          <p className="text-sm text-neutral-500 mt-2">
            {stats.on_track + stats.exceeding} of {stats.total_goals} IEPs
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Overdue Reviews</p>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.overdue_count}</p>
          <p className="text-sm text-neutral-500 mt-2">Require immediate attention</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Due Next 30 Days</p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.upcoming_30_days}</p>
          <p className="text-sm text-neutral-500 mt-2">Reviews scheduled</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Goals In Progress</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {stats.on_track}
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            On track to meet targets
          </p>
        </div>
      </div>

      {/* Upcoming Reviews Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Upcoming Review Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute top-0 left-6 w-0.5 h-full bg-neutral-200"></div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-xl">🔴</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="font-semibold text-neutral-900">Next 30 Days</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.upcoming_30_days}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">High priority reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-6 w-0.5 h-full bg-neutral-200"></div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-xl">🟡</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="font-semibold text-neutral-900">31-60 Days</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.upcoming_60_days - stats.upcoming_30_days}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">Medium priority</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-xl">🟢</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="font-semibold text-neutral-900">61-90 Days</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.upcoming_90_days - stats.upcoming_60_days}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">Future planning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance by School */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Overdue IEP Goals</h2>
          <Link 
            to="/iep-goals?overdue=true" 
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All Overdue →
          </Link>
        </div>
        <div className="space-y-3">
          {overdueGoals.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-2xl mb-2">🎉</p>
              <p>No overdue IEP goals! Great work!</p>
            </div>
          ) : (
            overdueGoals.map((goal) => (
              <div key={goal.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{goal.goal_name}</p>
                    {goal.learner_name && (
                      <p className="text-sm text-neutral-600 mt-1">
                        Student: {goal.learner_name}
                        {goal.school_name && <span> • {goal.school_name}</span>}
                      </p>
                    )}
                    <p className="text-sm text-neutral-600 mt-1">
                      Target Date: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
                      {' • '}Progress: {goal.progress_percentage}%
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Overdue
                    </span>
                    <Link
                      to={`/iep-goals/${goal.id}/edit`}
                      className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium"
                    >
                      Edit IEP
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">On Track</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.on_track}</p>
          <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${(stats.on_track / stats.total_goals) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Needs Attention</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.needs_attention}</p>
          <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${(stats.needs_attention / stats.total_goals) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Exceeding</span>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.exceeding}</p>
          <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(stats.exceeding / stats.total_goals) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Not Started</span>
            <span className="text-2xl">⏸️</span>
          </div>
          <p className="text-3xl font-bold text-neutral-600">{stats.not_started}</p>
          <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-400 rounded-full"
              style={{ width: `${(stats.not_started / stats.total_goals) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Required */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Action Required</h3>
            <p className="text-sm text-amber-700 mb-4">
              {stats.overdue_count} IEP reviews are overdue and require immediate attention.
            </p>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact teachers to schedule review meetings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Notify parents of upcoming IEP meetings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Review compliance training resources</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Generate overdue reports for administration</span>
              </li>
            </ul>
            <Link
              to="/iep-goals?overdue=true"
              className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
            >
              View Overdue IEPs
            </Link>
          </div>
        </div>
      </div>

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Schedule IEP Report</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Generate an automated IEP compliance report for all schools in your district.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleScheduleReport}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Schedule Now
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
