/**
 * NativeWind (Tailwind CSS) Configuration for Mobile App
 * 
 * Extends shared Tailwind config from @aivo/tailwind-config
 * with mobile-specific utilities and safe area support
 */

import type {Config} from 'tailwindcss';
import sharedConfig from '@aivo/tailwind-config';

const config: Config = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  
  // Use NativeWind preset for React Native compatibility
  presets: [require('nativewind/preset')],
  
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...(sharedConfig.theme?.extend || {}),
      
      colors: {
        ...(sharedConfig.theme?.extend?.colors || {}),
        
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
          textSecondary: '#666666',
          border: '#FFD1DC',
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
          textSecondary: '#64748B',
          border: '#E2E8F0',
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
          textSecondary: '#6B7280',
          border: '#E5E7EB',
        },
      },
      
      // Mobile-specific spacing (4px grid system)
      spacing: {
        safe: 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'touch': '44px', // Minimum touch target size
      },
      
      // Mobile-optimized border radius
      borderRadius: {
        'touch': '12px', // Touch-friendly rounded corners
      },
      
      // Mobile typography scale
      fontSize: {
        // Accessibility: Support up to 200% scaling
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      
      // Minimum touch target sizes for accessibility
      minWidth: {
        touch: '44px',
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  
  plugins: [],
};

export default config;
