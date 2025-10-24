# Mobile Deployment Setup Checklist

Complete this checklist to set up the mobile app deployment pipeline.

---

## ✅ Phase 1: Initial Setup

### 1.1 Install Dependencies

- [ ] Install Ruby 3.0+ on your system
- [ ] Install Bundler: `gem install bundler`
- [ ] Install project dependencies:
  ```bash
  cd apps/mobile-learner
  bundle install
  ```
- [ ] Install pnpm dependencies:
  ```bash
  cd ../..
  pnpm install
  ```

### 1.2 iOS Setup

- [ ] macOS with Xcode 15+ installed
- [ ] Open Xcode project:
  ```bash
  cd apps/mobile-learner/ios
  open AivoLearner.xcworkspace
  ```
- [ ] Install CocoaPods:
  ```bash
  gem install cocoapods
  pod install
  ```

### 1.3 Android Setup

- [ ] Java 17+ installed (check: `java -version`)
- [ ] Android Studio installed (optional but recommended)
- [ ] Android SDK installed with:
  - [ ] SDK Platform 34
  - [ ] Build Tools 34.0.0
  - [ ] NDK (if using native modules)

---

## ✅ Phase 2: Apple Developer Setup

### 2.1 Apple Developer Account

- [ ] Active Apple Developer account ($99/year)
- [ ] Signed in to [Apple Developer Portal](https://developer.apple.com/account)
- [ ] Team ID noted (found in Membership section)

### 2.2 App Store Connect

- [ ] App created in [App Store Connect](https://appstoreconnect.apple.com)
  - Name: AIVO Learning - Learner App
  - Bundle ID: com.aivolearning.learner
  - SKU: aivo-learner-ios
- [ ] App Store Connect API Key created:
  - [ ] Name: AIVO Learning CI/CD
  - [ ] Access: Developer
  - [ ] .p8 file downloaded (keep secure!)
  - [ ] Key ID noted
  - [ ] Issuer ID noted

### 2.3 iOS Certificates

- [ ] Apple Distribution certificate created
- [ ] Certificate downloaded and installed in Keychain
- [ ] Certificate exported as .p12 with password
- [ ] .p12 file converted to base64:
  ```bash
  base64 -i certificate.p12 | pbcopy
  ```

### 2.4 Provisioning Profiles

- [ ] App Store provisioning profile created
  - Profile type: App Store
  - App ID: com.aivolearning.learner
  - Certificate: Apple Distribution
- [ ] Provisioning profile downloaded
- [ ] Provisioning profile installed:
  ```bash
  cp ~/Downloads/*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
  ```
- [ ] Provisioning profile converted to base64:
  ```bash
  base64 -i profile.mobileprovision | pbcopy
  ```

### 2.5 App-Specific Password

- [ ] Generated at [appleid.apple.com](https://appleid.apple.com)
- [ ] Navigate to Security > App-Specific Passwords
- [ ] Create password with label "AIVO Learning Fastlane"
- [ ] Password saved securely

---

## ✅ Phase 3: Google Play Setup

### 3.1 Google Play Console

- [ ] Developer account created ($25 one-time fee)
- [ ] Signed in to [Play Console](https://play.google.com/console)
- [ ] App created:
  - Name: AIVO Learning - Learner App
  - Package: com.aivolearning.learner

### 3.2 Service Account

- [ ] Go to Setup > API access
- [ ] Service account created:
  - Name: AIVO Learning Release
  - Role: Release Manager
- [ ] JSON key downloaded and saved securely
- [ ] Service account granted access to app

### 3.3 Android Keystore

- [ ] Keystore generated:
  ```bash
  cd apps/mobile-learner/android/app
  keytool -genkey -v -keystore release.keystore \
    -alias aivo-release -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Keystore password recorded (keep secure!)
- [ ] Key alias recorded: `aivo-release`
- [ ] Key password recorded (keep secure!)
- [ ] Keystore backed up to secure location (NOT in Git!)
- [ ] Keystore converted to base64:
  ```bash
  base64 -i release.keystore | pbcopy  # Mac
  # OR
  certutil -encode release.keystore keystore.txt  # Windows
  ```

---

## ✅ Phase 4: GitHub Secrets Configuration

### 4.1 iOS Secrets

Navigate to: Repository > Settings > Secrets and variables > Actions

- [ ] `IOS_CERTIFICATES_P12` - Base64 .p12 certificate
- [ ] `IOS_CERTIFICATES_PASSWORD` - Certificate export password
- [ ] `IOS_PROVISIONING_PROFILE` - Base64 provisioning profile
- [ ] `APP_STORE_CONNECT_API_KEY` - .p8 file content (with headers)
- [ ] `APP_STORE_CONNECT_KEY_ID` - Key ID from App Store Connect
- [ ] `APPLE_ID` - Your Apple ID email
- [ ] `ITC_PROVIDER` - Team ID / Issuer ID
- [ ] `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` - App-specific password
- [ ] `KEYCHAIN_PASSWORD` - Generate random password (e.g., `uuidgen`)

### 4.2 Android Secrets

- [ ] `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- [ ] `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- [ ] `ANDROID_KEY_ALIAS` - Key alias (aivo-release)
- [ ] `ANDROID_KEY_PASSWORD` - Key password
- [ ] `PLAY_STORE_JSON_KEY` - Service account JSON content

### 4.3 Optional Secrets

- [ ] `SLACK_WEBHOOK_URL` - Slack webhook for notifications (optional)

**Verification**:
```bash
# Use GitHub CLI to verify secrets are set
gh secret list
```

---

## ✅ Phase 5: Local Testing

### 5.1 iOS Local Testing

- [ ] Build test:
  ```bash
  cd apps/mobile-learner
  bundle exec fastlane ios build
  ```
  **Expected**: Successful build, IPA created

- [ ] Test run:
  ```bash
  bundle exec fastlane ios test
  ```
  **Expected**: Tests pass on simulator

- [ ] Beta upload test (requires all secrets):
  ```bash
  bundle exec fastlane ios beta
  ```
  **Expected**: Build uploaded to TestFlight

### 5.2 Android Local Testing

- [ ] Build test:
  ```bash
  cd apps/mobile-learner
  bundle exec fastlane android build
  ```
  **Expected**: Successful build, APK created

- [ ] Test run:
  ```bash
  bundle exec fastlane android test
  ```
  **Expected**: Tests pass

- [ ] Beta upload test (requires all secrets):
  ```bash
  bundle exec fastlane android beta
  ```
  **Expected**: Build uploaded to Play Store Beta

---

## ✅ Phase 6: GitHub Actions Testing

### 6.1 Test Beta Deployment

- [ ] Create and push tag:
  ```bash
  git tag v1.0.0-mobile
  git push origin v1.0.0-mobile
  ```
- [ ] Check workflow in GitHub Actions tab
- [ ] Verify iOS build succeeds
- [ ] Verify Android build succeeds
- [ ] Check TestFlight for iOS build
- [ ] Check Play Console for Android build

### 6.2 Test Manual Workflow

- [ ] Go to Actions > Mobile App Release
- [ ] Click "Run workflow"
- [ ] Select platform: both
- [ ] Select track: beta
- [ ] Click "Run workflow"
- [ ] Verify both builds succeed

---

## ✅ Phase 7: Production Verification

### 7.1 iOS Production

- [ ] TestFlight build distributed to testers
- [ ] Beta testing completed (minimum 1-2 weeks)
- [ ] No critical bugs reported
- [ ] Run production build:
  ```bash
  bundle exec fastlane ios release
  ```
- [ ] Build appears in App Store Connect
- [ ] Complete app metadata (screenshots, description, etc.)
- [ ] Submit for App Review
- [ ] App approved and live

### 7.2 Android Production

- [ ] Play Store beta distributed to testers
- [ ] Beta testing completed (minimum 1-2 weeks)
- [ ] No critical bugs reported
- [ ] Run production build:
  ```bash
  bundle exec fastlane android release
  ```
- [ ] Build appears in Play Console
- [ ] Complete app metadata (screenshots, description, etc.)
- [ ] Submit for review
- [ ] App approved and live

---

## ✅ Phase 8: Monitoring & Maintenance

### 8.1 Setup Monitoring

- [ ] Enable App Store Connect notifications
- [ ] Enable Play Console notifications
- [ ] Setup crash reporting (Firebase Crashlytics)
- [ ] Setup analytics (Firebase Analytics)
- [ ] Configure Slack notifications (optional)

### 8.2 Regular Maintenance

- [ ] Schedule regular security updates
- [ ] Review and renew certificates annually
- [ ] Rotate keystore passwords every 6 months
- [ ] Update dependencies monthly
- [ ] Review App Store/Play Store policies quarterly

---

## 📋 Quick Reference

### Files Created
- ✅ `android/app/build.gradle` - Android build config
- ✅ `android/app/proguard-rules.pro` - ProGuard rules
- ✅ `android/app/KEYSTORE_SETUP.md` - Keystore guide
- ✅ `fastlane/Fastfile` - Fastlane lanes
- ✅ `Gemfile` - Ruby dependencies
- ✅ `.github/workflows/mobile-release.yml` - CI/CD workflow
- ✅ `IOS_BUILD_CONFIGURATION.md` - iOS setup guide
- ✅ `GITHUB_SECRETS_SETUP.md` - Secrets documentation
- ✅ `MOBILE_LEARNER_PHASE8_COMPLETE.md` - Phase summary
- ✅ `MOBILE_DEPLOYMENT_QUICK_REFERENCE.md` - Quick commands
- ✅ `MOBILE_DEPLOYMENT_CHECKLIST.md` - This checklist

### Key Commands
```bash
# Install dependencies
bundle install
pnpm install

# iOS beta
bundle exec fastlane ios beta

# Android beta
bundle exec fastlane android beta

# Trigger via tag
git tag v1.0.0-mobile && git push origin v1.0.0-mobile
```

### Important URLs
- Apple Developer: https://developer.apple.com/account
- App Store Connect: https://appstoreconnect.apple.com
- Play Console: https://play.google.com/console
- Fastlane Docs: https://docs.fastlane.tools

---

## 🆘 Troubleshooting

### Common Issues

**iOS Certificate Issues**:
- See: `IOS_BUILD_CONFIGURATION.md` > Troubleshooting

**Android Keystore Issues**:
- See: `android/app/KEYSTORE_SETUP.md`

**GitHub Actions Failures**:
- Check: `.github/workflows/mobile-release.yml` error messages
- Verify: All secrets are correctly configured
- Review: Fastlane logs in workflow output

**Slack Not Working**:
- Remove `SLACK_WEBHOOK_URL` secret if not using
- Or set up webhook: [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

## ✅ Final Verification

- [ ] All iOS secrets configured
- [ ] All Android secrets configured
- [ ] Local iOS build succeeds
- [ ] Local Android build succeeds
- [ ] GitHub Actions workflow succeeds
- [ ] TestFlight build received
- [ ] Play Console build received
- [ ] Documentation reviewed
- [ ] Team trained on deployment process
- [ ] Emergency rollback procedure documented

---

**Status**: Ready for Production Deployment! 🚀

**Next Steps**:
1. Test beta builds with real users
2. Collect feedback and fix issues
3. Run production deployment
4. Monitor app performance and crashes
5. Plan next release cycle

---

**Mobile Deployment Setup - Complete! ✅**
