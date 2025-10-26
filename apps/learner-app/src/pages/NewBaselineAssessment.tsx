import { useNavigate } from 'react-router-dom';
import { BaselineAssessment } from '../components/baseline/BaselineAssessment';
import type { BaselineSession, GradeBand } from '../types/baseline';

/**
 * New Comprehensive Baseline Assessment Page
 * 
 * This is a page wrapper for the new comprehensive baseline assessment
 * that includes IRT, CAT, speech therapy, and adaptive testing.
 */
export function NewBaselineAssessment() {
  const navigate = useNavigate();
  
  // Get learner ID from localStorage or URL params
  const learnerId = localStorage.getItem('current_learner_id') || 
                   localStorage.getItem('user_id') || 
                   'demo-learner';

  // Determine grade band from learner profile
  const learnerProfileStr = localStorage.getItem('learner_profile');
  let gradeBand: GradeBand = 'K-5'; // Default
  
  if (learnerProfileStr) {
    try {
      const profile = JSON.parse(learnerProfileStr);
      const gradeLevel = profile.grade_level || 0;
      if (gradeLevel >= 6 && gradeLevel <= 8) {
        gradeBand = '6-8';
      } else if (gradeLevel >= 9) {
        gradeBand = '9-12';
      }
    } catch (e) {
      console.error('Failed to parse learner profile');
    }
  }

  const handleComplete = (results: BaselineSession) => {
    console.log('✅ Baseline assessment completed:', results);
    
    // Store results
    localStorage.setItem('baseline_results', JSON.stringify(results));
    localStorage.setItem('baseline_complete', 'true');
    
    // Check if this is part of onboarding flow
    const isOnboarding = localStorage.getItem('onboarding_flow') === 'true';
    const returnTo = new URLSearchParams(window.location.search).get('return_to');
    
    if (isOnboarding) {
      // Navigate to results page or model cloning based on return_to param
      if (returnTo === 'model_cloning') {
        // Redirect back to parent portal for model cloning
        const parentPortalUrl = 'http://localhost:3001/#/model-cloning';
        window.location.href = parentPortalUrl;
      } else {
        // Show results page
        navigate(`/baseline/results/${results.id}`);
      }
    } else {
      // Regular assessment flow - show results
      navigate(`/baseline/results/${results.id}`);
    }
  };

  const handlePause = (session: BaselineSession) => {
    console.log('⏸️ Assessment paused:', session);
    
    // Save session state
    localStorage.setItem('paused_assessment', JSON.stringify(session));
    
    // Navigate back to home or dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <BaselineAssessment
        learnerId={learnerId}
        gradeBand={gradeBand}
        onComplete={handleComplete}
      />
    </div>
  );
}
