import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BaselineAssessment } from '../components/baseline/BaselineAssessment';
import type { BaselineSession, GradeBand } from '../types/baseline';

/**
 * Onboarding Assessment Wrapper
 * 
 * This component handles the assessment flow for newly onboarded students.
 * It doesn't require prior authentication - it creates a temporary session
 * for the learner to complete their baseline assessment.
 * 
 * Flow:
 * 1. Parent/Teacher portal redirects here with learner_id
 * 2. Auto-authenticate the learner (create temp session)
 * 3. Run baseline assessment
 * 4. Navigate to model cloning
 * 5. Then to subject selection
 */
export function OnboardingAssessment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learnerId, setLearnerId] = useState<string>('');
  const [gradeBand, setGradeBand] = useState<GradeBand>('K-5'); // Default grade band

  useEffect(() => {
    const setupAssessment = async () => {
      try {
        // Get learner_id from URL params or localStorage
        const learnerIdParam = searchParams.get('learner_id') || localStorage.getItem('current_learner_id');
        
        if (!learnerIdParam) {
          setError('No learner ID found. Please start the onboarding process again.');
          return;
        }

        setLearnerId(learnerIdParam);
        
        // Store learner_id for the session
        localStorage.setItem('current_learner_id', learnerIdParam);
        localStorage.setItem('onboarding_flow', 'true');
        
        // Get auth token from URL params (passed from parent portal for cross-origin auth)
        // or fall back to localStorage if available
        const authToken = searchParams.get('token') || localStorage.getItem('access_token');
        
        console.log('🔐 Setting up assessment for learner:', learnerId);
        console.log('🔑 Auth token available:', !!authToken);
        
        if (authToken) {
          // Fetch learner details from backend
          console.log('📡 Fetching learner data from API...');
          const response = await fetch(`http://localhost:9000/api/v1/learners/${learnerId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.ok) {
            const learnerData = await response.json();
            console.log('✅ Learner data fetched successfully');
            
            // Determine grade band from grade level
            const gradeLevel = learnerData.grade_level || 0;
            let band: GradeBand = 'K-5';
            if (gradeLevel >= 6 && gradeLevel <= 8) {
              band = '6-8';
            } else if (gradeLevel >= 9) {
              band = '9-12';
            }
            setGradeBand(band);
            
            // Create a learner session (simplified auth for onboarding)
            localStorage.setItem('learner_profile', JSON.stringify(learnerData));
            localStorage.setItem('user_role', 'learner');
            localStorage.setItem('user_id', learnerId);
            
            // Store the auth token temporarily for API calls during onboarding
            localStorage.setItem('onboarding_token', authToken);
            
            // Also set it as access_token so ProtectedRoute works
            localStorage.setItem('access_token', authToken);
            
            // Create a minimal user object for auth context
            const learnerUser = {
              id: learnerId,
              email: `learner_${learnerId}@temp.local`,
              firstName: learnerData.first_name,
              lastName: learnerData.last_name,
              role: 'learner',
              isActive: true
            };
            localStorage.setItem('user', JSON.stringify(learnerUser));
            
            // Mark that assessment is needed
            localStorage.setItem('needs_assessment', 'true');
          } else {
            console.error('❌ Failed to fetch learner data:', response.status);
            setError('Failed to load learner information. Please try again.');
            return;
          }
        } else {
          console.warn('⚠️ No auth token available - proceeding with limited functionality');
        }
        
        setIsReady(true);
        
      } catch (err) {
        console.error('Error setting up assessment:', err);
        setError('Failed to setup assessment. Please try again.');
      }
    };

    setupAssessment();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto"></div>
          <p className="text-gray-600 text-lg">Setting up your assessment...</p>
        </div>
      </div>
    );
  }

  // Handle assessment completion
  const handleComplete = (results: BaselineSession) => {
    console.log('✅ Baseline assessment completed:', results);
    
    // Store results
    localStorage.setItem('baseline_results', JSON.stringify(results));
    localStorage.setItem('baseline_complete', 'true');
    
    // Check return_to parameter
    const returnTo = searchParams.get('return_to');
    
    if (returnTo === 'model_cloning') {
      // Redirect back to parent portal for model cloning
      const parentPortalUrl = 'http://localhost:3001/#/model-cloning';
      window.location.href = parentPortalUrl;
    } else {
      // Show results page
      navigate(`/baseline/results/${results.id}`);
    }
  };

  // Render the actual assessment
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
