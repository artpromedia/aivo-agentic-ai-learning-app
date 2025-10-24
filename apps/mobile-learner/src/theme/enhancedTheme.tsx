/**
 * Enhanced Theme System with Light/Dark Mode Support
 * 
 * Provides theme configuration with:
 * - Age-based themes (K5, MS, HS)
 * - Light/Dark mode support
 * - useTheme hook for components
 * - Typography and spacing scales
 */

import React, {createContext, useContext, useMemo, type ReactNode} from 'react';
import {useColorScheme} from 'react-native';

export type ThemeType = 'K5' | 'MS' | 'HS';
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  disabled: string;
  overlay: string;
  shadow: string;
}

export interface Typography {
  fontFamily: {
    sans: string;
    display: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    extrabold: '800';
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Spacing {
  xs: number;    // 4
  sm: number;    // 8
  md: number;    // 16
  lg: number;    // 24
  xl: number;    // 32
  '2xl': number; // 48
  '3xl': number; // 64
  touch: number; // 44 (minimum touch target)
}

export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
  touch: number; // Touch-friendly radius
}

export interface ThemeConfig {
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}

// Shared typography across all themes
const typography: Typography = {
  fontFamily: {
    sans: 'System',
    display: 'System',
    mono: 'Menlo',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Shared spacing (4px grid system)
const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  touch: 44,
};

// Shared border radius
const borderRadius: BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
  touch: 12,
};

// K5 Theme (Ages 5-10) - Playful and Vibrant
export const K5Theme: ThemeConfig = {
  colors: {
    light: {
      primary: '#FF6B9D',
      secondary: '#FFA500',
      accent: '#FFD700',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      info: '#2196F3',
      background: '#FFF5F7',
      surface: '#FFFFFF',
      text: '#333333',
      textSecondary: '#666666',
      border: '#FFD1DC',
      disabled: '#E0E0E0',
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: '#FF8CB4',
      secondary: '#FFB347',
      accent: '#FFE066',
      success: '#66BB6A',
      warning: '#FFCA28',
      error: '#EF5350',
      info: '#42A5F5',
      background: '#1A1A1A',
      surface: '#2A2A2A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#444444',
      disabled: '#555555',
      overlay: 'rgba(0, 0, 0, 0.7)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  typography,
  spacing,
  borderRadius,
};

// MS Theme (Ages 11-13) - Cool and Engaging
export const MSTheme: ThemeConfig = {
  colors: {
    light: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      disabled: '#CBD5E1',
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: '#818CF8',
      secondary: '#A78BFA',
      accent: '#F472B6',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      disabled: '#475569',
      overlay: 'rgba(0, 0, 0, 0.7)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  typography,
  spacing,
  borderRadius,
};

// HS Theme (Ages 14-18) - Professional and Modern
export const HSTheme: ThemeConfig = {
  colors: {
    light: {
      primary: '#0EA5E9',
      secondary: '#8B5CF6',
      accent: '#F97316',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#0284C7',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      disabled: '#D1D5DB',
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      primary: '#38BDF8',
      secondary: '#A78BFA',
      accent: '#FB923C',
      success: '#4ADE80',
      warning: '#FCD34D',
      error: '#EF4444',
      info: '#0EA5E9',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      disabled: '#4B5563',
      overlay: 'rgba(0, 0, 0, 0.7)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  typography,
  spacing,
  borderRadius,
};

// Theme map
export const themes: Record<ThemeType, ThemeConfig> = {
  K5: K5Theme,
  MS: MSTheme,
  HS: HSTheme,
};

// Theme Context
interface ThemeContextType {
  themeType: ThemeType;
  colorScheme: ColorScheme;
  theme: ThemeConfig;
  colors: ThemeColors;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// useTheme Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  themeType?: ThemeType;
  onThemeChange?: (type: ThemeType) => void;
}

// Theme Provider Component
export const ThemeProvider = ({
  children,
  themeType: initialThemeType = 'K5',
  onThemeChange,
}: ThemeProviderProps) => {
  const [themeType, setThemeTypeState] = React.useState<ThemeType>(initialThemeType);
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';

  const theme = useMemo(() => themes[themeType], [themeType]);
  const colors = useMemo(() => theme.colors[colorScheme], [theme, colorScheme]);

  const setThemeType = React.useCallback(
    (type: ThemeType) => {
      setThemeTypeState(type);
      onThemeChange?.(type);
    },
    [onThemeChange]
  );

  const value = useMemo(
    () => ({
      themeType,
      colorScheme,
      theme,
      colors,
      setThemeType,
    }),
    [themeType, colorScheme, theme, colors, setThemeType]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Helper function to get theme
export const getTheme = (
  themeType: ThemeType = 'K5',
  colorScheme: ColorScheme = 'light'
): ThemeColors => {
  return themes[themeType].colors[colorScheme];
};

// Export individual themes
export {K5Theme as default};
export type {ThemeContextType};
