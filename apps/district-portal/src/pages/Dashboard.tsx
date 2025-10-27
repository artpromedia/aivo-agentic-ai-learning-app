import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, schoolAPI, iepAPI, type School } from '../services/api';

interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  teacherAdoptionRate: number;
  iepComplianceRate: number;
  averageStudentProgress: number;
  totalSchools: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  licenseUtilization: number;
  supportTicketsOpen: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [compliance, setCompliance] = useState<{
    total_goals: number;
    on_track: number;
    needs_attention: number;
    exceeding: number;
    not_started: number;
    overdue_count: number;
    upcoming_30_days: number;
    upcoming_60_days: number;
    upcoming_90_days: number;
    compliance_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [userStats, schoolStats, schoolsList, iepStats] = await Promise.all([
        userAPI.getStats(),
        schoolAPI.getStats(),
        schoolAPI.list(),
        iepAPI.getStats(),
      ]);

      // Calculate dashboard metrics from API data
      const dashboardMetrics: DashboardMetrics = {
        totalStudents: 0, // Would need learner API
        activeStudents: 0, // Would need learner API
        totalTeachers: userStats.users_by_role?.teacher || 0,
        teacherAdoptionRate: Math.round((userStats.active_users / userStats.total_users) * 100) || 0,
        iepComplianceRate: iepStats.compliance_rate || 0,
        averageStudentProgress: 0, // Would need learner/progress API
        totalSchools: schoolStats.total_schools,
        activeUsersToday: userStats.active_users || 0,
        activeUsersThisWeek: userStats.active_users || 0,
        licenseUtilization: Math.round((schoolStats.total_seats_used / schoolStats.total_seats_allocated) * 100) || 0,
        supportTicketsOpen: 0, // Would need support API
      };

      setMetrics(dashboardMetrics);
      setSchools(schoolsList);
      setCompliance(iepStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">District Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Real-time overview of district-wide performance and metrics
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-neutral-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">District Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Real-time overview of district-wide performance and metrics
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Get top and bottom performing schools
  const sortedSchools = [...schools].sort((a, b) => {
    const aUsage = (a.seats_used / a.seats_allocated) * 100;
    const bUsage = (b.seats_used / b.seats_allocated) * 100;
    return bUsage - aUsage;
  });
  const topSchools = sortedSchools.slice(0, 5);
  const needsAttention = schools.filter(s => {
    const usage = (s.seats_used / s.seats_allocated) * 100;
    return usage < 75 || !s.is_active;
  });


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
              <p className="text-sm font-medium text-neutral-600">Total Schools</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">
                {metrics.totalSchools.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {schools.filter(s => s.is_active).length} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">�</span>
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
                {metrics.teacherAdoptionRate}% active
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
                {compliance?.overdue_count || 0} overdue
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
              <p className="text-sm font-medium text-neutral-600">License Usage</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{metrics.licenseUtilization}%</p>
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
              <p className="text-xs font-medium text-neutral-600">Active Users</p>
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
              <p className="text-xs font-medium text-neutral-600">IEP Goals</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {compliance?.total_goals || 0}
              </p>
            </div>
            <span className="text-xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">On Track</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {compliance?.on_track || 0}
              </p>
            </div>
            <span className="text-xl">🎯</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-600">Needs Attention</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {compliance?.needs_attention || 0}
              </p>
            </div>
            <span className="text-xl">⚠️</span>
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
            {topSchools.length > 0 ? (
              topSchools.map((school, index) => {
                const usage = Math.round((school.seats_used / school.seats_allocated) * 100);
                return (
                  <div key={school.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{school.school_name}</p>
                      <p className="text-xs text-neutral-500">{school.seats_allocated} seats</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{usage}%</p>
                        <p className="text-xs text-neutral-500">usage</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-24">
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${usage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">No schools found</p>
            )}
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
                <p className="text-2xl font-bold text-green-700">{compliance?.on_track || 0}</p>
                <p className="text-xs text-green-600 mt-1">On Track</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-700">{compliance?.overdue_count || 0}</p>
                <p className="text-xs text-amber-600 mt-1">Overdue</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <p className="text-sm font-medium text-neutral-700 mb-3">Upcoming Reviews</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 30 days</span>
                  <span className="font-semibold text-neutral-900">{compliance?.upcoming_30_days || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 60 days</span>
                  <span className="font-semibold text-neutral-900">{compliance?.upcoming_60_days || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Next 90 days</span>
                  <span className="font-semibold text-neutral-900">{compliance?.upcoming_90_days || 0}</span>
                </div>
              </div>
            </div>
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
                {needsAttention.length} school{needsAttention.length !== 1 ? 's' : ''} with low utilization or inactive status
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {needsAttention.slice(0, 6).map((school) => {
                  const usage = Math.round((school.seats_used / school.seats_allocated) * 100);
                  return (
                    <Link
                      key={school.id}
                      to={`/schools?id=${school.id}`}
                      className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-neutral-900 text-sm">{school.school_name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-600">Seat Usage:</span>
                        <span className={`text-xs font-semibold ${usage >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                          {usage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-neutral-600">Status:</span>
                        <span className={`text-xs font-semibold ${school.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
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
