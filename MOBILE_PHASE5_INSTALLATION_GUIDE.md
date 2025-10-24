# Phase 5 Installation & Setup Guide

## 📦 Installation Steps

### Step 1: Install Notifee
```bash
# Navigate to mobile learner app
cd apps/mobile-learner

# Install Notifee package
pnpm add @notifee/react-native

# iOS: Install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Step 2: Verify Installation
```bash
# Check package.json
cat package.json | grep notifee
# Should show: "@notifee/react-native": "^7.8.2"

# Check iOS pods (iOS only)
cd ios && pod list | grep Notifee && cd ..
```

### Step 3: Android Configuration

#### Edit `android/app/src/main/AndroidManifest.xml`
Add notification permissions:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <!-- Add these permissions -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  <uses-permission android:name="android.permission.VIBRATE"/>

  <application>
    <!-- Optional: Custom notification icon and color -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_icon"
      android:resource="@drawable/ic_notification" />
      
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_color"
      android:resource="@color/colorPrimary" />
      
    <!-- Rest of your application config -->
  </application>
</manifest>
```

#### Create notification icon (Optional)
```bash
# Place icon in: android/app/src/main/res/drawable/ic_notification.png
# Recommended: 24x24dp, white icon on transparent background
```

### Step 4: iOS Configuration (Optional)

#### No additional setup required!
iOS 10+ supports local notifications out of the box. Permission is requested at runtime.

### Step 5: Initialize Services

#### Edit your `App.tsx` or main entry point:
```typescript
import React, {useEffect} from 'react';
import {notificationService} from './src/services/notifications';
import {engagementService} from './src/services/engagement';

export default function App() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();
        console.log('✅ Notification service initialized');

        // Initialize engagement service
        await engagementService.initialize();
        console.log('✅ Engagement service initialized');

        // Optional: Schedule daily reminder
        await notificationService.scheduleDailyReminder(9, 0); // 9:00 AM
        console.log('✅ Daily reminder scheduled');

      } catch (error) {
        console.error('❌ Service initialization failed:', error);
      }
    };

    initializeServices();
  }, []);

  // Rest of your app
  return (
    // Your app components
  );
}
```

### Step 6: Build and Run

```bash
# Clean build (recommended)
# Android
pnpm android --reset-cache

# iOS
pnpm ios --reset-cache

# Or standard build
pnpm android  # or pnpm ios
```

---

## 🧪 Testing Your Setup

### 1. Test Notification Permission
```typescript
import {notificationService} from './src/services/notifications';

// Request permission (should show system dialog)
const granted = await notificationService.requestPermission();
console.log('Permission granted:', granted);
```

### 2. Test Display Notification
```typescript
// Display a test notification
await notificationService.displayNotification({
  type: 'motivational',
  title: '🎉 Setup Complete!',
  body: 'Your notifications are working!',
  priority: 'high',
});
```

### 3. Test Engagement Tracking
```typescript
import {engagementService} from './src/services/engagement';

// Record a test activity
await engagementService.recordActivity('math');

// Check streak
const streak = engagementService.getStreak();
console.log('Current streak:', streak?.currentStreak);

// Check achievements
const achievements = engagementService.getAchievements();
console.log('Total achievements:', achievements.length);
```

### 4. Test UI Components
```tsx
import {StreakWidget, DailyGoalsWidget} from './src/components/engagement';

function TestScreen() {
  return (
    <View>
      <StreakWidget onPress={() => console.log('Streak tapped')} />
      <DailyGoalsWidget />
    </View>
  );
}
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@notifee/react-native'"

**Solution:**
```bash
# Re-install
pnpm add @notifee/react-native

# iOS: Re-install pods
cd ios && pod install && cd ..

# Clean cache
pnpm start --reset-cache
```

### Issue: Notifications not showing on Android

**Checklist:**
1. ✅ Permission granted? (Check Settings > Apps > Your App > Notifications)
2. ✅ `POST_NOTIFICATIONS` permission in AndroidManifest.xml?
3. ✅ Android 13+ requires runtime permission
4. ✅ Check quiet hours: `notificationService.isQuietHours()`
5. ✅ Check notification settings: `await notificationService.loadSettings()`

**Test:**
```bash
# Check logcat for errors
adb logcat | grep -i notif
```

### Issue: Notifications not showing on iOS

**Checklist:**
1. ✅ Permission granted? (Check Settings > Notifications > Your App)
2. ✅ Notification center enabled?
3. ✅ App not in Do Not Disturb mode?
4. ✅ Test on physical device (simulator may not show)

**Test:**
```typescript
// Check permission status
const settings = await notificationService.requestPermission();
console.log('iOS permission:', settings);
```

### Issue: Scheduled notifications not firing

**Solutions:**
1. Test on physical device (not simulator)
2. Check date/time is in future
3. Verify notification ID is unique
4. Check quiet hours settings
5. Ensure app not force-closed (iOS)

```typescript
// Debug scheduled notifications
const scheduled = await notifee.getTriggerNotifications();
console.log('Scheduled notifications:', scheduled);
```

### Issue: Streak not updating

**Debug:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored streak data
const streakData = await AsyncStorage.getItem('@aivolearning_streak');
console.log('Stored streak:', streakData);

// Manually update
await engagementService.updateStreak();
const streak = engagementService.getStreak();
console.log('Updated streak:', streak);
```

### Issue: Achievements not unlocking

**Debug:**
```typescript
// Check achievement progress
const progress = engagementService.getAchievementProgress('streak_3');
console.log('Streak 3 progress:', progress);

// Check all achievements
const achievements = engagementService.getAchievements();
achievements.forEach(a => {
  console.log(a.id, a.unlockedAt ? 'UNLOCKED' : 'LOCKED');
});

// Force unlock (testing only)
await engagementService.checkAndUnlockAchievement('streak_3');
```

### Issue: UI not updating after activity

**Solution:**
Ensure Zustand store is being used:
```typescript
import {useEngagementStore} from './src/stores/engagementStore';

function MyComponent() {
  // ✅ Correct - will auto-update
  const {streak, recordActivity} = useEngagementStore();

  // ❌ Wrong - won't update UI
  // const streak = engagementService.getStreak();

  return <Text>Streak: {streak?.currentStreak}</Text>;
}
```

### Issue: TypeScript errors

**Common fixes:**
```bash
# Rebuild TypeScript
pnpm tsc --noEmit

# Clean and rebuild
rm -rf node_modules && pnpm install
cd ios && pod install && cd ..

# Reset Metro cache
pnpm start --reset-cache
```

---

## 🔐 Permissions Reference

### Android (AndroidManifest.xml)
```xml
<!-- Required -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE"/>

<!-- Optional: For exact alarms (Android 12+) -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

### iOS (Info.plist)
```xml
<!-- No permissions needed for local notifications -->
<!-- Optional: For background notifications -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Runtime Permission Request
```typescript
// Automatically handled by notificationService.initialize()
// Or manually:
const granted = await notificationService.requestPermission();

if (!granted) {
  // Show explanation and link to settings
  Alert.alert(
    'Notifications Disabled',
    'Please enable notifications in Settings to receive reminders.',
    [
      {text: 'Cancel'},
      {text: 'Settings', onPress: () => Linking.openSettings()},
    ]
  );
}
```

---

## 🎯 Feature Verification

### ✅ Notification Service
```typescript
// Test each notification type
await notificationService.displayNotification({
  type: 'daily_reminder',
  title: 'Daily Reminder Test',
  body: 'This is a test',
});

await notificationService.sendActivityReminder('Test activity', new Date(Date.now() + 60000));

await notificationService.sendAchievementNotification({
  title: 'Test Achievement',
  description: 'Testing achievements',
  icon: '🎉',
  points: 100,
});

await notificationService.sendMotivationalMessage();
```

### ✅ Engagement Service
```typescript
// Test streak
await engagementService.recordActivity('math');
const streak = engagementService.getStreak();
console.log('✅ Streak:', streak?.currentStreak);

// Test achievements
await engagementService.recordLessonCompletion();
const unlocked = engagementService.getUnlockedAchievements();
console.log('✅ Unlocked:', unlocked.length);

// Test daily goals
const goals = engagementService.getTodayGoals();
console.log('✅ Goals:', goals.length);
```

### ✅ UI Components
```tsx
// Test in a screen
import {
  StreakWidget,
  AchievementCard,
  DailyGoalsWidget,
  NotificationSettingsScreen,
} from './src/components/engagement';

function TestScreen() {
  const achievements = useEngagementStore(s => s.achievements);

  return (
    <ScrollView>
      <StreakWidget />
      <DailyGoalsWidget />
      {achievements.map(a => (
        <AchievementCard key={a.id} achievement={a} />
      ))}
      <NotificationSettingsScreen />
    </ScrollView>
  );
}
```

---

## 🚀 Optional: Firebase Cloud Messaging

For production push notifications (server-triggered):

### Install Firebase
```bash
pnpm add @react-native-firebase/app @react-native-firebase/messaging
```

### Android Setup
```bash
# 1. Download google-services.json from Firebase Console
# 2. Place in: android/app/google-services.json

# 3. Edit android/build.gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}

# 4. Edit android/app/build.gradle
apply plugin: 'com.google.gms.google-services'
```

### iOS Setup
```bash
# 1. Download GoogleService-Info.plist from Firebase Console
# 2. Place in: ios/YourApp/GoogleService-Info.plist

# 3. Install pods
cd ios && pod install && cd ..
```

### Update Notification Service
```typescript
// In src/services/notifications/notificationService.ts

import messaging from '@react-native-firebase/messaging';

// Add to initialize()
async initialize() {
  // ... existing Notifee init ...

  // Add FCM token registration
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  // Send token to your backend

  // Handle foreground messages
  messaging().onMessage(async remoteMessage => {
    await this.displayNotification({
      type: 'parent_message',
      title: remoteMessage.notification?.title || 'New Message',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
    });
  });
}
```

---

## 📋 Post-Installation Checklist

- [ ] `@notifee/react-native` installed
- [ ] iOS pods installed (iOS only)
- [ ] Android permissions added to manifest
- [ ] Services initialized in App.tsx
- [ ] Test notification displays
- [ ] Test permission request
- [ ] Test engagement tracking
- [ ] Test UI components
- [ ] Verify scheduled notifications
- [ ] Check quiet hours functionality
- [ ] Test on physical device
- [ ] Verify background notifications
- [ ] Check notification settings screen

---

## 📚 Next Steps

1. **Integrate with Backend API**
   - Send achievements to server
   - Sync streaks across devices
   - Store notification preferences

2. **Add Analytics**
   - Track notification open rates
   - Monitor engagement metrics
   - A/B test notification content

3. **Enhance Notifications**
   - Add images to notifications
   - Add action buttons
   - Implement notification categories

4. **Social Features**
   - Friend leaderboards
   - Compare streaks
   - Share achievements

5. **Testing**
   - Unit tests for services
   - Integration tests
   - E2E tests with Detox

---

## 🆘 Support

### Documentation
- Full guide: `MOBILE_LEARNER_PHASE5_COMPLETE.md`
- Quick reference: `MOBILE_NOTIFICATIONS_QUICK_REFERENCE.md`
- Notifee docs: https://notifee.app/react-native/docs/overview

### Common Commands
```bash
# Clean build
pnpm android --reset-cache
pnpm ios --reset-cache

# Check logs
# Android
adb logcat | grep -i notif

# iOS
react-native log-ios | grep -i notif

# Clear AsyncStorage (testing)
# Add to app temporarily:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

---

## ✅ Installation Complete!

Once all steps are complete, your app will have:
- ✅ Local notifications
- ✅ Scheduled reminders
- ✅ Streak tracking
- ✅ Achievement system
- ✅ Daily goals
- ✅ Engagement UI
- ✅ Notification settings

**Ready to engage learners!** 🎉

For questions or issues, refer to the troubleshooting section above or check the complete documentation in `MOBILE_LEARNER_PHASE5_COMPLETE.md`.
