/**
 * Theme Configuration
 * 
 * Design system with age-based themes (K5, MS, HS)
 */

export type ThemeType = 'K5' | 'MS' | 'HS';

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
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

// K5 Theme (Ages 5-10) - Playful and Vibrant
export const K5Theme: ThemeConfig = {
  colors: {
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// MS Theme (Ages 11-13) - Cool and Engaging
export const MSTheme: ThemeConfig = {
  colors: {
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// HS Theme (Ages 14-18) - Professional and Modern
export const HSTheme: ThemeConfig = {
  colors: {
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Theme map
export const themes: Record<ThemeType, ThemeConfig> = {
  K5: K5Theme,
  MS: MSTheme,
  HS: HSTheme,
};

// Helper function to get theme
export const getTheme = (themeType: ThemeType = 'K5'): ThemeConfig => {
  return themes[themeType];
};

export default {
  K5Theme,
  MSTheme,
  HSTheme,
  themes,
  getTheme,
};
