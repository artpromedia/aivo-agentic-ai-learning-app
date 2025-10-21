import { useEffect } from 'react';
import { useAuth } from '@aivo/auth';
import { useTheme } from '@aivo/ui';

/**
 * GradeBasedThemeSync component
 * 
 * Automatically syncs the theme with the learner's grade level from their profile.
 * This component should be rendered inside both AuthProvider and ThemeProvider.
 * 
 * Grade to Theme Mapping:
 * - Grades K-5 → K5 Theme (Elementary)
 * - Grades 6-8 → MS Theme (Middle School)
 * - Grades 9-12 → HS Theme (High School)
 */
export function GradeBasedThemeSync() {
  const { user } = useAuth();
  const { setGradeLevel, gradeLevel: currentGrade } = useTheme();

  useEffect(() => {
    // Only sync for learner users
    if (user?.role === 'learner') {
      // In a real app, fetch the learner's profile to get their grade level
      // For now, we'll simulate with user metadata
      // @ts-expect-error - gradeLevel may not be on AuthUser type
      const learnerGrade = user.gradeLevel as number | undefined;
      
      if (learnerGrade && learnerGrade !== currentGrade) {
        console.log(`[Theme] Auto-setting theme for grade ${learnerGrade}`);
        setGradeLevel(learnerGrade);
      }
    }
  }, [user, setGradeLevel, currentGrade]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook to manually set grade level and sync theme
 * Use this when updating learner profile or during onboarding
 */
export function useGradeThemeSync() {
  const { setGradeLevel } = useTheme();
  
  return {
    syncGradeToTheme: (grade: number) => {
      console.log(`[Theme] Syncing theme for grade ${grade}`);
      setGradeLevel(grade);
    },
  };
}
