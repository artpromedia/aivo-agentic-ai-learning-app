/**
 * Aivo Learning Theme System
 * 
 * Provides age-appropriate theming for K-5, Middle School, and High School learners.
 * Themes automatically adapt based on grade level with distinct visual styles,
 * font sizes, spacing, and animation intensities.
 */

// Core theme configuration
export {
  LEARNER_THEMES,
  getThemeByGrade,
  getThemeVariables,
  applyThemeVariables,
  getAnimationClass,
  type LearnerTheme,
  type ThemeConfig,
} from './learner-themes';

// Theme provider and hooks
export {
  ThemeProvider,
  useTheme,
  useThemeStyles,
  useThemeAnimation,
} from './ThemeProvider';
