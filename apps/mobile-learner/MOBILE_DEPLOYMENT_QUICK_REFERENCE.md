# Mobile Deployment Quick Reference

Quick commands and workflows for deploying the AIVO Learning mobile app.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Commands](#quick-commands)
- [Deployment Workflows](#deployment-workflows)
- [GitHub Actions Triggers](#github-actions-triggers)
- [Version Management](#version-management)
- [Emergency Procedures](#emergency-procedures)

---

## Prerequisites

### First-Time Setup
```bash
# 1. Install Ruby dependencies
cd apps/mobile-learner
bundle install

# 2. Install Node dependencies
cd ../..
pnpm install

# 3. iOS: Install CocoaPods
cd apps/mobile-learner/ios
pod install

# 4. Android: Setup keystore
# See: android/app/KEYSTORE_SETUP.md

# 5. Configure GitHub Secrets
# See: GITHUB_SECRETS_SETUP.md
```

---

## Quick Commands

### Local Testing

```bash
# iOS - Build for testing
cd apps/mobile-learner
bundle exec fastlane ios build

# iOS - Run tests
bundle exec fastlane ios test

# Android - Build for testing
bundle exec fastlane android build

# Android - Run tests
bundle exec fastlane android test
```

### Beta Deployment (Local)

```bash
# iOS - Upload to TestFlight
cd apps/mobile-learner
bundle exec fastlane ios beta

# Android - Upload to Play Store Beta
bundle exec fastlane android beta
```

### Production Deployment (Local)

```bash
# iOS - Upload to App Store (draft)
cd apps/mobile-learner
bundle exec fastlane ios release

# Android - Upload to Play Store Production (draft)
bundle exec fastlane android release
```

---

## Deployment Workflows

### Beta Deployment via Git Tags

#### iOS Only
```bash
git tag v1.0.0-ios
git push origin v1.0.0-ios
```

#### Android Only
```bash
git tag v1.0.0-android
git push origin v1.0.0-android
```

#### Both Platforms
```bash
git tag v1.0.0-mobile
git push origin v1.0.0-mobile
```

### Production Deployment via GitHub Actions UI

1. Go to **Actions** tab in GitHub
2. Select **Mobile App Release** workflow
3. Click **Run workflow**
4. Select:
   - **Branch**: main
   - **Platform**: ios, android, or both
   - **Track**: release
5. Click **Run workflow**

---

## GitHub Actions Triggers

### Automatic Triggers

| Tag Pattern        | Platforms    | Track |
|-------------------|--------------|-------|
| `v*.*.*-mobile`   | iOS & Android| Beta  |
| `v*.*.*-ios`      | iOS Only     | Beta  |
| `v*.*.*-android`  | Android Only | Beta  |

### Manual Triggers

Use GitHub Actions UI to:
- Select platform (ios, android, both)
- Select track (beta, release)
- Deploy from any branch

---

## Version Management

### Current Version
- **iOS**: Check `ios/AivoLearner/Info.plist`
- **Android**: Check `android/app/build.gradle`

### Increment Version (iOS)

```bash
cd apps/mobile-learner

# Minor version (1.0.0 -> 1.1.0)
bundle exec fastlane run increment_version_number bump_type:minor

# Patch version (1.0.0 -> 1.0.1)
bundle exec fastlane run increment_version_number bump_type:patch

# Major version (1.0.0 -> 2.0.0)
bundle exec fastlane run increment_version_number bump_type:major
```

### Increment Version (Android)

```bash
cd apps/mobile-learner

# Update version name in android/app/build.gradle
# versionName "1.0.0" -> "1.1.0"

# Fastlane auto-increments versionCode
```

### Auto-Increment

Fastlane **automatically increments** build numbers:
- **iOS**: Build number (e.g., 1, 2, 3, ...)
- **Android**: Version code (e.g., 1, 2, 3, ...)

Version names are incremented by the **release** lane:
- Minor version bump (1.0.0 -> 1.1.0)

---

## Emergency Procedures

### Rollback Production Build

#### iOS
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app > **App Store** tab
3. Remove current version from review
4. Submit previous stable version

#### Android
1. Go to [Play Console](https://play.google.com/console)
2. Navigate to **Production** track
3. Click **Manage** on latest release
4. Click **Exclude devices** or **Halt rollout**
5. Promote previous stable version

### Cancel Ongoing Build

#### GitHub Actions
1. Go to **Actions** tab
2. Find the running workflow
3. Click **Cancel workflow**

#### Fastlane (Local)
- Press `Ctrl+C` to cancel
- Clean up artifacts:
  ```bash
  cd apps/mobile-learner
  
  # iOS
  rm -rf build/
  
  # Android
  cd android
  ./gradlew clean
  ```

### Fix Failed Build

#### Check Logs
```bash
# GitHub Actions: View logs in Actions tab

# Fastlane: Check local logs
cd apps/mobile-learner
cat fastlane/report.xml
```

#### Common Fixes

**iOS Certificate Expired**:
1. Renew certificate in Apple Developer Portal
2. Update `IOS_CERTIFICATES_P12` secret
3. Retry build

**Android Keystore Issue**:
1. Verify keystore password
2. Update GitHub secrets
3. Retry build

**Tests Failing**:
1. Review test output
2. Fix failing tests
3. Run tests locally: `bundle exec fastlane ios test`
4. Retry deployment

---

## Environment Variables

### iOS (via Fastlane)
```bash
APPLE_ID="developer@aivolearning.com"
ITC_PROVIDER="12345678-1234-1234-1234-123456789012"
FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

### Android (via Fastlane)
```bash
KEYSTORE_FILE="./android/app/release.keystore"
KEYSTORE_PASSWORD="***"
KEY_ALIAS="aivo-release"
KEY_PASSWORD="***"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

---

## Notification Setup (Optional)

### Slack Webhook

1. Create webhook in Slack workspace
2. Add to GitHub secrets: `SLACK_WEBHOOK_URL`
3. Fastlane will automatically send notifications on:
   - ✅ Successful beta upload
   - ✅ Successful release upload
   - ❌ Failed builds

### Remove Slack Notifications

If not using Slack, remove these lines from `fastlane/Fastfile`:
```ruby
# Remove slack() calls
# Or set SLACK_WEBHOOK_URL="" to skip
```

---

## Status Monitoring

### Check Build Status

#### GitHub Actions
- View workflow runs in **Actions** tab
- Download artifacts (IPA, AAB)
- View test results

#### TestFlight (iOS)
- [App Store Connect](https://appstoreconnect.apple.com) > TestFlight
- View processing status
- Add testers when ready

#### Play Console (Android)
- [Play Console](https://play.google.com/console) > Testing > Beta
- View upload status
- Publish to testers when ready

---

## Helpful Links

- **Apple Developer Portal**: https://developer.apple.com/account
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **Fastlane Docs**: https://docs.fastlane.tools
- **GitHub Actions Docs**: https://docs.github.com/en/actions

---

## Support

For detailed setup and troubleshooting:
- **Android Setup**: [`android/app/KEYSTORE_SETUP.md`](./android/app/KEYSTORE_SETUP.md)
- **iOS Setup**: [`IOS_BUILD_CONFIGURATION.md`](./IOS_BUILD_CONFIGURATION.md)
- **GitHub Secrets**: [`GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md)
- **Phase 8 Summary**: [`MOBILE_LEARNER_PHASE8_COMPLETE.md`](./MOBILE_LEARNER_PHASE8_COMPLETE.md)

---

**Quick Reference: Mobile App Deployment**
