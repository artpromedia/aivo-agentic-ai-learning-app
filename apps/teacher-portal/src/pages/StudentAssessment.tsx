/**
 * Teacher Portal - Student Assessment Redirect
 * 
 * Shows intro modal then redirects to learner app for baseline assessment
 * 
 * Updated: 2025-10-25 00:47:00 UTC
 * By: aivo-ai
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function StudentAssessmentPage() {
  const { learnerId } = useParams<{ learnerId: string }>();
  const [studentName, setStudentName] = useState('Student');
  const [showModal] = useState(true);

  useEffect(() => {
    // Try to get student name from backend
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:9000/api/v1/learners/${learnerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudentName(`${data.first_name} ${data.last_name}`);
        }
      } catch (error) {
        console.error('Failed to fetch student:', error);
      }
    };

    if (learnerId) {
      fetchStudent();
    }
  }, [learnerId]);

  const handleStartAssessment = () => {
    // Store learner ID and redirect to learner app's public onboarding assessment
    localStorage.setItem('current_learner_id', learnerId || '');
    
    // Get teacher's auth token to pass to learner app
    const teacherToken = localStorage.getItem('access_token');
    
    // Store session data for cross-origin access
    const crossOriginData = {
      learnerId: learnerId || '',
      timestamp: Date.now(),
      token: teacherToken,
      source: 'teacher_portal'
    };
    localStorage.setItem('pending_learner_session', JSON.stringify(crossOriginData));
    
    // Redirect with token and return_to parameter for proper flow
    const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${teacherToken}&return_to=model_cloning`;
    
    console.log('='.repeat(80));
    console.log('🚀 TEACHER PORTAL: Redirecting to learner app');
    console.log('='.repeat(80));
    console.log('📍 Current URL:', window.location.href);
    console.log('🎯 Target URL:', learnerAppUrl);
    console.log('👤 Learner ID:', learnerId);
    console.log('🔑 Token available:', !!teacherToken);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('='.repeat(80));
    
    window.location.href = learnerAppUrl;
  };

  if (!showModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto"></div>
          <p className="text-gray-600 text-lg">Launching assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">
            Ready for {studentName}'s Baseline Assessment?
          </h2>
          <p className="text-indigo-100">
            This assessment will personalize their AI learning brain
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h3 className="font-semibold text-indigo-900 mb-1">
              Quick Baseline Assessment
            </h3>
            <p className="text-sm text-indigo-800">
              This helps us understand the student's current level and learning preferences
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">What to expect:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-medium">8 Questions</p>
                  <p className="text-sm text-gray-600">Learning preferences and confidence levels</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-medium">About 15 minutes</p>
                  <p className="text-sm text-gray-600">Self-paced, no rush</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-medium">Personalized AI Model</p>
                  <p className="text-sm text-gray-600">Unique learning brain created from responses</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> The student will be redirected to the learner app to complete the assessment in a child-friendly interface.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleStartAssessment}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Launch Assessment 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
