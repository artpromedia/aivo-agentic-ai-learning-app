import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface LearnerProtectedRouteProps {
  children: ReactNode;
}

/**
 * Simple protection for learner routes that checks localStorage
 * instead of requiring traditional authentication.
 * 
 * Learners don't need to login - they're enrolled by parents/teachers.
 * We just verify they have a valid session from onboarding.
 */
export function LearnerProtectedRoute({ children }: LearnerProtectedRouteProps) {
  // Check if learner has a session (set during onboarding)
  const learnerId = localStorage.getItem('current_learner_id');
  const userRole = localStorage.getItem('user_role');
  
  console.log('🛡️ LearnerProtectedRoute check:');
  console.log('  - Learner ID:', learnerId);
  console.log('  - User Role:', userRole);
  console.log('  - Is Valid:', !!(learnerId && userRole === 'learner'));
  
  // If no learner session, redirect to onboarding assessment
  if (!learnerId || userRole !== 'learner') {
    console.warn('⚠️ No learner session found, redirecting to onboarding');
    console.warn('⚠️ Current URL:', window.location.href);
    return <Navigate to="/onboarding/assessment" replace />;
  }
  
  console.log('✅ Learner session valid, rendering protected content');
  return <>{children}</>;
}
