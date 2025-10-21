export function BaselineResults() {
  const assessmentDate = 'January 15, 2025';
  
  const subjectResults = [
    {
      name: 'Reading',
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      level: 'Intermediate',
      score: 72,
      skillsAssessed: [
        { name: 'Letter Recognition', score: 95, level: 'Advanced' },
        { name: 'Phonics', score: 85, level: 'Advanced' },
        { name: 'Reading Comprehension', score: 65, level: 'Intermediate' },
        { name: 'Vocabulary', score: 55, level: 'Beginner' },
      ],
      recommendations: [
        'Focus on expanding vocabulary through interactive stories',
        'Practice reading comprehension with guided questions',
        'Continue phonics exercises to strengthen foundation',
      ],
    },
    {
      name: 'Math',
      icon: '🔢',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      level: 'Beginner',
      score: 58,
      skillsAssessed: [
        { name: 'Number Recognition', score: 80, level: 'Advanced' },
        { name: 'Counting', score: 75, level: 'Intermediate' },
        { name: 'Addition', score: 45, level: 'Beginner' },
        { name: 'Subtraction', score: 35, level: 'Beginner' },
      ],
      recommendations: [
        'Start with visual counting exercises using objects',
        'Practice basic addition with numbers 1-10',
        'Use interactive games to make learning fun',
      ],
    },
    {
      name: 'Speech',
      icon: '🗣️',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      level: 'Advanced',
      score: 88,
      skillsAssessed: [
        { name: 'Pronunciation', score: 90, level: 'Advanced' },
        { name: 'Articulation', score: 92, level: 'Advanced' },
        { name: 'Sentence Formation', score: 85, level: 'Advanced' },
        { name: 'Conversation Skills', score: 85, level: 'Advanced' },
      ],
      recommendations: [
        'Continue practicing complex sentence structures',
        'Expand conversational vocabulary',
        'Introduce storytelling exercises',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Celebration */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-5xl">🎉</span>
              <h1 className="text-4xl font-bold">Baseline Assessment Complete!</h1>
            </div>
            <p className="text-lg text-purple-100">
              Assessment completed on {assessmentDate}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Summary Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Assessment Overview</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {subjectResults.map((subject) => (
            <div key={subject.name} className={`${subject.bgColor} rounded-xl p-6 border ${subject.borderColor}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {subject.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{subject.name}</h3>
                  <p className="text-sm text-neutral-600">{subject.level}</p>
                </div>
              </div>
              <div className="flex items-end space-x-2 mb-2">
                <span className="text-4xl font-bold text-neutral-900">{subject.score}</span>
                <span className="text-xl text-neutral-600 mb-1">/100</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${subject.color} rounded-full`}
                  style={{ width: `${subject.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results by Subject */}
      {subjectResults.map((subject) => (
        <div key={subject.name} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-14 h-14 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-3xl`}>
              {subject.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{subject.name} Assessment</h2>
              <p className="text-neutral-600">Current Level: {subject.level}</p>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Skills Assessed</h3>
            <div className="space-y-4">
              {subject.skillsAssessed.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900">{skill.name}</span>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          skill.level === 'Advanced'
                            ? 'bg-green-100 text-green-700'
                            : skill.level === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {skill.level}
                      </span>
                      <span className="font-bold text-neutral-900 w-12 text-right">{skill.score}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${subject.color} rounded-full transition-all`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className={`${subject.bgColor} rounded-xl p-6 border ${subject.borderColor}`}>
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
              <span className="mr-2">💡</span> Personalized Learning Recommendations
            </h3>
            <ul className="space-y-2">
              {subject.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start text-neutral-700">
                  <span className="text-purple-600 mr-2 flex-shrink-0">→</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Next Steps Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
            ✓
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Your Personalized Learning Path is Ready!</h2>
            <p className="text-neutral-700 mb-6">
              Based on these assessment results, we've created a customized learning plan tailored to your child's 
              strengths and growth areas. The AI model will adapt to their learning pace and provide targeted exercises.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Start Learning Journey →
              </button>
              <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-8 py-3 rounded-xl border border-neutral-200 transition-all">
                📊 Download Report
              </button>
              <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-8 py-3 rounded-xl border border-neutral-200 transition-all">
                ✉️ Email Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div className="text-sm text-neutral-700">
            <p className="mb-2">
              <strong>About Baseline Assessments:</strong> These initial assessments help us understand your child's 
              current skill level and create a personalized learning experience. The AI model will continuously adapt 
              as your child progresses.
            </p>
            <p>
              You can view detailed progress reports and retake assessments anytime from the Progress page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
