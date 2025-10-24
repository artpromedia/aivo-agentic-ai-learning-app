# Mobile Notifications & Engagement - Quick Reference

## 🔔 Notification Service API

### Initialize
```typescript
import {notificationService} from '@/services/notifications';

await notificationService.initialize();
```

### Display Notification
```typescript
await notificationService.displayNotification({
  type: 'achievement',           // Type enum
  title: 'Achievement Unlocked!',
  body: '3 Day Streak!',
  priority: 'high',              // Optional: 'high' | 'default' | 'low'
  data: {achievementId: '123'},  // Optional metadata
});
```

### Schedule Notification
```typescript
await notificationService.scheduleNotification(
  {
    type: 'reminder',
    title: 'Homework Time',
    body: 'Complete your math exercises',
  },
  new Date(Date.now() + 3600000), // 1 hour from now
  'homework-1'                     // Unique ID
);
```

### Daily Reminder
```typescript
// Schedule daily at 9:00 AM
await notificationService.scheduleDailyReminder(9, 0);
```

### Cancel Notifications
```typescript
// Cancel specific
await notificationService.cancelNotification('homework-1');

// Cancel all
await notificationService.cancelAllNotifications();
```

### Activity Reminders
```typescript
await notificationService.sendActivityReminder(
  'Complete your science quiz',
  new Date(Date.now() + 1800000) // 30 minutes
);
```

### Achievement Notifications
```typescript
await notificationService.sendAchievementNotification({
  title: '7 Day Streak!',
  description: 'You completed lessons 7 days in a row',
  icon: '🔥🔥',
  points: 100,
});
```

### Motivational Messages
```typescript
await notificationService.sendMotivationalMessage();
// Randomly selects from predefined messages
```

### Parent Messages
```typescript
await notificationService.sendParentMessage(
  'Your teacher sent you a message',
  {messageId: '123', senderId: '456'}
);
```

### Quiet Hours
```typescript
const isQuiet = notificationService.isQuietHours();
// Returns true if within quiet hours (default: 10 PM - 7 AM)
```

### Settings
```typescript
// Save
await notificationService.saveSettings({
  enabled: true,
  dailyRemindersEnabled: true,
  achievementsEnabled: true,
  quietHoursEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
});

// Load
const settings = await notificationService.loadSettings();
```

### Badge Count
```typescript
await notificationService.updateBadgeCount(5);
await notificationService.clearBadgeCount();
```

### Request Permission
```typescript
const granted = await notificationService.requestPermission();
```

---

## 🎯 Engagement Service API

### Initialize
```typescript
import {engagementService} from '@/services/engagement';

await engagementService.initialize();
```

### Record Activity
```typescript
// Updates streak and checks achievements
await engagementService.recordActivity('math');
```

### Record Lesson
```typescript
await engagementService.recordLessonCompletion();
// Updates: lessons goal, streak, achievements
```

### Record Quiz
```typescript
await engagementService.recordQuizScore(8, 10); // 8 out of 10
// Unlocks achievements for perfect scores
```

### Get Streak
```typescript
const streak = engagementService.getStreak();
// {
//   currentStreak: 15,
//   longestStreak: 25,
//   lastActivityDate: '2025-02-01',
//   streakStartDate: '2025-01-15'
// }
```

### Get Achievements
```typescript
// All achievements
const all = engagementService.getAchievements();

// Unlocked only
const unlocked = engagementService.getUnlockedAchievements();

// Locked only
const locked = engagementService.getLockedAchievements();

// Specific achievement
const achievement = engagementService.getAchievementById('streak_7');
```

### Achievement Progress
```typescript
const progress = engagementService.getAchievementProgress('lessons_10');
// Returns: {current: 7, target: 10} or null if unlocked
```

### Daily Goals
```typescript
// Get today's goals
const goals = engagementService.getTodayGoals();
// [
//   {id: '1', type: 'lessons', target: 3, current: 2, completed: false},
//   {id: '2', type: 'activities', target: 5, current: 5, completed: true},
//   ...
// ]

// Update goal
await engagementService.updateDailyGoals('lessons', 3);
```

### Points
```typescript
const total = engagementService.getTotalPoints();
// Sum of all unlocked achievement points
```

---

## 🏪 Engagement Store (Zustand)

### Import
```typescript
import {useEngagementStore} from '@/stores/engagementStore';
```

### Access State
```typescript
function MyComponent() {
  const {
    streak,           // StreakData
    achievements,     // Achievement[]
    dailyGoals,       // DailyGoal[]
    isLoading,        // boolean
    lastRefresh,      // Date | null
  } = useEngagementStore();

  return <Text>Streak: {streak?.currentStreak} days</Text>;
}
```

### Actions
```typescript
const {
  initialize,              // () => Promise<void>
  refresh,                 // () => Promise<void>
  recordActivity,          // (subject) => Promise<void>
  recordLessonCompletion,  // () => Promise<void>
  recordQuizScore,         // (score, total) => Promise<void>
} = useEngagementStore();

// Usage
await recordActivity('math');
await recordLessonCompletion();
await recordQuizScore(10, 10);
```

### Auto-refresh
```typescript
// Store auto-refreshes every 60 seconds
// Manual refresh:
await refresh();
```

---

## 🎨 UI Components

### Streak Widget
```tsx
import {StreakWidget} from '@/components/engagement';

<StreakWidget 
  onPress={() => navigation.navigate('Achievements')}
/>
```

**Props:** `onPress?: () => void`

**Features:**
- Fire emoji with streak count
- Shows best streak
- Motivational text
- Haptic feedback on tap
- Auto-updates

---

### Achievement Card
```tsx
import {AchievementCard} from '@/components/engagement';

<AchievementCard 
  achievement={achievement}
  compact={false}
  onPress={() => showDetails(achievement)}
/>
```

**Props:**
- `achievement: Achievement` (required)
- `compact?: boolean` (default: false)
- `onPress?: () => void`

**Features:**
- Lock/unlock states
- Progress bar (locked achievements)
- Points display
- Unlock date
- Icon customization

---

### Daily Goals Widget
```tsx
import {DailyGoalsWidget} from '@/components/engagement';

<DailyGoalsWidget 
  compact={false}
/>
```

**Props:** `compact?: boolean` (default: false)

**Features:**
- Horizontal scroll
- Multiple goal types
- Progress indicators
- Completion checkmarks
- Color-coded cards
- Auto-updates

---

### Notification Settings
```tsx
import {NotificationSettingsScreen} from '@/components/engagement';

<NotificationSettingsScreen />
```

**Features:**
- Enable/disable toggles
- Quiet hours time picker
- Per-type controls
- Sound/vibration settings
- Auto-save

---

## 🎮 Achievement Types

### Streaks
- `streak_3` - 3 Day Streak (50 points)
- `streak_7` - 7 Day Streak (100 points)
- `streak_30` - 30 Day Streak (300 points)
- `streak_100` - 100 Day Streak (1000 points)

### Lessons
- `lessons_10` - First 10 Lessons (100 points)
- `lessons_50` - 50 Lessons (250 points)
- `lessons_100` - Century Scholar (500 points)

### Quizzes
- `quiz_perfect_1` - First Perfect Score (50 points)
- `quiz_perfect_10` - Quiz Master (200 points)

### Time-based
- `early_bird` - Complete lesson before 8 AM (75 points)
- `night_owl` - Complete lesson after 10 PM (75 points)

### Subject-specific
- `math_master` - 10 math activities (150 points)
- `science_star` - 10 science activities (150 points)

### Special
- `speed_reader` - Complete 3 lessons in 1 day (100 points)

---

## 📋 Notification Types

### Type Enum
```typescript
type NotificationType = 
  | 'daily_reminder'
  | 'activity_reminder'
  | 'achievement'
  | 'streak_milestone'
  | 'parent_message'
  | 'motivational';
```

### Priority Levels
```typescript
type NotificationPriority = 'high' | 'default' | 'low';
```

### Channel IDs (Android)
- `default` - General notifications
- `reminders` - Daily/activity reminders
- `achievements` - Achievement unlocks
- `parent_messages` - Parent/teacher messages
- `motivational` - Encouragement

---

## ⏰ Default Settings

```typescript
{
  enabled: true,
  dailyRemindersEnabled: true,
  dailyReminderTime: {hour: 9, minute: 0},
  achievementsEnabled: true,
  parentMessagesEnabled: true,
  motivationalEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: {hour: 22, minute: 0}, // 10 PM
  quietHoursEnd: {hour: 7, minute: 0},    // 7 AM
  soundEnabled: true,
  vibrationEnabled: true,
}
```

---

## 🔧 Common Patterns

### Complete Activity Flow
```typescript
// 1. Record activity
await engagementService.recordActivity('math');

// 2. Update UI (automatic with Zustand)
const {streak, achievements} = useEngagementStore();

// 3. Send notification if achievement unlocked
const newAchievement = achievements.find(a => 
  a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 1000
);

if (newAchievement) {
  await notificationService.sendAchievementNotification(newAchievement);
}
```

### Daily Login Flow
```typescript
// 1. Initialize services
await notificationService.initialize();
await engagementService.initialize();

// 2. Record login
await engagementService.recordActivity('login');

// 3. Update store
const {refresh} = useEngagementStore();
await refresh();

// 4. Show daily goals
<DailyGoalsWidget />
```

### Perfect Quiz Score
```typescript
// 1. Record score
await engagementService.recordQuizScore(10, 10);

// 2. Check for unlock
const achievement = engagementService.getAchievementById('quiz_perfect_1');

// 3. Show celebration
if (achievement?.unlockedAt) {
  showConfetti();
  await notificationService.sendAchievementNotification(achievement);
}
```

---

## 🧪 Testing Commands

```typescript
// Test notification
await notificationService.displayNotification({
  type: 'achievement',
  title: 'Test Notification',
  body: 'This is a test',
  priority: 'high',
});

// Test achievement unlock
await engagementService.checkAndUnlockAchievement('streak_3');

// Test streak update
await engagementService.updateStreak();

// Test daily goal update
await engagementService.updateDailyGoals('lessons', 3);

// Test quiet hours
console.log('Is quiet:', notificationService.isQuietHours());

// Test badge
await notificationService.updateBadgeCount(5);
```

---

## 🐛 Troubleshooting

### Notifications not showing
1. Check permission: `await notificationService.requestPermission()`
2. Check settings: `const settings = await notificationService.loadSettings()`
3. Check quiet hours: `notificationService.isQuietHours()`
4. Verify channel (Android): Check logcat for channel errors

### Streak not updating
1. Ensure activity recorded: `await engagementService.recordActivity()`
2. Check last activity date: `const streak = engagementService.getStreak()`
3. Verify AsyncStorage: Check for `@aivolearning_*` keys

### Achievement not unlocking
1. Check criteria: Review `ACHIEVEMENTS` constant in engagement service
2. Verify progress: `engagementService.getAchievementProgress(id)`
3. Manual unlock (testing): `await engagementService.checkAndUnlockAchievement(id)`

### Store not updating
1. Check initialization: `await useEngagementStore.getState().initialize()`
2. Force refresh: `await useEngagementStore.getState().refresh()`
3. Verify subscriptions: Component should re-render on state change

---

## 📦 Installation

```bash
# Required
pnpm add @notifee/react-native

# iOS
cd ios && pod install && cd ..

# Optional (Firebase)
pnpm add @react-native-firebase/app @react-native-firebase/messaging
```

---

## ♿ Accessibility

### Screen Reader Labels
- All interactive elements have `accessibilityLabel`
- State changes announced
- Progress updates conveyed

### Haptic Feedback
- Streak widget tap
- Achievement unlock
- Goal completion
- Settings toggle

### Visual
- High contrast
- Large touch targets (44x44 minimum)
- Color-blind friendly colors

---

## 📱 Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| Local Notifications | ✅ | ✅ |
| Scheduled Notifications | ✅ | ✅ |
| Channels | N/A | ✅ |
| Badge Count | ✅ | ✅ |
| Sound | ✅ | ✅ |
| Vibration | ✅ | ✅ |
| Quiet Hours | ✅ | ✅ |
| Rich Notifications | ✅ | ✅ |

---

## 🚀 Quick Start

```typescript
// 1. Import
import {notificationService, engagementService} from '@/services';
import {useEngagementStore} from '@/stores/engagementStore';
import {StreakWidget, DailyGoalsWidget} from '@/components/engagement';

// 2. Initialize (App.tsx)
useEffect(() => {
  const init = async () => {
    await notificationService.initialize();
    await engagementService.initialize();
  };
  init();
}, []);

// 3. Use in components
function Dashboard() {
  const {streak, dailyGoals, recordActivity} = useEngagementStore();

  return (
    <View>
      <StreakWidget />
      <DailyGoalsWidget />
      
      <Button onPress={() => recordActivity('math')} />
    </View>
  );
}
```

---

**Ready to engage learners!** 🎉 See `MOBILE_LEARNER_PHASE5_COMPLETE.md` for full documentation.
