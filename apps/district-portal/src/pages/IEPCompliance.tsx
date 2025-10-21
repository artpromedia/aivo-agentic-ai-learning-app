import { getComplianceMetrics, getSchools } from '../utils/mockData';
import { Link } from 'react-router-dom';

export default function IEPCompliance() {
  const compliance = getComplianceMetrics();
  const schools = getSchools();

  const complianceRate = Math.floor((compliance.compliantIEPs / compliance.totalIEPs) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">IEP Compliance Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Monitor IEP compliance across {schools.length} schools
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Overall Compliance</p>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{complianceRate}%</p>
          <p className="text-sm text-neutral-500 mt-2">
            {compliance.compliantIEPs} of {compliance.totalIEPs} IEPs
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Overdue Reviews</p>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{compliance.overdueReviews}</p>
          <p className="text-sm text-neutral-500 mt-2">Require immediate attention</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Due Next 30 Days</p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{compliance.upcomingReviews.next30Days}</p>
          <p className="text-sm text-neutral-500 mt-2">Reviews scheduled</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Progress Reports</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {Math.floor((compliance.progressReportsOnTime / compliance.progressReportsTotal) * 100)}%
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            {compliance.progressReportsOnTime} of {compliance.progressReportsTotal} on time
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
                    {compliance.upcomingReviews.next30Days}
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
                    {compliance.upcomingReviews.next60Days - compliance.upcomingReviews.next30Days}
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
                    {compliance.upcomingReviews.next90Days - compliance.upcomingReviews.next60Days}
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
          <h2 className="text-lg font-semibold text-neutral-900">Compliance by School</h2>
          <Link to="/schools" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View All Schools →
          </Link>
        </div>
        <div className="space-y-3">
          {compliance.complianceBySchool
            .sort((a, b) => a.complianceRate - b.complianceRate)
            .map((school) => (
              <div key={school.schoolId} className="flex items-center space-x-4">
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{school.schoolName}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full flex items-center justify-end px-3 ${
                          school.complianceRate >= 95
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : school.complianceRate >= 90
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : school.complianceRate >= 85
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${school.complianceRate}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {school.complianceRate}%
                        </span>
                      </div>
                    </div>
                    {school.overdueCount > 0 && (
                      <div className="flex-shrink-0 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        {school.overdueCount} overdue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Compliance by Teacher */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Teachers Requiring Support
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compliance.complianceByTeacher
            .filter((t) => t.overdueCount > 0)
            .slice(0, 10)
            .map((teacher) => (
              <div
                key={teacher.teacherId}
                className="p-4 border border-neutral-200 rounded-lg hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{teacher.teacherName}</p>
                    <p className="text-sm text-neutral-600 mt-1">{teacher.schoolName}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    {teacher.overdueCount} overdue
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">IEP Compliance</span>
                    <span className="font-semibold text-neutral-900">
                      {teacher.compliantIEPs}/{teacher.totalIEPs}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (teacher.compliantIEPs / teacher.totalIEPs) * 100 >= 90
                          ? 'bg-green-500'
                          : (teacher.compliantIEPs / teacher.totalIEPs) * 100 >= 80
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(teacher.compliantIEPs / teacher.totalIEPs) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Evaluations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Evaluations Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Completed</span>
                <span className="text-lg font-bold text-green-600">
                  {compliance.evaluationsCompleted}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      (compliance.evaluationsCompleted / (compliance.evaluationsCompleted + compliance.evaluationsDue)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Due</span>
                <span className="text-lg font-bold text-amber-600">
                  {compliance.evaluationsDue}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${
                      (compliance.evaluationsDue / (compliance.evaluationsCompleted + compliance.evaluationsDue)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Evaluations</span>
                <span className="text-xl font-bold text-neutral-900">
                  {compliance.evaluationsCompleted + compliance.evaluationsDue}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Action Required</h3>
              <p className="text-sm text-amber-700 mb-4">
                {compliance.overdueReviews} IEP reviews are overdue and require immediate attention.
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
              <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm">
                View Overdue IEPs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
