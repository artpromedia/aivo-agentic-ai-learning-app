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
  
  // If no learner session, redirect to onboarding assessment
  if (!learnerId || userRole !== 'learner') {
    console.warn('⚠️ No learner session found, redirecting to onboarding');
    return <Navigate to="/onboarding/assessment" replace />;
  }
  
  return <>{children}</>;
}
