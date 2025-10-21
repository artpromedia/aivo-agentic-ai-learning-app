# Guardian Controls Quick Reference

## Component Imports

```tsx
// Parent Portal
import { GuardianGameControls, DailyUsageTracker } from '@/components';

// Using Switch in custom components
import { Switch } from '@aivo/ui';
```

## Basic Usage

### Guardian Game Controls
```tsx
<GuardianGameControls
  learnerId="unique-learner-id"
  learnerName="Student Name"
/>
```

### Daily Usage Tracker
```tsx
<DailyUsageTracker
  learnerId="unique-learner-id"
  learnerName="Student Name"
/>
```

## Reading Settings (Learner App)

```tsx
import { useLocalStorage } from '@aivo/utils';

// In your component
const [settings] = useLocalStorage(
  `game_settings_${learnerId}`,
  defaultSettings
);

// Access settings
const maxBreaks = settings.maxBreaksPerDay;
const duration = settings.breakDurationMinutes;
const isGameAllowed = settings.allowedGameTypes.includes('reaction');
```

## Logging Game Sessions

```tsx
import { useLocalStorage } from '@aivo/utils';

function useGameLogger(learnerId: string) {
  const [usageData, setUsageData] = useLocalStorage(
    `usage_history_${learnerId}`,
    []
  );
  
  const logSession = (session: GameBreakSession) => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    const todayIndex = usageData.findIndex(d => d.date === today);
    
    if (todayIndex === -1) {
      usageData.push({
        date: today,
        sessions: [session],
        totalBreaks: 1,
        totalDuration: session.duration,
        averageScore: session.score,
        focusStateBeforeBreaks: [],
      });
    } else {
      const dayData = usageData[todayIndex];
      dayData.sessions.push(session);
      dayData.totalBreaks += 1;
      dayData.totalDuration += session.duration;
      dayData.averageScore = 
        dayData.sessions.reduce((sum, s) => sum + s.score, 0) / 
        dayData.sessions.length;
    }
    
    setUsageData([...usageData]);
  };
  
  return { logSession };
}
```

## Validation Functions

```tsx
// Check if game break is allowed
function canStartGameBreak(
  learnerId: string,
  gameType: string
): { allowed: boolean; reason?: string } {
  const settings = getSettings(learnerId);
  const todayData = getTodayUsage(learnerId);
  
  // Check max breaks
  if (todayData.totalBreaks >= settings.maxBreaksPerDay) {
    return { allowed: false, reason: 'Daily limit reached' };
  }
  
  // Check quiet hours
  if (settings.quietHoursEnabled && isQuietHours(settings)) {
    return { allowed: false, reason: 'Quiet hours active' };
  }
  
  // Check game type
  if (!settings.allowedGameTypes.includes(gameType)) {
    return { allowed: false, reason: 'Game type not allowed' };
  }
  
  // Check manual breaks
  if (!settings.allowManualBreaks) {
    return { allowed: false, reason: 'Manual breaks disabled' };
  }
  
  return { allowed: true };
}

// Check if currently in quiet hours
function isQuietHours(settings: GameBreakSettings): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);
  
  const quietStart = startHour * 60 + startMin;
  const quietEnd = endHour * 60 + endMin;
  
  // Handle overnight quiet hours (e.g., 21:00 - 07:00)
  if (quietStart > quietEnd) {
    return currentMinutes >= quietStart || currentMinutes < quietEnd;
  }
  
  // Handle same-day quiet hours (e.g., 13:00 - 14:00)
  return currentMinutes >= quietStart && currentMinutes < quietEnd;
}
```

## Default Settings

```tsx
const defaultSettings: GameBreakSettings = {
  maxBreaksPerDay: 3,
  breakDurationMinutes: 3,
  allowManualBreaks: true,
  requireApproval: false,
  quietHoursEnabled: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '07:00',
  allowedGameTypes: ['reaction', 'breathing', 'memory', 'pattern', 'sorting'],
};
```

## Test IDs

### GuardianGameControls
- `guardian-game-controls` - Main container
- `max-breaks-input` - Max breaks input
- `break-duration-input` - Duration input
- `manual-breaks-toggle` - Manual breaks switch
- `require-approval-toggle` - Approval switch
- `quiet-hours-toggle` - Quiet hours switch
- `quiet-hours-start-input` - Start time input
- `quiet-hours-end-input` - End time input
- `game-type-{gameType}` - Game type checkboxes
- `save-settings` - Save button

### DailyUsageTracker
- `daily-usage-tracker` - Main container
- `today-breaks` - Today's break count
- `today-duration` - Today's total time
- `today-score` - Today's average score
- `today-completion` - Today's completion rate
- `session-{sessionId}` - Individual sessions
- `history-bar-{date}` - 7-day chart bars
- `export-data-button` - Export button
- `clear-history-button` - Clear button

## localStorage Keys

- Settings: `game_settings_{learnerId}`
- Usage: `usage_history_{learnerId}`

## Game Type Icons

- `reaction` - ⚡ Quick Reflex
- `breathing` - 🫁 Breathing Coach
- `memory` - 🧠 Memory Match
- `pattern` - 🔢 Pattern Finder
- `sorting` - 🎯 Quick Sort
