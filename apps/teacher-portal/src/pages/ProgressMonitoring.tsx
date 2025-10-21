import { useState } from 'react';

export function ProgressMonitoring() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const students = [
    { name: 'Alex Johnson', avatar: '👦', overall: 75, reading: 65, math: 72, speech: 88, trend: 'up' },
    { name: 'Emma Davis', avatar: '👧', overall: 75, reading: 82, math: 68, speech: 75, trend: 'up' },
    { name: 'Liam Brown', avatar: '👦', overall: 55, reading: 55, math: 48, speech: 62, trend: 'down' },
    { name: 'Sofia Martinez', avatar: '👧', overall: 89, reading: 90, math: 85, speech: 92, trend: 'up' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Progress Monitoring</h1>
          <p className="text-neutral-600 mt-1">Track student progress across multiple subjects and goals</p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-xl border border-neutral-200 p-1">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                timeRange === range
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Avg. Class Progress</p>
          <p className="text-3xl font-bold text-neutral-900">73%</p>
          <p className="text-xs text-green-600 mt-1">↑ +8% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Students On Track</p>
          <p className="text-3xl font-bold text-green-600">18/24</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Need Support</p>
          <p className="text-3xl font-bold text-red-600">6</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
          <p className="text-sm text-neutral-600 mb-1">Goals Completed</p>
          <p className="text-3xl font-bold text-indigo-600">142</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Student Progress Overview</h2>
        <div className="space-y-4">
          {students.map((student, index) => (
            <div key={index} className="p-4 border border-neutral-100 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    {student.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{student.name}</p>
                    <p className="text-sm text-neutral-600">Overall: {student.overall}%</p>
                  </div>
                </div>
                <span className={`text-2xl ${student.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {student.trend === 'up' ? '↗' : '↘'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['reading', 'math', 'speech'].map((subject) => (
                  <div key={subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600 capitalize">{subject}</span>
                      <span className="font-semibold text-neutral-900">
                        {student[subject as keyof typeof student]}%
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${student[subject as keyof typeof student]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
