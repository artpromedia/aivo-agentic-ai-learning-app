import React, { useState } from 'react';

/**
 * Pilot Program Management Page
 * Manage beta programs and pilot deployments
 */
export const PilotProgram: React.FC = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const handleViewParticipant = (participant: any) => {
    setSelectedParticipant(participant);
    setShowViewModal(true);
  };
  const activePilots = [
    { name: 'New Assessment Engine v2', participants: 500, target: 500, start: '2024-01-01', end: '2024-03-31', status: 'active', feedback: 4.6 },
    { name: 'AI Writing Coach', participants: 250, target: 300, start: '2024-01-15', end: '2024-04-15', status: 'active', feedback: 4.8 },
    { name: 'Parent Mobile App', participants: 1000, target: 1000, start: '2023-12-01', end: '2024-02-29', status: 'ending-soon', feedback: 4.4 },
  ];

  const participants = [
    { name: 'Springfield District', tenant: 'Springfield', pilot: 'Assessment Engine v2', enrolled: '2024-01-05', usage: 45, feedback: true, status: 'active' },
    { name: 'Metro Schools', tenant: 'Metro', pilot: 'AI Writing Coach', enrolled: '2024-01-18', usage: 38, feedback: true, status: 'active' },
    { name: 'Riverside District', tenant: 'Riverside', pilot: 'Parent Mobile App', enrolled: '2023-12-10', usage: 92, feedback: true, status: 'active' },
    { name: 'Central Schools', tenant: 'Central', pilot: 'Assessment Engine v2', enrolled: '2024-01-12', usage: 12, feedback: false, status: 'inactive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'ending-soon': return 'bg-orange-100 text-orange-700';
      case 'recruiting': return 'bg-blue-100 text-blue-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pilot Program Management</h1>
        <p className="text-gray-600 mt-1">Manage beta programs and pilot deployments</p>
      </div>

      {/* Active Pilots Overview */}
      <div className="grid grid-cols-3 gap-6">
        {activePilots.map((pilot, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{pilot.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(pilot.status)}`}>
                {pilot.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium">{pilot.participants} / {pilot.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{pilot.start} to {pilot.end}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Feedback Score:</span>
                <span className="font-medium text-green-600">{pilot.feedback} / 5.0</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(pilot.participants / pilot.target) * 100}%` }} />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {((pilot.participants / pilot.target) * 100).toFixed(0)}% enrolled
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pilot Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilot Metrics Overview</h2>
        <div className="grid grid-cols-6 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600 mt-1">Enrollment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">72%</div>
            <div className="text-sm text-gray-600 mt-1">Active Participation</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">68%</div>
            <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">4.6</div>
            <div className="text-sm text-gray-600 mt-1">Satisfaction Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">23</div>
            <div className="text-sm text-gray-600 mt-1">Reported Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">20</div>
            <div className="text-sm text-gray-600 mt-1">Resolved Issues</div>
          </div>
        </div>
      </div>

      {/* Pilot Participants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pilot Participants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pilot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{participant.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{participant.tenant}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{participant.pilot}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{participant.enrolled}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{participant.usage}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${participant.feedback ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {participant.feedback ? 'Provided' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(participant.status)}`}>
                      {participant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewParticipant(participant)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Details Modal */}
      {showViewModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Participant Details</h2>
                  <p className="text-gray-600 mt-1">{selectedParticipant.name}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Enrollment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600">Tenant</p>
                    <p className="font-medium text-gray-900">{selectedParticipant.tenant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pilot Program</p>
                    <p className="font-medium text-gray-900">{selectedParticipant.pilot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Enrolled Date</p>
                    <p className="font-medium text-gray-900">{selectedParticipant.enrolled}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedParticipant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedParticipant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Usage Count</p>
                    <p className="text-3xl font-bold text-blue-700">{selectedParticipant.usage}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Active Days</p>
                    <p className="text-3xl font-bold text-green-700">{Math.floor(selectedParticipant.usage * 0.7)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Features Used</p>
                    <p className="text-3xl font-bold text-purple-700">{Math.floor(selectedParticipant.usage * 0.3)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-600 mb-1">Bug Reports</p>
                    <p className="text-3xl font-bold text-amber-700">{selectedParticipant.status === 'active' ? 2 : 0}</p>
                  </div>
                </div>

                {/* Usage Chart Placeholder */}
                <div className="mt-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-3">Usage Over Time</p>
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[12, 18, 15, 22, 28, 25, 30, 35, 32, 38, 42, 45].map((height, idx) => (
                      <div key={idx} className="flex-1 bg-indigo-200 rounded-t" style={{ height: `${height}%` }}>
                        <div className="bg-indigo-600 rounded-t h-full" style={{ height: `${Math.random() * 100}%` }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Week 1</span>
                    <span>Week 12</span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
                {selectedParticipant.feedback ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Overall Satisfaction</span>
                        <span className="text-lg font-bold text-green-700">4.5 / 5.0</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Latest Feedback</p>
                      <p className="text-sm text-gray-700 italic">"The new assessment engine is much faster and more accurate. Students love the immediate feedback!"</p>
                      <p className="text-xs text-gray-500 mt-2">- Submitted 3 days ago</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">⏳ Feedback pending - reminder sent</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => alert('Sending message to participant...')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <div className="text-2xl mb-1">✉️</div>
                    <div className="text-sm font-medium text-gray-900">Send Message</div>
                  </button>
                  <button
                    onClick={() => alert('Exporting participant data...')}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm font-medium text-gray-900">Export Data</div>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Remove this participant from the pilot program?')) {
                        alert('Participant removed from pilot');
                        setShowViewModal(false);
                      }
                    }}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
                  >
                    <div className="text-2xl mb-1">🚫</div>
                    <div className="text-sm font-medium text-gray-900">Remove from Pilot</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PilotProgram;
