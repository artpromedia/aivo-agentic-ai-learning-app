# 📱 Phase 9 Quick Reference Card

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/mobile-learner
pnpm add react-native-background-fetch@4.2.5 \
  react-native-background-upload@6.7.1 \
  @react-native-community/netinfo@11.4.1 \
  @react-native-firebase/analytics@21.8.0 \
  @sentry/react-native@6.3.1 \
  react-native-device-info@14.0.1

# iOS only
cd ios && pod install && cd ..

# Test
node test-phase9.js
```

## 🔧 Service Configuration

### Background Sync
```tsx
import {backgroundSyncService} from './src/services/background/backgroundSyncService';

backgroundSyncService.configure({
  minimumFetchInterval: 15, // minutes
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
  requiredNetworkType: 'wifi', // 'none', 'any', 'wifi', 'cellular'
});
```

### Analytics
```tsx
import {analyticsService} from './src/services/analytics/analyticsService';

// Initialize
await analyticsService.initialize();

// Set user
await analyticsService.setUser({
  id: 'user-123',
  email: 'student@example.com',
  gradeLevel: 5,
});

// Track events
await analyticsService.logLessonCompleted('lesson-id', 'Math', {
  duration: 600,
  score: 85,
});
```

### Upload Queue
```tsx
import {uploadQueueService} from './src/services/upload/uploadQueueService';

uploadQueueService.configure({
  uploadUrl: 'https://api.aivo.app/uploads',
  headers: {'Authorization': `Bearer ${token}`},
});

await uploadQueueService.addToQueue('media-upload-id');
```

## 📊 Analytics Events

| Event | Method | Parameters |
|-------|--------|------------|
| Screen View | `logScreenView(name)` | Screen name |
| Lesson Started | `logLessonStarted(id, subject, metadata)` | Lesson details |
| Lesson Completed | `logLessonCompleted(id, subject, metadata)` | Duration, score |
| Activity Started | `logActivityStarted(id, type, metadata)` | Activity details |
| Activity Completed | `logActivityCompleted(id, type, metadata)` | Duration, score |
| Homework Uploaded | `logHomeworkUploaded(id, metadata)` | File info |
| Streak Achieved | `logStreakAchieved(days)` | Streak count |
| Badge Earned | `logBadgeEarned(id, name)` | Badge details |
| Goal Completed | `logDailyGoalCompleted()` | - |
| Voice Input | `logVoiceInputUsed()` | - |
| Text-to-Speech | `logTextToSpeechUsed()` | - |
| Accessibility | `logAccessibilityFeatureUsed(feature)` | Feature name |
| Camera Used | `logCameraUsed(purpose)` | Usage purpose |
| Offline Mode | `logOfflineModeEntered/Exited()` | - |
| Sync | `logSyncStarted/Completed()` | - |
| Performance | `logPerformance(metric, value)` | Metric details |
| Error | `logError(error, context)` | Error info |

## 🔐 COPPA Compliance

```tsx
// Disable analytics for children under 13
if (userAge < 13 && !hasParentalConsent) {
  analyticsService.setAnalyticsEnabled(false);
}
```

## 🧪 Testing Commands

```bash
# Run interactive tests
node test-phase9.js

# Check Android logs
adb logcat | grep -E "BackgroundFetch|Analytics|UploadQueue"

# Check iOS logs (Xcode console)
# Filter by: "BackgroundFetch" OR "Analytics" OR "UploadQueue"
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Background sync not working (iOS) | Check Info.plist has `fetch` and `processing` in UIBackgroundModes |
| Background sync not working (Android) | Check AndroidManifest.xml has all permissions, add app to battery whitelist |
| Analytics not tracking | Wait 1 hour, check Firebase config files exist |
| Sentry not capturing | Check SENTRY_DSN in .env, verify initialization |
| Uploads failing | Check UPLOAD_URL, verify server endpoint |

## 📁 Key Files

```
apps/mobile-learner/
├── src/services/
│   ├── background/backgroundSyncService.ts    # Background sync
│   ├── upload/uploadQueueService.ts           # Upload queue
│   └── analytics/analyticsService.ts          # Analytics
├── sentry.config.ts                           # Crash reporting
├── index.js                                   # Headless task
├── android/app/src/main/AndroidManifest.xml   # Android config
├── ios/AivoLearner/Info.plist                 # iOS config
└── .env                                       # Environment vars
```

## 🔑 Environment Variables

```bash
# .env
SENTRY_DSN=https://xxx@sentry.io/xxx
API_URL=https://api.aivo.app
UPLOAD_URL=https://api.aivo.app/uploads
```

## 📚 Documentation

- **Installation**: `PHASE9_INSTALLATION.md`
- **Complete Guide**: `MOBILE_LEARNER_PHASE9_COMPLETE.md`
- **Checklist**: `PHASE9_CHECKLIST.md`
- **Summary**: `PHASE9_SUMMARY.md`

## 🎯 Next Steps

1. Install dependencies
2. Configure environment variables
3. Add Firebase config files
4. Run tests: `node test-phase9.js`
5. Deploy with Phase 8 pipeline

---

**Phase 9 Status**: ✅ **COMPLETE**  
**All 9 Phases**: ✅ **DONE** (100%)
