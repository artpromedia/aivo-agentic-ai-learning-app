/**
 * Root Navigator
 * 
 * Top-level navigation controller that handles:
 * - Authentication flow (Auth Stack)
 * - Onboarding flow (first-time users)
 * - Main app navigation (Main Navigator)
 * - Modal screens (Focus Mode, Parent Controls)
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';

// Stack Navigators
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import MainNavigator from './MainNavigator';

// Stores
import {useAuthStore} from '../stores/authStore';
import {useUserStore} from '../stores/userStore';

// Modal Screens (placeholders)
// import FocusModeScreen from '../screens/modals/FocusMode';
// import ParentControlsScreen from '../screens/modals/ParentControls';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * 
 * Manages top-level navigation flow:
 * 1. Check authentication status from authStore
 * 2. If not authenticated → Auth Stack
 * 3. If authenticated but not onboarded → Onboarding Stack
 * 4. If authenticated and onboarded → Main Navigator
 * 
 * Modal screens can be presented on top of any stack
 */
export default function RootNavigator() {
  // Get auth and onboarding status from Zustand stores
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        // Not authenticated → Show Auth Stack
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      ) : !isOnboarded ? (
        // Authenticated but not onboarded → Show Onboarding
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        // Authenticated and onboarded → Show Main App
        <Stack.Screen name="Main" component={MainNavigator} />
      )}

      {/* Global Modal Screens (TODO: Uncomment when screens are created) */}
      {/* <Stack.Group
        screenOptions={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen
          name="FocusMode"
          component={FocusModeScreen}
          options={{
            headerShown: true,
            title: 'Focus Mode',
          }}
        />
        <Stack.Screen
          name="ParentControls"
          component={ParentControlsScreen}
          options={{
            headerShown: true,
            title: 'Parent Controls',
          }}
        />
      </Stack.Group> */}
    </Stack.Navigator>
  );
}
