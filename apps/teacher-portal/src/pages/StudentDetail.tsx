import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

export function StudentDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'iep' | 'progress' | 'activities'>('overview');

  // Mock student data
  const student = {
    id: 1,
    name: 'Alex Johnson',
    avatar: '👦',
    grade: '3rd Grade',
    age: 8,
    parentName: 'Jane Johnson',
    parentEmail: 'jane.johnson@example.com',
    iepStatus: 'active',
    enrollment: 'September 2024',
    attendance: 95,
    lastActive: '2 hours ago',
  };

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: '📊' },
    { id: 'iep' as const, name: 'IEP Goals', icon: '🎯' },
    { id: 'progress' as const, name: 'Progress', icon: '📈' },
    { id: 'activities' as const, name: 'Activities', icon: '🎮' },
  ];

  const iepGoals = [
    {
      id: 1,
      subject: 'Reading',
      goal: 'Improve reading comprehension to grade level',
      progress: 65,
      status: 'on-track',
      baseline: '40%',
      target: '85%',
      dueDate: 'March 2025',
    },
    {
      id: 2,
      subject: 'Math',
      goal: 'Master addition and subtraction with regrouping',
      progress: 72,
      status: 'on-track',
      baseline: '35%',
      target: '90%',
      dueDate: 'April 2025',
    },
    {
      id: 3,
      subject: 'Speech',
      goal: 'Articulate /r/ sound in conversation',
      progress: 88,
      status: 'ahead',
      baseline: '50%',
      target: '95%',
      dueDate: 'February 2025',
    },
  ];

  const recentActivities = [
    { title: 'Reading Level 5', date: 'Today, 10:30 AM', score: 85, icon: '📚' },
    { title: 'Math Practice', date: 'Yesterday, 2:15 PM', score: 92, icon: '🔢' },
    { title: 'Speech Exercise', date: '2 days ago', score: 88, icon: '🗣️' },
  ];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/students"
        className="inline-flex items-center text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
      >
        <span className="mr-2">←</span> Back to Students
      </Link>

      {/* Student Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl">
              {student.avatar}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{student.name}</h1>
              <div className="flex items-center space-x-4 text-indigo-100">
                <span>{student.grade}</span>
                <span>•</span>
                <span>Age {student.age}</span>
                <span>•</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  student.iepStatus === 'active' ? 'bg-green-500/30' : 'bg-yellow-500/30'
                }`}>
                  {student.iepStatus === 'active' ? '● Active IEP' : 'Review Pending'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all">
              Message Parent
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Attendance Rate</p>
          <p className="text-3xl font-bold text-neutral-900">{student.attendance}%</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">IEP Goals Progress</p>
          <p className="text-3xl font-bold text-green-600">75%</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Activities Completed</p>
          <p className="text-3xl font-bold text-indigo-600">124</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Last Session</p>
          <p className="text-lg font-bold text-neutral-900">{student.lastActive}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-neutral-100 inline-flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Parent Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Parent/Guardian Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Name:</span>
                  <span className="font-semibold text-neutral-900">{student.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="font-semibold text-neutral-900">{student.parentEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Enrolled:</span>
                  <span className="font-semibold text-neutral-900">{student.enrollment}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{activity.title}</p>
                        <p className="text-sm text-neutral-600">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-neutral-900">{activity.score}%</p>
                      <p className="text-xs text-neutral-600">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
              <h3 className="font-semibold text-neutral-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-white hover:bg-neutral-50 text-neutral-900 font-medium py-3 px-4 rounded-xl transition-colors text-left">
                  📋 View Full IEP
                </button>
                <button className="w-full bg-white hover:bg-neutral-50 text-neutral-900 font-medium py-3 px-4 rounded-xl transition-colors text-left">
                  🎯 Assign Activity
                </button>
                <button className="w-full bg-white hover:bg-neutral-50 text-neutral-900 font-medium py-3 px-4 rounded-xl transition-colors text-left">
                  📊 Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'iep' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-neutral-900">IEP Goals & Progress</h2>
            <Link to={`/iep/${id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
              View Full IEP →
            </Link>
          </div>

          {iepGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900">{goal.subject}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        goal.status === 'ahead'
                          ? 'bg-green-100 text-green-700'
                          : goal.status === 'on-track'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {goal.status === 'ahead' ? '↑ Ahead of Schedule' : goal.status === 'on-track' ? '→ On Track' : '↓ Needs Support'}
                    </span>
                  </div>
                  <p className="text-neutral-700 mb-4">{goal.goal}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Baseline</p>
                  <p className="text-2xl font-bold text-neutral-900">{goal.baseline}</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Current Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">{goal.progress}%</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Target</p>
                  <p className="text-2xl font-bold text-neutral-900">{goal.target}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Progress to Goal</span>
                  <span className="font-semibold text-neutral-900">{goal.progress}%</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-neutral-600 mt-2">Due: {goal.dueDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
