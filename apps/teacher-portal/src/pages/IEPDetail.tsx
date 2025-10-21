import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

export function IEPDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'accommodations' | 'services' | 'notes' | 'timeline'>('overview');

  // Mock IEP data - in production, fetch based on id
  const iep = {
    id: id || '1',
    studentName: 'Alex Johnson',
    studentAvatar: '👦',
    grade: 5,
    status: 'Active',
    dateCreated: 'September 1, 2024',
    lastModified: '2 days ago',
    nextReview: 'March 15, 2025',
    parentContact: 'jane.johnson@email.com',
    caseManager: 'Ms. Thompson',
  };

  const goals = [
    {
      id: 1,
      category: 'Reading',
      title: 'Reading Comprehension',
      description: 'Student will read grade-level text and answer comprehension questions with 80% accuracy.',
      progress: 75,
      targetDate: 'June 2025',
      currentLevel: '4th grade level',
      strategies: ['Guided reading', 'Graphic organizers', 'Think-aloud modeling'],
      assessmentMethod: 'Weekly reading assessments and teacher observations',
    },
    {
      id: 2,
      category: 'Math',
      title: 'Math Problem Solving',
      description: 'Student will solve multi-step word problems with 75% accuracy using visual aids.',
      progress: 60,
      targetDate: 'June 2025',
      currentLevel: 'Below grade level',
      strategies: ['Manipulatives', 'Step-by-step visual guides', 'Small group instruction'],
      assessmentMethod: 'Bi-weekly math assessments',
    },
    {
      id: 3,
      category: 'Speech',
      title: 'Articulation - R Sound',
      description: 'Student will correctly articulate the /r/ sound in conversational speech 90% of the time.',
      progress: 88,
      targetDate: 'April 2025',
      currentLevel: 'Emerging',
      strategies: ['Speech therapy 2x/week', 'Home practice exercises', 'Peer modeling'],
      assessmentMethod: 'Speech therapist observations and recordings',
    },
  ];

  const accommodations = [
    {
      category: 'Instructional',
      items: [
        'Extended time (1.5x) for assignments and tests',
        'Preferential seating near front of classroom',
        'Visual aids and graphic organizers',
        'Break down multi-step directions',
        'Chunking of assignments',
      ],
    },
    {
      category: 'Assessment',
      items: [
        'Read aloud accommodation for assessments',
        'Use of calculator for non-computation questions',
        'Separate quiet testing location',
        'Frequent breaks during testing',
      ],
    },
    {
      category: 'Behavioral',
      items: [
        'Visual schedule and timers',
        'Positive reinforcement system',
        'Movement breaks every 20 minutes',
        'Sensory tools available (fidget, stress ball)',
      ],
    },
  ];

  const services = [
    {
      service: 'Speech-Language Therapy',
      provider: 'Ms. Rodriguez',
      frequency: '2x per week',
      duration: '30 minutes',
      location: 'Speech Room',
      schedule: 'Monday & Wednesday, 10:00 AM',
    },
    {
      service: 'Occupational Therapy',
      provider: 'Mr. Chen',
      frequency: '1x per week',
      duration: '30 minutes',
      location: 'OT Room',
      schedule: 'Thursday, 2:00 PM',
    },
    {
      service: 'Special Education Support',
      provider: 'Ms. Thompson',
      frequency: 'Daily',
      duration: '60 minutes',
      location: 'Resource Room',
      schedule: 'Daily, 1:00-2:00 PM',
    },
  ];

  const progressNotes = [
    {
      date: 'October 15, 2025',
      author: 'Ms. Thompson',
      note: 'Alex showed significant improvement in reading comprehension this week. Successfully answered 8/10 questions on the grade-level passage. Continue with current strategies.',
      category: 'Reading',
    },
    {
      date: 'October 10, 2025',
      author: 'Ms. Rodriguez',
      note: 'Speech therapy session focused on /r/ sound in initial position. Alex is making good progress with minimal cues. Homework: Practice words with /r/ sound 10 minutes daily.',
      category: 'Speech',
    },
    {
      date: 'October 5, 2025',
      author: 'Ms. Thompson',
      note: 'Math problem-solving continues to be challenging. Introduced new visual strategy for breaking down word problems. Will monitor progress over the next two weeks.',
      category: 'Math',
    },
  ];

  const milestones = [
    { date: 'September 1, 2024', event: 'IEP Created', status: 'completed' },
    { date: 'November 15, 2024', event: 'First Progress Report', status: 'completed' },
    { date: 'February 1, 2025', event: 'Mid-Year Review', status: 'upcoming' },
    { date: 'March 15, 2025', event: 'Annual IEP Meeting', status: 'upcoming' },
    { date: 'June 1, 2025', event: 'End of Year Assessment', status: 'upcoming' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'accommodations', label: 'Accommodations', icon: '🛠️' },
    { id: 'services', label: 'Services', icon: '👥' },
    { id: 'notes', label: 'Progress Notes', icon: '📝' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/ieps" className="inline-flex items-center text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
        <span className="mr-2">←</span> Back to IEP Management
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {iep.studentAvatar}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">IEP for {iep.studentName}</h1>
              <p className="text-lg text-indigo-100">
                Grade {iep.grade} • {iep.status} IEP • Next Review: {iep.nextReview}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-xl font-semibold transition-all">
              📄 Export PDF
            </button>
            <button className="bg-white hover:bg-neutral-100 text-indigo-600 px-6 py-3 rounded-xl font-semibold transition-all">
              ✏️ Edit IEP
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-semibold transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Case Manager</p>
                  <p className="text-xl font-bold text-blue-900">{iep.caseManager}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">Parent Contact</p>
                  <p className="text-xl font-bold text-purple-900">{iep.parentContact}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Last Modified</p>
                  <p className="text-xl font-bold text-green-900">{iep.lastModified}</p>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">IEP Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Date Created:</span>
                    <span className="font-semibold text-neutral-900">{iep.dateCreated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Total Goals:</span>
                    <span className="font-semibold text-neutral-900">{goals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Average Progress:</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Services Provided:</span>
                    <span className="font-semibold text-neutral-900">{services.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-2">
                        {goal.category}
                      </span>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{goal.title}</h3>
                      <p className="text-neutral-700 mb-2">{goal.description}</p>
                      <p className="text-sm text-neutral-600">
                        Target Date: <span className="font-semibold">{goal.targetDate}</span> • 
                        Current Level: <span className="font-semibold">{goal.currentLevel}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">{goal.progress}%</div>
                      <div className="text-xs text-neutral-600">Complete</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Strategies:</h4>
                      <ul className="space-y-1">
                        {goal.strategies.map((strategy, index) => (
                          <li key={index} className="text-sm text-neutral-700 flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Assessment Method:</h4>
                      <p className="text-sm text-neutral-700">{goal.assessmentMethod}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Accommodations Tab */}
          {activeTab === 'accommodations' && (
            <div className="space-y-6">
              {accommodations.map((category, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">{category.category} Accommodations</h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                          ✓
                        </span>
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{service.service}</h3>
                      <p className="text-neutral-600">Provider: <span className="font-semibold text-neutral-900">{service.provider}</span></p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Frequency:</span>
                        <span className="font-semibold text-neutral-900">{service.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Duration:</span>
                        <span className="font-semibold text-neutral-900">{service.duration}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Location:</span>
                        <span className="font-semibold text-neutral-900">{service.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Schedule:</span>
                        <span className="font-semibold text-neutral-900">{service.schedule}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                + Add New Progress Note
              </button>
              
              <div className="space-y-4">
                {progressNotes.map((note, index) => (
                  <div key={index} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                          {note.author.split(' ')[1]?.[0] || note.author[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{note.author}</p>
                          <p className="text-sm text-neutral-600">{note.date}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {note.category}
                      </span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-200" />
                
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-start space-x-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 z-10 ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-600 border-4 border-green-200'
                          : 'bg-blue-100 text-blue-600 border-4 border-blue-200'
                      }`}>
                        {milestone.status === 'completed' ? '✓' : '📅'}
                      </div>
                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-neutral-900">{milestone.event}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            milestone.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {milestone.status === 'completed' ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>
                        <p className="text-neutral-600">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
