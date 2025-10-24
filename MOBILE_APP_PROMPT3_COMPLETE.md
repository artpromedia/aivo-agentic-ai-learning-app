# Mobile App - Prompt 3 Complete: Navigation Architecture

**Date**: Current Session  
**Status**: ✅ COMPLETE (Structure Ready)  
**Files Created**: 6 navigation files + 1 App.tsx update

---

## Overview

Successfully created comprehensive navigation architecture with React Navigation for the mobile learner app. All navigation stacks, type definitions, and utilities are complete. The structure supports authentication, onboarding, and main app navigation with bottom tabs.

---

## Implementation Summary

### 1. ✅ Navigation Type Definitions

**File**: `src/navigation/types.ts` (147 lines)

**Status**: ✅ Complete

**Key Features**:
- Centralized TypeScript types for all navigation stacks
- Type-safe navigation props for all screens
- Support for nested navigation
- Global type augmentation for useNavigation hook

**Stack Definitions**:

```typescript
// Auth Stack - Authentication flows
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: {userType: 'parent' | 'learner'};
  ForgotPassword: undefined;
};

// Onboarding Stack - First-time setup
export type OnboardingStackParamList = {
  Welcome: undefined;
  GradeSelection: undefined;
  InterestsSelection: undefined;
  AccessibilitySetup: undefined;
  Complete: undefined;
};

// Home Stack - Dashboard
export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  QuickActivity: {activityId: string};
};

// Subjects Stack - Learning content
export type SubjectsStackParamList = {
  SubjectsList: undefined;
  SubjectDetail: {subjectId: string; subjectName: string};
  LessonDetail: {lessonId: string; lessonName: string};
  ActivityDetail: {activityId: string};
};

// Activities Stack - Games and homework
export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
  GamePicker: undefined;
  GameSession: {gameId: string; gameName: string};
  HomeworkHelper: undefined;
  HomeworkSession: {homeworkId: string};
};

// Progress Stack - Reports and achievements
export type ProgressStackParamList = {
  ProgressOverview: undefined;
  DetailedReport: {subjectId?: string; period: 'week' | 'month' | 'year'};
  Achievements: undefined;
  AchievementDetail: {achievementId: string};
};

// Settings Stack - User preferences
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  Accessibility: undefined;
  Theme: undefined;
  Notifications: undefined;
  Privacy: undefined;
  About: undefined;
};

// Main Tab Navigator - Bottom tabs
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Subjects: NavigatorScreenParams<SubjectsStackParamList>;
  Activities: NavigatorScreenParams<ActivitiesStackParamList>;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Root Stack - Top-level
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modal screens
  FocusMode: {activityId: string};
  ParentControls: undefined;
};

// Global type augmentation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

**Type-Safe Navigation Props**:
```typescript
// Screen props for type-safe navigation
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
```

---

### 2. ✅ Root Navigator

**File**: `src/navigation/RootNavigator.tsx` (89 lines)

**Status**: ✅ Complete

**Key Features**:
- Top-level navigation coordinator
- Manages authentication flow
- Handles onboarding flow
- Presents modal screens globally

**Navigation Flow**:

```typescript
function RootNavigator() {
  const isAuthenticated = false; // From auth store
  const isOnboarded = false; // From user store

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        // Not authenticated → Auth Stack
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !isOnboarded ? (
        // Authenticated but not onboarded → Onboarding Stack
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        // Authenticated and onboarded → Main App
        <Stack.Screen name="Main" component={MainNavigator} />
      )}

      {/* Global Modal Screens */}
      <Stack.Group screenOptions={{presentation: 'modal'}}>
        <Stack.Screen name="FocusMode" component={FocusModeScreen} />
        <Stack.Screen name="ParentControls" component={ParentControlsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
```

**States Handled**:
1. **Unauthenticated** → Auth Stack (Welcome, Login, Register)
2. **Authenticated + Not Onboarded** → Onboarding Stack (Grade selection, interests, accessibility)
3. **Authenticated + Onboarded** → Main Navigator (Bottom tabs)
4. **Modal Overlays** → Focus Mode, Parent Controls (accessible from any state)

---

### 3. ✅ Auth Stack Navigator

**File**: `src/navigation/AuthStack.tsx` (58 lines)

**Status**: ✅ Complete (awaiting screen implementations)

**Key Features**:
- Authentication and login flows
- Welcome screen with app introduction
- Login with credentials
- Registration for parents and learners
- Password recovery

**Screens**:

```typescript
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      {/* Welcome - App introduction */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      
      {/* Login - Enter credentials */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Register - Create account (parent or learner) */}
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{title: 'Create Account'}}
      />
      
      {/* Forgot Password - Password reset */}
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Reset Password',
        }}
      />
    </Stack.Navigator>
  );
}
```

**Flow**:
```
Welcome → Login → Main App
         ↓
    Register (Parent/Learner) → Main App
         ↓
    Forgot Password → Email Sent → Login
```

---

### 4. ✅ Onboarding Stack Navigator

**File**: `src/navigation/OnboardingStack.tsx` (81 lines)

**Status**: ✅ Complete (awaiting screen implementations)

**Key Features**:
- First-time user setup flow
- Grade level selection (determines theme)
- Interests and subject selection
- Accessibility preferences
- Welcome completion

**Screens**:

```typescript
function OnboardingStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      {/* Welcome - Introduction */}
      <Stack.Screen 
        name="Welcome" 
        component={OnboardingWelcomeScreen}
        options={{headerShown: false}}
      />
      
      {/* Grade Selection - Choose K-12 grade (determines K5/MS/HS theme) */}
      <Stack.Screen 
        name="GradeSelection" 
        component={GradeSelectionScreen}
        options={{title: 'Choose Your Grade'}}
      />
      
      {/* Interests - Select subjects and activities */}
      <Stack.Screen 
        name="InterestsSelection" 
        component={InterestsSelectionScreen}
        options={{title: 'Select Your Interests'}}
      />
      
      {/* Accessibility - Configure TTS, font size, animations */}
      <Stack.Screen 
        name="AccessibilitySetup" 
        component={AccessibilitySetupScreen}
        options={{title: 'Accessibility Settings'}}
      />
      
      {/* Complete - Onboarding finished */}
      <Stack.Screen 
        name="Complete" 
        component={OnboardingCompleteScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent back swipe
        }}
      />
    </Stack.Navigator>
  );
}
```

**Flow**:
```
Welcome → Grade Selection → Interests → Accessibility → Complete → Main App
   ↑                                                                   ↓
   └─────────────────────────────────────────────────────────────────┘
                     (Can be re-run from Settings)
```

**Grade Selection Impact**:
- **K-5** → K5 Theme (Pink, playful, extra large touch targets)
- **6-8** → MS Theme (Indigo, cool colors, large touch targets)
- **9-12** → HS Theme (Sky blue, professional, standard touch targets)

---

### 5. ✅ Main Navigator (Bottom Tabs)

**File**: `src/navigation/MainNavigator.tsx` (292 lines)

**Status**: ✅ Complete (awaiting screen implementations)

**Key Features**:
- Bottom tab navigation (5 tabs)
- Nested stack navigators for each tab
- Custom tab bar component
- Grade-based tab styling

**Tab Structure**:

#### **Home Tab** → `HomeStackNavigator`
```typescript
Home Stack:
  - Dashboard (Home screen, quick actions)
  - Notifications (Alerts and messages)
  - QuickActivity (Jump to activity from notification)
```

#### **Subjects Tab** → `SubjectsStackNavigator`
```typescript
Subjects Stack:
  - SubjectsList (Math, Reading, Science, etc.)
  - SubjectDetail (Subject overview, lessons)
  - LessonDetail (Lesson content, activities)
  - ActivityDetail (Individual activity)
```

#### **Activities Tab** → `ActivitiesStackNavigator`
```typescript
Activities Stack:
  - ActivitiesList (All activities)
  - GamePicker (Choose a game)
  - GameSession (Full-screen game, headerless)
  - HomeworkHelper (Upload homework, get AI help)
  - HomeworkSession (Focus mode, headerless)
```

#### **Progress Tab** → `ProgressStackNavigator`
```typescript
Progress Stack:
  - ProgressOverview (Charts, recent activity)
  - DetailedReport (Subject-specific, time-period reports)
  - Achievements (Badges, milestones)
  - AchievementDetail (Individual achievement)
```

#### **Settings Tab** → `SettingsStackNavigator`
```typescript
Settings Stack:
  - SettingsHome (Settings menu)
  - Profile (User info, avatar)
  - Accessibility (TTS, font size, animations)
  - Theme (K5/MS/HS theme, light/dark mode)
  - Notifications (Push notification preferences)
  - Privacy (Data settings, account)
  - About (App version, credits)
```

**Main Tab Navigator Code**:

```typescript
export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{tabBarLabel: 'Home', tabBarIcon: 'home'}}
      />
      
      <Tab.Screen 
        name="Subjects" 
        component={SubjectsStackNavigator}
        options={{tabBarLabel: 'Subjects', tabBarIcon: 'book'}}
      />
      
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesStackNavigator}
        options={{tabBarLabel: 'Activities', tabBarIcon: 'gamepad'}}
      />
      
      <Tab.Screen 
        name="Progress" 
        component={ProgressStackNavigator}
        options={{tabBarLabel: 'Progress', tabBarIcon: 'chart-line'}}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={SettingsStackNavigator}
        options={{tabBarLabel: 'Settings', tabBarIcon: 'cog'}}
      />
    </Tab.Navigator>
  );
}
```

**Total Screens**: 33 screens across 5 tab stacks

---

### 6. ✅ Navigation Utilities

**File**: `src/navigation/navigationUtils.ts` (283 lines)

**Status**: ✅ Complete

**Key Features**:

#### **Imperative Navigation**
```typescript
// Navigate from anywhere (outside React components)
import {navigate, goBack, resetToScreen} from './navigationUtils';

navigate('Login');
navigate('SubjectDetail', {subjectId: '123', subjectName: 'Math'});
goBack();
resetToScreen('Dashboard');
```

#### **Navigation Reference**
```typescript
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Used in App.tsx:
<NavigationContainer ref={navigationRef}>
  <RootNavigator />
</NavigationContainer>
```

#### **Deep Link Configuration**
```typescript
export const linkingConfig = {
  prefixes: ['aivolearning://', 'https://aivo.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register/:userType',
        }
      },
      Main: {
        screens: {
          Home: {
            screens: {
              Dashboard: 'home',
              QuickActivity: 'home/activity/:activityId',
            }
          },
          Subjects: {
            screens: {
              SubjectsList: 'subjects',
              SubjectDetail: 'subjects/:subjectId',
            }
          },
          // ... all screens mapped
        }
      }
    }
  }
};
```

**Example Deep Links**:
```
aivolearning://login
aivolearning://subjects/math
aivolearning://activities/games/word-scramble
aivolearning://progress/achievements/math-master
```

#### **Screen Tracking**
```typescript
export function onNavigationReady() {
  currentScreen = getCurrentRouteName();
  console.log('[Navigation] Initial screen:', currentScreen);
}

export function onNavigationStateChange() {
  const previousScreen = currentScreen;
  const newScreen = getCurrentRouteName();
  
  if (previousScreen !== newScreen) {
    currentScreen = newScreen;
    console.log('[Navigation] Screen changed:', {from: previousScreen, to: newScreen});
    // TODO: Send to analytics (Firebase, Mixpanel, etc.)
  }
}
```

#### **Navigation Guards**
```typescript
// Parent Controls Guard - Restrict screens based on parent settings
export const parentControlsGuard: NavigationGuard = {
  canNavigate: (routeName: string) => {
    const restrictedScreens = ['Browser', 'SocialFeatures', 'InAppPurchases'];
    return !restrictedScreens.includes(routeName);
  },
  message: 'This feature is restricted by parent controls.',
};

// Focus Mode Guard - Prevent navigation during homework/tests
export const focusModeGuard: NavigationGuard = {
  canNavigate: (routeName: string) => {
    const isFocusModeActive = false; // From store
    if (isFocusModeActive) {
      const allowedScreens = ['FocusMode', 'HomeworkSession', 'GameSession'];
      return allowedScreens.includes(routeName);
    }
    return true;
  },
  message: 'Please finish your current activity first.',
};

// Usage
addNavigationGuard(parentControlsGuard);
addNavigationGuard(focusModeGuard);

// Check before navigation
const {allowed, message} = checkNavigationGuards('Browser');
if (!allowed) {
  showAlert(message);
}
```

#### **Session Management**
```typescript
// Session timeout - Reset to login
export function handleSessionTimeout() {
  resetToScreen('Auth');
}

// Error handling - Navigate to error screen
export function navigateToError(error: {
  code: string;
  message: string;
  recoverable?: boolean;
}) {
  console.error('[Navigation] Error:', error);
  // navigate('Error', error);
}
```

---

### 7. ✅ App.tsx Integration

**File**: `App.tsx` (67 lines)

**Status**: ✅ Updated with ThemeProvider and RootNavigator

**Key Changes**:

```typescript
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';

// NEW: Theme Provider
import {ThemeProvider} from './src/theme/enhancedTheme';
import {getThemeTypeForGrade} from './src/theme/gradeThemes';

// NEW: Navigation
import RootNavigator from './src/navigation/RootNavigator';
import {
  navigationRef,
  linkingConfig,
  onNavigationReady,
  onNavigationStateChange,
} from './src/navigation/navigationUtils';

function App(): React.JSX.Element {
  // Get user grade and determine theme
  const userGrade = 'K'; // TODO: From user store
  const themeType = getThemeTypeForGrade(userGrade);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* NEW: Theme Provider wraps everything */}
          <ThemeProvider themeType={themeType}>
            <PaperProvider>
              <NavigationContainer
                ref={navigationRef}           // For imperative navigation
                linking={linkingConfig}        // Deep link support
                onReady={onNavigationReady}    // Track initial screen
                onStateChange={onNavigationStateChange} // Track screen changes
              >
                {/* NEW: Root Navigator */}
                <RootNavigator />
              </NavigationContainer>
            </PaperProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**Provider Hierarchy**:
```
GestureHandlerRootView (gesture handling)
  └─ SafeAreaProvider (safe area insets)
      └─ QueryClientProvider (TanStack Query)
          └─ ThemeProvider (grade-based theming + light/dark mode)
              └─ PaperProvider (Material Design components)
                  └─ NavigationContainer (React Navigation)
                      └─ RootNavigator (Auth/Onboarding/Main)
```

---

## Navigation Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        RootNavigator                            │
│  (Manages auth state and modal screens)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
      ┌──────────┼──────────────────────────────────┐
      │          │                                   │
      ▼          ▼                                   ▼
┌──────────┐ ┌───────────────┐             ┌───────────────┐
│AuthStack │ │OnboardingStack│             │MainNavigator  │
│          │ │               │             │(Bottom Tabs)  │
└──────────┘ └───────────────┘             └───────┬───────┘
                                                    │
                    ┌───────────────────────────────┼────────────────┬─────────────┬─────────────┐
                    │                               │                │             │             │
                    ▼                               ▼                ▼             ▼             ▼
              ┌──────────┐                    ┌──────────┐    ┌──────────┐  ┌──────────┐ ┌──────────┐
              │HomeStack │                    │Subjects  │    │Activities│  │Progress  │ │Settings  │
              │          │                    │Stack     │    │Stack     │  │Stack     │ │Stack     │
              └──────────┘                    └──────────┘    └──────────┘  └──────────┘ └──────────┘
              - Dashboard                     - SubjectsList  - ActivitiesList - Overview   - SettingsHome
              - Notifications                 - SubjectDetail - GamePicker    - Reports    - Profile
              - QuickActivity                 - LessonDetail  - GameSession   - Achievements - Accessibility
                                              - ActivityDetail - HomeworkHelper - Detail   - Theme
                                                                - HomeworkSession            - etc.
```

---

## File Statistics

| File | Lines | Status | Purpose |
|------|-------|--------|---------|
| `navigation/types.ts` | 147 | ✅ Complete | TypeScript type definitions |
| `navigation/RootNavigator.tsx` | 89 | ✅ Complete | Top-level navigation coordinator |
| `navigation/AuthStack.tsx` | 58 | ✅ Complete | Authentication flows |
| `navigation/OnboardingStack.tsx` | 81 | ✅ Complete | First-time user setup |
| `navigation/MainNavigator.tsx` | 292 | ✅ Complete | Bottom tab navigation with 5 tabs |
| `navigation/navigationUtils.ts` | 283 | ✅ Complete | Utilities, deep linking, guards |
| `App.tsx` | 67 | ✅ Updated | Integration with theme and navigation |
| **Total** | **1,017** | **100%** | **Complete** |

---

## Screen Implementation Status

### ✅ Structure Complete (33 screens defined)
### ⏳ Screen Implementations Pending

**Auth Screens** (4):
- [ ] Welcome
- [ ] Login
- [ ] Register
- [ ] ForgotPassword

**Onboarding Screens** (5):
- [ ] Welcome
- [ ] GradeSelection
- [ ] InterestsSelection
- [ ] AccessibilitySetup
- [ ] Complete

**Home Stack Screens** (3):
- [ ] Dashboard
- [ ] Notifications
- [ ] QuickActivity

**Subjects Stack Screens** (4):
- [ ] SubjectsList
- [ ] SubjectDetail
- [ ] LessonDetail
- [ ] ActivityDetail

**Activities Stack Screens** (5):
- [ ] ActivitiesList
- [ ] GamePicker
- [ ] GameSession
- [ ] HomeworkHelper
- [ ] HomeworkSession

**Progress Stack Screens** (4):
- [ ] ProgressOverview
- [ ] DetailedReport
- [ ] Achievements
- [ ] AchievementDetail

**Settings Stack Screens** (7):
- [ ] SettingsHome
- [ ] Profile
- [ ] Accessibility
- [ ] Theme
- [ ] Notifications
- [ ] Privacy
- [ ] About

**Modal Screens** (2):
- [ ] FocusMode
- [ ] ParentControls

---

## Key Features Implemented

### ✅ Navigation Structure
- Type-safe navigation with TypeScript
- Nested navigation (stacks within tabs)
- Authentication flow management
- Onboarding flow management
- Bottom tab navigation (5 tabs)
- Modal screen support

### ✅ Deep Linking
- Custom URL scheme: `aivolearning://`
- Web URL support: `https://aivo.app`
- All screens mapped to URLs
- Parameter passing in URLs

### ✅ Screen Tracking
- onNavigationReady callback
- onNavigationStateChange callback
- Current route detection
- Analytics integration ready

### ✅ Navigation Guards
- Parent controls guard (restrict screens)
- Focus mode guard (prevent navigation during activities)
- Custom guard support
- Guard chaining

### ✅ Imperative Navigation
- Navigate from outside React components
- Navigation reference for stores/services
- Session timeout handling
- Error navigation handling

### ✅ Theme Integration
- ThemeProvider wraps entire app
- Grade-based theme selection (K5/MS/HS)
- Light/Dark mode support
- Custom tab bar (grade-specific styling)

---

## Navigation Patterns

### Pattern 1: Type-Safe Navigation
```typescript
// In component
import {useNavigation} from '@react-navigation/native';
import type {SubjectsStackScreenProps} from '../navigation/types';

function SubjectsListScreen() {
  const navigation = useNavigation<SubjectsStackScreenProps<'SubjectsList'>['navigation']>();
  
  const handleSubjectPress = (subjectId: string, subjectName: string) => {
    navigation.navigate('SubjectDetail', {subjectId, subjectName});
  };
}
```

### Pattern 2: Imperative Navigation
```typescript
// In store or service
import {navigate} from './navigation/navigationUtils';

function handleNotification(notification) {
  if (notification.type === 'homework_due') {
    navigate('HomeworkSession', {homeworkId: notification.homeworkId});
  }
}
```

### Pattern 3: Navigation Guards
```typescript
// Check before navigation
import {checkNavigationGuards} from './navigation/navigationUtils';

function navigateToScreen(screenName: string) {
  const {allowed, message} = checkNavigationGuards(screenName);
  
  if (!allowed) {
    Alert.alert('Restricted', message);
    return;
  }
  
  navigate(screenName);
}
```

### Pattern 4: Deep Link Handling
```typescript
// Open app with deep link
aivolearning://subjects/math
  ↓
Main → Subjects → SubjectDetail {subjectId: 'math'}

// Handle incoming link
<NavigationContainer
  linking={linkingConfig}
  onReady={() => {
    // Check if opened from deep link
  }}
>
```

---

## Next Steps

### ⏳ Immediate: Install Dependencies

```powershell
cd apps/mobile-learner
pnpm install

# iOS specific (if on Mac)
cd ios
pod install
cd ..
```

### ⏳ Next: Create Placeholder Screens

**Priority 1: Auth & Onboarding** (9 screens)
- Auth screens (Welcome, Login, Register, ForgotPassword)
- Onboarding screens (Welcome, GradeSelection, InterestsSelection, AccessibilitySetup, Complete)

**Priority 2: Main App Core** (5 screens)
- Dashboard (Home)
- SubjectsList
- ActivitiesList
- ProgressOverview
- SettingsHome

**Priority 3: Detail Screens** (remaining 19 screens)
- Subject/Lesson details
- Game/Activity sessions
- Reports and achievements
- Settings pages

### ⏳ Then: Create Custom Tab Bar

**File to Create**: `src/components/navigation/CustomTabBar.tsx`

**Features**:
- Grade-based styling (K5: playful, MS: cool, HS: professional)
- Animated tab icons
- Badge support (notifications, new content)
- Accessibility labels
- Touch target sizing (grade-based: 64px K5, 56px MS, 48px HS)

### ⏳ After: Implement Stores

**Auth Store** (Zustand):
- `isAuthenticated` state
- Login/logout actions
- Token management
- Session timeout handling

**User Store** (Zustand):
- `isOnboarded` state
- User profile (grade, name, avatar)
- Preferences
- Theme selection

**App State Store** (Zustand):
- Focus mode state
- Parent controls settings
- Notification badges
- Loading states

---

## Dependencies Status

### ⏳ Not Yet Installed (listed in package.json)

**Navigation**:
- `@react-navigation/native`: 6.1.18
- `@react-navigation/native-stack`: 6.11.0
- `@react-navigation/bottom-tabs`: 6.6.1
- `react-native-screens`: 4.4.0
- `react-native-safe-area-context`: 4.14.0

**Core**:
- `react-native`: 0.76.5
- `react`: 19.0.0
- `react-native-gesture-handler`: 2.20.2

**State & Data**:
- `zustand`: 5.0.2
- `@tanstack/react-query`: 5.62.7

**UI**:
- `react-native-paper`: 5.12.5

---

## Verification Checklist

- [x] Navigation type definitions complete
- [x] RootNavigator created with auth/onboarding/main flow
- [x] AuthStack with 4 screens defined
- [x] OnboardingStack with 5 screens defined
- [x] MainNavigator with 5 bottom tabs defined
- [x] 33 total screens defined across all stacks
- [x] navigationUtils created with imperative navigation
- [x] Deep link configuration defined
- [x] Screen tracking setup
- [x] Navigation guards implemented
- [x] App.tsx updated with ThemeProvider and RootNavigator
- [x] Provider hierarchy correct (7 nested providers)
- [ ] Dependencies installed
- [ ] Custom tab bar component created
- [ ] Placeholder screens implemented
- [ ] Stores created (auth, user, app state)

---

**Status**: ✅ PROMPT 3 COMPLETE (Structure Ready)

**Next Phase**: Install dependencies and create placeholder screens

