# Frontend Components Update Guide - Baseline Assessment

**Date:** October 28, 2025  
**Migration:** Prompt 5 - Update frontend for 5 questions per domain and neurodiverse features

## Overview

This document outlines the required updates to the learner-app baseline assessment components to support:
- **5 questions per domain** (30 total questions across 6 domains)
- **Neurodiverse accessibility features** from Prompt 1
- **Enhanced engagement tracking** and break management
- **Improved visual progress indicators**

---

## Files to Update

### 1. **BaselineAssessment.tsx** (Main Container)

**Current State:** Basic assessment flow with minimal accessibility  
**Target State:** Full neurodiverse support with accessibility preferences

**Key Changes:**
```typescript
// Add accessibility state management
const [accessibilityPrefs, setAccessibilityPrefs] = useState<AccessibilityPreferences>(() => {
  const saved = localStorage.getItem('accessibility_prefs');
  return saved ? JSON.parse(saved) : DEFAULT_ACCESSIBILITY_PREFS;
});

// Update constants
const DOMAINS: Domain[] = ['reading', 'math', 'science', 'writing', 'sel', 'speech'];
const ITEMS_PER_DOMAIN = 5;
const TOTAL_ITEMS = 30; // 6 domains × 5 questions

// Add break management
const [showBreakReminder, setShowBreakReminder] = useState(false);
const [isOnBreak, setIsOnBreak] = useState(false);

// Add accessibility panel toggle
const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
```

**New Features:**
- Load/save accessibility preferences from localStorage
- Break reminder every N questions (configurable)
- Accessibility panel overlay
- Color scheme backgrounds
- Focus mode support
- Auto-save session every 30 seconds

---

### 2. **AdaptiveProgress.tsx** (Progress Bar)

**Current State:** Simple linear progress bar  
**Target State:** 6 domain badges with 5 checkboxes each

**Key Changes:**
```typescript
interface AdaptiveProgressProps {
  domains: Domain[];  // Now 6 domains
  currentDomain: Domain;
  domainsCompleted: Domain[];
  itemsAnsweredPerDomain: Record<Domain, number>;
  itemsPerDomain: number;  // Always 5
  abilityEstimates: Partial<Record<Domain, number>>;
  standardErrors: Partial<Record<Domain, number>>;
  preferences: AccessibilityPreferences;  // NEW
}
```

**Visual Design:**
- Grid layout: 2 columns (mobile), 3 (tablet), 6 (desktop)
- Each domain shows:
  - Icon emoji (📚, 🔢, 🔬, ✍️, ❤️, 🗣️)
  - Domain label
  - 5 small checkboxes (filled when answered)
  - Count (e.g., "3/5")
  - Completion badge (⭐ or ✅)
  - Ability score (if completed)

**Responsive Font Sizes:**
```typescript
const getFontSizeClass = () => {
  const sizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };
  return sizes[preferences.fontSize];
};
```

---

### 3. **DomainTransition.tsx** (Transition Screen)

**Current State:** Basic transition message  
**Target State:** Celebration + breathing exercise option

**Key Changes:**
```typescript
interface DomainTransitionProps {
  completedDomain: Domain;
  nextDomain: Domain;
  completedDomainScore: number;
  questionsCompleted: number;  // Should be 5
  totalQuestionsInDomain: number;  // Always 5
  onContinue: () => void;
  allowSkip: boolean;
  gradeBand: GradeBand;
  preferences: AccessibilityPreferences;  // NEW
}
```

**New Features:**
- Breathing exercise animation (optional)
  - 3 cycles: breathe in (4s) → hold (2s) → breathe out (4s)
  - Animated circle grows/shrinks
  - Age-appropriate instructions
- Domain-specific color schemes
- Motivational messages by grade band
- Auto-continue countdown (if allowSkip=true)
- Celebration messages based on score

---

### 4. **BreakReminder.tsx** (Already Created in Prompt 1)

**Location:** `apps/learner-app/src/components/baseline/BreakReminder.tsx`  
**Status:** ✅ Already implemented with breathing exercises

**Integration Points:**
```typescript
// In BaselineAssessment.tsx
useEffect(() => {
  if (!accessibilityPrefs.breakReminders || isOnBreak) return;
  const questionsCompleted = session.itemsAnswered;
  const breakInterval = accessibilityPrefs.breakInterval || 15;
  if (questionsCompleted > 0 && questionsCompleted % breakInterval === 0) {
    setShowBreakReminder(true);
  }
}, [session.itemsAnswered]);
```

---

### 5. **AccessibilityPanel.tsx** (Already Created in Prompt 1)

**Location:** `apps/learner-app/src/components/baseline/AccessibilityPanel.tsx`  
**Status:** ✅ Already implemented

**Integration Points:**
```typescript
<AccessibilityPanel
  preferences={accessibilityPrefs}
  onPreferencesChange={handleAccessibilityChange}
  isOpen={accessibilityPanelOpen}
  onToggle={() => setAccessibilityPanelOpen(!accessibilityPanelOpen)}
/>
```

---

## Implementation Steps

### Step 1: Update Type Definitions
Ensure `types/accessibility.ts` and `types/baseline.ts` are up to date with:
- `AccessibilityPreferences` interface
- `EngagementMetrics` interface with `confidenceRatings: number[]`
- `Domain` type includes 'speech'

### Step 2: Update BaselineAssessment.tsx
1. Import accessibility components
2. Add accessibility state management
3. Update DOMAINS constant to include 'speech'
4. Set ITEMS_PER_DOMAIN = 5, TOTAL_ITEMS = 30
5. Add break reminder logic
6. Add accessibility panel toggle
7. Update background classes based on color scheme
8. Add "Take a Break" floating button

### Step 3: Update AdaptiveProgress.tsx
1. Change layout from linear bar to grid of domain badges
2. Show 5 checkboxes per domain instead of progress bar
3. Add domain icons and labels
4. Apply font size preferences
5. Add milestone celebrations (25%, 50%, 75%)
6. Show ability estimates if completed

### Step 4: Update DomainTransition.tsx
1. Add breathing exercise state machine
2. Add celebration messages by grade band
3. Apply color scheme preferences
4. Add "Take 3 Deep Breaths" button
5. Add auto-continue countdown
6. Apply font size preferences

### Step 5: Update ItemRenderer.tsx (If Needed)
Ensure it accepts and uses `preferences` prop:
```typescript
interface ItemRendererProps {
  item: BaselineItem;
  onSubmit: (response: Partial<ItemResponse>) => void;
  preferences: AccessibilityPreferences;  // Use this
  questionNumber: number;
  totalQuestions: number;
}
```

---

## Testing Checklist

- [ ] All 6 domains display in progress bar
- [ ] Each domain shows 5 checkboxes
- [ ] Break reminder appears at configured intervals
- [ ] Accessibility panel opens/closes correctly
- [ ] Font size changes apply everywhere
- [ ] Color scheme changes background
- [ ] Reduce animations works
- [ ] Focus mode hides UI elements
- [ ] Breathing exercise animates correctly
- [ ] Domain transitions show correct scores
- [ ] Session auto-saves to localStorage
- [ ] Break time doesn't count toward assessment time
- [ ] Assessment completes after 30 questions
- [ ] All accessibility preferences persist

---

## API Integration Notes

When ready to connect to backend:

```typescript
// Start session with preferences
const response = await fetch('/api/v1/baseline/start-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    learner_id: learnerId,
    grade_band: gradeBand,
    accessibility_preferences: accessibilityPrefs
  })
});

// Submit response with engagement metrics
const response = await fetch('/api/v1/baseline/submit-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    item_id: itemId,
    response: { selectedOptions },
    engagement_metrics: {
      hesitationCount,
      usedHint,
      usedReadAloud,
      confidenceLevel,
      focusLevel,
      timeSpentMs
    },
    time_started: startTime.toISOString(),
    time_submitted: new Date().toISOString()
  })
});
```

---

## Summary of Changes

| Component | Lines Changed | New Features |
|-----------|--------------|--------------|
| BaselineAssessment.tsx | ~200 | Accessibility preferences, breaks, auto-save |
| AdaptiveProgress.tsx | ~150 | 6-domain grid layout, checkboxes, celebrations |
| DomainTransition.tsx | ~100 | Breathing exercise, grade-based messaging |
| ItemRenderer.tsx | ~50 | Preferences integration |
| **TOTAL** | **~500 lines** | **Full neurodiverse support** |

---

## Color Scheme Reference

```typescript
const colorSchemes = {
  'calm-blue': {
    bg: 'from-blue-50 via-blue-100 to-cyan-50',
    accent: 'blue-500',
    text: 'blue-700'
  },
  'soft-green': {
    bg: 'from-green-50 via-emerald-100 to-teal-50',
    accent: 'green-500',
    text: 'green-700'
  },
  'warm-purple': {
    bg: 'from-purple-50 via-pink-100 to-violet-50',
    accent: 'purple-500',
    text: 'purple-700'
  },
  'neutral-gray': {
    bg: 'from-gray-50 via-slate-100 to-gray-50',
    accent: 'gray-500',
    text: 'gray-700'
  }
};
```

---

## Next Steps

1. ✅ Database migrations created (035 & 036)
2. ✅ API endpoints updated with neurodiverse support
3. ⏳ Update frontend components (this document)
4. ⏳ Test end-to-end with real API
5. ⏳ User acceptance testing with neurodiverse learners

---

**Status:** Ready for implementation  
**Estimated Time:** 4-6 hours for full integration  
**Priority:** High - Required for neurodiverse learner support
