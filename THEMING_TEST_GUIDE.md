# Theme System Testing Guide

## Overview
This guide covers comprehensive testing of the Aivo Learning dynamic theming system with K5, MS, and HS themes.

## Setup

### Prerequisites
1. Learner app running: `cd apps/learner-app && pnpm run dev`
2. Development mode enabled (ThemeSwitcher visible)
3. Browser console open for theme logs

### Test Environment
- **Browser**: Chrome, Firefox, Safari, Edge
- **Viewport**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Accessibility**: Test with screen readers, keyboard navigation

## Test Cases

### 1. Theme Switching (Manual)

#### Test 1.1: ThemeSwitcher Component
**Location**: Bottom-right corner (dev mode only)

✅ **Steps**:
1. Open learner app
2. Verify ThemeSwitcher appears in bottom-right
3. Click "K-5 (Elementary)" button
4. Observe visual changes
5. Click "Middle School" button
6. Observe visual changes
7. Click "High School" button
8. Observe visual changes

**Expected Results**:
- ThemeSwitcher visible in dev mode
- Theme changes immediately on click
- UI updates reflect new theme
- No layout shift or flashing
- Smooth transitions (<300ms)

#### Test 1.2: Theme Persistence
✅ **Steps**:
1. Select K5 theme
2. Refresh page (F5)
3. Verify K5 theme still active
4. Select HS theme
5. Close tab
6. Reopen learner app
7. Verify HS theme still active

**Expected Results**:
- Theme persists across page reloads
- Theme persists across browser sessions
- localStorage contains correct theme

**Validation**:
```javascript
// In browser console
localStorage.getItem('aivo-learner-theme') // Should be 'K5', 'MS', or 'HS'
```

### 2. K5 Theme (Elementary) Testing

#### Test 2.1: Visual Properties
✅ **Steps**:
1. Switch to K5 theme
2. Navigate to Lock screen
3. Navigate to Subject Selection
4. Inspect visual elements

**Expected K5 Theme Properties**:
- **Colors**: Warm amber (#f59e0b) primary
- **Font Size**: 18px base (large, readable)
- **Icon Size**: 64px subject icons (large, friendly)
- **Spacing**: 24px card padding (generous)
- **Border Radius**: 24px cards (very rounded)
- **Animations**: High intensity, bouncy, 300ms

**Visual Checklist**:
- [ ] Text is noticeably larger
- [ ] Icons are big and inviting
- [ ] Spacing feels generous
- [ ] Buttons have soft, rounded corners
- [ ] Colors are warm and friendly
- [ ] Animations are playful and noticeable

#### Test 2.2: Lock Screen (K5)
✅ **Steps**:
1. On Lock screen with K5 theme
2. Check avatar size
3. Check PIN dot size
4. Check number button size
5. Test button interactions

**Expected**:
- Avatar: 64px (4rem)
- PIN dots: Large, easy to see
- Number buttons: Large text, easy to tap
- Transitions: 300ms, bouncy
- Colors: Amber gradient background

#### Test 2.3: Subject Selection (K5)
✅ **Steps**:
1. Navigate to Subject Selection
2. Check subject card layout
3. Check icon sizes
4. Check text readability
5. Test hover effects

**Expected**:
- Subject icons: 64px, prominent
- Heading: ~36px, bold, clear
- Card padding: 24px, spacious
- Card corners: Very rounded (24px)
- Hover: Noticeable scale effect

### 3. MS Theme (Middle School) Testing

#### Test 3.1: Visual Properties
✅ **Steps**:
1. Switch to MS theme
2. Navigate through Lock → Subject Selection
3. Compare to K5 theme

**Expected MS Theme Properties**:
- **Colors**: Modern indigo (#6366f1)
- **Font Size**: 16px base (standard)
- **Icon Size**: 48px subject icons (medium)
- **Spacing**: 20px card padding (balanced)
- **Border Radius**: 16px cards (modern)
- **Animations**: Medium intensity, smooth, 250ms

**Visual Checklist**:
- [ ] Text smaller than K5, larger than HS
- [ ] Icons medium-sized, modern
- [ ] Spacing balanced, not cramped
- [ ] Moderate rounding on corners
- [ ] Indigo/purple color scheme
- [ ] Smooth, modern animations

#### Test 3.2: Lock Screen (MS)
**Expected**:
- Avatar: 48px (3rem)
- PIN dots: Medium size
- Number buttons: Standard size
- Transitions: 250ms, smooth
- Colors: Indigo gradient

#### Test 3.3: Subject Selection (MS)
**Expected**:
- Subject icons: 48px, clear
- Heading: ~24px, readable
- Card padding: 20px, balanced
- Card corners: Modern rounded (16px)
- Hover: Smooth scale

### 4. HS Theme (High School) Testing

#### Test 4.1: Visual Properties
✅ **Steps**:
1. Switch to HS theme
2. Navigate through pages
3. Compare to MS and K5

**Expected HS Theme Properties**:
- **Colors**: Professional emerald (#10b981)
- **Font Size**: 14px base (compact)
- **Icon Size**: 40px subject icons (streamlined)
- **Spacing**: 16px card padding (efficient)
- **Border Radius**: 12px cards (subtle)
- **Animations**: Low intensity, professional, 200ms

**Visual Checklist**:
- [ ] Text compact, efficient
- [ ] Icons smaller, professional
- [ ] Spacing tight, maximized
- [ ] Subtle corner rounding
- [ ] Emerald/green color scheme
- [ ] Quick, subtle animations

#### Test 4.2: Lock Screen (HS)
**Expected**:
- Avatar: 40px (2.5rem)
- PIN dots: Compact
- Number buttons: Smaller text
- Transitions: 200ms, quick
- Colors: Emerald gradient

#### Test 4.3: Subject Selection (HS)
**Expected**:
- Subject icons: 40px, compact
- Heading: ~20px, efficient
- Card padding: 16px, tight
- Card corners: Subtle rounded (12px)
- Hover: Quick, subtle scale

### 5. Grade-Based Auto Theming

#### Test 5.1: Automatic Theme Selection
**Note**: This requires backend integration or mock data

✅ **Steps**:
1. Mock learner profile with grade 2
2. Login as learner
3. Verify K5 theme auto-selected

**Mock Grades to Test**:
- Grade K → K5 theme
- Grade 1 → K5 theme
- Grade 5 → K5 theme
- Grade 6 → MS theme
- Grade 8 → MS theme
- Grade 9 → HS theme
- Grade 12 → HS theme

**Expected**:
- Theme matches grade level automatically
- No manual selection needed
- Console shows: `[Theme] Auto-setting theme for grade X`

#### Test 5.2: Grade Update
✅ **Steps**:
1. Login with grade 5 (K5 theme)
2. Update profile to grade 6
3. Verify theme switches to MS

**Expected**:
- Theme updates automatically
- No page refresh needed
- Smooth transition

### 6. Responsive Design Testing

#### Test 6.1: Desktop (1920x1080)
✅ **Test each theme**:
- K5: Large elements, spacious layout
- MS: Balanced layout, good use of space
- HS: Compact, efficient use of space

#### Test 6.2: Tablet (768x1024)
✅ **Test each theme**:
- K5: Still large, touch-friendly
- MS: Medium sizing maintained
- HS: Compact but readable

#### Test 6.3: Mobile (375x667)
✅ **Test each theme**:
- K5: Very touch-friendly, large tap targets
- MS: Good balance for mobile
- HS: Efficient but still usable

### 7. Accessibility Testing

#### Test 7.1: Font Size Accessibility
✅ **WCAG Compliance**:
- K5: 18px base (AAA for young readers)
- MS: 16px base (AA standard)
- HS: 14px base (AA for mature readers)

**Test with browser zoom**:
- 100% zoom: All themes readable
- 150% zoom: All themes functional
- 200% zoom: Layout maintains integrity

#### Test 7.2: Color Contrast
✅ **Use contrast checker**:
- K5: Amber (#f59e0b) on cream (#fffbeb) - Check ratio
- MS: Indigo (#6366f1) on light blue (#eef2ff) - Check ratio
- HS: Emerald (#10b981) on light green (#ecfdf5) - Check ratio

**Expected**: All color combos meet WCAG AA (4.5:1 for text)

#### Test 7.3: Touch Targets
✅ **Minimum size**: 44x44px (WCAG 2.1)

- K5: 64px icons ✅ (excellent for children)
- MS: 48px icons ✅ (good for teens)
- HS: 40px icons ✅ (acceptable for older students)

#### Test 7.4: Keyboard Navigation
✅ **Steps**:
1. Tab through Lock screen
2. Use Enter/Space to select
3. Navigate Subject Selection
4. Test ThemeSwitcher

**Expected**:
- All interactive elements focusable
- Focus indicators visible
- Logical tab order
- Works in all themes

#### Test 7.5: Screen Reader
✅ **Tools**: NVDA, JAWS, VoiceOver

**Test**:
- Theme changes announced
- Button labels clear
- Proper ARIA labels
- Semantic HTML

### 8. Animation Testing

#### Test 8.1: Animation Intensity
✅ **Compare animations**:
- K5: Bouncy hover (scale-105), 300ms
- MS: Smooth hover (scale-105), 250ms
- HS: Subtle hover (scale-105), 200ms

**Verify**:
- K5 feels playful and fun
- MS feels modern and engaging
- HS feels professional and quick

#### Test 8.2: Reduced Motion
✅ **Steps**:
1. Enable "Reduce Motion" in OS
2. Reload app
3. Verify animations respect preference

**Expected**:
- Animations reduced or removed
- Transitions instant or very short
- No motion-triggered effects

**Implementation needed**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9. Performance Testing

#### Test 9.1: Theme Switch Performance
✅ **Steps**:
1. Open Performance tab in DevTools
2. Record while switching themes
3. Measure time to complete

**Expected**:
- Theme switch: <10ms
- CSS variable update: Instant
- No layout thrashing
- No unnecessary re-renders

#### Test 9.2: Initial Load
✅ **Measure**:
- Time to theme application
- Impact on FCP (First Contentful Paint)
- Impact on LCP (Largest Contentful Paint)

**Expected**:
- Theme applied before first paint
- No FOUC (Flash of Unstyled Content)
- Minimal bundle size impact

### 10. Edge Cases

#### Test 10.1: Invalid Grade Level
✅ **Steps**:
1. Set grade to -1
2. Set grade to 0
3. Set grade to 13
4. Set grade to null

**Expected**:
- Defaults to MS theme
- No errors in console
- Graceful fallback

#### Test 10.2: Missing Theme Data
✅ **Steps**:
1. Clear localStorage
2. Load app without auth
3. Verify default theme

**Expected**:
- MS theme as default
- App functional
- No crashes

#### Test 10.3: Rapid Theme Switching
✅ **Steps**:
1. Click K5, MS, HS rapidly
2. Verify no race conditions
3. Check final state

**Expected**:
- Theme updates correctly
- No visual glitches
- Last click wins

### 11. Browser Compatibility

#### Test 11.1: Chrome
- [ ] All themes work
- [ ] CSS variables supported
- [ ] Animations smooth

#### Test 11.2: Firefox
- [ ] All themes work
- [ ] CSS variables supported
- [ ] Animations smooth

#### Test 11.3: Safari
- [ ] All themes work
- [ ] CSS variables supported
- [ ] Animations smooth

#### Test 11.4: Edge
- [ ] All themes work
- [ ] CSS variables supported
- [ ] Animations smooth

### 12. Integration Testing

#### Test 12.1: Auth Integration
✅ **Steps**:
1. Login as learner with grade
2. Verify theme auto-set
3. Logout
4. Login with different grade
5. Verify theme changed

#### Test 12.2: Profile Update
✅ **Steps**:
1. Update learner grade in profile
2. Verify theme updates
3. Check persistence

#### Test 12.3: Multiple Learners
✅ **Steps**:
1. Login as learner 1 (grade 3)
2. Logout
3. Login as learner 2 (grade 8)
4. Verify theme changed

**Expected**:
- Each learner has their own theme
- Themes don't conflict
- Correct theme per user

## Test Data

### Mock Learner Profiles

```javascript
// K5 Learner
{
  id: 'learner-1',
  name: 'Alex',
  gradeLevel: 3,
  expectedTheme: 'K5'
}

// MS Learner
{
  id: 'learner-2',
  name: 'Jordan',
  gradeLevel: 7,
  expectedTheme: 'MS'
}

// HS Learner
{
  id: 'learner-3',
  name: 'Taylor',
  gradeLevel: 11,
  expectedTheme: 'HS'
}
```

## Automated Testing

### Unit Tests
```typescript
// packages/ui/src/themes/__tests__/learner-themes.test.ts
describe('getThemeByGrade', () => {
  it('returns K5 for grades K-5', () => {
    expect(getThemeByGrade(0)).toBe('K5');
    expect(getThemeByGrade(5)).toBe('K5');
  });
  
  it('returns MS for grades 6-8', () => {
    expect(getThemeByGrade(6)).toBe('MS');
    expect(getThemeByGrade(8)).toBe('MS');
  });
  
  it('returns HS for grades 9-12', () => {
    expect(getThemeByGrade(9)).toBe('HS');
    expect(getThemeByGrade(12)).toBe('HS');
  });
});
```

### Integration Tests
```typescript
// apps/learner-app/src/__tests__/theme-integration.test.tsx
describe('Theme Integration', () => {
  it('applies theme based on user grade', () => {
    // Mock user with grade 3
    // Render app
    // Verify K5 theme applied
  });
});
```

## Bug Report Template

```markdown
**Theme**: K5 / MS / HS
**Page**: Lock / SubjectSelection / etc.
**Browser**: Chrome 120
**Viewport**: 1920x1080

**Expected**:
K5 theme should show large icons (64px)

**Actual**:
Icons are 48px

**Steps to Reproduce**:
1. Switch to K5 theme
2. Navigate to Subject Selection
3. Inspect subject icon

**Screenshots**:
[Attach screenshot]

**Console Errors**:
[Paste any errors]
```

## Sign-Off Checklist

### Theme Functionality
- [ ] All three themes load correctly
- [ ] Theme switching works
- [ ] Theme persistence works
- [ ] Grade-based auto-theming works

### Visual Design
- [ ] K5 theme looks playful and child-friendly
- [ ] MS theme looks modern and engaging
- [ ] HS theme looks professional and efficient
- [ ] All colors match specifications

### Accessibility
- [ ] Font sizes meet WCAG guidelines
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets meet minimum size
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Performance
- [ ] Theme switching is fast (<10ms)
- [ ] No layout shift
- [ ] No performance degradation
- [ ] Minimal bundle size impact

### Browser Compatibility
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works

### Integration
- [ ] Auth integration works
- [ ] Profile updates trigger theme change
- [ ] Multiple learners don't conflict

---

**Testing Complete**: ✅ / ❌
**Tested By**: _____________
**Date**: _____________
**Notes**: _____________
