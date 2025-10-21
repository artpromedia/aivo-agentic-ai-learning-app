import { Link } from 'react-router-dom';
import { useState, type FormEvent, type ChangeEvent } from 'react';

export function Progress() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const subjects = [
    {
      name: 'Reading',
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200',
      progress: 65,
      hoursSpent: 8.5,
      activitiesCompleted: 24,
      skillsMastered: 5,
    },
    {
      name: 'Math',
      icon: '🔢',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-200',
      progress: 52,
      hoursSpent: 6.2,
      activitiesCompleted: 18,
      skillsMastered: 4,
    },
    {
      name: 'Speech',
      icon: '🗣️',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-200',
      progress: 75,
      hoursSpent: 9.8,
      activitiesCompleted: 32,
      skillsMastered: 7,
    },
  ];

  const achievements = [
    { title: 'First Week Complete', icon: '🎉', date: 'Jan 15, 2025' },
    { title: '7-Day Streak', icon: '🔥', date: 'Jan 20, 2025' },
    { title: 'Reading Master', icon: '📖', date: 'Jan 18, 2025' },
    { title: 'Math Champion', icon: '🏆', date: 'Jan 22, 2025' },
  ];

  const weeklyActivity = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 55 },
    { day: 'Fri', minutes: 70 },
    { day: 'Sat', minutes: 40 },
    { day: 'Sun', minutes: 50 },
  ];

  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Learning Progress</h1>
          <p className="text-neutral-600 mt-1">Track your children's learning journey</p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-xl border border-neutral-200 p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-purple-100 text-purple-700'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-purple-100 text-purple-700'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Weekly Activity</h2>
        <div className="flex items-end justify-between space-x-4 h-64">
          {weeklyActivity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div className="relative w-full mb-3 flex-1 flex flex-col justify-end">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-xl hover:from-purple-700 hover:to-blue-600 transition-all cursor-pointer"
                  style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                  title={`${day.minutes} minutes`}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-neutral-700">
                    {day.minutes}m
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-neutral-600">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Progress Cards */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Progress by Subject</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              to={`/progress/${subject.name.toLowerCase()}`}
              className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border ${subject.borderColor} hover:border-purple-300 group`}
            >
              {/* Subject Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-2xl`}
                  >
                    {subject.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">{subject.name}</h3>
                </div>
                <span className="text-neutral-400 group-hover:text-purple-600 transition-colors">→</span>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="fill-none stroke-neutral-100"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`fill-none stroke-current ${
                        subject.name === 'Reading'
                          ? 'text-blue-500'
                          : subject.name === 'Math'
                          ? 'text-green-500'
                          : 'text-purple-500'
                      }`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${subject.progress * 2.51} 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-neutral-900">{subject.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{subject.hoursSpent}</p>
                  <p className="text-xs text-neutral-600 mt-1">Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{subject.activitiesCompleted}</p>
                  <p className="text-xs text-neutral-600 mt-1">Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{subject.skillsMastered}</p>
                  <p className="text-xs text-neutral-600 mt-1">Skills</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Recent Achievements</h2>
          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            View All
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3 text-center">{achievement.icon}</div>
              <h3 className="font-semibold text-neutral-900 text-center mb-1">{achievement.title}</h3>
              <p className="text-xs text-neutral-600 text-center">{achievement.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-8 py-3 rounded-xl border border-neutral-200 hover:border-purple-300 transition-all flex items-center space-x-2">
          <span>📊</span>
          <span>Export Progress Report</span>
        </button>
      </div>
    </div>
  );
}
