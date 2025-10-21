import { Link } from 'react-router-dom';

export function Dashboard() {
  const children = [
    {
      id: 1,
      name: 'Alex',
      avatar: '👦',
      level: 5,
      streak: 3,
      progress: {
        reading: 65,
        math: 45,
        speech: 80,
      },
      recentActivity: 'Completed Math Level 3',
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'Emma',
      avatar: '👧',
      level: 3,
      streak: 7,
      progress: {
        reading: 75,
        math: 60,
        speech: 70,
      },
      recentActivity: 'Finished Reading Story',
      lastActive: '5 hours ago',
    },
  ];

  const stats = [
    {
      label: 'Total Learning Time',
      value: '24.5 hrs',
      change: '+12%',
      trend: 'up',
      icon: '⏰',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Activities Completed',
      value: '142',
      change: '+8',
      trend: 'up',
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Streak Days',
      value: '7 days',
      change: 'Record!',
      trend: 'up',
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Skills Mastered',
      value: '23',
      change: '+5',
      trend: 'up',
      icon: '⭐',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const upcomingActivities = [
    { time: 'Today, 3:00 PM', activity: 'Speech Practice', child: 'Alex', icon: '🗣️' },
    { time: 'Tomorrow, 10:00 AM', activity: 'Math Challenge', child: 'Emma', icon: '🔢' },
    { time: 'Tomorrow, 2:00 PM', activity: 'Reading Session', child: 'Alex', icon: '📚' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, Jane! 👋</h1>
        <p className="text-lg text-purple-100">
          Your children are making great progress. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-neutral-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-neutral-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Children Progress Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Your Children</h2>
          <Link
            to="/invitations"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
          >
            <span className="mr-1">+</span> Add Child
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-neutral-100 hover:border-purple-200"
            >
              {/* Child Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl">
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{child.name}</h3>
                    <p className="text-sm text-neutral-600">Level {child.level}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
                  <span className="text-orange-600 font-semibold">{child.streak}</span>
                  <span className="text-xl">🔥</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">📚 Reading</span>
                    <span className="font-semibold text-neutral-900">{child.progress.reading}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${child.progress.reading}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">🔢 Math</span>
                    <span className="font-semibold text-neutral-900">{child.progress.math}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${child.progress.math}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">🗣️ Speech</span>
                    <span className="font-semibold text-neutral-900">{child.progress.speech}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${child.progress.speech}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-neutral-600 mb-1">Recent Activity</p>
                <p className="font-medium text-neutral-900">{child.recentActivity}</p>
                <p className="text-xs text-neutral-500 mt-1">{child.lastActive}</p>
              </div>

              {/* Action Button */}
              <Link
                to={`/progress`}
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-center font-semibold py-3 rounded-xl transition-all"
              >
                View Full Progress →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Upcoming Activities */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Upcoming Activities</h2>
          <div className="space-y-4">
            {upcomingActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{activity.activity}</p>
                    <p className="text-sm text-neutral-600">{activity.child} • {activity.time}</p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  Remind Me
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/devices"
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span className="font-medium text-neutral-900">Manage Devices</span>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/baseline-results"
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📋</span>
                <span className="font-medium text-neutral-900">View Assessments</span>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/billing"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💳</span>
                <span className="font-medium text-neutral-900">Billing</span>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚙️</span>
                <span className="font-medium text-neutral-900">Settings</span>
              </div>
              <span className="text-neutral-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
