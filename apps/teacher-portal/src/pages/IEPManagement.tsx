import { Link } from 'react-router-dom';
import { useState } from 'react';

export function IEPManagement() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const ieps = [
    {
      id: 1,
      studentName: 'Alex Johnson',
      avatar: '👦',
      status: 'active',
      nextReview: 'Mar 15, 2025',
      goalsTotal: 8,
      goalsCompleted: 5,
      lastUpdated: '2 days ago',
      daysUntilReview: 45,
    },
    {
      id: 2,
      studentName: 'Emma Davis',
      avatar: '👧',
      status: 'review-due',
      nextReview: 'Jan 28, 2025',
      goalsTotal: 6,
      goalsCompleted: 4,
      lastUpdated: '1 week ago',
      daysUntilReview: 5,
    },
    {
      id: 3,
      studentName: 'Liam Brown',
      avatar: '👦',
      status: 'draft',
      nextReview: 'Feb 10, 2025',
      goalsTotal: 10,
      goalsCompleted: 0,
      lastUpdated: 'Today',
      daysUntilReview: 18,
    },
    {
      id: 4,
      studentName: 'Sofia Martinez',
      avatar: '👧',
      status: 'active',
      nextReview: 'Apr 20, 2025',
      goalsTotal: 7,
      goalsCompleted: 6,
      lastUpdated: '5 days ago',
      daysUntilReview: 81,
    },
  ];

  const filteredIEPs = ieps.filter((iep) => {
    if (filterStatus === 'all') return true;
    return iep.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'review-due':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'review-due':
        return 'Review Due';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">IEP Management</h1>
          <p className="text-neutral-600 mt-1">Manage Individualized Education Programs for your students</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2">
          <span>+</span>
          <span>Create New IEP</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Total IEPs</p>
          <p className="text-3xl font-bold text-neutral-900">{ieps.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Active IEPs</p>
          <p className="text-3xl font-bold text-green-600">
            {ieps.filter((iep) => iep.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Reviews Due</p>
          <p className="text-3xl font-bold text-red-600">
            {ieps.filter((iep) => iep.status === 'review-due').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Drafts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {ieps.filter((iep) => iep.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All IEPs
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('review-due')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'review-due'
                ? 'bg-red-100 text-red-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Review Due
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* IEP List */}
      <div className="space-y-4">
        {filteredIEPs.map((iep) => (
          <div
            key={iep.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl">
                  {iep.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-xl font-bold text-neutral-900">{iep.studentName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(iep.status)}`}>
                      {getStatusLabel(iep.status)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Next Review: {iep.nextReview} ({iep.daysUntilReview} days)
                  </p>
                </div>
              </div>

              {/* Middle Section - Goals Progress */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {iep.goalsCompleted}/{iep.goalsTotal}
                  </p>
                  <p className="text-xs text-neutral-600">Goals Completed</p>
                </div>

                <div className="w-48">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Overall Progress</span>
                    <span className="font-semibold text-neutral-900">
                      {Math.round((iep.goalsCompleted / iep.goalsTotal) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${(iep.goalsCompleted / iep.goalsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center space-x-3">
                <Link
                  to={`/iep/${iep.id}`}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  View Details
                </Link>
                <button className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
                  <span className="text-xl">⋮</span>
                </button>
              </div>
            </div>

            {/* Timeline Warning */}
            {iep.daysUntilReview <= 7 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <p className="text-sm text-red-700 font-medium">
                  Review meeting scheduled in {iep.daysUntilReview} days. Prepare progress reports and documentation.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* IEP Timeline Calendar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Upcoming IEP Meetings</h2>
        <div className="space-y-3">
          {ieps
            .sort((a, b) => a.daysUntilReview - b.daysUntilReview)
            .slice(0, 3)
            .map((iep) => (
              <div
                key={iep.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    {iep.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{iep.studentName}</p>
                    <p className="text-sm text-neutral-600">{iep.nextReview}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      iep.daysUntilReview <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {iep.daysUntilReview} days
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                    Schedule →
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
