# iOS Build Configuration Guide

## Overview
This guide explains how to configure your iOS app for App Store distribution using Xcode, certificates, and provisioning profiles.

## Prerequisites
- macOS with Xcode 15 or later
- Apple Developer account ($99/year)
- Access to App Store Connect

## Step 1: Xcode Project Setup

### 1.1 Open Xcode Project
```bash
cd apps/mobile-learner/ios
open AivoLearner.xcworkspace
```

### 1.2 Configure Signing & Capabilities
1. Select `AivoLearner` project in navigator
2. Select `AivoLearner` target
3. Go to **Signing & Capabilities** tab
4. Set the following:
   - **Bundle Identifier**: `com.aivolearning.learner`
   - **Team**: Select your Apple Developer team
   - **Signing Certificate**: Apple Distribution
   - **Provisioning Profile**: Select "Automatic" or create manual profiles

### 1.3 Build Settings
1. Go to **Build Settings** tab
2. Ensure the following settings:
   ```
   PRODUCT_BUNDLE_IDENTIFIER = com.aivolearning.learner
   DEVELOPMENT_TEAM = <Your Team ID>
   CODE_SIGN_STYLE = Automatic (or Manual if using custom profiles)
   CODE_SIGN_IDENTITY = Apple Distribution
   PROVISIONING_PROFILE_SPECIFIER = <Profile Name>
   ```

## Step 2: Create Certificates

### 2.1 Apple Distribution Certificate
1. Open **Keychain Access** on your Mac
2. Go to **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority**
3. Enter your email and name, select **Saved to disk**
4. Save the `.certSigningRequest` file

5. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
6. Click **+** to create a new certificate
7. Select **Apple Distribution** (for App Store)
8. Upload the `.certSigningRequest` file
9. Download the certificate (`.cer` file)
10. Double-click to install in Keychain

### 2.2 Export Certificate for CI/CD
```bash
# Export as .p12 file (for GitHub Actions)
# In Keychain Access:
# 1. Find your certificate under "login" keychain
# 2. Right-click > Export "Apple Distribution: Your Name"
# 3. Choose .p12 format
# 4. Set a password (you'll need this for CI/CD)
```

## Step 3: Create Provisioning Profiles

### 3.1 App Store Provisioning Profile
1. Go to [Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click **+** to create a new profile
3. Select **App Store** distribution
4. Select your App ID: `com.aivolearning.learner`
5. Select your Apple Distribution certificate
6. Name it: `AIVO Learning Learner App - App Store`
7. Download the `.mobileprovision` file

### 3.2 Install Provisioning Profile
```bash
# Copy to Xcode provisioning profiles directory
cp ~/Downloads/AIVO_Learning_*.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
```

## Step 4: App Store Connect Setup

### 4.1 Create App
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** > **+** > **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: AIVO Learning - Learner App
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.aivolearning.learner`
   - **SKU**: `aivo-learner-ios`

### 4.2 Create App Store Connect API Key
1. Go to **Users and Access** > **Keys** tab
2. Click **+** to create new key
3. Enter name: `AIVO Learning CI/CD`
4. Select **Developer** access
5. Click **Generate**
6. Download the `.p8` file (only shown once!)
7. Note the **Key ID** and **Issuer ID**

### 4.3 Save API Key Details
```bash
# You'll need these for GitHub Actions secrets:
# - Key ID (e.g., ABC123XYZ4)
# - Issuer ID (e.g., 12345678-1234-1234-1234-123456789012)
# - .p8 file content (base64 encoded)
```

## Step 5: Configure Fastlane Match (Optional)

If you want to use Fastlane Match for certificate management:

```bash
cd apps/mobile-learner
bundle exec fastlane match init
```

Follow the prompts to set up a private Git repository for storing certificates.

## Step 6: GitHub Actions Secrets

Add these secrets to your GitHub repository:

### iOS Signing Secrets
```bash
# IOS_CERTIFICATES_P12
# Base64 encoded .p12 certificate file
base64 -i ~/path/to/certificate.p12 | pbcopy

# IOS_CERTIFICATES_PASSWORD
# Password you set when exporting the .p12 file

# IOS_PROVISIONING_PROFILE
# Base64 encoded .mobileprovision file
base64 -i ~/Library/MobileDevice/Provisioning\ Profiles/profile.mobileprovision | pbcopy
```

### App Store Connect Secrets
```bash
# APP_STORE_CONNECT_API_KEY
# Content of the .p8 file (not base64, just the raw file content)
cat ~/path/to/AuthKey_ABC123XYZ4.p8

# APP_STORE_CONNECT_KEY_ID
# Key ID from App Store Connect (e.g., ABC123XYZ4)

# APPLE_ID
# Your Apple ID email address

# ITC_PROVIDER
# Your Team ID (find in App Store Connect > Users and Access > Keys)

# FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD
# Generate at appleid.apple.com > Security > App-Specific Passwords
```

### Keychain Secret
```bash
# KEYCHAIN_PASSWORD
# Choose a strong password for the temporary keychain (e.g., generate a UUID)
```

## Step 7: Test Build Locally

### 7.1 Install Fastlane
```bash
cd apps/mobile-learner
bundle install
```

### 7.2 Test Beta Build
```bash
bundle exec fastlane ios beta
```

This will:
- Increment build number
- Build the app
- Upload to TestFlight
- Send Slack notification (if configured)

### 7.3 Test Release Build
```bash
bundle exec fastlane ios release
```

This will:
- Increment version and build number
- Build the app
- Upload to App Store Connect
- Create Git tag
- Send Slack notification (if configured)

## Step 8: Version Management

### Current Version
- Version Name: `1.0.0` (in `Info.plist`)
- Build Number: Auto-incremented by Fastlane

### Increment Version Manually
```bash
# Increment minor version (1.0.0 -> 1.1.0)
bundle exec fastlane run increment_version_number bump_type:minor

# Increment patch version (1.0.0 -> 1.0.1)
bundle exec fastlane run increment_version_number bump_type:patch

# Increment major version (1.0.0 -> 2.0.0)
bundle exec fastlane run increment_version_number bump_type:major
```

## Step 9: TestFlight Distribution

After building and uploading to TestFlight:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app > **TestFlight** tab
3. Select the build you just uploaded
4. Add **What to Test** notes
5. Add internal testers (up to 100)
6. Add external testers (requires Beta App Review)

## Step 10: App Store Submission

When ready for production:

1. Go to **App Store** tab in App Store Connect
2. Click **+** next to **iOS App** to create a version
3. Fill in all required metadata:
   - Description
   - Keywords
   - Screenshots (required for all device sizes)
   - App icon
   - Support URL
   - Privacy Policy URL
4. Select the build from TestFlight
5. Click **Submit for Review**

## Troubleshooting

### Build Fails with Signing Error
- Verify certificate is installed in Keychain
- Verify provisioning profile is installed
- Check Bundle ID matches exactly
- Verify Team ID is correct

### TestFlight Upload Fails
- Check App Store Connect API key is valid
- Verify APPLE_ID and ITC_PROVIDER are correct
- Ensure build number is unique (higher than previous)

### "No profiles for team" Error
- Run `bundle exec fastlane match development` to sync profiles
- Or create profiles manually in Apple Developer Portal

## Resources

- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Fastlane Documentation](https://docs.fastlane.tools)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
