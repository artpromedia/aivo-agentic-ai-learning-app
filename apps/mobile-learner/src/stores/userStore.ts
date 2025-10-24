/**
 * User Store
 * 
 * Manages user profile and onboarding state using Zustand:
 * - User profile (grade, preferences, avatar)
 * - Onboarding status
 * - Theme selection
 * - Accessibility settings
 */

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ThemeType} from '../theme/enhancedTheme';
import type {GradeLevel} from '../theme/gradeThemes';

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  name: string;
  role?: 'parent' | 'teacher' | 'student';
  grade: GradeLevel;
  avatar?: string;
  interests: string[];
  dateOfBirth?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: ThemeType;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  enableTTS: boolean;
  enableVoiceInput: boolean;
  enableAnimations: boolean;
  enableSounds: boolean;
  notificationsEnabled: boolean;
  parentalControlsEnabled: boolean;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largerTouchTargets: boolean;
  voiceGuidance: boolean;
  screenReader: boolean;
}

/**
 * User store state
 */
interface UserState {
  // State
  isOnboarded: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences;
  accessibilitySettings: AccessibilitySettings;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateGrade: (grade: GradeLevel) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
}

/**
 * Default preferences
 */
const defaultPreferences: UserPreferences = {
  theme: 'K5',
  fontSize: 'medium',
  enableTTS: true,
  enableVoiceInput: true,
  enableAnimations: true,
  enableSounds: true,
  notificationsEnabled: true,
  parentalControlsEnabled: false,
};

/**
 * Default accessibility settings
 */
const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largerTouchTargets: false,
  voiceGuidance: true,
  screenReader: false,
};

/**
 * User Store
 * 
 * Persisted to AsyncStorage
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnboarded: false,
      profile: null,
      preferences: defaultPreferences,
      accessibilitySettings: defaultAccessibilitySettings,

      /**
       * Set user profile
       */
      setProfile: (profile: UserProfile) => {
        set({profile});
      },

      /**
       * Update user profile
       */
      updateProfile: (updates: Partial<UserProfile>) => {
        const {profile} = get();
        if (profile) {
          set({profile: {...profile, ...updates}});
        }
      },

      /**
       * Set preferences
       */
      setPreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: {...state.preferences, ...preferences},
        }));
      },

      /**
       * Set accessibility settings
       */
      setAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => {
        set((state) => ({
          accessibilitySettings: {...state.accessibilitySettings, ...settings},
        }));
      },

      /**
       * Complete onboarding
       */
      completeOnboarding: () => {
        set({isOnboarded: true});
      },

      /**
       * Reset onboarding (for testing or profile reset)
       */
      resetOnboarding: () => {
        set({isOnboarded: false});
      },

      /**
       * Update grade level (triggers theme change)
       */
      updateGrade: (grade: GradeLevel) => {
        const {profile, setPreferences} = get();
        
        if (profile) {
          // Update profile grade
          set({profile: {...profile, grade}});
          
          // Update theme based on grade
          const themeMap: Record<string, ThemeType> = {
            K: 'K5', '1': 'K5', '2': 'K5', '3': 'K5', '4': 'K5', '5': 'K5',
            '6': 'MS', '7': 'MS', '8': 'MS',
            '9': 'HS', '10': 'HS', '11': 'HS', '12': 'HS',
          };
          
          const newTheme = themeMap[grade] || 'K5';
          setPreferences({theme: newTheme});
        }
      },

      /**
       * Add interest
       */
      addInterest: (interest: string) => {
        const {profile} = get();
        if (profile && !profile.interests.includes(interest)) {
          set({
            profile: {
              ...profile,
              interests: [...profile.interests, interest],
            },
          });
        }
      },

      /**
       * Remove interest
       */
      removeInterest: (interest: string) => {
        const {profile} = get();
        if (profile) {
          set({
            profile: {
              ...profile,
              interests: profile.interests.filter((i) => i !== interest),
            },
          });
        }
      },
    }),
    {
      name: 'aivo-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
