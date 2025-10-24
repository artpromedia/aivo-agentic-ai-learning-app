/**
 * Main Navigator - Bottom Tab Navigation
 * 
 * Primary navigation for authenticated and onboarded users:
 * - Home (Dashboard)
 * - Subjects (Learning content)
 * - Activities (Games, Homework Helper)
 * - Progress (Reports, Achievements)
 * - Settings (Profile, Preferences)
 * 
 * Uses custom tab bar with grade-based styling and animations
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {
  MainTabParamList,
  HomeStackParamList,
  SubjectsStackParamList,
  ActivitiesStackParamList,
  ProgressStackParamList,
  SettingsStackParamList,
} from './types';

// Custom Tab Bar
import CustomTabBar from '../components/navigation/CustomTabBar';

// Placeholder screens (will be created later)
// Home Stack
import DashboardScreen from '../screens/home/Dashboard';
import NotificationsScreen from '../screens/home/Notifications';
import QuickActivityScreen from '../screens/home/QuickActivity';

// Subjects Stack
import SubjectsListScreen from '../screens/subjects/SubjectsList';
import SubjectDetailScreen from '../screens/subjects/SubjectDetail';
import LessonDetailScreen from '../screens/subjects/LessonDetail';
import ActivityDetailScreen from '../screens/subjects/ActivityDetail';

// Activities Stack
import ActivitiesListScreen from '../screens/activities/ActivitiesList';
import GamePickerScreen from '../screens/activities/GamePicker';
import GameSessionScreen from '../screens/activities/GameSession';
import HomeworkHelperScreen from '../screens/activities/HomeworkHelper';
import HomeworkSessionScreen from '../screens/activities/HomeworkSession';

// Progress Stack
import ProgressOverviewScreen from '../screens/progress/ProgressOverview';
import DetailedReportScreen from '../screens/progress/DetailedReport';
import AchievementsScreen from '../screens/progress/Achievements';
import AchievementDetailScreen from '../screens/progress/AchievementDetail';

// Settings Stack
import SettingsHomeScreen from '../screens/settings/SettingsHome';
import ProfileScreen from '../screens/settings/Profile';
import AccessibilityScreen from '../screens/settings/Accessibility';
import ThemeScreen from '../screens/settings/Theme';
import NotificationsSettingsScreen from '../screens/settings/Notifications';
import PrivacyScreen from '../screens/settings/Privacy';
import AboutScreen from '../screens/settings/About';
import {ScreenshotGeneratorScreen} from '../components/ScreenshotGenerator/ScreenshotGeneratorScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SubjectsStack = createNativeStackNavigator<SubjectsStackParamList>();
const ActivitiesStack =
  createNativeStackNavigator<ActivitiesStackParamList>();
const ProgressStack = createNativeStackNavigator<ProgressStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * Home Stack Navigator
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Home'}}
      />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Notifications'}}
      />
      <HomeStack.Screen
        name="QuickActivity"
        component={QuickActivityScreen}
        options={{title: 'Activity'}}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Subjects Stack Navigator
 */
function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator>
      <SubjectsStack.Screen
        name="SubjectsList"
        component={SubjectsListScreen}
        options={{title: 'Subjects'}}
      />
      <SubjectsStack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={({route}) => ({title: route.params.subjectName})}
      />
      <SubjectsStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={({route}) => ({title: route.params.lessonName})}
      />
      <SubjectsStack.Screen
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={{title: 'Activity'}}
      />
    </SubjectsStack.Navigator>
  );
}

/**
 * Activities Stack Navigator
 */
function ActivitiesStackNavigator() {
  return (
    <ActivitiesStack.Navigator>
      <ActivitiesStack.Screen
        name="ActivitiesList"
        component={ActivitiesListScreen}
        options={{title: 'Activities'}}
      />
      <ActivitiesStack.Screen
        name="GamePicker"
        component={GamePickerScreen}
        options={{title: 'Choose a Game'}}
      />
      <ActivitiesStack.Screen
        name="GameSession"
        component={GameSessionScreen}
        options={({route}) => ({
          title: route.params.gameName,
          headerShown: false, // Full-screen game
        })}
      />
      <ActivitiesStack.Screen
        name="HomeworkHelper"
        component={HomeworkHelperScreen}
        options={{title: 'Homework Helper'}}
      />
      <ActivitiesStack.Screen
        name="HomeworkSession"
        component={HomeworkSessionScreen}
        options={{
          title: 'Homework',
          headerShown: false, // Focus mode
        }}
      />
    </ActivitiesStack.Navigator>
  );
}

/**
 * Progress Stack Navigator
 */
function ProgressStackNavigator() {
  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen
        name="ProgressOverview"
        component={ProgressOverviewScreen}
        options={{title: 'Progress'}}
      />
      <ProgressStack.Screen
        name="DetailedReport"
        component={DetailedReportScreen}
        options={{title: 'Detailed Report'}}
      />
      <ProgressStack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{title: 'Achievements'}}
      />
      <ProgressStack.Screen
        name="AchievementDetail"
        component={AchievementDetailScreen}
        options={{title: 'Achievement'}}
      />
    </ProgressStack.Navigator>
  );
}

/**
 * Settings Stack Navigator
 */
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{title: 'Settings'}}
      />
      <SettingsStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
      <SettingsStack.Screen
        name="Accessibility"
        component={AccessibilityScreen}
        options={{title: 'Accessibility'}}
      />
      <SettingsStack.Screen
        name="Theme"
        component={ThemeScreen}
        options={{title: 'Theme'}}
      />
      <SettingsStack.Screen
        name="Notifications"
        component={NotificationsSettingsScreen}
        options={{title: 'Notifications'}}
      />
      <SettingsStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{title: 'Privacy'}}
      />
      <SettingsStack.Screen
        name="About"
        component={AboutScreen}
        options={{title: 'About'}}
      />
      {__DEV__ && (
        <SettingsStack.Screen
          name="ScreenshotGenerator"
          component={ScreenshotGeneratorScreen}
          options={{title: 'Screenshot Generator'}}
        />
      )}
    </SettingsStack.Navigator>
  );
}

/**
 * Main Tab Navigator Component
 * 
 * Bottom tabs with custom tab bar:
 * - Home: Dashboard and quick actions
 * - Subjects: Learning content by subject
 * - Activities: Games and homework helper
 * - Progress: Reports and achievements
 * - Settings: User preferences
 */
export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: 'home',
        }}
      />
      
      <Tab.Screen
        name="Subjects"
        component={SubjectsStackNavigator}
        options={{
          tabBarLabel: 'Subjects',
          tabBarIcon: 'book',
        }}
      />
      
      <Tab.Screen
        name="Activities"
        component={ActivitiesStackNavigator}
        options={{
          tabBarLabel: 'Activities',
          tabBarIcon: 'gamepad',
        }}
      />
      
      <Tab.Screen
        name="Progress"
        component={ProgressStackNavigator}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: 'chart-line',
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: 'cog',
        }}
      />
    </Tab.Navigator>
  );
}
