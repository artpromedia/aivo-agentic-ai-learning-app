# Mobile Development Guide

> Comprehensive guide for developers working on the Aivo Learning mobile app

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [State Management](#state-management)
4. [Navigation Patterns](#navigation-patterns)
5. [Data Flow](#data-flow)
6. [Testing Strategies](#testing-strategies)
7. [Performance Optimization](#performance-optimization)
8. [Common Patterns](#common-patterns)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App Entry                         │
│                    (App.tsx)                         │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    ┌────▼────┐          ┌─────▼─────┐
    │ Providers│          │Navigation │
    │  Layer   │          │   Layer   │
    └────┬────┘          └─────┬─────┘
         │                     │
    ┌────▼─────────────────────▼────┐
    │      Screen Components         │
    │  (Screens + UI Components)     │
    └────────────┬───────────────────┘
                 │
    ┌────────────┴───────────────┐
    │                            │
┌───▼───┐  ┌──────▼──────┐  ┌───▼────┐
│Stores │  │  Services   │  │  Hooks │
│(State)│  │(Business    │  │(Reuse) │
│       │  │ Logic)      │  │        │
└───┬───┘  └──────┬──────┘  └───┬────┘
    │             │              │
    └─────────────┴──────────────┘
                  │
         ┌────────▼────────┐
         │  Data Sources   │
         │  (API, DB, FS)  │
         └─────────────────┘
```

### Core Principles

1. **Separation of Concerns**: UI, business logic, and data layers are distinct
2. **Offline First**: All features work offline with background sync
3. **Accessibility First**: WCAG 2.1 Level AA compliance
4. **Type Safety**: Strict TypeScript with no `any` types
5. **Performance**: 60 FPS animations, lazy loading, code splitting

### Technology Decisions

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Framework | React Native 0.76 | Latest stable, Fabric architecture |
| Language | TypeScript 5.6 | Type safety, developer experience |
| Navigation | React Navigation 6 | Most mature, type-safe |
| State | Zustand | Simple, performant, TypeScript-friendly |
| Server State | TanStack Query | Caching, optimistic updates, offline |
| Local DB | WatermelonDB | Fast, lazy loading, SQLite-based |
| Styling | NativeWind | Tailwind-style, utility-first |
| Animations | Reanimated 3 | 60 FPS, runs on UI thread |
| Testing | Jest + RNTL | Standard, good DX |

---

## Code Organization

### Directory Structure Philosophy

```
src/
├── components/          # Reusable UI components (dumb)
│   ├── AccessibleButton/   # One component per directory
│   │   ├── AccessibleButton.tsx
│   │   ├── index.ts
│   │   └── __tests__/
│   │       └── AccessibleButton.test.tsx
│   └── ...
├── screens/            # Screen components (smart)
│   ├── home/
│   │   ├── Dashboard.tsx
│   │   └── Notifications.tsx
│   └── ...
├── navigation/         # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── MainNavigator.tsx
│   └── types.ts        # Navigation param types
├── stores/             # Zustand stores (global state)
│   ├── authStore.ts
│   └── userStore.ts
├── services/           # Business logic (domain logic)
│   ├── api/            # API clients
│   ├── database/       # WatermelonDB models
│   ├── accessibility/  # Accessibility features
│   └── analytics/      # Analytics integration
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useOffline.ts
├── utils/              # Pure utility functions
│   ├── date.ts
│   └── validation.ts
├── theme/              # Theming system
│   ├── ThemeContext.tsx
│   └── gradeThemes.ts
└── types/              # TypeScript type definitions
    ├── models.ts
    └── api.ts
```

### Component Organization

**Dumb Components** (`src/components/`):
- No business logic
- Props in, JSX out
- Highly reusable
- Well-tested

**Smart Components** (`src/screens/`):
- Connect to stores/services
- Handle business logic
- Compose dumb components
- Navigation aware

### Naming Conventions

```typescript
// Files: PascalCase for components, camelCase for utilities
Dashboard.tsx
userStore.ts
formatDate.ts

// Components: PascalCase
export function Dashboard() { ... }

// Hooks: camelCase with "use" prefix
export function useAuth() { ... }

// Stores: camelCase with "Store" suffix
export const authStore = create<AuthState>()

// Services: camelCase with "Service" suffix
export const apiService = { ... }

// Constants: SCREAMING_SNAKE_CASE
export const MAX_RETRY_ATTEMPTS = 3;

// Types/Interfaces: PascalCase
export interface User { ... }
export type UserRole = 'student' | 'parent';
```

---

## State Management

### State Architecture

```
┌─────────────────────────────────────────┐
│         Component Tree                   │
│                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │Screen A │  │Screen B │  │Screen C │ │
│  └────┬────┘  └────┬────┘  └────┬────┘ │
│       │            │             │      │
└───────┼────────────┼─────────────┼──────┘
        │            │             │
        ▼            ▼             ▼
┌─────────────────────────────────────────┐
│         Zustand Stores (Global)          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Auth   │  │  User   │  │  Sync   │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       TanStack Query (Server State)      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │Lessons  │  │Progress │  │ Games   │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     WatermelonDB (Local Cache/Offline)   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Lesson  │  │Progress │  │  Game   │ │
│  │  Model  │  │  Model  │  │  Model  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

### Zustand Store Pattern

```typescript
// src/stores/authStore.ts
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,

      // Actions
      login: async (email, password) => {
        try {
          const {user, token} = await authService.login(email, password);
          set({isAuthenticated: true, user, token});
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: async () => {
        await authService.logout();
        set({isAuthenticated: false, user: null, token: null});
      },

      refreshToken: async () => {
        const {token: currentToken} = get();
        if (!currentToken) return;

        try {
          const {token: newToken} = await authService.refreshToken(currentToken);
          set({token: newToken});
        } catch (error) {
          // Token refresh failed, logout user
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### TanStack Query Pattern

```typescript
// src/hooks/useLessons.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {lessonService} from '@/services/api/lessonService';

export function useLessons(subjectId: string) {
  return useQuery({
    queryKey: ['lessons', subjectId],
    queryFn: () => lessonService.getLessons(subjectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({lessonId, score}: {lessonId: string; score: number}) =>
      lessonService.completeLesson(lessonId, score),

    // Optimistic update
    onMutate: async ({lessonId}) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({queryKey: ['lessons']});

      // Snapshot previous value
      const previousLessons = queryClient.getQueryData(['lessons']);

      // Optimistically update
      queryClient.setQueryData(['lessons'], (old: any) => {
        return old.map((lesson: any) =>
          lesson.id === lessonId ? {...lesson, completed: true} : lesson
        );
      });

      return {previousLessons};
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['lessons'], context?.previousLessons);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['lessons']});
      queryClient.invalidateQueries({queryKey: ['progress']});
    },
  });
}
```

### When to Use What?

| State Type | Tool | Example |
|------------|------|---------|
| **Auth state** | Zustand | User logged in, token, profile |
| **UI state (global)** | Zustand | Theme, accessibility settings |
| **UI state (local)** | React useState | Form inputs, modals |
| **Server data** | TanStack Query | Lessons, progress, games |
| **Derived state** | useMemo | Filtered lists, calculations |
| **Offline data** | WatermelonDB | Cached lessons, local progress |

---

## Navigation Patterns

### Navigation Structure

```
RootNavigator
├── Auth Stack (not authenticated)
│   ├── Login
│   ├── Signup
│   └── ForgotPassword
├── Onboarding Stack (first-time users)
│   ├── Welcome
│   ├── Grade Selection
│   └── Accessibility Setup
└── Main Navigator (authenticated)
    ├── Home Stack
    │   ├── Dashboard
    │   ├── Notifications
    │   └── Quick Activity
    ├── Subjects Stack
    │   ├── Subjects List
    │   ├── Subject Detail
    │   ├── Lesson Detail
    │   └── Activity Detail
    ├── Activities Stack
    │   ├── Activities List
    │   ├── Game Picker
    │   ├── Game Session
    │   └── Homework Helper
    ├── Progress Stack
    │   ├── Progress Overview
    │   ├── Detailed Report
    │   └── Achievements
    └── Settings Stack
        ├── Settings Home
        ├── Profile
        ├── Accessibility
        └── About
```

### Type-Safe Navigation

```typescript
// src/navigation/types.ts
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Home Stack
export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  QuickActivity: {activityId: string};
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

// Usage in component:
import type {HomeStackScreenProps} from '@/navigation/types';

type Props = HomeStackScreenProps<'QuickActivity'>;

function QuickActivityScreen({route, navigation}: Props) {
  const {activityId} = route.params; // Type-safe!
  
  navigation.navigate('Dashboard'); // Type-checked!
}
```

### Deep Linking

```typescript
// src/navigation/navigationUtils.ts
import {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['aivolearning://', 'https://aivolearning.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              Dashboard: 'home',
              QuickActivity: 'activity/:activityId',
            },
          },
          Subjects: {
            screens: {
              SubjectsList: 'subjects',
              SubjectDetail: 'subject/:subjectId',
              LessonDetail: 'lesson/:lessonId',
            },
          },
        },
      },
    },
  },
};

// Deep link examples:
// aivolearning://home
// aivolearning://activity/abc123
// aivolearning://subject/math
// aivolearning://lesson/math-101
```

---

## Data Flow

### API → UI Data Flow

```
┌──────────┐
│  Screen  │
│(Component│
└────┬─────┘
     │ 1. Component mounts
     │
     ▼
┌────────────────┐
│  useQuery()    │  2. Check cache
│  (TanStack)    │
└────┬───────────┘
     │
     ├─ Cache hit ─────────┐
     │                     │
     │ Cache miss          │
     │                     │
     ▼                     │
┌────────────────┐         │
│  API Service   │  3. Fetch│
│  (HTTP)        │         │
└────┬───────────┘         │
     │                     │
     ▼                     │
┌────────────────┐         │
│  Transform     │  4. Parse│
│  & Validate    │         │
└────┬───────────┘         │
     │                     │
     ▼                     │
┌────────────────┐         │
│  Update Cache  │  5. Store│
│  (TanStack)    │◄────────┘
└────┬───────────┘
     │
     ▼
┌────────────────┐
│  Render UI     │  6. Display
└────────────────┘
```

### Offline Data Flow

```
User Action
     │
     ▼
┌─────────────────┐
│  Is Online?     │
└────┬─────┬──────┘
     │     │
  Yes│     │No
     │     │
     ▼     ▼
┌─────┐ ┌──────────────┐
│ API │ │  Local DB    │
│     │ │(WatermelonDB)│
└──┬──┘ └──────┬───────┘
   │           │
   ▼           ▼
┌──────────────────────┐
│   Sync Queue         │
│(Background Service)  │
└──────────┬───────────┘
           │
    When online
           │
           ▼
┌──────────────────────┐
│   Sync to Server     │
└──────────────────────┘
```

---

## Testing Strategies

### Testing Pyramid

```
        ┌────────┐
        │   E2E  │  10% - Critical user flows
        └────────┘
      ┌──────────┐
      │Integration│  20% - Component + hooks
      └──────────┘
    ┌──────────────┐
    │     Unit     │  70% - Functions, hooks
    └──────────────┘
```

### Unit Testing

```typescript
// src/utils/__tests__/formatDate.test.ts
import {formatDate} from '../formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('January 15, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid date');
  });
});
```

### Component Testing

```typescript
// src/components/AccessibleButton/__tests__/AccessibleButton.test.tsx
import {render, fireEvent} from '@testing-library/react-native';
import {AccessibleButton} from '../AccessibleButton';

describe('AccessibleButton', () => {
  it('renders correctly', () => {
    const {getByText} = render(
      <AccessibleButton accessibilityLabel="Test" onPress={() => {}}>
        Click Me
      </AccessibleButton>
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = render(
      <AccessibleButton accessibilityLabel="Test" onPress={onPress}>
        Click Me
      </AccessibleButton>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is accessible', () => {
    const {getByLabelText} = render(
      <AccessibleButton accessibilityLabel="Test Button" onPress={() => {}}>
        Click Me
      </AccessibleButton>
    );

    const button = getByLabelText('Test Button');
    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityRole).toBe('button');
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/lesson-completion.test.tsx
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useCompleteLesson} from '@/hooks/useLessons';

describe('Lesson Completion Flow', () => {
  it('completes lesson and updates progress', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const {result} = renderHook(() => useCompleteLesson(), {wrapper});

    // Complete lesson
    result.current.mutate({lessonId: '123', score: 95});

    // Wait for mutation
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check progress updated
    const progress = queryClient.getQueryData(['progress']);
    expect(progress).toBeDefined();
  });
});
```

### E2E Testing (Detox)

```typescript
// e2e/lesson-flow.e2e.ts
describe('Lesson Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete a lesson successfully', async () => {
    // Login
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('submit-button')).tap();

    // Navigate to lesson
    await element(by.text('Math')).tap();
    await element(by.text('Addition Level 1')).tap();

    // Complete lesson
    await element(by.id('start-lesson')).tap();
    await element(by.id('answer-5')).tap();
    await element(by.id('submit')).tap();

    // Check success
    await expect(element(by.text('Great job!'))).toBeVisible();
  });
});
```

---

## Performance Optimization

### Rendering Performance

**1. Memoization**

```typescript
import React, {useMemo, useCallback} from 'react';

function LessonList({lessons, onLessonPress}) {
  // Memoize filtered list
  const completedLessons = useMemo(
    () => lessons.filter(lesson => lesson.completed),
    [lessons]
  );

  // Memoize callback
  const handlePress = useCallback(
    (lessonId: string) => {
      onLessonPress(lessonId);
    },
    [onLessonPress]
  );

  return (
    <FlatList
      data={completedLessons}
      renderItem={({item}) => (
        <LessonCard lesson={item} onPress={handlePress} />
      )}
      keyExtractor={item => item.id}
    />
  );
}
```

**2. Virtualized Lists**

```typescript
import {FlashList} from '@shopify/flash-list';

function OptimizedList({data}) {
  return (
    <FlashList
      data={data}
      renderItem={({item}) => <ListItem item={item} />}
      estimatedItemSize={80}
      // Faster than FlatList!
    />
  );
}
```

**3. Image Optimization**

```typescript
import FastImage from 'react-native-fast-image';

function OptimizedImage({uri}) {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={{width: 100, height: 100}}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}
```

### Bundle Size Optimization

**1. Code Splitting**

```typescript
// Lazy load screens
const HomeworkHelper = React.lazy(
  () => import('@/screens/activities/HomeworkHelper')
);

function ActivitiesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List" component={ActivitiesList} />
      <Stack.Screen
        name="HomeworkHelper"
        component={HomeworkHelper}
        // Only loaded when navigated to
      />
    </Stack.Navigator>
  );
}
```

**2. Tree Shaking**

```typescript
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import only what you need
import debounce from 'lodash/debounce';
```

### Memory Management

```typescript
// Clean up subscriptions
useEffect(() => {
  const subscription = eventEmitter.on('event', handler);
  
  return () => {
    subscription.remove(); // Cleanup!
  };
}, []);

// Cancel API calls on unmount
useEffect(() => {
  const controller = new AbortController();
  
  fetch(url, {signal: controller.signal});
  
  return () => {
    controller.abort(); // Cancel!
  };
}, [url]);
```

---

## Common Patterns

### 1. Custom Hook Pattern

```typescript
// src/hooks/useKeyboard.ts
import {useEffect, useState} from 'react';
import {Keyboard, KeyboardEvent} from 'react-native';

export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setIsVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return {isVisible, keyboardHeight};
}
```

### 2. Error Boundary Pattern

```typescript
// src/components/ErrorBoundary.tsx
import React, {Component, ReactNode} from 'react';
import {View, Text, Button} from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Something went wrong</Text>
          <Button
            title="Try again"
            onPress={() => this.setState({hasError: false})}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 3. Debounced Input Pattern

```typescript
// src/hooks/useDebounce.ts
import {useEffect, useState} from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
function SearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Make API call with debounced query
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <TextInput value={query} onChangeText={setQuery} />;
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Inline Functions in Render

```typescript
// Bad
<FlatList
  data={items}
  renderItem={({item}) => <Item item={item} onPress={() => handlePress(item.id)} />}
/>

// Good
const renderItem = useCallback(
  ({item}) => <Item item={item} onPress={handlePress} />,
  [handlePress]
);
<FlatList data={items} renderItem={renderItem} />
```

### ❌ Don't: Multiple State Updates

```typescript
// Bad
setCount(count + 1);
setLoading(false);
setError(null);
// 3 re-renders!

// Good
setState(prev => ({
  ...prev,
  count: prev.count + 1,
  loading: false,
  error: null,
}));
// 1 re-render!
```

### ❌ Don't: Async in useEffect Without Cleanup

```typescript
// Bad
useEffect(() => {
  async function fetchData() {
    const data = await api.get('/data');
    setState(data); // May update unmounted component!
  }
  fetchData();
}, []);

// Good
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const data = await api.get('/data');
    if (!cancelled) {
      setState(data);
    }
  }
  fetchData();

  return () => {
    cancelled = true;
  };
}, []);
```

### ❌ Don't: Direct State Mutation

```typescript
// Bad
const user = useUserStore(state => state.user);
user.name = 'New Name'; // Mutation!
setUser(user);

// Good
setUser({...user, name: 'New Name'}); // Immutable update
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot read property 'navigate' of undefined"

**Cause**: Component not wrapped in navigation context

**Fix**:
```typescript
// Use navigation prop, not hook
function Screen({navigation}: Props) {
  // navigation prop is guaranteed
}

// Or use hook only inside navigation context
import {useNavigation} from '@react-navigation/native';

function Component() {
  const navigation = useNavigation();
  // Will throw if not in NavigationContainer
}
```

#### 2. "Rendered more hooks than during the previous render"

**Cause**: Conditional hooks

**Fix**:
```typescript
// Bad
if (condition) {
  useEffect(() => {}, []); // Conditional!
}

// Good
useEffect(() => {
  if (condition) {
    // Logic inside effect
  }
}, [condition]);
```

#### 3. "Can't perform a React state update on an unmounted component"

**Cause**: Async operation completing after unmount

**Fix**:
```typescript
useEffect(() => {
  let mounted = true;

  async function load() {
    const data = await fetch();
    if (mounted) {
      setState(data);
    }
  }
  load();

  return () => {
    mounted = false;
  };
}, []);
```

---

## Additional Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [WatermelonDB Docs](https://nozbe.github.io/WatermelonDB/)

---

*Last updated: January 2025*
