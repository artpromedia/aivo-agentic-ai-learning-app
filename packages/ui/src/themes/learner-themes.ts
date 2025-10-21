/**
 * Learner Theme Configuration
 * 
 * Provides distinct visual styles for different grade levels:
 * - K5: Playful, colorful interface for elementary (K-5, ages 5-11)
 * - MS: Modern, engaging interface for middle school (6-8, ages 11-14)
 * - HS: Professional, streamlined interface for high school (9-12, ages 14-18)
 */

export type LearnerTheme = 'K5' | 'MS' | 'HS';

export interface ThemeConfig {
  id: LearnerTheme;
  name: string;
  gradeRange: string;
  ages: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  fontSize: {
    base: string;
    heading: string;
    label: string;
  };
  spacing: {
    card: string;
    grid: string;
  };
  borderRadius: {
    card: string;
    button: string;
  };
  iconSize: {
    subject: string;
    navigation: string;
  };
  animations: {
    enabled: boolean;
    duration: string;
    intensity: 'low' | 'medium' | 'high';
  };
}

export const LEARNER_THEMES: Record<LearnerTheme, ThemeConfig> = {
  K5: {
    id: 'K5',
    name: 'Elementary',
    gradeRange: 'K-5',
    ages: '5-11 years',
    description: 'Playful, colorful interface for elementary learners',
    colors: {
      primary: '#f59e0b',      // amber-500
      secondary: '#fbbf24',    // amber-400
      accent: '#fb923c',       // orange-400
      background: '#fffbeb',   // amber-50
      surface: '#ffffff',
      text: '#78350f',         // amber-900
      border: '#fde68a',       // amber-200
    },
    fontSize: {
      base: '1.125rem',        // 18px - larger for young readers
      heading: '2rem',         // 32px
      label: '1rem',           // 16px
    },
    spacing: {
      card: '1.5rem',          // 24px - generous spacing
      grid: '1.5rem',
    },
    borderRadius: {
      card: '1.5rem',          // 24px - very rounded
      button: '1rem',          // 16px
    },
    iconSize: {
      subject: '4rem',         // 64px - large, friendly icons
      navigation: '2.5rem',    // 40px
    },
    animations: {
      enabled: true,
      duration: '300ms',
      intensity: 'high',       // Fun, bouncy animations
    },
  },
  
  MS: {
    id: 'MS',
    name: 'Middle School',
    gradeRange: '6-8',
    ages: '11-14 years',
    description: 'Modern, engaging interface for middle schoolers',
    colors: {
      primary: '#6366f1',      // indigo-500
      secondary: '#818cf8',    // indigo-400
      accent: '#a78bfa',       // violet-400
      background: '#eef2ff',   // indigo-50
      surface: '#ffffff',
      text: '#312e81',         // indigo-900
      border: '#c7d2fe',       // indigo-200
    },
    fontSize: {
      base: '1rem',            // 16px - standard
      heading: '1.75rem',      // 28px
      label: '0.875rem',       // 14px
    },
    spacing: {
      card: '1.25rem',         // 20px
      grid: '1rem',
    },
    borderRadius: {
      card: '1rem',            // 16px - moderately rounded
      button: '0.75rem',       // 12px
    },
    iconSize: {
      subject: '3rem',         // 48px - medium icons
      navigation: '2rem',      // 32px
    },
    animations: {
      enabled: true,
      duration: '250ms',
      intensity: 'medium',     // Smooth, modern animations
    },
  },
  
  HS: {
    id: 'HS',
    name: 'High School',
    gradeRange: '9-12',
    ages: '14-18 years',
    description: 'Professional, streamlined interface for high schoolers',
    colors: {
      primary: '#10b981',      // emerald-500
      secondary: '#34d399',    // emerald-400
      accent: '#059669',       // emerald-600
      background: '#ecfdf5',   // emerald-50
      surface: '#ffffff',
      text: '#064e3b',         // emerald-900
      border: '#a7f3d0',       // emerald-200
    },
    fontSize: {
      base: '0.875rem',        // 14px - more compact
      heading: '1.5rem',       // 24px
      label: '0.75rem',        // 12px
    },
    spacing: {
      card: '1rem',            // 16px - tighter spacing
      grid: '0.75rem',
    },
    borderRadius: {
      card: '0.75rem',         // 12px - subtle rounding
      button: '0.5rem',        // 8px
    },
    iconSize: {
      subject: '2.5rem',       // 40px - smaller, professional
      navigation: '1.5rem',    // 24px
    },
    animations: {
      enabled: true,
      duration: '200ms',
      intensity: 'low',        // Subtle, professional animations
    },
  },
};

/**
 * Get theme by grade level
 * @param grade - Grade level (K=0, 1-12)
 * @returns Appropriate theme for grade level
 */
export function getThemeByGrade(grade: number): LearnerTheme {
  if (grade <= 5) return 'K5';
  if (grade <= 8) return 'MS';
  return 'HS';
}

/**
 * Get theme CSS variables for the given theme
 * @param theme - Theme identifier
 * @returns CSS custom properties object
 */
export function getThemeVariables(theme: LearnerTheme): Record<string, string> {
  const config = LEARNER_THEMES[theme];
  return {
    '--theme-primary': config.colors.primary,
    '--theme-secondary': config.colors.secondary,
    '--theme-accent': config.colors.accent,
    '--theme-background': config.colors.background,
    '--theme-surface': config.colors.surface,
    '--theme-text': config.colors.text,
    '--theme-border': config.colors.border,
    '--theme-font-base': config.fontSize.base,
    '--theme-font-heading': config.fontSize.heading,
    '--theme-font-label': config.fontSize.label,
    '--theme-card-padding': config.spacing.card,
    '--theme-grid-gap': config.spacing.grid,
    '--theme-card-radius': config.borderRadius.card,
    '--theme-button-radius': config.borderRadius.button,
    '--theme-icon-subject': config.iconSize.subject,
    '--theme-icon-nav': config.iconSize.navigation,
    '--theme-animation-duration': config.animations.duration,
  };
}

/**
 * Apply theme variables to an element
 * @param element - DOM element to apply theme to
 * @param theme - Theme to apply
 */
export function applyThemeVariables(element: HTMLElement, theme: LearnerTheme): void {
  const variables = getThemeVariables(theme);
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Get animation class based on theme intensity
 * @param theme - Theme identifier
 * @param baseClass - Base animation class
 * @returns Animation class with intensity modifier
 */
export function getAnimationClass(theme: LearnerTheme, baseClass: string): string {
  const config = LEARNER_THEMES[theme];
  if (!config.animations.enabled) return '';
  
  const intensityMap = {
    low: 'animate-subtle',
    medium: 'animate-smooth',
    high: 'animate-bounce',
  };
  
  return `${baseClass} ${intensityMap[config.animations.intensity]}`;
}
