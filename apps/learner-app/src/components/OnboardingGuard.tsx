import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingGuardProps {
  children: ReactNode;
}

/**
 * OnboardingGuard ensures learners complete the onboarding flow before accessing certain features.
 * 
 * Required flow:
 * 1. Baseline Assessment (baseline_complete)
 * 2. Model Cloning (model_cloning_complete)
 * 3. Then access to subjects/activities
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = () => {
      const learnerId = localStorage.getItem('current_learner_id');
      const baselineComplete = localStorage.getItem('baseline_complete');
      const modelCloningComplete = localStorage.getItem('model_cloning_complete');
      const onboardingFlow = localStorage.getItem('onboarding_flow');

      console.log('🛡️ OnboardingGuard check:');
      console.log('  - Learner ID:', learnerId);
      console.log('  - Baseline Complete:', baselineComplete);
      console.log('  - Model Cloning Complete:', modelCloningComplete);
      console.log('  - In Onboarding Flow:', onboardingFlow);

      // If no learner ID, this is handled by LearnerProtectedRoute
      if (!learnerId) {
        console.warn('⚠️ No learner ID - will be handled by parent guard');
        return;
      }

      // Check if baseline assessment is complete
      if (!baselineComplete || baselineComplete !== 'true') {
        console.warn('⚠️ Baseline assessment not complete, redirecting to assessment');
        navigate('/onboarding/assessment', { replace: true });
        return;
      }

      // Check if model cloning is complete
      if (!modelCloningComplete || modelCloningComplete !== 'true') {
        console.warn('⚠️ Model cloning not complete, redirecting to cloning');
        navigate('/cloning', { replace: true });
        return;
      }

      console.log('✅ Onboarding complete, allowing access');
    };

    checkOnboardingStatus();
  }, [navigate]);

  return <>{children}</>;
}
