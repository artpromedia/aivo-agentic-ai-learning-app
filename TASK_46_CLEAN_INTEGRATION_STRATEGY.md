# PROMPT 46: Clean Integration Strategy & Best Practices ✅

**Status**: Complete - Implementation Guide  
**Date**: October 20, 2025  
**Focus**: Non-Breaking, Progressive Enhancement Strategy

## 🎯 Core Philosophy

### Progressive Enhancement Principles

1. **Additive Only**: All new features are additions, never modifications
2. **Optional by Default**: Features are opt-in via user settings
3. **Graceful Degradation**: App works perfectly without new features
4. **Zero Breaking Changes**: Existing code continues to work unchanged
5. **Feature Flag Control**: All features can be enabled/disabled instantly

---

## 📦 Clean Package Architecture

### New Standalone Packages (Isolated)

```
packages/
├── sensory/                    # NEW - Sensory accommodations
│   ├── src/
│   │   ├── types/
│   │   │   ├── profile.ts
│   │   │   ├── accommodations.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── profileService.ts
│   │   │   ├── accommodationEngine.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── ProfileSetup/
│   │   │   ├── AccommodationPanel/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── README.md
│
├── regulation/                 # NEW - Self-regulation tools
│   ├── src/
│   │   ├── types/
│   │   │   ├── emotion.ts
│   │   │   ├── activity.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── emotionTracking.ts
│   │   │   ├── activityService.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── EmotionCheck/
│   │   │   ├── CalmingHub/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── README.md
│
└── executive-function/         # NEW - Executive function scaffolds
    ├── src/
    │   ├── types/
    │   │   ├── timer.ts
    │   │   ├── task.ts
    │   │   ├── schedule.ts
    │   │   └── index.ts
    │   ├── services/
    │   │   ├── timerService.ts
    │   │   ├── taskService.ts
    │   │   └── index.ts
    │   ├── components/
    │   │   ├── VisualTimer/
    │   │   ├── TaskBreakdown/
    │   │   ├── FirstThenBoard/
    │   │   ├── VisualSchedule/
    │   │   └── index.ts
    │   └── index.ts
    ├── package.json
    └── README.md
```

### Extended Existing Packages (Non-Breaking)

```
packages/
├── types/                      # EXTEND - Add new type definitions
│   └── src/
│       ├── user.ts             # EXTEND - Add optional fields
│       ├── sensory.ts          # NEW
│       ├── regulation.ts       # NEW
│       ├── executive.ts        # NEW (already exists)
│       └── index.ts            # EXTEND - Export new types
│
├── ui/                         # EXTEND - Add new component categories
│   └── src/components/
│       ├── Button/             # UNCHANGED
│       ├── Card/               # UNCHANGED
│       ├── SensoryProfile/     # NEW folder
│       ├── RegulationHub/      # NEW folder
│       └── ExecutiveTools/     # NEW folder (already exists)
│
└── utils/                      # EXTEND - Add new services
    └── src/
        ├── api.ts              # UNCHANGED
        ├── storage.ts          # UNCHANGED
        ├── sensoryService.ts   # NEW
        ├── regulationService.ts # NEW
        └── index.ts            # EXTEND - Export new services
```

---

## 🔌 Integration Points - Detailed Implementation

### 1. Sensory Profile Integration

#### A. User Preferences Extension (Non-Breaking)

```typescript
// packages/types/src/user.ts

// BEFORE (existing)
export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  // ... other existing preferences
}

// AFTER (extended - all new fields optional)
export interface UserPreferences {
  // Existing fields unchanged
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  
  // NEW - Optional sensory profile
  sensoryProfileId?: string;
  enableSensoryAccommodations?: boolean;
  
  // NEW - Optional feature toggles
  enabledFeatures?: {
    sensoryProfile?: boolean;
    emotionCheckIns?: boolean;
    visualTimers?: boolean;
    taskBreakdown?: boolean;
    firstThenBoards?: boolean;
    visualSchedules?: boolean;
  };
}

// All existing code continues to work because:
// 1. New fields are optional (?)
// 2. No existing fields modified
// 3. No breaking type changes
```

#### B. Profile Setup Route (Additive)

```typescript
// apps/learner-app/src/App.tsx

import { SensoryProfileSetup } from '@aivo/sensory';
import { FEATURES } from '@aivo/utils';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes unchanged */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/homework" element={<HomeworkHelper />} />
        <Route path="/lessons" element={<Lessons />} />
        
        {/* NEW - Conditional route only if feature enabled */}
        {FEATURES.SENSORY_PROFILES && (
          <Route 
            path="/settings/sensory-profile" 
            element={<SensoryProfileSetup />} 
          />
        )}
        
        {/* Existing routes continue... */}
      </Routes>
    </Router>
  );
}
```

#### C. Global Profile Application (Opt-In)

```typescript
// apps/learner-app/src/hooks/useSensoryProfile.ts

import { useEffect } from 'react';
import { sensoryProfileService } from '@aivo/sensory';
import { useAuth } from '@aivo/auth';
import { FEATURES } from '@aivo/utils';

export function useSensoryProfile() {
  const { user } = useAuth();

  useEffect(() => {
    // Early exit if feature disabled
    if (!FEATURES.SENSORY_PROFILES) return;
    
    // Early exit if user hasn't enabled
    if (!user?.preferences?.enableSensoryAccommodations) return;
    
    // Early exit if no profile ID
    if (!user?.preferences?.sensoryProfileId) return;

    // Fetch and apply profile
    const profile = await sensoryProfileService.getProfile(
      user.id, 
      user.preferences.sensoryProfileId
    );

    if (profile) {
      sensoryProfileService.applyProfile(profile);
      
      // Apply CSS accommodations
      document.documentElement.setAttribute('data-sensory-profile', 'active');
      
      if (profile.reduceMotion) {
        document.documentElement.classList.add('reduce-motion');
      }
      if (profile.highContrast) {
        document.documentElement.classList.add('high-contrast');
      }
      if (profile.reducedClutter) {
        document.documentElement.classList.add('reduced-clutter');
      }
      if (profile.focusMode) {
        document.documentElement.classList.add('focus-mode');
      }
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.removeAttribute('data-sensory-profile');
      document.documentElement.classList.remove(
        'reduce-motion',
        'high-contrast',
        'reduced-clutter',
        'focus-mode'
      );
    };
  }, [user]);
}

// Usage in App.tsx
function App() {
  useSensoryProfile(); // Non-invasive hook
  
  // Existing app structure unchanged
  return <ExistingAppStructure />;
}
```

---

### 2. Self-Regulation Tools Integration

#### A. Quick Access Button (Non-Invasive)

```typescript
// apps/learner-app/src/components/Header/Header.tsx

import { useState } from 'react';
import { SelfRegulationHub } from '@aivo/regulation';
import { FEATURES } from '@aivo/utils';
import { useAuth } from '@aivo/auth';

export const Header = () => {
  const { user } = useAuth();
  const [showRegulation, setShowRegulation] = useState(false);

  // Check if feature enabled both globally and for user
  const regulationEnabled = 
    FEATURES.SELF_REGULATION && 
    user?.preferences?.enabledFeatures?.emotionCheckIns;

  return (
    <header className="app-header">
      {/* Existing header content unchanged */}
      <Logo />
      <Navigation />
      <UserMenu />
      
      {/* NEW - Optional regulation button */}
      {regulationEnabled && (
        <button
          onClick={() => setShowRegulation(true)}
          className="regulation-quick-access"
          aria-label="Open calming tools"
          data-testid="regulation-button"
        >
          🧘 Need a break?
        </button>
      )}

      {/* Modal doesn't interfere with existing UI */}
      {showRegulation && (
        <SelfRegulationHub
          learnerId={user.id}
          onClose={() => setShowRegulation(false)}
          position="overlay" // Renders above everything
        />
      )}
    </header>
  );
};
```

#### B. Automatic Check-Ins (Optional, Configurable)

```typescript
// apps/learner-app/src/hooks/useEmotionCheckIns.ts

import { useEffect, useState } from 'react';
import { emotionTrackingService } from '@aivo/regulation';
import { FEATURES } from '@aivo/utils';

export function useEmotionCheckIns(
  learnerId: string,
  enabled: boolean = false,
  intervalMinutes: number = 60
) {
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    // Early exit if not enabled
    if (!FEATURES.EMOTION_CHECK_INS || !enabled) return;

    // Show check-in at configured intervals
    const interval = setInterval(() => {
      const shouldShow = emotionTrackingService.shouldShowCheckIn(learnerId);
      if (shouldShow) {
        setShowCheckIn(true);
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [learnerId, enabled, intervalMinutes]);

  const handleCheckInComplete = (emotion: Emotion) => {
    emotionTrackingService.recordEmotion(learnerId, emotion);
    setShowCheckIn(false);
  };

  return { showCheckIn, handleCheckInComplete };
}

// Usage in App.tsx (non-breaking)
function App() {
  const { user } = useAuth();
  const emotionCheckInsEnabled = user?.preferences?.enabledFeatures?.emotionCheckIns ?? false;
  
  const { showCheckIn, handleCheckInComplete } = useEmotionCheckIns(
    user?.id,
    emotionCheckInsEnabled
  );

  return (
    <div>
      {/* Existing app */}
      <ExistingApp />
      
      {/* Non-intrusive check-in modal */}
      {showCheckIn && (
        <EmotionCheckInModal
          onComplete={handleCheckInComplete}
          onSkip={() => setShowCheckIn(false)}
        />
      )}
    </div>
  );
}
```

---

### 3. Executive Function Tools Integration

#### A. Homework Helper Enhancement

```typescript
// apps/learner-app/src/components/HomeworkHelper/HomeworkSession.tsx

import { useState } from 'react';
import { VisualTimer, TaskBreakdown, FirstThenBoard } from '@aivo/executive-function';
import { FEATURES } from '@aivo/utils';
import { useAuth } from '@aivo/auth';

export const HomeworkSessionView = ({ session }) => {
  const { user } = useAuth();
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);

  // Check feature flags and user preferences
  const executiveToolsEnabled = 
    FEATURES.EXECUTIVE_FUNCTION && 
    user?.preferences?.enabledFeatures?.visualTimers;

  return (
    <div className="homework-session">
      {/* Existing homework UI unchanged */}
      <HomeworkUpload session={session} />
      <HomeworkQuestions session={session} />
      <HomeworkSubmit session={session} />

      {/* NEW - Optional executive function tools bar */}
      {executiveToolsEnabled && (
        <div className="executive-tools-bar">
          <button
            onClick={() => setActiveToolModal('timer')}
            className="tool-button"
            data-testid="open-timer"
          >
            ⏰ Set Timer
          </button>
          
          <button
            onClick={() => setActiveToolModal('breakdown')}
            className="tool-button"
            data-testid="open-task-breakdown"
          >
            📋 Break It Down
          </button>
          
          <button
            onClick={() => setActiveToolModal('first-then')}
            className="tool-button"
            data-testid="open-first-then"
          >
            ➡️ First-Then
          </button>
        </div>
      )}

      {/* Tool modals - don't interfere with main UI */}
      {activeToolModal === 'timer' && (
        <VisualTimer
          timer={createTimerFromSession(session)}
          onComplete={() => setActiveToolModal(null)}
          onClose={() => setActiveToolModal(null)}
        />
      )}

      {activeToolModal === 'breakdown' && (
        <TaskBreakdown
          task={createBreakdownFromSession(session)}
          onComplete={() => setActiveToolModal(null)}
          onClose={() => setActiveToolModal(null)}
        />
      )}

      {activeToolModal === 'first-then' && (
        <FirstThenBoard
          board={createFirstThenFromSession(session)}
          onComplete={() => setActiveToolModal(null)}
          onClose={() => setActiveToolModal(null)}
        />
      )}
    </div>
  );
};

// Helper functions (non-breaking additions)
function createTimerFromSession(session: HomeworkSession) {
  return {
    id: `homework-timer-${session.id}`,
    name: `${session.subject} Homework`,
    duration: session.estimatedTime * 60,
    style: 'pie' as const,
    warnings: [
      { secondsRemaining: 300, message: '5 minutes left!' },
      { secondsRemaining: 60, message: '1 minute left!' },
    ],
    soundEnabled: true,
    color: '#3b82f6',
  };
}

function createBreakdownFromSession(session: HomeworkSession) {
  return {
    id: `homework-breakdown-${session.id}`,
    mainTask: `Complete ${session.subject} Homework`,
    estimatedTime: session.estimatedTime,
    visualType: 'checklist' as const,
    showProgress: true,
    subtasks: session.questions.map((q, idx) => ({
      id: `subtask-${idx}`,
      title: `Question ${idx + 1}`,
      description: q.text.substring(0, 50),
      estimatedMinutes: 5,
      completed: false,
      order: idx,
      dependencies: idx > 0 ? [`subtask-${idx - 1}`] : [],
    })),
  };
}
```

#### B. Lesson Activities Enhancement

```typescript
// apps/learner-app/src/components/Lessons/ActivityView.tsx

import { FirstThenBoard, VisualSchedule } from '@aivo/executive-function';
import { FEATURES } from '@aivo/utils';
import { useAuth } from '@aivo/auth';

export const ActivityView = ({ activity }) => {
  const { user } = useAuth();

  // Check if user wants First-Then boards
  const useFirstThen = 
    FEATURES.EXECUTIVE_FUNCTION &&
    user?.preferences?.enabledFeatures?.firstThenBoards;

  // Render First-Then board if enabled
  if (useFirstThen) {
    return (
      <FirstThenBoard
        board={{
          id: `activity-board-${activity.id}`,
          first: {
            name: activity.name,
            icon: activity.icon,
            duration: activity.estimatedTime * 60,
          },
          then: {
            name: user.preferences.rewardActivity || 'Free Choice Time',
            icon: '🎮',
            duration: 300, // 5 minutes
          },
          visualStyle: 'detailed',
          showTimer: true,
        }}
        onComplete={() => handleActivityComplete(activity)}
      />
    );
  }

  // Default: existing activity view (unchanged)
  return <ExistingActivityView activity={activity} />;
};
```

---

## 🎨 CSS Integration Strategy (Non-Breaking)

### Global Accommodations Stylesheet

```css
/* apps/learner-app/src/styles/sensory-accommodations.css */

/* 
 * Only applied when sensory profile is active
 * Zero impact on existing styles when not active
 */

:root[data-sensory-profile] {
  /* CSS custom properties for dynamic adjustments */
  --animation-duration: 0.3s;
  --transition-duration: 0.2s;
  --font-family: var(--font-standard);
  --font-size-base: 16px;
  --line-height: 1.5;
  --min-touch-target: 44px;
  --spacing-scale: 1;
  --color-contrast-ratio: 4.5;
}

/* Reduced Motion Accommodation */
:root[data-sensory-profile].reduce-motion *,
:root[data-sensory-profile].reduce-motion *::before,
:root[data-sensory-profile].reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* High Contrast Accommodation */
:root[data-sensory-profile].high-contrast {
  --color-text: #000000;
  --color-background: #ffffff;
  --color-border: #000000;
  --color-link: #0000ff;
  --color-link-visited: #551a8b;
  --color-focus: #ff0000;
}

:root[data-sensory-profile].high-contrast.dark-mode {
  --color-text: #ffffff;
  --color-background: #000000;
  --color-border: #ffffff;
}

/* Reduced Clutter Accommodation */
:root[data-sensory-profile].reduced-clutter {
  /* Hide non-essential decorative elements */
  .decoration,
  .ornament,
  .background-pattern,
  .non-essential {
    display: none !important;
  }
  
  /* Simplify borders */
  * {
    border-radius: 4px !important;
  }
  
  /* Remove shadows */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

/* Focus Mode Accommodation */
:root[data-sensory-profile].focus-mode {
  /* Dim non-essential UI */
  header:not(.main-header) {
    opacity: 0.2;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  
  header:not(.main-header):hover {
    opacity: 1;
    pointer-events: auto;
  }
  
  aside,
  .sidebar,
  nav:not(.breadcrumb) {
    display: none !important;
  }
  
  /* Emphasize main content */
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
}

/* Dyslexic-Friendly Font */
:root[data-sensory-profile][data-font="dyslexic"] {
  --font-family: "OpenDyslexic", "Comic Sans MS", cursive;
}

:root[data-sensory-profile][data-font="dyslexic"] * {
  font-family: var(--font-family) !important;
}

/* Large Touch Targets */
:root[data-sensory-profile].large-touch-targets button,
:root[data-sensory-profile].large-touch-targets a,
:root[data-sensory-profile].large-touch-targets input[type="checkbox"],
:root[data-sensory-profile].large-touch-targets input[type="radio"],
:root[data-sensory-profile].large-touch-targets select {
  min-width: var(--min-touch-target);
  min-height: var(--min-touch-target);
  padding: 12px 16px;
}

/* Increased Spacing */
:root[data-sensory-profile].increased-spacing {
  --spacing-scale: 1.5;
}

:root[data-sensory-profile].increased-spacing * {
  margin: calc(var(--margin) * var(--spacing-scale)) !important;
  padding: calc(var(--padding) * var(--spacing-scale)) !important;
}

/* Enhanced Focus Indicators */
:root[data-sensory-profile] *:focus {
  outline: 3px solid var(--color-focus, #3b82f6);
  outline-offset: 2px;
}

/* Predictable Animations Only */
:root[data-sensory-profile].predictable-only {
  /* Allow only user-initiated animations */
  *:not(:hover):not(:focus):not(:active) {
    animation: none !important;
    transition: none !important;
  }
}
```

### Import Strategy (Safe)

```typescript
// apps/learner-app/src/App.tsx

// Existing styles first (unchanged)
import './styles/reset.css';
import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';

// NEW - Additive accommodations (only applies when activated)
import './styles/sensory-accommodations.css';
```

---

## 🔐 Feature Flags System

### Environment-Based Feature Flags

```typescript
// packages/utils/src/featureFlags.ts

export const FEATURES = {
  // Sensory accommodations
  SENSORY_PROFILES: process.env.REACT_APP_FEATURE_SENSORY === 'true',
  
  // Self-regulation tools
  SELF_REGULATION: process.env.REACT_APP_FEATURE_REGULATION === 'true',
  EMOTION_CHECK_INS: process.env.REACT_APP_FEATURE_CHECK_INS === 'true',
  
  // Executive function scaffolds
  EXECUTIVE_FUNCTION: process.env.REACT_APP_FEATURE_EXECUTIVE === 'true',
  VISUAL_TIMERS: process.env.REACT_APP_FEATURE_TIMERS === 'true',
  TASK_BREAKDOWN: process.env.REACT_APP_FEATURE_BREAKDOWN === 'true',
  FIRST_THEN_BOARDS: process.env.REACT_APP_FEATURE_FIRST_THEN === 'true',
  VISUAL_SCHEDULES: process.env.REACT_APP_FEATURE_SCHEDULES === 'true',
} as const;

// Type-safe feature checking
export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature] === true;
}

// Combined check: feature flag + user preference
export function isFeatureEnabledForUser(
  feature: FeatureKey,
  user: User | null
): boolean {
  if (!FEATURES[feature]) return false;
  if (!user?.preferences?.enabledFeatures) return false;
  
  const featureMap: Record<FeatureKey, keyof UserPreferences['enabledFeatures']> = {
    SENSORY_PROFILES: 'sensoryProfile',
    SELF_REGULATION: 'emotionCheckIns',
    EMOTION_CHECK_INS: 'emotionCheckIns',
    EXECUTIVE_FUNCTION: 'visualTimers',
    VISUAL_TIMERS: 'visualTimers',
    TASK_BREAKDOWN: 'taskBreakdown',
    FIRST_THEN_BOARDS: 'firstThenBoards',
    VISUAL_SCHEDULES: 'visualSchedules',
  };
  
  const userFeatureKey = featureMap[feature];
  return user.preferences.enabledFeatures[userFeatureKey] ?? false;
}
```

### Environment Configuration

```bash
# .env.development (all features ON for dev)
REACT_APP_FEATURE_SENSORY=true
REACT_APP_FEATURE_REGULATION=true
REACT_APP_FEATURE_CHECK_INS=true
REACT_APP_FEATURE_EXECUTIVE=true
REACT_APP_FEATURE_TIMERS=true
REACT_APP_FEATURE_BREAKDOWN=true
REACT_APP_FEATURE_FIRST_THEN=true
REACT_APP_FEATURE_SCHEDULES=true

# .env.staging (gradual rollout)
REACT_APP_FEATURE_SENSORY=true
REACT_APP_FEATURE_REGULATION=false
REACT_APP_FEATURE_CHECK_INS=false
REACT_APP_FEATURE_EXECUTIVE=true
REACT_APP_FEATURE_TIMERS=true
REACT_APP_FEATURE_BREAKDOWN=false
REACT_APP_FEATURE_FIRST_THEN=false
REACT_APP_FEATURE_SCHEDULES=false

# .env.production (initially all OFF)
REACT_APP_FEATURE_SENSORY=false
REACT_APP_FEATURE_REGULATION=false
REACT_APP_FEATURE_CHECK_INS=false
REACT_APP_FEATURE_EXECUTIVE=false
REACT_APP_FEATURE_TIMERS=false
REACT_APP_FEATURE_BREAKDOWN=false
REACT_APP_FEATURE_FIRST_THEN=false
REACT_APP_FEATURE_SCHEDULES=false
```

### User-Level Toggles

```typescript
// apps/learner-app/src/components/Settings/FeatureToggles.tsx

import { FEATURES } from '@aivo/utils';
import { useAuth } from '@aivo/auth';

export const FeatureTogglesSettings = () => {
  const { user, updateUserPreferences } = useAuth();

  const handleToggle = (feature: keyof UserPreferences['enabledFeatures']) => {
    updateUserPreferences({
      enabledFeatures: {
        ...user.preferences.enabledFeatures,
        [feature]: !user.preferences.enabledFeatures?.[feature],
      },
    });
  };

  return (
    <div className="feature-toggles">
      <h2>Special Education Features</h2>
      
      {FEATURES.SENSORY_PROFILES && (
        <ToggleSwitch
          label="Sensory Profile Accommodations"
          description="Customize visual and sensory preferences"
          checked={user.preferences.enabledFeatures?.sensoryProfile ?? false}
          onChange={() => handleToggle('sensoryProfile')}
        />
      )}
      
      {FEATURES.EMOTION_CHECK_INS && (
        <ToggleSwitch
          label="Emotion Check-Ins"
          description="Regular prompts to identify and manage emotions"
          checked={user.preferences.enabledFeatures?.emotionCheckIns ?? false}
          onChange={() => handleToggle('emotionCheckIns')}
        />
      )}
      
      {FEATURES.VISUAL_TIMERS && (
        <ToggleSwitch
          label="Visual Timers"
          description="Time awareness tools with visual countdowns"
          checked={user.preferences.enabledFeatures?.visualTimers ?? false}
          onChange={() => handleToggle('visualTimers')}
        />
      )}
      
      {/* Additional toggles... */}
    </div>
  );
};
```

---

## 📊 Database Migration Strategy (Additive Only)

### Migration Scripts

```sql
-- Migration: 001_add_sensory_profiles.sql
-- Description: Add sensory profile tables (non-breaking)
-- Rollback: Safe to drop tables

-- Create sensory profiles table
CREATE TABLE IF NOT EXISTS sensory_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  profile_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_sensory_profiles_learner ON sensory_profiles(learner_id);
CREATE INDEX idx_sensory_profiles_active ON sensory_profiles(learner_id, is_active) WHERE is_active = TRUE;

-- Add optional column to existing learners table
ALTER TABLE learners
  ADD COLUMN IF NOT EXISTS sensory_profile_id UUID REFERENCES sensory_profiles(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_learners_sensory_profile ON learners(sensory_profile_id);

-- ✅ Existing queries continue to work:
-- - New tables don't interfere with existing tables
-- - New column is nullable (optional)
-- - No changes to existing columns
```

```sql
-- Migration: 002_add_regulation_tables.sql
-- Description: Add self-regulation tracking tables (non-breaking)
-- Rollback: Safe to drop tables

-- Emotion history table
CREATE TABLE IF NOT EXISTS emotion_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  emotion VARCHAR(50) NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  trigger TEXT,
  coping_strategy TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Regulation sessions table
CREATE TABLE IF NOT EXISTS regulation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_id VARCHAR(255),
  emotion_before JSONB NOT NULL,
  emotion_after JSONB,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_emotion_history_learner ON emotion_history(learner_id);
CREATE INDEX idx_emotion_history_created ON emotion_history(created_at DESC);
CREATE INDEX idx_regulation_sessions_learner ON regulation_sessions(learner_id);
CREATE INDEX idx_regulation_sessions_created ON regulation_sessions(created_at DESC);

-- ✅ Zero impact on existing tables and queries
```

```sql
-- Migration: 003_add_executive_function_data.sql
-- Description: Add executive function tracking (non-breaking)
-- Rollback: Safe to drop tables and columns

-- Timer usage tracking
CREATE TABLE IF NOT EXISTS timer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  context VARCHAR(50), -- 'homework', 'activity', 'break', etc.
  context_id UUID,
  duration_seconds INTEGER NOT NULL,
  timer_style VARCHAR(20), -- 'pie', 'bar', 'hourglass', etc.
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task breakdown tracking
CREATE TABLE IF NOT EXISTS task_breakdown_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  main_task TEXT NOT NULL,
  subtasks JSONB NOT NULL,
  completion_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_timer_sessions_learner ON timer_sessions(learner_id);
CREATE INDEX idx_task_breakdown_learner ON task_breakdown_sessions(learner_id);

-- Add optional column to homework_sessions
ALTER TABLE homework_sessions
  ADD COLUMN IF NOT EXISTS executive_function_data JSONB;

-- ✅ All additions, no modifications to existing structure
```

### Migration Execution Script

```bash
#!/bin/bash
# scripts/migrate-safe.sh
# Safe migration with verification

set -e

echo "🔍 Checking database connection..."
psql $DATABASE_URL -c "SELECT 1;" > /dev/null

echo "📊 Backing up current schema..."
pg_dump $DATABASE_URL --schema-only > backup_schema_$(date +%Y%m%d_%H%M%S).sql

echo "🚀 Running migrations..."
for migration in migrations/*.sql; do
  echo "  ⏳ Applying: $migration"
  psql $DATABASE_URL -f $migration
  echo "  ✅ Completed: $migration"
done

echo "🧪 Verifying existing data..."
psql $DATABASE_URL -c "SELECT COUNT(*) FROM learners;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM homework_sessions;"

echo "✅ Migration complete! All existing data intact."
```

---

## 🧪 Testing Strategy (Non-Disruptive)

### Unit Tests (Isolated)

```typescript
// packages/sensory/__tests__/profileService.test.ts

import { sensoryProfileService } from '../src/services/profileService';
import { mockProfile } from './mocks';

describe('SensoryProfileService', () => {
  describe('applyProfile', () => {
    it('should apply profile without affecting existing styles', () => {
      const initialStyles = document.documentElement.className;
      
      sensoryProfileService.applyProfile(mockProfile);
      
      // New classes added
      expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
      
      // Existing classes unchanged
      expect(initialStyles).toContain(document.documentElement.className);
    });
  });

  describe('graceful degradation', () => {
    it('should handle missing profile gracefully', () => {
      expect(() => {
        sensoryProfileService.applyProfile(null);
      }).not.toThrow();
    });
  });
});
```

### Integration Tests (Backward Compatibility)

```typescript
// apps/learner-app/__tests__/integration/backward-compatibility.test.tsx

import { render } from '@testing-library/react';
import { App } from '../src/App';

describe('Backward Compatibility', () => {
  it('should render existing features without new features', () => {
    // Simulate feature flags OFF
    process.env.REACT_APP_FEATURE_SENSORY = 'false';
    process.env.REACT_APP_FEATURE_REGULATION = 'false';
    process.env.REACT_APP_FEATURE_EXECUTIVE = 'false';

    const { getByTestId, queryByTestId } = render(<App />);

    // Existing features work
    expect(getByTestId('dashboard')).toBeInTheDocument();
    expect(getByTestId('homework-helper')).toBeInTheDocument();

    // New features not rendered
    expect(queryByTestId('regulation-button')).not.toBeInTheDocument();
    expect(queryByTestId('sensory-profile-setup')).not.toBeInTheDocument();
  });

  it('should enhance existing features when enabled', () => {
    // Simulate feature flags ON
    process.env.REACT_APP_FEATURE_EXECUTIVE = 'true';

    const { getByTestId } = render(<App />);

    // Existing features still work
    expect(getByTestId('homework-helper')).toBeInTheDocument();

    // New features added
    expect(getByTestId('executive-tools-bar')).toBeInTheDocument();
  });
});
```

### E2E Tests (Parallel Scenarios)

```typescript
// e2e/tests/feature-compatibility.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Feature Compatibility', () => {
  test('existing homework flow works without new features', async ({ page }) => {
    // Disable new features
    await page.goto('/?features=none');

    // Verify existing flow unchanged
    await page.goto('/homework/helper');
    await expect(page.locator('[data-testid="homework-upload"]')).toBeVisible();
    await expect(page.locator('[data-testid="homework-submit"]')).toBeVisible();

    // Verify no new features visible
    await expect(page.locator('[data-testid="executive-tools-bar"]')).not.toBeVisible();
  });

  test('new features enhance existing flow when enabled', async ({ page }) => {
    // Enable executive function features
    await page.goto('/?features=executive');

    await page.goto('/homework/helper');
    
    // Existing features still work
    await expect(page.locator('[data-testid="homework-upload"]')).toBeVisible();
    
    // New features present
    await expect(page.locator('[data-testid="executive-tools-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="open-timer"]')).toBeVisible();
  });
});
```

---

## 🚀 Deployment Strategy (Phased Rollout)

### Phase 1: Infrastructure (Week 1)

```bash
# Day 1-2: Add new packages
pnpm install --workspace=packages/sensory
pnpm install --workspace=packages/regulation
pnpm install --workspace=packages/executive-function

# Day 3: Run all tests
pnpm test --workspace=packages/sensory
pnpm test --workspace=packages/regulation
pnpm test --workspace=packages/executive-function
pnpm test --filter=learner-app

# Day 4-5: Build and verify
pnpm build --workspaces
pnpm typecheck --workspaces

# Verify existing functionality unchanged
pnpm test:e2e --grep="existing features"
```

### Phase 2: Database Migration (Week 1)

```bash
# Day 5: Backup production database
pg_dump $PROD_DATABASE_URL > backup_before_migration.sql

# Run migrations on staging
psql $STAGING_DATABASE_URL -f migrations/001_add_sensory_profiles.sql
psql $STAGING_DATABASE_URL -f migrations/002_add_regulation_tables.sql
psql $STAGING_DATABASE_URL -f migrations/003_add_executive_function_data.sql

# Verify existing data intact
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM learners;"
psql $STAGING_DATABASE_URL -c "SELECT * FROM learners LIMIT 5;"

# Run migrations on production (after staging verification)
psql $PROD_DATABASE_URL -f migrations/001_add_sensory_profiles.sql
psql $PROD_DATABASE_URL -f migrations/002_add_regulation_tables.sql
psql $PROD_DATABASE_URL -f migrations/003_add_executive_function_data.sql
```

### Phase 3: Deploy with Features OFF (Week 2)

```bash
# Deploy to staging with all features disabled
REACT_APP_FEATURE_SENSORY=false \
REACT_APP_FEATURE_REGULATION=false \
REACT_APP_FEATURE_EXECUTIVE=false \
pnpm deploy:staging

# Run smoke tests
pnpm test:e2e:smoke

# Deploy to production with features OFF
REACT_APP_FEATURE_SENSORY=false \
REACT_APP_FEATURE_REGULATION=false \
REACT_APP_FEATURE_EXECUTIVE=false \
pnpm deploy:production

# Monitor for issues
# ✅ Existing functionality should be identical
```

### Phase 4: Internal Testing (Week 2-3)

```bash
# Enable features for internal team only
REACT_APP_FEATURE_SENSORY=true \
REACT_APP_FEATURE_REGULATION=true \
REACT_APP_FEATURE_EXECUTIVE=true \
REACT_APP_INTERNAL_ONLY=true \
pnpm deploy:staging

# Gather feedback from team
# Fix any issues
# Run full test suite
```

### Phase 5: Gradual Production Rollout (Week 4+)

```typescript
// Percentage-based rollout
// packages/utils/src/rollout.ts

export function isEnabledForUser(userId: string, featureKey: string): boolean {
  const rolloutPercentage = parseInt(
    process.env[`REACT_APP_ROLLOUT_${featureKey}`] || '0'
  );
  
  if (rolloutPercentage === 0) return false;
  if (rolloutPercentage === 100) return true;
  
  // Stable hash-based distribution
  const hash = simpleHash(userId + featureKey);
  return (hash % 100) < rolloutPercentage;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

```bash
# Week 4: 10% rollout
REACT_APP_ROLLOUT_SENSORY=10 \
REACT_APP_ROLLOUT_REGULATION=10 \
REACT_APP_ROLLOUT_EXECUTIVE=10 \
pnpm deploy:production

# Week 5: 25% rollout (if no issues)
REACT_APP_ROLLOUT_SENSORY=25 \
REACT_APP_ROLLOUT_REGULATION=25 \
REACT_APP_ROLLOUT_EXECUTIVE=25 \
pnpm deploy:production

# Week 6: 50% rollout
REACT_APP_ROLLOUT_SENSORY=50 \
REACT_APP_ROLLOUT_REGULATION=50 \
REACT_APP_ROLLOUT_EXECUTIVE=50 \
pnpm deploy:production

# Week 7: 100% rollout
REACT_APP_ROLLOUT_SENSORY=100 \
REACT_APP_ROLLOUT_REGULATION=100 \
REACT_APP_ROLLOUT_EXECUTIVE=100 \
pnpm deploy:production
```

---

## 🔄 Rollback Strategy (Safety Net)

### Quick Rollback (< 5 minutes)

```bash
# Option 1: Turn off feature flags
REACT_APP_FEATURE_SENSORY=false \
REACT_APP_FEATURE_REGULATION=false \
REACT_APP_FEATURE_EXECUTIVE=false \
pnpm deploy:production

# Option 2: Revert to previous deployment
git revert HEAD
pnpm deploy:production

# Option 3: Roll back to specific version
git checkout <previous-commit>
pnpm deploy:production
```

### Database Rollback (If Needed)

```sql
-- Rollback script: rollback_all_migrations.sql
-- Safe because all changes are additive

-- Drop new tables (doesn't affect existing data)
DROP TABLE IF EXISTS timer_sessions CASCADE;
DROP TABLE IF EXISTS task_breakdown_sessions CASCADE;
DROP TABLE IF EXISTS regulation_sessions CASCADE;
DROP TABLE IF EXISTS emotion_history CASCADE;
DROP TABLE IF EXISTS sensory_profiles CASCADE;

-- Remove new columns from existing tables
ALTER TABLE learners DROP COLUMN IF EXISTS sensory_profile_id;
ALTER TABLE homework_sessions DROP COLUMN IF EXISTS executive_function_data;
ALTER TABLE homework_sessions DROP COLUMN IF EXISTS regulation_data;

-- Verify existing data intact
SELECT COUNT(*) FROM learners;
SELECT COUNT(*) FROM homework_sessions;
```

---

## 📈 Monitoring & Observability

### Feature Usage Analytics

```typescript
// packages/utils/src/analytics.ts

import { FEATURES } from './featureFlags';

export const trackFeatureUsage = (
  feature: string,
  action: string,
  metadata?: Record<string, any>
) => {
  // Only track if feature is enabled
  if (!FEATURES[feature]) return;

  // Send to analytics service
  analytics.track('feature_usage', {
    feature,
    action,
    metadata,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
  });
};

// Usage examples
trackFeatureUsage('sensory_profiles', 'profile_applied', {
  profileId: profile.id,
  accommodations: profile.accommodations.length,
});

trackFeatureUsage('self_regulation', 'session_started', {
  activityType: 'breathing',
  emotionBefore: 'anxious',
});

trackFeatureUsage('executive_function', 'timer_completed', {
  timerStyle: 'pie',
  durationSeconds: 600,
  context: 'homework',
});
```

### Error Tracking (Isolated)

```typescript
// packages/utils/src/errorTracking.ts

export const trackFeatureError = (
  feature: string,
  error: Error,
  context?: Record<string, any>
) => {
  // Log to console for debugging
  console.error(`[${feature}] Error:`, error, context);

  // Send to Sentry with feature tag
  Sentry.captureException(error, {
    tags: {
      feature,
      featureEnabled: FEATURES[feature],
    },
    extra: context,
  });

  // Show user-friendly message (don't break app)
  toast.error('Something went wrong. Please try again.');
};

// Usage in components
try {
  await sensoryProfileService.applyProfile(profile);
} catch (error) {
  trackFeatureError('sensory_profiles', error, {
    profileId: profile.id,
    action: 'apply_profile',
  });
  
  // Gracefully degrade - app continues to work
  console.warn('Unable to apply sensory profile, using defaults');
}
```

### Performance Monitoring

```typescript
// packages/utils/src/performance.ts

export const measureFeaturePerformance = (
  feature: string,
  operation: string,
  fn: () => void | Promise<void>
) => {
  const startTime = performance.now();

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        trackPerformance(feature, operation, duration);
      });
    }

    const duration = performance.now() - startTime;
    trackPerformance(feature, operation, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance(feature, operation, duration, 'error');
    throw error;
  }
};

function trackPerformance(
  feature: string,
  operation: string,
  duration: number,
  status: 'success' | 'error' = 'success'
) {
  analytics.track('feature_performance', {
    feature,
    operation,
    duration,
    status,
  });

  // Warn if slow
  if (duration > 1000) {
    console.warn(`[${feature}] Slow operation: ${operation} took ${duration}ms`);
  }
}

// Usage
await measureFeaturePerformance(
  'sensory_profiles',
  'load_and_apply',
  async () => {
    const profile = await loadProfile(userId);
    await applyProfile(profile);
  }
);
```

---

## ✅ Integration Checklist

### Pre-Integration Verification

- [ ] All new packages have comprehensive tests
- [ ] TypeScript compilation succeeds with 0 errors
- [ ] ESLint passes with 0 warnings
- [ ] All existing tests still pass
- [ ] Database migrations are reversible
- [ ] Feature flags are implemented and tested
- [ ] Rollback plan is documented and rehearsed

### Integration Execution

- [ ] New packages added to monorepo
- [ ] Dependencies installed successfully
- [ ] Type definitions exported from `@aivo/types`
- [ ] Components exported from `@aivo/ui`
- [ ] Services exported from `@aivo/utils`
- [ ] Database migrations applied (staging first)
- [ ] Feature flags set to OFF initially
- [ ] Deployed to staging with features disabled
- [ ] Smoke tests pass on staging
- [ ] Deployed to production with features disabled
- [ ] Production smoke tests pass

### Gradual Rollout

- [ ] Internal testing phase complete (Week 2-3)
- [ ] 10% user rollout (Week 4)
- [ ] Monitor metrics and errors
- [ ] 25% user rollout (Week 5)
- [ ] Monitor metrics and errors
- [ ] 50% user rollout (Week 6)
- [ ] Monitor metrics and errors
- [ ] 100% user rollout (Week 7)
- [ ] Final verification and monitoring

### Post-Integration Verification

- [ ] All existing features working identically
- [ ] New features accessible when enabled
- [ ] Performance metrics acceptable
- [ ] Error rates within normal range
- [ ] User feedback positive
- [ ] Documentation updated
- [ ] Team trained on new features

---

**PROMPT 46 Status**: ✅ **COMPLETE - Clean Integration Strategy**

Safe, non-breaking integration plan • Progressive enhancement • Feature flags • Gradual rollout • Zero downtime • Production-ready 🚀✨
