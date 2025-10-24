import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // K5 Theme (Ages 5-10) - Playful and Vibrant
        k5: {
          primary: '#FF6B9D',    // Pink
          secondary: '#FFA500',   // Orange
          accent: '#FFD700',      // Gold
          success: '#4CAF50',     // Green
          warning: '#FFC107',     // Amber
          error: '#F44336',       // Red
          info: '#2196F3',        // Blue
          background: '#FFF5F7',  // Light Pink
          surface: '#FFFFFF',
          text: '#333333',
        },
        // MS Theme (Ages 11-13) - Cool and Engaging
        ms: {
          primary: '#6366F1',     // Indigo
          secondary: '#8B5CF6',   // Purple
          accent: '#EC4899',      // Pink
          success: '#10B981',     // Emerald
          warning: '#F59E0B',     // Amber
          error: '#EF4444',       // Red
          info: '#3B82F6',        // Blue
          background: '#F8FAFC',  // Slate 50
          surface: '#FFFFFF',
          text: '#1E293B',        // Slate 800
        },
        // HS Theme (Ages 14-18) - Professional and Modern
        hs: {
          primary: '#0EA5E9',     // Sky Blue
          secondary: '#8B5CF6',   // Purple
          accent: '#F97316',      // Orange
          success: '#22C55E',     // Green
          warning: '#EAB308',     // Yellow
          error: '#DC2626',       // Red
          info: '#0284C7',        // Sky 600
          background: '#F9FAFB',  // Gray 50
          surface: '#FFFFFF',
          text: '#111827',        // Gray 900
        },
        // Common semantic colors
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0EA5E9',
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Menlo', 'Monaco', 'Courier New'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
