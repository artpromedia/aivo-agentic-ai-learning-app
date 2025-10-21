import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getStudents } from '../utils/mockData';

export function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Get students from mock data
  const allStudents = getStudents();

  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSubject === 'all' || true; // Can add subject filtering logic
    return matchesSearch && matchesFilter;
  });

  const avgAttendance = Math.round(
    allStudents.reduce((sum, s) => sum + (s.engagementMetrics.activeDaysThisWeek / 7 * 100), 0) / allStudents.length
  );

  const avgProgress = Math.round(
    allStudents.reduce((sum, s) => sum + s.overallProgress, 0) / allStudents.length
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Students</h1>
          <p className="text-neutral-600 mt-1">Manage your classroom roster and student progress</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">
          + Add Student
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            >
              <option value="all">All Students</option>
              <option value="reading">Reading Focus</option>
              <option value="math">Math Focus</option>
              <option value="speech">Speech Focus</option>
            </select>
            <button className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-medium transition-colors">
              Export List
            </button>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-neutral-900">{allStudents.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Active IEPs</p>
          <p className="text-3xl font-bold text-green-600">
            {allStudents.filter((s) => s.iepStatus === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Avg. Engagement</p>
          <p className="text-3xl font-bold text-indigo-600">{avgAttendance}%</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Avg. Progress</p>
          <p className="text-3xl font-bold text-purple-600">{avgProgress}%</p>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Link
            key={student.id}
            to={`/students/${student.id}`}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 hover:border-indigo-300 group"
          >
            {/* Student Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl">
                  {student.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-sm text-neutral-600">Grade {student.grade}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  student.iepStatus === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {student.iepStatus === 'active' ? 'Active IEP' : 'Review Pending'}
              </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 mb-6">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-600">📚 Reading</span>
                  <span className="font-semibold text-neutral-900">{student.performance.reading}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${student.performance.reading}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-600">🔢 Math</span>
                  <span className="font-semibold text-neutral-900">{student.performance.math}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ width: `${student.performance.math}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-600">🗣️ Speech</span>
                  <span className="font-semibold text-neutral-900">{student.performance.speech}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${student.performance.speech}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100">
              <div className="text-center">
                <p className="text-lg font-bold text-neutral-900">
                  {student.iepGoals.filter(g => g.status === 'exceeded' || g.status === 'on-track').length}/{student.iepGoals.length}
                </p>
                <p className="text-xs text-neutral-600">Goals</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-neutral-900">
                  {student.engagementMetrics.activeDaysThisWeek}/7
                </p>
                <p className="text-xs text-neutral-600">Active Days</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-600 mb-1">Last Active</p>
                <p className="text-xs font-semibold text-neutral-900">
                  {Math.floor((Date.now() - student.lastActive.getTime()) / (1000 * 60 * 60))}h ago
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
