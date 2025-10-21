# Dynamic Theming System - Quick Reference

## 🎨 Three Themes Available

### K5 (Elementary: K-5th Grade)
- **Colors**: Amber (#f59e0b) - warm, friendly
- **Font**: 18px base - large for young readers
- **Icons**: 64px - big, easy to tap
- **Animation**: High intensity - fun and bouncy

### MS (Middle School: 6-8th Grade)
- **Colors**: Indigo (#6366f1) - modern, engaging
- **Font**: 16px base - standard reading
- **Icons**: 48px - comfortable size
- **Animation**: Medium intensity - smooth

### HS (High School: 9-12th Grade)
- **Colors**: Emerald (#10b981) - professional
- **Font**: 14px base - compact, efficient
- **Icons**: 40px - streamlined
- **Animation**: Low intensity - subtle

## 🚀 Quick Start

### 1. Wrap Your App
```typescript
import { ThemeProvider } from '@aivo/ui';

<ThemeProvider defaultTheme="MS" persistTheme>
  <YourApp />
</ThemeProvider>
```

### 2. Use Theme in Components
```typescript
import { useTheme } from '@aivo/ui';

function MyComponent() {
  const { theme, themeConfig } = useTheme();
  
  return (
    <div style={{
      fontSize: themeConfig.fontSize.base,
      padding: themeConfig.spacing.card,
    }}>
      Content
    </div>
  );
}
```

### 3. Switch Theme by Grade
```typescript
const { setGradeLevel } = useTheme();
setGradeLevel(7); // Auto-switches to MS theme
```

## 📦 What's Included

✅ **Theme Configuration** (`packages/ui/src/themes/learner-themes.ts`)
- 3 complete themes (K5, MS, HS)
- Helper functions for switching
- 17 CSS custom properties per theme

✅ **Provider & Hooks** (`packages/ui/src/themes/ThemeProvider.tsx`)
- ThemeProvider component
- useTheme() hook
- useThemeStyles() hook
- useThemeAnimation() hook

✅ **Integration** (`apps/learner-app/src/App.tsx`)
- Wrapped with ThemeProvider
- Theme persistence enabled

✅ **Example Component** (`apps/learner-app/src/components/SubjectCard.tsx`)
- Shows theme-aware design

✅ **Dev Tools** (`apps/learner-app/src/components/ThemeSwitcher.tsx`)
- Theme preview/switcher (dev mode only)

## 🎯 Key Features

- **Automatic Theme Selection**: Based on grade level
- **LocalStorage Persistence**: Theme saved between sessions
- **CSS Variables**: 17 custom properties per theme
- **Type Safety**: Full TypeScript support
- **Grade-Based Switching**: K-5, 6-8, 9-12 auto-mapping
- **Development Tools**: Theme switcher for testing

## 📝 Next Steps

1. Update existing components to use theme variables
2. Connect to learner profile for auto-theming
3. Test all themes across all pages

## 💡 Tips

- Use `themeConfig` for dynamic values
- Use CSS variables for static styling
- Test with ThemeSwitcher in dev mode
- Respect animation preferences
