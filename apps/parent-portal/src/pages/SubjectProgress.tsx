import { Link, useParams } from 'react-router-dom';

interface SubjectInfo {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export function SubjectProgress() {
  const { subject } = useParams<{ subject: string }>();
  
  const subjectData: Record<string, SubjectInfo> = {
    reading: {
      name: 'Reading',
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    math: {
      name: 'Math',
      icon: '🔢',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    speech: {
      name: 'Speech',
      icon: '🗣️',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  };

  const currentSubject: SubjectInfo = (subjectData[subject || 'reading'] || subjectData.reading)!;

  const skills = [
    { name: 'Phonics Awareness', level: 'Mastered', progress: 100 },
    { name: 'Vocabulary Building', level: 'Advanced', progress: 85 },
    { name: 'Reading Comprehension', level: 'Intermediate', progress: 65 },
    { name: 'Fluency Practice', level: 'Beginner', progress: 40 },
    { name: 'Story Sequencing', level: 'Intermediate', progress: 70 },
    { name: 'Context Clues', level: 'Beginner', progress: 35 },
  ];

  const activities = [
    {
      title: 'The Little Red Hen',
      type: 'Reading Story',
      date: 'Today, 10:30 AM',
      duration: '15 min',
      score: 95,
      status: 'completed',
    },
    {
      title: 'Phonics Level 5',
      type: 'Practice',
      date: 'Yesterday, 3:45 PM',
      duration: '12 min',
      score: 88,
      status: 'completed',
    },
    {
      title: 'Vocabulary Quiz',
      type: 'Assessment',
      date: '2 days ago',
      duration: '8 min',
      score: 92,
      status: 'completed',
    },
    {
      title: 'Sight Words Practice',
      type: 'Practice',
      date: '3 days ago',
      duration: '10 min',
      score: 100,
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/progress"
        className="inline-flex items-center text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
      >
        <span className="mr-2">←</span> Back to All Progress
      </Link>

      {/* Subject Header */}
      <div className={`bg-gradient-to-r ${currentSubject.color} rounded-3xl p-8 text-white`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
            {currentSubject.icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{currentSubject.name} Progress</h1>
            <p className="text-white/80 mt-1">Detailed learning insights and activity history</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/80 text-sm mb-1">Overall Progress</p>
            <p className="text-3xl font-bold">65%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/80 text-sm mb-1">Time Spent</p>
            <p className="text-3xl font-bold">8.5 hrs</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/80 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold">24</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/80 text-sm mb-1">Skills Mastered</p>
            <p className="text-3xl font-bold">5</p>
          </div>
        </div>
      </div>

      {/* Skills Mastery Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Skills Mastery</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">{skill.name}</h3>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    skill.level === 'Mastered'
                      ? 'bg-green-100 text-green-700'
                      : skill.level === 'Advanced'
                      ? 'bg-blue-100 text-blue-700'
                      : skill.level === 'Intermediate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {skill.level}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${currentSubject.color} rounded-full transition-all`}
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-neutral-700 w-12 text-right">
                  {skill.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Activity History</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${currentSubject.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
                  {currentSubject.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{activity.title}</h3>
                  <p className="text-sm text-neutral-600">
                    {activity.type} • {activity.date} • {activity.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">{activity.score}%</p>
                  <p className="text-xs text-neutral-600">Score</p>
                </div>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Areas for Improvement */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
            <span className="mr-2">💪</span> Strengths
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-neutral-700">Excellent phonics awareness and sound recognition</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-neutral-700">Strong vocabulary retention and recall</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-neutral-700">Good engagement with interactive stories</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
            <span className="mr-2">🎯</span> Growth Areas
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">→</span>
              <span className="text-neutral-700">Continue practicing reading fluency and speed</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">→</span>
              <span className="text-neutral-700">Work on understanding context clues</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">→</span>
              <span className="text-neutral-700">Expand comprehension of longer passages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
