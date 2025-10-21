import { getDistrictMetrics, getSchools, getEngagementTrends, getComplianceMetrics } from '../utils/mockData';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const metrics = getDistrictMetrics();
  const schools = getSchools();
  const engagementTrends = getEngagementTrends();
  const compliance = getComplianceMetrics();

  // Get last 7 days for engagement chart
  const last7Days = engagementTrends.slice(-7);

  // Get top and bottom performing schools
  const sortedSchools = [...schools].sort((a, b) => b.averageProgress - a.averageProgress);
  const topSchools = sortedSchools.slice(0, 5);
  const needsAttention = sortedSchools.filter(s => s.iepComplianceRate < 90 || s.averageProgress < 75);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">District Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Real-time overview of district-wide performance and metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Students</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">
                {metrics.totalStudents.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2">
                ↑ {metrics.activeStudents.toLocaleString()} active today
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Teachers</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">
                {metrics.totalTeachers.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {metrics.teacherAdoptionRate}% adoption rate
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👩‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">IEP Compliance</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{metrics.iepComplianceRate}%</p>
              <p className="text-sm text-amber-600 mt-2">
                {compliance.overdueReviews} overdue reviews
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg Progress</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{metrics.averageStudentProgress}%</p>
              <p className="text-sm text-green-600 mt-2">
                Across {metrics.totalSchools} schools
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">Active Today</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {metrics.activeUsersToday}
              </p>
            </div>
            <span className="text-xl">⚡</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">Active This Week</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {metrics.activeUsersThisWeek}
              </p>
            </div>
            <span className="text-xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">License Usage</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {metrics.licenseUtilization}%
              </p>
            </div>
            <span className="text-xl">🔑</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">Support Tickets</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {metrics.supportTicketsOpen}
              </p>
            </div>
            <span className="text-xl">🎧</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* School Performance Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Top Performing Schools</h2>
            <Link to="/schools" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {topSchools.map((school, index) => (
              <div key={school.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{school.name}</p>
                  <p className="text-xs text-neutral-500">{school.totalStudents} students</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">{school.averageProgress}%</p>
                    <p className="text-xs text-neutral-500">progress</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-24">
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${school.averageProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IEP Goal Achievement */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">IEP Goal Achievement</h2>
            <Link to="/compliance" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Details →
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Overall Compliance</span>
                <span className="text-lg font-bold text-neutral-900">{metrics.iepComplianceRate}%</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${metrics.iepComplianceRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">{compliance.compliantIEPs}</p>
                <p className="text-xs text-green-600 mt-1">Compliant IEPs</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-700">{compliance.overdueReviews}</p>
                <p className="text-xs text-amber-600 mt-1">Overdue Reviews</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <p className="text-sm font-medium text-neutral-700 mb-3">Upcoming Reviews</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 30 days</span>
                  <span className="font-semibold text-neutral-900">{compliance.upcomingReviews.next30Days}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 60 days</span>
                  <span className="font-semibold text-neutral-900">{compliance.upcomingReviews.next60Days}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 90 days</span>
                  <span className="font-semibold text-neutral-900">{compliance.upcomingReviews.next90Days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trends Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Engagement Trends</h2>
            <p className="text-sm text-neutral-600 mt-1">Active users over the last 7 days</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">Teachers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">Parents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">Students</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-1">
            {last7Days.map((day, index) => {
              const maxValue = Math.max(...last7Days.map(d => d.activeUsers));
              const teacherHeight = (day.activeTeachers / maxValue) * 100;
              const parentHeight = (day.activeParents / maxValue) * 100;
              const studentHeight = (day.activeStudents / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-1 min-w-0">
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-48">
                    <div
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t min-w-[4px]"
                      style={{ height: `${teacherHeight}%` }}
                      title={`Teachers: ${day.activeTeachers}`}
                    />
                    <div
                      className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t min-w-[4px]"
                      style={{ height: `${parentHeight}%` }}
                      title={`Parents: ${day.activeParents}`}
                    />
                    <div
                      className="flex-1 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t min-w-[4px]"
                      style={{ height: `${studentHeight}%` }}
                      title={`Students: ${day.activeStudents}`}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 truncate w-full text-center">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schools Needing Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Schools Needing Attention
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                {needsAttention.length} school{needsAttention.length !== 1 ? 's' : ''} with compliance
                below 90% or progress below 75%
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {needsAttention.slice(0, 6).map((school) => (
                  <Link
                    key={school.id}
                    to={`/schools?id=${school.id}`}
                    className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-neutral-900 text-sm">{school.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-600">Compliance:</span>
                      <span className={`text-xs font-semibold ${school.iepComplianceRate >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                        {school.iepComplianceRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-600">Progress:</span>
                      <span className={`text-xs font-semibold ${school.averageProgress >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                        {school.averageProgress}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {needsAttention.length > 6 && (
                <Link
                  to="/schools"
                  className="inline-block mt-4 text-sm text-amber-700 font-medium hover:text-amber-800"
                >
                  View all {needsAttention.length} schools →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/reports"
            className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2">📊</span>
            <span className="text-sm font-medium text-neutral-900">Generate Report</span>
          </Link>
          <Link
            to="/schools"
            className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2">🏫</span>
            <span className="text-sm font-medium text-neutral-900">Manage Schools</span>
          </Link>
          <Link
            to="/users"
            className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2">👥</span>
            <span className="text-sm font-medium text-neutral-900">Add Users</span>
          </Link>
          <Link
            to="/support"
            className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2">🎧</span>
            <span className="text-sm font-medium text-neutral-900">Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
