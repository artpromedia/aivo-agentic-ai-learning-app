import { createContext, useContext, useState, useEffect, ReactNode, CSSProperties } from 'react';
import { LearnerTheme, ThemeConfig, LEARNER_THEMES, getThemeByGrade, applyThemeVariables } from './learner-themes';

interface ThemeContextValue {
  theme: LearnerTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: LearnerTheme) => void;
  setGradeLevel: (grade: number) => void;
  gradeLevel: number | null;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: LearnerTheme;
  gradeLevel?: number;
  persistTheme?: boolean;
}

const THEME_STORAGE_KEY = 'aivo-learner-theme';
const GRADE_STORAGE_KEY = 'aivo-learner-grade';

export function ThemeProvider({
  children,
  defaultTheme = 'MS',
  gradeLevel: initialGrade,
  persistTheme = true,
}: ThemeProviderProps) {
  // Initialize theme from grade level or localStorage
  const [gradeLevel, setGradeLevelState] = useState<number | null>(() => {
    if (initialGrade !== undefined) return initialGrade;
    if (persistTheme) {
      const stored = localStorage.getItem(GRADE_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  const [theme, setThemeState] = useState<LearnerTheme>(() => {
    // If grade level provided, derive theme from it
    if (gradeLevel !== null) {
      return getThemeByGrade(gradeLevel);
    }
    
    // Otherwise check localStorage or use default
    if (persistTheme) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && (stored === 'K5' || stored === 'MS' || stored === 'HS')) {
        return stored as LearnerTheme;
      }
    }
    
    return defaultTheme;
  });

  const themeConfig = LEARNER_THEMES[theme];

  // Apply theme variables to document root
  useEffect(() => {
    applyThemeVariables(document.documentElement, theme);
    
    // Also add theme class to body for CSS selectors
    document.body.classList.remove('theme-K5', 'theme-MS', 'theme-HS');
    document.body.classList.add(`theme-${theme}`);
    
    // Update background color
    document.body.style.backgroundColor = themeConfig.colors.background;
  }, [theme, themeConfig]);

  // Persist theme to localStorage
  useEffect(() => {
    if (persistTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, persistTheme]);

  // Persist grade level to localStorage
  useEffect(() => {
    if (persistTheme && gradeLevel !== null) {
      localStorage.setItem(GRADE_STORAGE_KEY, gradeLevel.toString());
    }
  }, [gradeLevel, persistTheme]);

  const setTheme = (newTheme: LearnerTheme) => {
    setThemeState(newTheme);
  };

  const setGradeLevel = (grade: number) => {
    setGradeLevelState(grade);
    const newTheme = getThemeByGrade(grade);
    setThemeState(newTheme);
  };

  const value: ThemeContextValue = {
    theme,
    themeConfig,
    setTheme,
    setGradeLevel,
    gradeLevel,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get theme-aware inline styles
 * @param overrides - Optional style overrides
 * @returns Inline styles with theme variables
 */
export function useThemeStyles(overrides?: CSSProperties): CSSProperties {
  const { themeConfig } = useTheme();
  
  return {
    color: `var(--theme-text, ${themeConfig.colors.text})`,
    fontSize: `var(--theme-font-base, ${themeConfig.fontSize.base})`,
    ...overrides,
  };
}

/**
 * Hook to get theme-aware animation class
 * @param baseClass - Base animation class
 * @returns Animation class with theme intensity
 */
export function useThemeAnimation(baseClass: string): string {
  const { themeConfig } = useTheme();
  
  if (!themeConfig.animations.enabled) return '';
  
  const intensityMap = {
    low: 'transition-all ease-in-out',
    medium: 'transition-transform ease-out',
    high: 'transition-transform ease-out hover:scale-105',
  };
  
  return `${baseClass} ${intensityMap[themeConfig.animations.intensity]}`;
}
