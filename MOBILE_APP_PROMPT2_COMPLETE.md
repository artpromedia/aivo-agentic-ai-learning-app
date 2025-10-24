# Mobile App - Prompt 2 Complete: Shared Design System with NativeWind

**Date**: Current Session  
**Status**: ✅ COMPLETE  
**Files Created/Verified**: 4 files (1 verified, 3 existing)

---

## Overview

Successfully configured comprehensive shared design system with NativeWind 4.x for React Native mobile app. All theme configuration, responsive utilities, and grade-based theme selection logic are complete.

---

## Implementation Summary

### 1. ✅ NativeWind Configuration (VERIFIED)

**File**: `apps/mobile-learner/tailwind.config.ts` (135 lines)

**Status**: Already comprehensive - No changes needed

**Features**:
- ✅ Extends `@aivo/tailwind-config` (shared config from monorepo)
- ✅ NativeWind preset configured (`require('nativewind/preset')`)
- ✅ K5/MS/HS theme colors defined
- ✅ Safe area utilities (`env(safe-area-inset-*)`)
- ✅ Mobile spacing (touch: 44px)
- ✅ Touch target sizes (minWidth/minHeight: 44px)
- ✅ Typography scale (12-36px)
- ✅ 4px grid spacing system

```typescript
const config: Config = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    ...sharedConfig.theme,
    extend: {
      colors: {
        k5: { primary, secondary, accent, ... },
        ms: { ... },
        hs: { ... }
      },
      spacing: { safe, 'safe-bottom', touch: '44px' },
      fontSize: { xs: ['12px', '16px'], ... },
      minWidth: { touch: '44px' },
      minHeight: { touch: '44px' }
    }
  }
};
```

---

### 2. ✅ Enhanced Theme System (CREATED)

**File**: `apps/mobile-learner/src/theme/enhancedTheme.ts` (318 lines)

**Status**: ✅ Created in current session

**Key Components**:

#### Type Definitions (Lines 1-130)
```typescript
export type ThemeType = 'K5' | 'MS' | 'HS';
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  primary, secondary, accent, success, warning, error, info,
  background, surface, text, textSecondary, border, disabled,
  overlay, shadow
}

export interface Typography {
  fontFamily: { sans, display, mono }
  fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl }
  fontWeight: { normal, medium, semibold, bold, extrabold }
  lineHeight: { tight, normal, relaxed }
}

export interface Spacing {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, 2xl: 48, 3xl: 64, touch: 44
}

export interface BorderRadius {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, 2xl: 24, 3xl: 32, full: 9999, touch: 12
}

export interface ThemeConfig {
  colors: { light: ThemeColors; dark: ThemeColors };
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}
```

#### Shared Scales (Lines 131-180)
```typescript
const typography: Typography = {
  fontFamily: {
    sans: 'System',
    display: 'System',
    mono: 'Menlo',
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 20, 
    '2xl': 24, '3xl': 30, '4xl': 36
  },
  fontWeight: {
    normal: '400', medium: '500', semibold: '600',
    bold: '700', extrabold: '800'
  },
  lineHeight: {
    tight: 1.25, normal: 1.5, relaxed: 1.75
  }
};

const spacing: Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, 
  '2xl': 48, '3xl': 64, touch: 44
};

const borderRadius: BorderRadius = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, 
  '2xl': 24, '3xl': 32, full: 9999, touch: 12
};
```

#### K5 Theme (Ages 5-10) - Lines 181-211
```typescript
Light Mode:
  primary: #FF6B9D (Pink)
  secondary: #FFA500 (Orange)
  accent: #FFD700 (Gold)
  success: #4CAF50, warning: #FF9800, error: #F44336, info: #2196F3
  background: #FFF5F7 (Light Pink)
  surface: #FFFFFF
  text: #333333, textSecondary: #666666
  border: #FFE0E8, disabled: #CCCCCC
  overlay: rgba(0,0,0,0.5), shadow: rgba(0,0,0,0.15)

Dark Mode:
  primary: #FF8CB4 (Lighter Pink)
  secondary: #FFB347 (Lighter Orange)
  accent: #FFE066 (Lighter Gold)
  background: #1A1A1A (Dark)
  surface: #2A2A2A (Dark Gray)
  text: #FFFFFF, textSecondary: #CCCCCC
  border: #444444, disabled: #666666
```

#### MS Theme (Ages 11-13) - Lines 212-242
```typescript
Light Mode:
  primary: #6366F1 (Indigo)
  secondary: #8B5CF6 (Purple)
  accent: #EC4899 (Pink)
  background: #F8FAFC (Slate)
  surface: #FFFFFF
  text: #1E293B (Slate 800)
  textSecondary: #64748B (Slate 500)

Dark Mode:
  primary: #818CF8 (Lighter Indigo)
  secondary: #A78BFA (Lighter Purple)
  accent: #F472B6 (Lighter Pink)
  background: #0F172A (Dark Slate)
  surface: #1E293B (Slate 800)
  text: #F1F5F9 (Slate 100)
```

#### HS Theme (Ages 14-18) - Lines 243-273
```typescript
Light Mode:
  primary: #0EA5E9 (Sky Blue)
  secondary: #8B5CF6 (Purple)
  accent: #F97316 (Orange)
  background: #F9FAFB (Gray 50)
  surface: #FFFFFF
  text: #111827 (Gray 900)
  textSecondary: #6B7280 (Gray 500)

Dark Mode:
  primary: #38BDF8 (Lighter Sky)
  secondary: #A78BFA (Lighter Purple)
  accent: #FB923C (Lighter Orange)
  background: #111827 (Gray 900)
  surface: #1F2937 (Gray 800)
  text: #F9FAFB (Gray 50)
```

#### Theme Context & Provider (Lines 274-318)
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  themeType: initialThemeType = 'K5',
  onThemeChange,
}) => {
  const [themeType, setThemeTypeState] = useState<ThemeType>(initialThemeType);
  const systemColorScheme = useColorScheme(); // React Native hook
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  
  const theme = useMemo(() => themes[themeType], [themeType]);
  const colors = useMemo(() => theme.colors[colorScheme], [theme, colorScheme]);
  
  const setThemeType = useCallback((type: ThemeType) => {
    setThemeTypeState(type);
    onThemeChange?.(type);
  }, [onThemeChange]);
  
  return (
    <ThemeContext.Provider value={{themeType, colorScheme, theme, colors, setThemeType}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const getTheme = (
  themeType: ThemeType = 'K5',
  colorScheme: ColorScheme = 'light'
): ThemeColors => {
  return themes[themeType].colors[colorScheme];
};
```

**Exports**:
```typescript
export { ThemeProvider, useTheme, getTheme, K5Theme, MSTheme, HSTheme, themes };
export type { ThemeType, ColorScheme, ThemeColors, Typography, Spacing, BorderRadius, ThemeConfig, ThemeContextType };
```

---

### 3. ✅ Grade-Based Theme Logic (EXISTING)

**File**: `apps/mobile-learner/src/theme/gradeThemes.ts` (144 lines)

**Status**: ✅ Already exists

**Key Features**:
- Maps K-12 grades to K5/MS/HS themes
- Grade level detection
- Theme transition messages
- Grade-specific UI features

```typescript
export type GradeLevel = 'K' | '1' | '2' | ... | '12';

// Maps grade to theme
export const getThemeTypeForGrade = (grade: GradeLevel): ThemeType => {
  const gradeMap: Record<GradeLevel, ThemeType> = {
    'K': 'K5', '1': 'K5', '2': 'K5', '3': 'K5', '4': 'K5', '5': 'K5',
    '6': 'MS', '7': 'MS', '8': 'MS',
    '9': 'HS', '10': 'HS', '11': 'HS', '12': 'HS',
  };
  return gradeMap[grade];
};

// Gets full theme config for grade
export const getThemeForGrade = (
  grade: GradeLevel,
  colorMode: ColorMode = 'light',
): ThemeConfig => {
  const themeType = getThemeTypeForGrade(grade);
  return getTheme(themeType, colorMode);
};

// Grade categories
export const gradeCategories = {
  elementary: ['K', '1', '2', '3', '4', '5'],
  middle: ['6', '7', '8'],
  high: ['9', '10', '11', '12'],
};

// Grade-specific UI features
export const getThemeFeaturesForGrade = (grade: GradeLevel): GradeThemeFeatures => {
  if (isElementary(grade)) {
    return {
      showAnimations: true,
      simplifiedNavigation: true,
      voiceGuidance: true,
      largerTouchTargets: true,
      playfulIcons: true,
    };
  }
  // ... MS and HS features
};

// Theme transition messages
export const getThemeTransitionMessage = (
  currentGrade: GradeLevel,
  newGrade: GradeLevel,
): string | null => {
  if (currentTheme === 'K5' && newTheme === 'MS') {
    return "You're moving up to middle school! We've updated your app...";
  }
  // ...
};
```

---

### 4. ✅ Responsive Design Utilities (EXISTING)

**File**: `apps/mobile-learner/src/utils/responsive.ts` (364 lines)

**Status**: ✅ Already exists

**Key Features**:

#### useResponsive Hook
```typescript
export const useResponsive = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(
    getScreenDimensions(),
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(getScreenDimensions());
    });
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

// Returns:
{
  width, height, scale, fontScale,
  isPhone, isTablet, isPortrait, isLandscape,
  deviceType, orientation
}
```

#### Breakpoints
```typescript
export const breakpoints = {
  phonePortrait: {min: 320, max: 414},
  phoneLandscape: {min: 568, max: 896},
  tabletPortrait: {min: 768, max: 1024},
  tabletLandscape: {min: 1024, max: 1366},
};
```

#### Font Scaling (WCAG Compliant)
```typescript
export const scaleFontSize = (
  size: number,
  options: FontScaleOptions = {},
): number => {
  const {
    minScale = 0.8,
    maxScale = 2.0, // Support 200% scaling for WCAG
    respectAccessibility = true,
  } = options;

  const {width, fontScale} = Dimensions.get('window');
  const baseWidth = 375; // iPhone X width

  let scale = width / baseWidth;
  
  // Apply accessibility font scale
  if (respectAccessibility && fontScale > 1) {
    scale *= fontScale;
  }
  
  // Clamp to min/max
  scale = Math.max(minScale, Math.min(maxScale, scale));
  return Math.round(size * scale);
};
```

#### Responsive Value Selectors
```typescript
// Device-based values
export const responsive = <T>(values: {
  phone?: T;
  tablet?: T;
  default?: T;
}): T | undefined => { ... };

// Orientation-based values
export const orientationValue = <T>(values: {
  portrait?: T;
  landscape?: T;
  default?: T;
}): T | undefined => { ... };

// Platform-based values
export const platformValue = <T>(values: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T | undefined => { ... };
```

#### Touch Target Utilities
```typescript
export const touchTargets = {
  minimum: 44,      // iOS HIG minimum
  comfortable: 48,  // Material Design
  large: 56,        // Accessibility
  extraLarge: 64,   // K5 learners
};

export const getTouchTargetSize = (grade?: string): number => {
  if (['K', '1', '2', '3', '4', '5'].includes(grade)) {
    return touchTargets.extraLarge; // 64px for K-5
  }
  if (['6', '7', '8'].includes(grade)) {
    return touchTargets.large; // 56px for 6-8
  }
  return touchTargets.comfortable; // 48px for 9-12
};
```

#### Accessibility Utilities
```typescript
export const accessibility = {
  isLargeText: (): boolean => {
    const {fontScale} = Dimensions.get('window');
    return fontScale > 1.2;
  },

  getAccessibleTextSize: (baseSize: number): number => {
    return scaleFontSize(baseSize, {
      minScale: 1.0,
      maxScale: 2.0,
      respectAccessibility: true,
    });
  },

  getAccessibleSpacing: (baseSpacing: number): number => {
    const {fontScale} = Dimensions.get('window');
    return Math.round(baseSpacing * Math.min(fontScale, 1.5));
  },
};
```

#### Responsive Grid
```typescript
export const grid = {
  getColumns: (options?: {phone?: number; tablet?: number}): number => {
    return responsive({
      phone: options?.phone ?? 1,
      tablet: options?.tablet ?? 2,
      default: 1,
    }) ?? 1;
  },

  getGutter: (): number => {
    return responsive({ phone: 16, tablet: 24, default: 16 }) ?? 16;
  },
};
```

---

## Usage Examples

### 1. Theme Provider Setup (App.tsx)
```typescript
import {ThemeProvider} from './src/theme/enhancedTheme';
import {getThemeTypeForGrade} from './src/theme/gradeThemes';

function App() {
  const userGrade = 'K'; // From user profile
  const themeType = getThemeTypeForGrade(userGrade);

  return (
    <ThemeProvider themeType={themeType}>
      <NavigationContainer>
        {/* App content */}
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

### 2. Using Theme in Components
```typescript
import {useTheme} from '../theme/enhancedTheme';

function MyComponent() {
  const {colors, themeType, colorScheme} = useTheme();

  return (
    <View style={{backgroundColor: colors.background}}>
      <Text style={{color: colors.text}}>Hello {themeType}!</Text>
      <Text style={{color: colors.textSecondary}}>
        Current mode: {colorScheme}
      </Text>
    </View>
  );
}
```

### 3. Using Responsive Utilities
```typescript
import {useResponsive, responsive, scaleFontSize} from '../utils/responsive';

function ResponsiveComponent() {
  const {isPhone, isTablet, width, orientation} = useResponsive();

  const padding = responsive({phone: 16, tablet: 24});
  const fontSize = scaleFontSize(16);

  return (
    <View style={{padding}}>
      <Text style={{fontSize}}>
        {isPhone ? 'Phone' : 'Tablet'} - {orientation}
      </Text>
      <Text>Width: {width}px</Text>
    </View>
  );
}
```

### 4. Grade-Based Touch Targets
```typescript
import {getTouchTargetSize} from '../utils/responsive';

function GradeButton({grade}: {grade: string}) {
  const touchSize = getTouchTargetSize(grade);

  return (
    <TouchableOpacity
      style={{
        width: touchSize,
        height: touchSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Tap Me</Text>
    </TouchableOpacity>
  );
}
```

---

## File Statistics

| File | Lines | Status | Purpose |
|------|-------|--------|---------|
| `tailwind.config.ts` | 135 | ✅ Verified | NativeWind configuration |
| `theme/enhancedTheme.ts` | 318 | ✅ Created | Theme system with light/dark mode |
| `theme/gradeThemes.ts` | 144 | ✅ Existing | Grade-based theme logic |
| `utils/responsive.ts` | 364 | ✅ Existing | Responsive design utilities |
| **Total** | **961** | **100%** | **Complete** |

---

## Key Features Implemented

### ✅ NativeWind Integration
- Extends shared Tailwind config from `@aivo/tailwind-config`
- NativeWind 4.x preset configured
- Mobile-specific utilities (safe area, touch targets)

### ✅ Theme System
- 3 age-based themes (K5, MS, HS)
- Light/Dark mode support with system detection
- 16 color properties per theme/mode combination
- Typography, spacing, border radius scales

### ✅ Grade-Based Theme Selection
- Automatic theme based on K-12 grade level
- Grade-specific UI features (animations, navigation, touch targets)
- Theme transition messages

### ✅ Responsive Design
- `useResponsive()` hook with device/orientation detection
- Font scaling (supports 200% for WCAG compliance)
- Breakpoint utilities (phone/tablet, portrait/landscape)
- Platform-specific values (iOS/Android/Web)
- Grade-based touch target sizing (44-64px)
- Accessibility utilities

---

## Accessibility Features

1. **WCAG Compliance**: Font scaling up to 200%
2. **Touch Targets**: Grade-based sizing (44-64px)
3. **Color Contrast**: Light/Dark mode support
4. **System Settings**: Respects OS accessibility settings
5. **Safe Areas**: iPhone X+ safe area support

---

## Next Steps

### ⏳ Prompt 3: Set Up Navigation Architecture

**Files to Create** (~800 lines):
1. `src/navigation/RootNavigator.tsx` - Main navigation coordinator
2. `src/navigation/AuthStack.tsx` - Login and authentication flows
3. `src/navigation/OnboardingStack.tsx` - First-time user setup
4. `src/navigation/MainNavigator.tsx` - Bottom tab navigation
5. `src/navigation/navigationUtils.ts` - Deep linking, screen tracking

**Bottom Tab Screens**:
- Home (Dashboard)
- Subjects (Math, Reading, etc.)
- Activities (Games, Homework Helper)
- Progress (Reports, Achievements)
- Settings (Profile, Preferences)

---

## Dependencies Ready

All theme and responsive dependencies are configured:
- ✅ React Native (useColorScheme, Dimensions, Platform)
- ✅ React (createContext, useContext, useMemo, useState, useEffect, useCallback)
- ✅ NativeWind 4.x
- ✅ Tailwind CSS 4.0

---

## Verification Checklist

- [x] NativeWind config extends shared config
- [x] K5/MS/HS themes defined with light/dark modes
- [x] ThemeProvider component created
- [x] useTheme hook implemented
- [x] Grade-based theme selection logic
- [x] useResponsive hook for device detection
- [x] Font scaling with accessibility support
- [x] Touch target utilities
- [x] Breakpoint system
- [x] Platform-specific utilities

---

**Status**: ✅ PROMPT 2 COMPLETE - Ready for Prompt 3 (Navigation Architecture)

