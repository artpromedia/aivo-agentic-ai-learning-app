// Theme and styling types
export type LearnerTheme = 'K5' | 'MS' | 'HS';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface ThemeConfig {
  id: LearnerTheme;
  name: string;
  description: string;
  ageRange: string;
  colors: ThemeColors;
  fontSize: {
    base: string;
    heading: string;
  };
  spacing: {
    base: string;
    large: string;
  };
}
