/**
 * Navigation Utilities
 * 
 * Helper functions for navigation:
 * - Navigation service (imperative navigation)
 * - Deep link handlers
 * - Screen tracking
 * - Navigation guards
 */

import {useEffect, useRef} from 'react';
import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './types';
import {analyticsService} from '../services/analytics/analyticsService';

/**
 * Navigation Container Ref
 * 
 * Allows imperative navigation from outside React components
 * (e.g., from stores, services, push notifications)
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen imperatively
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
}

/**
 * Go back one screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reset navigation stack to specific screen
 */
export function resetToScreen(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name, params}],
    });
  }
}

/**
 * Get current route name
 */
export function getCurrentRouteName(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

/**
 * Deep Link Configuration
 * 
 * Maps deep links to navigation paths
 */
export const linkingConfig = {
  prefixes: ['aivolearning://', 'https://aivo.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register/:userType',
          ForgotPassword: 'forgot-password',
        },
      },
      Onboarding: {
        screens: {
          Welcome: 'onboarding',
          GradeSelection: 'onboarding/grade',
          InterestsSelection: 'onboarding/interests',
          AccessibilitySetup: 'onboarding/accessibility',
          Complete: 'onboarding/complete',
        },
      },
      Main: {
        screens: {
          Home: {
            screens: {
              Dashboard: 'home',
              Notifications: 'home/notifications',
              QuickActivity: 'home/activity/:activityId',
            },
          },
          Subjects: {
            screens: {
              SubjectsList: 'subjects',
              SubjectDetail: 'subjects/:subjectId',
              LessonDetail: 'lessons/:lessonId',
              ActivityDetail: 'activities/:activityId',
            },
          },
          Activities: {
            screens: {
              ActivitiesList: 'activities',
              GamePicker: 'activities/games',
              GameSession: 'activities/games/:gameId',
              HomeworkHelper: 'activities/homework',
              HomeworkSession: 'activities/homework/:homeworkId',
            },
          },
          Progress: {
            screens: {
              ProgressOverview: 'progress',
              DetailedReport: 'progress/report',
              Achievements: 'progress/achievements',
              AchievementDetail: 'progress/achievements/:achievementId',
            },
          },
          Settings: {
            screens: {
              SettingsHome: 'settings',
              Profile: 'settings/profile',
              Accessibility: 'settings/accessibility',
              Theme: 'settings/theme',
              Notifications: 'settings/notifications',
              Privacy: 'settings/privacy',
              About: 'settings/about',
            },
          },
        },
      },
      FocusMode: 'focus/:activityId',
      ParentControls: 'parent-controls',
    },
  },
};

/**
 * Screen Tracking
 * 
 * Tracks screen views for analytics
 */
let currentScreen: string | undefined;

export function onNavigationReady() {
  currentScreen = getCurrentRouteName();
  console.log('[Navigation] Initial screen:', currentScreen);
  
  // Track initial screen
  if (currentScreen) {
    analyticsService.logScreenView(currentScreen);
  }
}

export function onNavigationStateChange() {
  const previousScreen = currentScreen;
  const newScreen = getCurrentRouteName();

  if (previousScreen !== newScreen && newScreen) {
    currentScreen = newScreen;
    console.log('[Navigation] Screen changed:', {
      from: previousScreen,
      to: newScreen,
    });

    // Track screen view in analytics
    analyticsService.logScreenView(newScreen);
  }
}

/**
 * Get active route name
 * 
 * Recursively traverses navigation state to find the active route
 */
export function getActiveRouteName(state: any): string | undefined {
  if (!state || typeof state.index !== 'number') {
    return undefined;
  }

  const route = state.routes[state.index];

  // Dive deeper if nested navigator
  if (route.state) {
    return getActiveRouteName(route.state);
  }

  return route.name;
}

/**
 * Navigation Tracking Hook
 * 
 * Hook to track navigation changes in React components.
 * Use this hook to automatically track screen views when
 * users navigate through the app.
 */
export function useNavigationTracking() {
  const routeNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Track initial screen when navigation is ready
    const unsubscribe = navigationRef.addListener('state', () => {
      const previousRouteName = routeNameRef.current;
      const currentRouteName = getActiveRouteName(navigationRef.getRootState());

      if (previousRouteName !== currentRouteName && currentRouteName) {
        // Track screen view
        analyticsService.logScreenView(currentRouteName);
        
        console.log('[Navigation] Screen view tracked:', {
          from: previousRouteName,
          to: currentRouteName,
        });
      }

      // Save current route name for next comparison
      routeNameRef.current = currentRouteName;
    });

    return unsubscribe;
  }, []);

  return navigationRef;
}

/**
 * Navigation Guards
 * 
 * Check if navigation is allowed based on conditions
 */
export interface NavigationGuard {
  canNavigate: (routeName: string, params?: any) => boolean;
  message?: string;
}

const guards: NavigationGuard[] = [];

export function addNavigationGuard(guard: NavigationGuard) {
  guards.push(guard);
}

export function removeNavigationGuard(guard: NavigationGuard) {
  const index = guards.indexOf(guard);
  if (index > -1) {
    guards.splice(index, 1);
  }
}

export function checkNavigationGuards(
  routeName: string,
  params?: any
): {allowed: boolean; message?: string} {
  for (const guard of guards) {
    if (!guard.canNavigate(routeName, params)) {
      return {
        allowed: false,
        message: guard.message,
      };
    }
  }
  return {allowed: true};
}

/**
 * Parent Controls Guard
 * 
 * Prevents navigation to restricted screens based on parent settings
 */
export const parentControlsGuard: NavigationGuard = {
  canNavigate: (routeName: string) => {
    // TODO: Check parent controls settings
    const restrictedScreens = [
      'Browser',
      'SocialFeatures',
      'InAppPurchases',
    ];

    return !restrictedScreens.includes(routeName);
  },
  message: 'This feature is restricted by parent controls.',
};

/**
 * Focus Mode Guard
 * 
 * Prevents navigation during focus mode (homework, tests)
 */
export const focusModeGuard: NavigationGuard = {
  canNavigate: (routeName: string) => {
    // TODO: Check if focus mode is active
    const isFocusModeActive = false;

    if (isFocusModeActive) {
      const allowedScreens = ['FocusMode', 'HomeworkSession', 'GameSession'];
      return allowedScreens.includes(routeName);
    }

    return true;
  },
  message: 'Please finish your current activity first.',
};

/**
 * Session Timeout Navigation
 * 
 * Navigate to login screen after session timeout
 */
export function handleSessionTimeout() {
  resetToScreen('Auth');
}

/**
 * Error Navigation
 * 
 * Navigate to error screen with context
 */
export function navigateToError(error: {
  code: string;
  message: string;
  recoverable?: boolean;
}) {
  console.error('[Navigation] Error:', error);
  // TODO: Implement error screen
  // navigate('Error', error);
}

export default {
  navigationRef,
  navigate,
  goBack,
  resetToScreen,
  getCurrentRouteName,
  getActiveRouteName,
  linkingConfig,
  onNavigationReady,
  onNavigationStateChange,
  useNavigationTracking,
  addNavigationGuard,
  removeNavigationGuard,
  checkNavigationGuards,
  parentControlsGuard,
  focusModeGuard,
  handleSessionTimeout,
  navigateToError,
};
