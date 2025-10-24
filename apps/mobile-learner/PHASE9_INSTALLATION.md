# Phase 9: Advanced Features - Installation Guide

## Overview
This guide covers the installation and configuration of Phase 9 advanced features:
- **Background Sync & Task Queue**: Automatic syncing when app is closed
- **Analytics & Crash Reporting**: Firebase Analytics + Sentry integration

## Prerequisites
- Node.js 20.19.4+
- pnpm 10+
- React Native 0.76.5
- CocoaPods (for iOS)
- Android SDK (for Android)

## Step 1: Install Dependencies

Navigate to the mobile learner app directory:
```bash
cd apps/mobile-learner
```

Install the new packages:
```bash
pnpm add react-native-background-fetch@4.2.5 \
  react-native-background-upload@6.7.1 \
  @react-native-community/netinfo@11.4.1 \
  @react-native-firebase/analytics@21.8.0 \
  @sentry/react-native@6.3.1 \
  react-native-device-info@14.0.1
```

## Step 2: iOS Configuration

### 2.1 Install iOS Pods
```bash
cd ios
pod install
cd ..
```

### 2.2 Verify Info.plist
The `ios/AivoLearner/Info.plist` file has been updated with:
- Background modes: `fetch` and `processing`
- Camera/microphone permissions
- Privacy descriptions for COPPA compliance

### 2.3 Link Native Modules (if needed)
If using React Native < 0.60, manually link:
```bash
npx react-native link react-native-background-fetch
npx react-native link @sentry/react-native
```

## Step 3: Android Configuration

### 3.1 Verify AndroidManifest.xml
The `android/app/src/main/AndroidManifest.xml` has been updated with:
- Background sync permissions: `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `FOREGROUND_SERVICE`
- Network permissions: `INTERNET`, `ACCESS_NETWORK_STATE`
- Firebase and background services configurations

### 3.2 Update build.gradle (if needed)
If you encounter build errors, add to `android/app/build.gradle`:
```gradle
dependencies {
    // ... existing dependencies
    
    // Background Fetch
    implementation "com.transistorsoft:rnbackgroundfetch:+"
    
    // Background Upload
    implementation "net.gotev:uploadservice:4.9.0"
}
```

## Step 4: Environment Variables

Create or update `.env` file in the app root:
```bash
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=mobile-learner
SENTRY_AUTH_TOKEN=your-auth-token

# API Configuration
API_URL=https://api.aivo.app
UPLOAD_URL=https://api.aivo.app/uploads
```

### Get Sentry DSN:
1. Sign up at https://sentry.io
2. Create a new React Native project
3. Copy the DSN from Project Settings > Client Keys (DSN)

## Step 5: Firebase Analytics Setup

### 5.1 Android Setup
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/google-services.json`

### 5.2 iOS Setup
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place in `ios/AivoLearner/GoogleService-Info.plist`

### 5.3 Enable Analytics in Firebase Console
1. Go to Firebase Console > Analytics
2. Enable Google Analytics for your project
3. Link to Google Analytics account (optional)

## Step 6: Initialize Services

Update your main App component (e.g., `App.tsx`):

```tsx
import React, {useEffect} from 'react';
import {backgroundSyncService} from './src/services/background/backgroundSyncService';
import {analyticsService} from './src/services/analytics/analyticsService';
import {uploadQueueService} from './src/services/upload/uploadQueueService';
import './sentry.config'; // Initialize Sentry

function App() {
  useEffect(() => {
    // Initialize background sync
    backgroundSyncService.configure({
      minimumFetchInterval: 15, // minutes
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: 'any', // 'none', 'any', 'wifi', 'cellular'
    });

    // Initialize analytics
    analyticsService.initialize();

    // Configure upload queue
    uploadQueueService.configure({
      uploadUrl: process.env.UPLOAD_URL || 'https://api.aivo.app/uploads',
      headers: {
        'Authorization': 'Bearer <token>', // Add your auth token
      },
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    // Your app components
  );
}

export default App;
```

## Step 7: Database Migrations

Run the database migrations to create new tables:
```bash
# This will create:
# - sync_events table
# - analytics_events table  
# - media_uploads table

pnpm db:migrate
```

## Step 8: Test Installation

### 8.1 Run on Android
```bash
pnpm android
```

### 8.2 Run on iOS
```bash
pnpm ios
```

### 8.3 Verify Background Sync
1. Open the app
2. Background the app (home button)
3. Wait 15 minutes
4. Check logs for `[BackgroundFetch]` messages
5. Kill the app completely
6. Wait 15 minutes
7. Check device logs for headless task execution

### 8.4 Verify Analytics
1. Perform some actions in the app
2. Check Firebase Console > Analytics > Events
3. Events should appear within 1 hour

### 8.5 Verify Crash Reporting
1. Trigger a test crash:
```tsx
import * as Sentry from '@sentry/react-native';

// In your code:
Sentry.captureException(new Error('Test error'));
```
2. Check Sentry dashboard for the error

## Step 9: COPPA Compliance

For users under 13, disable analytics collection:

```tsx
import {analyticsService} from './src/services/analytics/analyticsService';

// When user age is verified
if (userAge < 13 && !hasParentalConsent) {
  analyticsService.setAnalyticsEnabled(false);
} else {
  analyticsService.setAnalyticsEnabled(true);
}
```

## Troubleshooting

### Background Sync Not Working

**iOS:**
- Check Info.plist has `fetch` and `processing` in UIBackgroundModes
- Enable "Background fetch" in Xcode > Capabilities
- Background tasks are throttled by iOS - may not run exactly every 15 minutes

**Android:**
- Check AndroidManifest.xml has all required permissions
- Some manufacturers (Xiaomi, Huawei) aggressively kill background tasks
- Add app to battery optimization whitelist

### Analytics Not Tracking

- Check Firebase Analytics is enabled in Firebase Console
- Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is present
- Analytics events are batched - may take up to 1 hour to appear in console
- Check logcat/console for `[Analytics]` logs

### Sentry Not Capturing Errors

- Verify `SENTRY_DSN` is set in `.env`
- Check Sentry is initialized before any errors occur
- In development, errors are logged to console instead of sent to Sentry
- Test with `Sentry.captureException(new Error('Test'))`

### Upload Queue Not Processing

- Check `UPLOAD_URL` is set correctly
- Verify network permissions in manifest
- Check server endpoint accepts multipart/form-data
- Review upload logs: `console.log('[UploadQueue]')`

## Next Steps

1. **Test Background Sync**: Use device in real-world scenarios
2. **Review Analytics**: Check Firebase Console for user behavior insights
3. **Monitor Crashes**: Set up Sentry alerts for critical errors
4. **Optimize Battery**: Fine-tune sync frequency based on usage patterns
5. **Privacy Policy**: Update privacy policy to reflect analytics collection

## Documentation

- [Background Fetch Documentation](https://github.com/transistorsoft/react-native-background-fetch)
- [Firebase Analytics Documentation](https://rnfirebase.io/analytics/usage)
- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review device logs (logcat/console)
3. Check service configuration
4. Verify all dependencies are installed correctly

---

**Phase 9 Complete!** ✅ Your app now has production-ready background sync and comprehensive analytics.
