# Phase 8: Build & Deployment Configuration - COMPLETE ✅

**Status**: Complete  
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm")  
**Platform**: React Native Mobile App  

---

## 📋 Overview

Phase 8 implements a complete CI/CD pipeline for automated building and deployment of the AIVO Learning mobile app to both iOS App Store and Google Play Store.

---

## ✅ Completed Components

### 1. Android Build Configuration

#### `android/app/build.gradle`
**Purpose**: Gradle build configuration for Android app

**Key Features**:
- Application ID: `com.aivolearning.learner`
- SDK Configuration:
  - compileSdk: 34
  - minSdk: 24
  - targetSdk: 34
  - Version: 1.0.0 (versionCode: 1)
- Signing Configurations:
  - Debug: Built-in debug keystore
  - Release: Production keystore (from gradle.properties or env vars)
- Build Types:
  - Debug: Debuggable, no minification
  - Release: ProGuard enabled, Hermes enabled, minified
- Multi-Architecture Support:
  - armeabi-v7a (32-bit ARM)
  - arm64-v8a (64-bit ARM)
  - x86 (32-bit emulator)
  - x86_64 (64-bit emulator)
- New Architecture: Ready for React Native 0.76+ features
- Dependencies:
  - React Native core
  - AndroidX libraries
  - Multidex support
  - Flipper (debug builds only)

**Configuration Options**:
```gradle
// Via gradle.properties (local development)
AIVO_RELEASE_STORE_FILE=release.keystore
AIVO_RELEASE_STORE_PASSWORD=***
AIVO_RELEASE_KEY_ALIAS=aivo-release
AIVO_RELEASE_KEY_PASSWORD=***

// Via environment variables (CI/CD)
KEYSTORE_FILE
KEYSTORE_PASSWORD
KEY_ALIAS
KEY_PASSWORD
```

#### `android/app/proguard-rules.pro`
**Purpose**: Code obfuscation and optimization rules

**Features**:
- React Native Core: Preserve RN classes and annotations
- Hermes: Keep unicode ranges and JNI functions
- Third-Party Libraries:
  - WatermelonDB: Preserve model classes
  - FastImage: Keep native interfaces
  - Notifee: Preserve notification classes
  - OkHttp/Retrofit: Network library rules
  - Gson: JSON serialization rules
- Optimization:
  - 5 optimization passes
  - Remove logging in production
  - Preserve line numbers for stack traces
  - Keep generic signatures for debugging

#### `android/app/KEYSTORE_SETUP.md`
**Purpose**: Documentation for Android keystore creation and configuration

**Topics Covered**:
- Keystore generation using `keytool`
- Two configuration methods:
  1. Local development (gradle.properties)
  2. CI/CD (environment variables)
- Security best practices
- GitHub Actions setup
- Verification steps

---

### 2. iOS Build Configuration

#### `IOS_BUILD_CONFIGURATION.md`
**Purpose**: Complete guide for iOS build setup

**Topics Covered**:
1. Xcode Project Setup
   - Signing & Capabilities configuration
   - Build settings
   - Bundle identifier setup
2. Certificate Creation
   - Apple Distribution certificate
   - Certificate export for CI/CD
3. Provisioning Profiles
   - App Store profile creation
   - Profile installation
4. App Store Connect Setup
   - App creation
   - API key generation
   - Issuer ID and Key ID retrieval
5. Fastlane Match (optional)
6. GitHub Actions Secrets
   - All required secrets documented
   - Base64 encoding instructions
7. Local Testing
   - Beta build testing
   - Release build testing
8. Version Management
   - Manual version increment
   - Fastlane automation
9. TestFlight Distribution
10. App Store Submission
11. Troubleshooting guide

---

### 3. Fastlane Configuration

#### `fastlane/Fastfile`
**Purpose**: Automated build and deployment lanes for iOS and Android

**iOS Lanes**:
1. **`ios build`**: Build for testing
   - Uses development export method
   - Cleans before building
   
2. **`ios test`**: Run tests
   - Runs on iPhone 15 Pro simulator
   - Clean test environment
   
3. **`ios beta`**: Build and upload to TestFlight
   - Ensures clean git status
   - Auto-increments build number
   - Builds with App Store export method
   - Uploads to TestFlight (skip processing wait)
   - Commits version bump
   - Sends Slack notification
   
4. **`ios release`**: Deploy to App Store
   - Ensures on main branch
   - Auto-increments version (minor) and build
   - Builds with App Store export method
   - Uploads to App Store (draft mode)
   - Commits version bump
   - Creates git tag (e.g., v1.0.0-ios)
   - Pushes to remote
   - Sends Slack notification
   
5. **`ios screenshots`**: Capture App Store screenshots

**Android Lanes**:
1. **`android build`**: Build for testing
   - Assembles debug APK
   
2. **`android test`**: Run tests
   - Runs unit tests
   
3. **`android beta`**: Build and upload to Play Store Beta
   - Ensures clean git status
   - Auto-increments version code
   - Builds release bundle (AAB)
   - Signs with release keystore
   - Uploads to Play Store beta track (draft)
   - Commits version bump
   - Sends Slack notification
   
4. **`android release`**: Deploy to Play Store Production
   - Ensures on main branch
   - Auto-increments version name (minor) and code
   - Builds release bundle (AAB)
   - Signs with release keystore
   - Uploads to Play Store production track (draft)
   - Commits version bump
   - Creates git tag (e.g., v1.0.0-android)
   - Pushes to remote
   - Sends Slack notification
   
5. **`android screenshots`**: Capture Play Store screenshots

**Error Handling**:
- Both platforms have error callbacks
- Sends Slack notifications on failure
- Includes error details in notifications

---

### 4. GitHub Actions Workflow

#### `.github/workflows/mobile-release.yml`
**Purpose**: Automated CI/CD pipeline for mobile releases

**Triggers**:
- **Push**: Tags matching `v*.*.*-mobile`, `v*.*.*-ios`, or `v*.*.*-android`
- **Manual**: Workflow dispatch with platform and track selection

**Jobs**:

##### **ios-build**
**Runner**: macOS-14 (Xcode 15)
**Conditions**: Triggers on iOS-related tags or manual iOS/both selection

**Steps**:
1. Checkout code (full history)
2. Setup Ruby 3.2 with bundler cache
3. Setup Node.js 20
4. Install pnpm 10
5. Setup pnpm cache
6. Install dependencies (`pnpm install --frozen-lockfile`)
7. Install CocoaPods
8. Configure App Store Connect API key
9. Setup signing certificates:
   - Create temporary keychain
   - Import distribution certificate
   - Install provisioning profile
10. Run tests (continue on error)
11. Build and deploy:
    - Beta: Upload to TestFlight
    - Release: Upload to App Store
12. Cleanup keychain
13. Upload artifacts (IPA, test results)

##### **android-build**
**Runner**: ubuntu-latest
**Conditions**: Triggers on Android-related tags or manual Android/both selection

**Steps**:
1. Checkout code (full history)
2. Setup Ruby 3.2 with bundler cache
3. Setup Node.js 20
4. Install pnpm 10
5. Setup pnpm cache
6. Setup Java 17 (Temurin) with Gradle cache
7. Install dependencies (`pnpm install --frozen-lockfile`)
8. Setup Android keystore (decode from base64)
9. Create Play Store service account JSON
10. Run tests (continue on error)
11. Build and deploy:
    - Beta: Upload to Play Store beta track
    - Release: Upload to Play Store production track
12. Cleanup (remove keystore and JSON)
13. Upload artifacts (AAB, APK, test results)

##### **create-release**
**Runner**: ubuntu-latest
**Conditions**: Runs if either iOS or Android build succeeds
**Dependencies**: ios-build, android-build

**Steps**:
1. Checkout code
2. Download iOS artifacts (if available)
3. Download Android artifacts (if available)
4. Extract version from tag or generate timestamp
5. Create GitHub Release:
   - Tag name with version
   - Draft or prerelease based on track
   - Attach IPA and AAB files
   - Include build status in description

##### **notify**
**Runner**: ubuntu-latest
**Conditions**: Always runs after builds
**Dependencies**: ios-build, android-build

**Steps**:
1. Send Slack notification with:
   - Overall status
   - iOS build result
   - Android build result
   - Trigger type

---

### 5. Documentation

#### `GITHUB_SECRETS_SETUP.md`
**Purpose**: Complete guide for configuring GitHub Actions secrets

**Secrets Documented**:

**iOS Secrets** (9 required):
1. `IOS_CERTIFICATES_P12` - Base64 distribution certificate
2. `IOS_CERTIFICATES_PASSWORD` - Certificate password
3. `IOS_PROVISIONING_PROFILE` - Base64 provisioning profile
4. `APP_STORE_CONNECT_API_KEY` - API key .p8 content
5. `APP_STORE_CONNECT_KEY_ID` - Key ID
6. `APPLE_ID` - Apple ID email
7. `ITC_PROVIDER` - Team ID/Issuer ID
8. `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` - App-specific password
9. `KEYCHAIN_PASSWORD` - CI keychain password

**Android Secrets** (5 required):
1. `ANDROID_KEYSTORE_BASE64` - Base64 keystore
2. `ANDROID_KEYSTORE_PASSWORD` - Keystore password
3. `ANDROID_KEY_ALIAS` - Key alias
4. `ANDROID_KEY_PASSWORD` - Key password
5. `PLAY_STORE_JSON_KEY` - Service account JSON

**Optional**:
- `SLACK_WEBHOOK_URL` - Slack notifications

**Features**:
- Detailed instructions for obtaining each secret
- CLI commands for adding secrets
- Verification checklists
- Security best practices
- Troubleshooting guide

#### `Gemfile`
**Purpose**: Ruby dependencies for Fastlane

**Dependencies**:
- `fastlane` ~> 2.220.0
- `cocoapods` ~> 1.15
- `fastlane-plugin-firebase_app_distribution`
- `fastlane-plugin-increment_version_code`
- `xcodeproj`
- `xcode-install`

---

## 📦 Installation Guide

### Prerequisites
```bash
# Install Ruby dependencies
cd apps/mobile-learner
bundle install

# Install Node dependencies
pnpm install

# iOS: Install CocoaPods
cd ios
pod install
cd ..

# Android: Setup keystore (see android/app/KEYSTORE_SETUP.md)
keytool -genkey -v -keystore android/app/release.keystore \
  -alias aivo-release -keyalg RSA -keysize 2048 -validity 10000
```

### Local Testing

#### Test iOS Beta Build
```bash
cd apps/mobile-learner
bundle exec fastlane ios beta
```

#### Test Android Beta Build
```bash
cd apps/mobile-learner
bundle exec fastlane android beta
```

### GitHub Actions Setup
1. Configure all secrets (see `GITHUB_SECRETS_SETUP.md`)
2. Push a tag to trigger workflow:
   ```bash
   git tag v1.0.0-mobile
   git push origin v1.0.0-mobile
   ```
3. Or trigger manually via GitHub Actions UI

---

## 🎯 Usage Examples

### Deploy Beta to TestFlight
```bash
# Tag and push
git tag v1.0.0-ios
git push origin v1.0.0-ios

# Or run locally
bundle exec fastlane ios beta
```

### Deploy Beta to Play Store
```bash
# Tag and push
git tag v1.0.0-android
git push origin v1.0.0-android

# Or run locally
bundle exec fastlane android beta
```

### Deploy Both Platforms (Beta)
```bash
git tag v1.0.0-mobile
git push origin v1.0.0-mobile
```

### Deploy to Production (App Store)
```bash
# Run locally (recommended for production)
bundle exec fastlane ios release

# Or manually via GitHub Actions:
# - Go to Actions tab
# - Select "Mobile App Release"
# - Click "Run workflow"
# - Choose platform: ios
# - Choose track: release
```

### Deploy to Production (Play Store)
```bash
# Run locally (recommended for production)
bundle exec fastlane android release

# Or manually via GitHub Actions
```

---

## 🔄 Deployment Workflow

### Beta Deployment Process
1. **Commit Changes**: Push your changes to main branch
2. **Create Tag**: `git tag v1.0.0-mobile`
3. **Push Tag**: `git push origin v1.0.0-mobile`
4. **GitHub Actions**:
   - Checks out code
   - Installs dependencies
   - Runs tests
   - Builds apps
   - Uploads to TestFlight/Play Store Beta
5. **TestFlight**:
   - iOS build appears in TestFlight within 30 minutes
   - Add testers and distribute
6. **Play Store Beta**:
   - Android build appears in Play Store Console
   - Publish to beta testers

### Production Deployment Process
1. **Test Beta**: Ensure beta builds are thoroughly tested
2. **Update Version**: Increment version in code (or let Fastlane handle it)
3. **Run Release Lane**:
   - iOS: `bundle exec fastlane ios release`
   - Android: `bundle exec fastlane android release`
4. **App Store Connect**:
   - Build uploaded in draft mode
   - Add metadata, screenshots
   - Submit for review
5. **Play Store Console**:
   - Build uploaded in draft mode
   - Add metadata, screenshots
   - Submit for review

---

## 📊 Build Matrix

| Platform | Track    | Command                          | Destination            |
|----------|----------|----------------------------------|------------------------|
| iOS      | Beta     | `fastlane ios beta`              | TestFlight            |
| iOS      | Release  | `fastlane ios release`           | App Store (draft)     |
| Android  | Beta     | `fastlane android beta`          | Play Store Beta       |
| Android  | Release  | `fastlane android release`       | Play Store Production |

---

## 🔍 Verification Steps

### iOS Build Verification
```bash
# Check certificate
security find-identity -v -p codesigning

# Check provisioning profiles
ls ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify build settings
cd apps/mobile-learner/ios
xcodebuild -showBuildSettings -workspace AivoLearner.xcworkspace -scheme AivoLearner

# Test build locally
bundle exec fastlane ios build
```

### Android Build Verification
```bash
# Check keystore
keytool -list -v -keystore android/app/release.keystore

# Test build locally
cd apps/mobile-learner/android
./gradlew assembleRelease

# Verify APK
apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚨 Troubleshooting

### iOS Issues

#### Certificate Not Found
**Problem**: "No signing identity found"
**Solution**:
1. Verify certificate installed: `security find-identity -v`
2. Check `IOS_CERTIFICATES_P12` secret is correct
3. Verify `IOS_CERTIFICATES_PASSWORD` is correct

#### Provisioning Profile Error
**Problem**: "No profile for bundle identifier"
**Solution**:
1. Verify bundle ID matches: `com.aivolearning.learner`
2. Check provisioning profile is installed
3. Verify `IOS_PROVISIONING_PROFILE` secret is correct

#### TestFlight Upload Fails
**Problem**: "Authentication failed"
**Solution**:
1. Check `APP_STORE_CONNECT_API_KEY` includes headers
2. Verify `APP_STORE_CONNECT_KEY_ID` is correct
3. Ensure API key has "Developer" access

### Android Issues

#### Keystore Error
**Problem**: "Keystore was tampered with"
**Solution**:
1. Verify `ANDROID_KEYSTORE_PASSWORD` is correct
2. Check `ANDROID_KEY_PASSWORD` matches
3. Ensure keystore base64 encoded correctly

#### Signing Failed
**Problem**: "Failed to read key"
**Solution**:
1. Verify `ANDROID_KEY_ALIAS` matches keystore alias
2. Check keystore file path is correct
3. Ensure all signing properties are set

#### Play Store Upload Fails
**Problem**: "Permission denied"
**Solution**:
1. Verify service account has "Release Manager" role
2. Check `PLAY_STORE_JSON_KEY` is valid JSON
3. Ensure app exists in Play Console

---

## 📚 Related Documentation

- **Android Setup**: [`android/app/KEYSTORE_SETUP.md`](../../android/app/KEYSTORE_SETUP.md)
- **iOS Setup**: [`IOS_BUILD_CONFIGURATION.md`](./IOS_BUILD_CONFIGURATION.md)
- **GitHub Secrets**: [`GITHUB_SECRETS_SETUP.md`](./GITHUB_SECRETS_SETUP.md)
- **Fastlane**: [`fastlane/Fastfile`](./fastlane/Fastfile)
- **Workflow**: [`../../.github/workflows/mobile-release.yml`](../../.github/workflows/mobile-release.yml)

---

## 🎉 Phase 8 Summary

**Completed**:
✅ Android build configuration (Gradle, ProGuard, keystore setup)
✅ iOS build configuration guide (certificates, profiles, App Store Connect)
✅ Fastlane automation (8 lanes: build, test, beta, release for both platforms)
✅ GitHub Actions workflow (automated CI/CD with matrix builds)
✅ Comprehensive documentation (setup guides, secrets, troubleshooting)
✅ Ruby dependencies (Gemfile with Fastlane and plugins)

**Outcome**: Complete CI/CD pipeline ready for automated deployment to iOS App Store and Google Play Store with beta and production tracks.

**Next Steps**:
1. Configure GitHub secrets (see `GITHUB_SECRETS_SETUP.md`)
2. Setup iOS certificates and profiles (see `IOS_BUILD_CONFIGURATION.md`)
3. Create Android keystore (see `android/app/KEYSTORE_SETUP.md`)
4. Test local builds with Fastlane
5. Push a tag to trigger automated deployment

---

**Phase 8: Build & Deployment Configuration - COMPLETE ✅**
