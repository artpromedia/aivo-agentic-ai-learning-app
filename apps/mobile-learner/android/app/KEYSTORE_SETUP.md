# Keystore Configuration for AIVO Learning Mobile App

This document describes how to configure the Android keystore for release builds.

## Option 1: Local Development (gradle.properties)

1. Create or edit `~/.gradle/gradle.properties` (or `android/gradle.properties` for project-specific):

```properties
AIVO_UPLOAD_STORE_FILE=aivo-learner-release.keystore
AIVO_UPLOAD_KEY_ALIAS=aivo-learner
AIVO_UPLOAD_STORE_PASSWORD=your_keystore_password
AIVO_UPLOAD_KEY_PASSWORD=your_key_password
```

2. Place your keystore file in `android/app/`

## Option 2: CI/CD Environment Variables

Set the following environment variables in your CI/CD system:

```bash
KEYSTORE_FILE=/path/to/keystore.keystore
KEYSTORE_PASSWORD=your_keystore_password
KEY_ALIAS=aivo-learner
KEY_PASSWORD=your_key_password
```

## Generate New Keystore

If you don't have a keystore yet:

```bash
cd android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore aivo-learner-release.keystore \
  -alias aivo-learner \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**IMPORTANT:** 
- Store the keystore file securely (NEVER commit to git)
- Backup the keystore - you cannot update your app without it
- Save the passwords in a secure password manager

## GitHub Actions Setup

Add these secrets to your GitHub repository:
1. Go to Settings > Secrets and variables > Actions
2. Add:
   - `KEYSTORE_BASE64`: Base64 encoded keystore file
   - `KEYSTORE_PASSWORD`: Keystore password
   - `KEY_ALIAS`: Key alias (usually "aivo-learner")
   - `KEY_PASSWORD`: Key password

To encode keystore:
```bash
base64 -i aivo-learner-release.keystore | pbcopy  # macOS
base64 -w 0 aivo-learner-release.keystore         # Linux
```

## Verify Configuration

Test your release build:

```bash
cd android
./gradlew assembleRelease

# APK will be in:
# app/build/outputs/apk/release/app-release.apk
```
