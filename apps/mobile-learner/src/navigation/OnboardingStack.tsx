/**
 * Onboarding Stack Navigator
 * 
 * Handles first-time user setup with role-based paths:
 * 
 * PARENT PATH:
 * - Welcome (role selection)
 * - ParentSetup (child info, IEP/504, challenges)
 * - BaselineAssessment (5 questions)
 * - ModelCloning (AI brain creation, 10s)
 * - AssessmentResults (show what AI learned)
 * - Complete
 * 
 * TEACHER PATH:
 * - Welcome (role selection)
 * - TeacherSetup (license validation, students)
 * - Complete
 * 
 * STUDENT PATH:
 * - Welcome (role selection)
 * - GradeSelection
 * - InterestsSelection
 * - AccessibilitySetup
 * - Complete
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Onboarding Screens
import OnboardingWelcomeScreen from '../screens/onboarding/Welcome';
import ParentSetupScreen from '../screens/onboarding/ParentSetup';
import TeacherSetupScreen from '../screens/onboarding/TeacherSetup';
import GradeSelectionScreen from '../screens/onboarding/GradeSelection';
import InterestsSelectionScreen from '../screens/onboarding/InterestsSelection';
import AccessibilitySetupScreen from '../screens/onboarding/AccessibilitySetup';
import BaselineAssessmentScreen from '../screens/onboarding/BaselineAssessment';
import ModelCloningScreen from '../screens/onboarding/ModelCloning';
import AssessmentResultsScreen from '../screens/onboarding/AssessmentResults';
import OnboardingCompleteScreen from '../screens/onboarding/Complete';

// Param list for type safety
export type OnboardingStackParamList = {
  Welcome: undefined;
  ParentSetup: undefined;
  TeacherSetup: undefined;
  GradeSelection: undefined;
  InterestsSelection: undefined;
  AccessibilitySetup: undefined;
  BaselineAssessment: undefined;
  ModelCloning: undefined;
  AssessmentResults: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Onboarding Stack Component
 * 
 * THREE ROLE-BASED FLOWS:
 * 
 * 1. PARENT: Welcome → ParentSetup → BaselineAssessment → ModelCloning → AssessmentResults → Complete
 * 2. TEACHER: Welcome → TeacherSetup → Complete
 * 3. STUDENT: Welcome → GradeSelection → InterestsSelection → AccessibilitySetup → Complete
 * 
 * All flows start at Welcome screen where user selects their role.
 */
export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // All screens handle their own headers
        animation: 'slide_from_right',
      }}
      initialRouteName="Welcome"
    >
      {/* STEP 1: Role Selection (ALL PATHS) */}
      <Stack.Screen
        name="Welcome"
        component={OnboardingWelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      
      {/* PARENT PATH */}
      <Stack.Screen
        name="ParentSetup"
        component={ParentSetupScreen}
      />
      
      <Stack.Screen
        name="BaselineAssessment"
        component={BaselineAssessmentScreen}
      />
      
      <Stack.Screen
        name="ModelCloning"
        component={ModelCloningScreen}
        options={{
          gestureEnabled: false, // No back during cloning
        }}
      />
      
      <Stack.Screen
        name="AssessmentResults"
        component={AssessmentResultsScreen}
      />
      
      {/* TEACHER PATH */}
      <Stack.Screen
        name="TeacherSetup"
        component={TeacherSetupScreen}
      />
      
      {/* STUDENT PATH */}
      <Stack.Screen
        name="GradeSelection"
        component={GradeSelectionScreen}
      />
      
      <Stack.Screen
        name="InterestsSelection"
        component={InterestsSelectionScreen}
      />
      
      <Stack.Screen
        name="AccessibilitySetup"
        component={AccessibilitySetupScreen}
      />
      
      {/* FINAL STEP (ALL PATHS) */}
      <Stack.Screen
        name="Complete"
        component={OnboardingCompleteScreen}
        options={{
          gestureEnabled: false, // Prevent back swipe
        }}
      />
    </Stack.Navigator>
  );
}
