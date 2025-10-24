/**
 * Navigation Type Definitions
 * 
 * Centralized type definitions for React Navigation
 */

import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

/**
 * Auth Stack - Authentication and Login Flows
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: {userType: 'parent' | 'learner'};
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Onboarding Stack - First-Time User Setup
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  GradeSelection: undefined;
  InterestsSelection: undefined;
  AccessibilitySetup: undefined;
  Complete: undefined;
};

export type OnboardingStackScreenProps<
  T extends keyof OnboardingStackParamList,
> = NativeStackScreenProps<OnboardingStackParamList, T>;

/**
 * Home Stack - Dashboard and Quick Actions
 */
export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  QuickActivity: {activityId: string};
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

/**
 * Subjects Stack - Learning Subjects
 */
export type SubjectsStackParamList = {
  SubjectsList: undefined;
  SubjectDetail: {subjectId: string; subjectName: string};
  LessonDetail: {lessonId: string; lessonName: string};
  ActivityDetail: {activityId: string};
};

export type SubjectsStackScreenProps<T extends keyof SubjectsStackParamList> =
  NativeStackScreenProps<SubjectsStackParamList, T>;

/**
 * Activities Stack - Games and Interactive Content
 */
export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
  GamePicker: undefined;
  GameSession: {gameId: string; gameName: string};
  HomeworkHelper: undefined;
  HomeworkSession: {homeworkId: string};
};

export type ActivitiesStackScreenProps<
  T extends keyof ActivitiesStackParamList,
> = NativeStackScreenProps<ActivitiesStackParamList, T>;

/**
 * Progress Stack - Reports and Achievements
 */
export type ProgressStackParamList = {
  ProgressOverview: undefined;
  DetailedReport: {subjectId?: string; period: 'week' | 'month' | 'year'};
  Achievements: undefined;
  AchievementDetail: {achievementId: string};
};

export type ProgressStackScreenProps<T extends keyof ProgressStackParamList> =
  NativeStackScreenProps<ProgressStackParamList, T>;

/**
 * Settings Stack - User Preferences
 */
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  Accessibility: undefined;
  Theme: undefined;
  Notifications: undefined;
  Privacy: undefined;
  About: undefined;
  ScreenshotGenerator: undefined; // Developer tool
};

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

/**
 * Main Tab Navigator - Bottom Tabs
 */
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Subjects: NavigatorScreenParams<SubjectsStackParamList>;
  Activities: NavigatorScreenParams<ActivitiesStackParamList>;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/**
 * Root Stack - Top-Level Navigation
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modal screens (overlay on top of everything)
  FocusMode: {activityId: string};
  ParentControls: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Navigation prop types for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
