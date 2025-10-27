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
        console.log('='.repeat(80));
        console.log('🎯 LEARNER APP: OnboardingAssessment Starting');
        console.log('='.repeat(80));
        console.log('📍 Current URL:', window.location.href);
        console.log('🔍 URL Search Params:', searchParams.toString());
        console.log('⏰ Timestamp:', new Date().toISOString());
        
        // Check for pending session from parent portal
        const pendingSession = localStorage.getItem('pending_learner_session');
        if (pendingSession) {
          console.log('📦 Found pending session data from parent portal');
          try {
            const sessionData = JSON.parse(pendingSession);
            console.log('📦 Session data:', { ...sessionData, token: '***' });
            // Clear it after reading
            localStorage.removeItem('pending_learner_session');
          } catch {
            console.warn('⚠️ Could not parse pending session data');
          }
        }
        
        // Get learner_id from URL params or localStorage
        const learnerIdParam = searchParams.get('learner_id') || localStorage.getItem('current_learner_id');
        
        console.log('👤 Learner ID from URL:', searchParams.get('learner_id'));
        console.log('👤 Learner ID from localStorage:', localStorage.getItem('current_learner_id'));
        console.log('👤 Final Learner ID:', learnerIdParam);
        
        if (!learnerIdParam) {
          console.error('❌ No learner ID found');
          setError('No learner ID found. Please start the onboarding process again.');
          return;
        }

        setLearnerId(learnerIdParam);
        
        // CRITICAL: Set user_role FIRST before anything else
        console.log('🔐 Setting user_role to learner...');
        localStorage.setItem('user_role', 'learner');
        localStorage.setItem('current_learner_id', learnerIdParam);
        localStorage.setItem('onboarding_flow', 'true');
        
        console.log('✅ User role set:', localStorage.getItem('user_role'));
        console.log('✅ Learner ID stored:', localStorage.getItem('current_learner_id'));
        
        // Get auth token from URL params (passed from parent portal for cross-origin auth)
        // or fall back to localStorage if available
        const authToken = searchParams.get('token') || localStorage.getItem('access_token');
        
        console.log('🔐 Setting up assessment for learner:', learnerIdParam);
        console.log('🔑 Auth token available:', !!authToken);
        console.log('🔑 Auth token source:', searchParams.get('token') ? 'URL' : 'localStorage');
        console.log('='.repeat(80));
        
        if (authToken) {
          // Fetch learner details from backend
          console.log('📡 Fetching learner data from API...');
          const response = await fetch(`http://localhost:9000/api/v1/learners/${learnerIdParam}`, {
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
            localStorage.setItem('user_id', learnerIdParam);
            
            // Store the auth token temporarily for API calls during onboarding
            localStorage.setItem('onboarding_token', authToken);
            
            // Also set it as access_token so ProtectedRoute works
            localStorage.setItem('access_token', authToken);
            
            // Create a minimal user object for auth context
            const learnerUser = {
              id: learnerIdParam,
              email: `learner_${learnerIdParam}@temp.local`,
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
            // Don't fail completely - set a default grade band and continue
            console.warn('⚠️ Using default grade band K-5');
            setGradeBand('K-5');
            
            // Still set up basic learner session
            localStorage.setItem('user_role', 'learner');
            localStorage.setItem('user_id', learnerIdParam);
            if (authToken) {
              localStorage.setItem('access_token', authToken);
            }
          }
        } else {
          console.warn('⚠️ No auth token available - proceeding with default grade band K-5');
          setGradeBand('K-5');
          
          // Set up basic learner session even without token
          localStorage.setItem('user_role', 'learner');
          localStorage.setItem('user_id', learnerIdParam);
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
    
    // Store assessment results for model cloning API
    const assessmentResults = {
      session_id: results.id,
      learner_id: results.learnerId,
      domain_estimates: results.currentAbilityEstimates,
      standard_errors: results.standardErrors,
      total_items: results.responses.length,
      completed_at: results.completedAt || new Date(),
    };
    localStorage.setItem('assessment_results', JSON.stringify(assessmentResults));
    
    // Check return_to parameter
    const returnTo = searchParams.get('return_to');
    
    if (returnTo === 'model_cloning') {
      // Stay in learner app and go to Responsible AI model cloning
      console.log('🧬 Assessment complete! Moving to Responsible AI model cloning...');
      navigate('/cloning');
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
