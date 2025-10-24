/**
 * Onboarding Assessment Page
 * 
 * Wrapper for assessment triggered during onboarding
 * Shows intro modal first, then assessment
 * 
 * Updated: 2025-10-23 06:03:55 UTC
 * By: aivo-ai
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentIntroModal } from '../../components/onboarding/AssessmentIntro';

interface AssessmentData {
  learner_name?: string;
  total_questions?: number;
  estimated_time_minutes?: number;
}

export function OnboardingAssessmentPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  const loadAssessmentInfo = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get assessment details from API
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/v1/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessmentData(data);
      }
      
    } catch (error) {
      console.error('Failed to load assessment:', error);
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadAssessmentInfo();
  }, [loadAssessmentInfo]);

  const handleCloseIntro = () => {
    setShowIntro(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Assessment not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show intro modal first */}
      <AssessmentIntroModal
        isOpen={showIntro}
        onClose={handleCloseIntro}
        assessmentId={assessmentId!}
        learnerName={assessmentData.learner_name || 'there'}
        totalQuestions={assessmentData.total_questions}
        estimatedMinutes={assessmentData.estimated_time_minutes}
      />

      {/* Assessment component will be shown after intro is closed */}
      {!showIntro && (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Assessment #{assessmentId}
            </h2>
            <p className="text-gray-600">
              Assessment content will be integrated here with the existing AssessmentPage component.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
