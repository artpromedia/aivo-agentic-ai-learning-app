import { useEffect } from 'react';
import { useTheme } from '@aivo/ui';

/**
 * GradeBasedThemeSync component
 * 
 * Automatically syncs the theme with the learner's grade level from their profile.
 * This component should be rendered inside ThemeProvider.
 * 
 * Grade to Theme Mapping:
 * - Grades K-5 → K5 Theme (Elementary)
 * - Grades 6-8 → MS Theme (Middle School)
 * - Grades 9-12 → HS Theme (High School)
 * 
 * Note: Reads learner data from localStorage (no AuthProvider needed)
 */
export function GradeBasedThemeSync() {
  const { setGradeLevel, gradeLevel: currentGrade } = useTheme();

  useEffect(() => {
    // Read learner data from localStorage
    const userRole = localStorage.getItem('user_role');
    const userDataStr = localStorage.getItem('user');
    
    // Only sync for learner users
    if (userRole === 'learner' && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const learnerGrade = userData.gradeLevel as number | undefined;
        
        if (learnerGrade && learnerGrade !== currentGrade) {
          console.log(`[Theme] Auto-setting theme for grade ${learnerGrade}`);
          setGradeLevel(learnerGrade);
        }
      } catch (error) {
        console.warn('[Theme] Failed to parse user data from localStorage:', error);
      }
    }
  }, [setGradeLevel, currentGrade]);

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
