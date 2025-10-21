import { Link } from 'react-router-dom';
import { getStudents, getAnalytics, getMessages, getInterventionAlerts } from '../utils/mockData';
import { StudentActivityStatus } from '../components/StudentActivityStatus';
import { InterventionAlertList } from '../components/InterventionAlert';
import { IEPGoalTracker } from '../components/IEPGoalTracker';

export function Dashboard() {
  // Get real data from mock generators
  const students = getStudents();
  const analytics = getAnalytics();
  const messages = getMessages();
  const interventionAlerts = getInterventionAlerts();

  const activeStudents = students.filter((s) => s.currentActivity);
  const unreadMessages = messages.filter((m) => !m.isRead).length;
  
  // Calculate average progress across all students
  const avgProgress = Math.round(
    students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length
  );

  const stats = [
    { 
      label: 'Total Students', 
      value: students.length.toString(), 
      icon: '👥', 
      color: 'from-blue-500 to-cyan-500', 
      change: `${activeStudents.length} active now` 
    },
    { 
      label: 'Active IEPs', 
      value: students.filter(s => s.iepStatus === 'active').length.toString(), 
      icon: '📋', 
      color: 'from-green-500 to-emerald-500', 
      change: `${students.filter(s => s.iepStatus === 'review-due').length} due for review` 
    },
    { 
      label: 'Avg. Progress', 
      value: `${avgProgress}%`, 
      icon: '📈', 
      color: 'from-purple-500 to-pink-500', 
      change: `${analytics.classroomSummary.iepGoalsOnTrack} goals on track` 
    },
    { 
      label: 'Messages', 
      value: messages.length.toString(), 
      icon: '✉️', 
      color: 'from-orange-500 to-red-500', 
      change: `${unreadMessages} unread` 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, Ms. Smith! 👋</h1>
        <p className="text-lg text-indigo-100">
          You have 3 IEP meetings scheduled this week and 12 new messages from parents.
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
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-neutral-600 mb-2">{stat.label}</p>
            <p className="text-xs text-neutral-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Now Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Active Now
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {activeStudents.length} students currently working
              </p>
            </div>
            <Link to="/students" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              View All Students →
            </Link>
          </div>
          
          {activeStudents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeStudents.slice(0, 5).map((student) => (
                <StudentActivityStatus
                  key={student.id}
                  student={student}
                  onClick={() => window.location.href = `/students/${student.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-4xl mb-3">😴</p>
              <p>No students currently active</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/iep"
              className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📋</span>
                <span className="font-medium text-neutral-900">Create IEP</span>
              </div>
              <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/activities"
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <span className="font-medium text-neutral-900">Assign Activity</span>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/messages"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <span className="font-medium text-neutral-900 block">Message Parents</span>
                  {unreadMessages > 0 && (
                    <span className="text-xs text-purple-600">{unreadMessages} unread</span>
                  )}
                </div>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <span className="font-medium text-neutral-900">Generate Report</span>
              </div>
              <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Intervention Alerts */}
      {interventionAlerts.length > 0 && (
        <InterventionAlertList alerts={interventionAlerts} maxDisplay={3} />
      )}

      {/* IEP Goals Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <IEPGoalTracker 
          goals={students.flatMap(s => s.iepGoals)} 
          compact 
        />
        
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Upcoming IEP Deadlines</h2>
            <Link to="/iep" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {students
              .filter(s => s.iepStatus === 'review-due' || Math.random() > 0.7)
              .slice(0, 3)
              .map((student, index) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    index === 0
                      ? 'bg-red-50 border-red-500'
                      : index === 1
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">IEP Review Meeting</p>
                      <p className="text-sm text-neutral-600">{student.name} • Due Soon</p>
                    </div>
                    <Link 
                      to={`/students/${student.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Student Activity</h2>
        <div className="space-y-4">
          {students
            .filter(s => s.currentActivity || Math.random() > 0.5)
            .slice(0, 6)
            .map((student) => (
              <div key={student.id} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                <img 
                  src={student.avatar} 
                  alt={student.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{student.name}</p>
                  <p className="text-sm text-neutral-600">
                    {student.currentActivity 
                      ? `Working on ${student.currentActivity.activityName}`
                      : `Last active ${Math.floor(Math.random() * 12) + 1} hours ago`
                    }
                  </p>
                </div>
                <p className="text-xs text-neutral-500">
                  {student.currentActivity 
                    ? `${student.currentActivity.accuracy}% accuracy`
                    : `${student.overallProgress}% progress`
                  }
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
