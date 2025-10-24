/**
 * Grade-Based Theme Switcher
 * 
 * Automatically selects theme based on learner's grade level:
 * - K-5: K5 Theme (Playful)
 * - 6-8: MS Theme (Engaging)
 * - 9-12: HS Theme (Professional)
 */

import type {ThemeType, ThemeConfig, ColorMode} from './index';
import {getTheme} from './index';

export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

/**
 * Maps grade level to theme type
 */
export const getThemeTypeForGrade = (grade: GradeLevel): ThemeType => {
  const gradeMap: Record<GradeLevel, ThemeType> = {
    'K': 'K5',
    '1': 'K5',
    '2': 'K5',
    '3': 'K5',
    '4': 'K5',
    '5': 'K5',
    '6': 'MS',
    '7': 'MS',
    '8': 'MS',
    '9': 'HS',
    '10': 'HS',
    '11': 'HS',
    '12': 'HS',
  };

  return gradeMap[grade];
};

/**
 * Gets theme configuration for a specific grade level
 */
export const getThemeForGrade = (
  grade: GradeLevel,
  colorMode: ColorMode = 'light',
): ThemeConfig => {
  const themeType = getThemeTypeForGrade(grade);
  return getTheme(themeType, colorMode);
};

/**
 * Grade level categories
 */
export const gradeCategories = {
  elementary: ['K', '1', '2', '3', '4', '5'] as GradeLevel[],
  middle: ['6', '7', '8'] as GradeLevel[],
  high: ['9', '10', '11', '12'] as GradeLevel[],
};

/**
 * Checks if grade is in elementary school
 */
export const isElementary = (grade: GradeLevel): boolean => {
  return gradeCategories.elementary.includes(grade);
};

/**
 * Checks if grade is in middle school
 */
export const isMiddleSchool = (grade: GradeLevel): boolean => {
  return gradeCategories.middle.includes(grade);
};

/**
 * Checks if grade is in high school
 */
export const isHighSchool = (grade: GradeLevel): boolean => {
  return gradeCategories.high.includes(grade);
};

/**
 * Gets theme-specific features based on grade level
 */
export interface GradeThemeFeatures {
  showAnimations: boolean;
  simplifiedNavigation: boolean;
  voiceGuidance: boolean;
  largerTouchTargets: boolean;
  playfulIcons: boolean;
}

export const getThemeFeaturesForGrade = (
  grade: GradeLevel,
): GradeThemeFeatures => {
  if (isElementary(grade)) {
    return {
      showAnimations: true,
      simplifiedNavigation: true,
      voiceGuidance: true,
      largerTouchTargets: true,
      playfulIcons: true,
    };
  }

  if (isMiddleSchool(grade)) {
    return {
      showAnimations: true,
      simplifiedNavigation: false,
      voiceGuidance: false,
      largerTouchTargets: true,
      playfulIcons: false,
    };
  }

  // High school
  return {
    showAnimations: false,
    simplifiedNavigation: false,
    voiceGuidance: false,
    largerTouchTargets: false,
    playfulIcons: false,
  };
};

/**
 * Theme transition recommendations based on grade progression
 */
export const getThemeTransitionMessage = (
  currentGrade: GradeLevel,
  newGrade: GradeLevel,
): string | null => {
  const currentTheme = getThemeTypeForGrade(currentGrade);
  const newTheme = getThemeTypeForGrade(newGrade);

  if (currentTheme === newTheme) {
    return null;
  }

  if (currentTheme === 'K5' && newTheme === 'MS') {
    return "You're moving up to middle school! We've updated your app with a cooler, more grown-up look. 🎨";
  }

  if (currentTheme === 'MS' && newTheme === 'HS') {
    return "Welcome to high school! Your app now has a more professional design to match your learning level. 📚";
  }

  return "We've updated your app's appearance to better match your grade level!";
};

export default {
  getThemeTypeForGrade,
  getThemeForGrade,
  gradeCategories,
  isElementary,
  isMiddleSchool,
  isHighSchool,
  getThemeFeaturesForGrade,
  getThemeTransitionMessage,
};
