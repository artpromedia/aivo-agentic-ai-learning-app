/**
 * App State Store
 * 
 * Manages global app state using Zustand:
 * - Focus mode (homework, tests)
 * - Parent controls
 * - Notification badges
 * - Loading states
 * - App-wide settings
 */

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Parent controls settings
 */
export interface ParentControlsSettings {
  enabled: boolean;
  restrictedScreens: string[];
  maxDailyGameBreaks: number;
  maxBreakDuration: number; // in seconds
  allowedTimeSlots: TimeSlot[];
  requireParentApproval: string[]; // screen names requiring approval
}

/**
 * Time slot for allowed usage
 */
export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
}

/**
 * Focus mode state
 */
export interface FocusModeState {
  isActive: boolean;
  activityId?: string;
  activityType?: 'homework' | 'test' | 'lesson';
  startTime?: Date;
  allowedScreens: string[];
}

/**
 * Notification badges
 */
export interface NotificationBadges {
  home: number;
  subjects: number;
  activities: number;
  progress: number;
  settings: number;
}

/**
 * App state store state
 */
interface AppStateStoreState {
  // Focus mode
  focusMode: FocusModeState;
  
  // Parent controls
  parentControls: ParentControlsSettings;
  
  // Notification badges
  badges: NotificationBadges;
  
  // Loading states
  isAppLoading: boolean;
  isNetworkConnected: boolean;
  
  // Game break tracking
  gameBreaksUsedToday: number;
  lastGameBreakDate: string;

  // Actions - Focus Mode
  activateFocusMode: (activityId: string, activityType: 'homework' | 'test' | 'lesson') => void;
  deactivateFocusMode: () => void;
  
  // Actions - Parent Controls
  setParentControls: (settings: Partial<ParentControlsSettings>) => void;
  isScreenAllowed: (screenName: string) => boolean;
  requiresParentApproval: (screenName: string) => boolean;
  
  // Actions - Badges
  setBadge: (screen: keyof NotificationBadges, count: number) => void;
  incrementBadge: (screen: keyof NotificationBadges) => void;
  decrementBadge: (screen: keyof NotificationBadges) => void;
  clearBadge: (screen: keyof NotificationBadges) => void;
  clearAllBadges: () => void;
  
  // Actions - Game Breaks
  incrementGameBreak: () => boolean; // Returns true if allowed
  resetGameBreaksIfNewDay: () => void;
  canTakeGameBreak: () => boolean;
  
  // Actions - App State
  setAppLoading: (loading: boolean) => void;
  setNetworkConnected: (connected: boolean) => void;
}

/**
 * Default parent controls
 */
const defaultParentControls: ParentControlsSettings = {
  enabled: false,
  restrictedScreens: [],
  maxDailyGameBreaks: 3,
  maxBreakDuration: 300, // 5 minutes
  allowedTimeSlots: [],
  requireParentApproval: [],
};

/**
 * Default focus mode state
 */
const defaultFocusMode: FocusModeState = {
  isActive: false,
  allowedScreens: [],
};

/**
 * Default notification badges
 */
const defaultBadges: NotificationBadges = {
  home: 0,
  subjects: 0,
  activities: 0,
  progress: 0,
  settings: 0,
};

/**
 * App State Store
 * 
 * Persisted to AsyncStorage
 */
export const useAppStateStore = create<AppStateStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      focusMode: defaultFocusMode,
      parentControls: defaultParentControls,
      badges: defaultBadges,
      isAppLoading: false,
      isNetworkConnected: true,
      gameBreaksUsedToday: 0,
      lastGameBreakDate: new Date().toISOString().split('T')[0],

      /**
       * Activate focus mode
       */
      activateFocusMode: (activityId, activityType) => {
        set({
          focusMode: {
            isActive: true,
            activityId,
            activityType,
            startTime: new Date(),
            allowedScreens: ['FocusMode', 'HomeworkSession', 'GameSession'],
          },
        });
      },

      /**
       * Deactivate focus mode
       */
      deactivateFocusMode: () => {
        set({focusMode: defaultFocusMode});
      },

      /**
       * Set parent controls
       */
      setParentControls: (settings) => {
        set((state) => ({
          parentControls: {...state.parentControls, ...settings},
        }));
      },

      /**
       * Check if screen is allowed by parent controls
       */
      isScreenAllowed: (screenName) => {
        const {parentControls} = get();
        
        if (!parentControls.enabled) {
          return true;
        }
        
        return !parentControls.restrictedScreens.includes(screenName);
      },

      /**
       * Check if screen requires parent approval
       */
      requiresParentApproval: (screenName) => {
        const {parentControls} = get();
        
        if (!parentControls.enabled) {
          return false;
        }
        
        return parentControls.requireParentApproval.includes(screenName);
      },

      /**
       * Set badge count
       */
      setBadge: (screen, count) => {
        set((state) => ({
          badges: {...state.badges, [screen]: Math.max(0, count)},
        }));
      },

      /**
       * Increment badge
       */
      incrementBadge: (screen) => {
        set((state) => ({
          badges: {...state.badges, [screen]: state.badges[screen] + 1},
        }));
      },

      /**
       * Decrement badge
       */
      decrementBadge: (screen) => {
        set((state) => ({
          badges: {
            ...state.badges,
            [screen]: Math.max(0, state.badges[screen] - 1),
          },
        }));
      },

      /**
       * Clear badge
       */
      clearBadge: (screen) => {
        set((state) => ({
          badges: {...state.badges, [screen]: 0},
        }));
      },

      /**
       * Clear all badges
       */
      clearAllBadges: () => {
        set({badges: defaultBadges});
      },

      /**
       * Increment game break (returns true if allowed)
       */
      incrementGameBreak: () => {
        const {
          gameBreaksUsedToday,
          parentControls,
          resetGameBreaksIfNewDay,
        } = get();
        
        resetGameBreaksIfNewDay();
        
        const updatedBreaksUsed = get().gameBreaksUsedToday;
        
        if (updatedBreaksUsed >= parentControls.maxDailyGameBreaks) {
          return false; // Limit reached
        }
        
        set({gameBreaksUsedToday: updatedBreaksUsed + 1});
        return true;
      },

      /**
       * Reset game breaks if new day
       */
      resetGameBreaksIfNewDay: () => {
        const {lastGameBreakDate} = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (lastGameBreakDate !== today) {
          set({
            gameBreaksUsedToday: 0,
            lastGameBreakDate: today,
          });
        }
      },

      /**
       * Check if can take game break
       */
      canTakeGameBreak: () => {
        const {
          gameBreaksUsedToday,
          parentControls,
          resetGameBreaksIfNewDay,
        } = get();
        
        resetGameBreaksIfNewDay();
        
        const updatedBreaksUsed = get().gameBreaksUsedToday;
        return updatedBreaksUsed < parentControls.maxDailyGameBreaks;
      },

      /**
       * Set app loading
       */
      setAppLoading: (loading) => {
        set({isAppLoading: loading});
      },

      /**
       * Set network connected
       */
      setNetworkConnected: (connected) => {
        set({isNetworkConnected: connected});
      },
    }),
    {
      name: 'aivo-app-state-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        parentControls: state.parentControls,
        badges: state.badges,
        gameBreaksUsedToday: state.gameBreaksUsedToday,
        lastGameBreakDate: state.lastGameBreakDate,
      }),
    }
  )
);
