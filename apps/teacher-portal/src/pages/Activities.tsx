import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Activities() {
  const [filter, setFilter] = useState<string>('all');

  const activities = [
    {
      id: 1,
      title: 'Phonics Practice - Letter Sounds',
      subject: 'Reading',
      level: 'Beginner',
      duration: '15 min',
      assigned: 12,
      completed: 8,
      icon: '📚',
    },
    {
      id: 2,
      title: 'Addition with Manipulatives',
      subject: 'Math',
      level: 'Intermediate',
      duration: '20 min',
      assigned: 15,
      completed: 12,
      icon: '🔢',
    },
    {
      id: 3,
      title: 'Articulation Exercise - R Sound',
      subject: 'Speech',
      level: 'Beginner',
      duration: '10 min',
      assigned: 8,
      completed: 6,
      icon: '🗣️',
    },
    {
      id: 4,
      title: 'Reading Comprehension - Short Stories',
      subject: 'Reading',
      level: 'Advanced',
      duration: '25 min',
      assigned: 10,
      completed: 5,
      icon: '📖',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Learning Activities</h1>
          <p className="text-neutral-600 mt-1">Assign and manage customized learning activities</p>
        </div>
        <button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all">
          + Create Activity
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {['all', 'reading', 'math', 'speech'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === category
                ? 'bg-teal-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                  {activity.icon}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{activity.title}</h3>
                  <p className="text-sm text-neutral-600">{activity.subject} • {activity.level}</p>
                </div>
              </div>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                {activity.duration}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Assigned To</p>
                <p className="text-lg font-bold text-neutral-900">{activity.assigned} students</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Completed</p>
                <p className="text-lg font-bold text-green-600">{activity.completed} students</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-600">Completion Rate</span>
                <span className="font-semibold text-neutral-900">
                  {Math.round((activity.completed / activity.assigned) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  style={{ width: `${(activity.completed / activity.assigned) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/activities/${activity.id}`}
                className="flex-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg font-medium text-center transition-colors text-sm"
              >
                View Details
              </Link>
              <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
