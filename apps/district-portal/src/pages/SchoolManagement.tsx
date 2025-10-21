import { useState } from 'react';
import { getSchools } from '../utils/mockData';

export default function SchoolManagement() {
  const allSchools = getSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'needs-attention'>('all');

  // Filter schools
  const filteredSchools = allSchools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && school.iepComplianceRate >= 90) ||
      (filterStatus === 'needs-attention' && (school.iepComplianceRate < 90 || school.averageProgress < 75));

    return matchesSearch && matchesFilter;
  });

  // Calculate district totals
  const districtTotals = {
    totalStudents: allSchools.reduce((sum, s) => sum + s.totalStudents, 0),
    totalTeachers: allSchools.reduce((sum, s) => sum + s.totalTeachers, 0),
    avgCompliance: Math.floor(
      allSchools.reduce((sum, s) => sum + s.iepComplianceRate, 0) / allSchools.length
    ),
    avgProgress: Math.floor(
      allSchools.reduce((sum, s) => sum + s.averageProgress, 0) / allSchools.length
    ),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">School Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage {allSchools.length} schools across the district
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          + Add New School
        </button>
      </div>

      {/* District Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Schools</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{allSchools.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Students</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {districtTotals.totalStudents.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Teachers</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {districtTotals.totalTeachers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Compliance</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{districtTotals.avgCompliance}%</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search schools, principals, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Schools ({allSchools.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Active (≥90%)
            </button>
            <button
              onClick={() => setFilterStatus('needs-attention')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'needs-attention'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Needs Attention
            </button>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Teachers
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  IEP Compliance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Avg Progress
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Licenses
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{school.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Active: {school.activeStudents}/{school.totalStudents} students
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-neutral-900">{school.principal}</p>
                      <p className="text-xs text-neutral-500 mt-1">{school.principalEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-neutral-900">{school.city}, {school.state}</p>
                      <p className="text-xs text-neutral-500 mt-1">{school.zipCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-900">{school.totalStudents}</p>
                    <p className="text-xs text-green-600">
                      {Math.floor((school.activeStudents / school.totalStudents) * 100)}% active
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-900">{school.totalTeachers}</p>
                    <p className="text-xs text-neutral-500">{school.activeTeachers} active</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          school.iepComplianceRate >= 95
                            ? 'bg-green-100 text-green-700'
                            : school.iepComplianceRate >= 90
                            ? 'bg-blue-100 text-blue-700'
                            : school.iepComplianceRate >= 85
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {school.iepComplianceRate}%
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">
                        {school.specialEducationStats.overdueReviews} overdue
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-neutral-900">
                        {school.averageProgress}%
                      </span>
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            school.averageProgress >= 85
                              ? 'bg-green-500'
                              : school.averageProgress >= 75
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${school.averageProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-900">
                      {school.licenseUsage}/{school.licenseCount}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {Math.floor((school.licenseUsage / school.licenseCount) * 100)}% used
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-neutral-600">No schools found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* School Performance Comparison Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">School Performance Comparison</h2>
        <div className="space-y-4">
          {allSchools
            .sort((a, b) => b.averageProgress - a.averageProgress)
            .map((school) => (
              <div key={school.id} className="flex items-center space-x-4">
                <div className="w-48 flex-shrink-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{school.name}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-8 bg-neutral-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end px-3"
                        style={{ width: `${school.averageProgress}%` }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {school.averageProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-xs text-neutral-600">{school.totalStudents} students</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
