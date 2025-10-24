# GitHub Secrets Configuration Guide

This document lists all required GitHub Actions secrets for the Mobile App Release workflow.

## 🔐 Required Secrets

### iOS Secrets

#### `IOS_CERTIFICATES_P12`
- **Description**: Base64-encoded iOS distribution certificate (.p12 file)
- **How to get**:
  1. Open Keychain Access on Mac
  2. Find "Apple Distribution: Your Name" certificate
  3. Right-click > Export "Apple Distribution..."
  4. Save as `.p12` with a password
  5. Run: `base64 -i certificate.p12 | pbcopy`
  6. Paste into GitHub secret
- **Example**: `MIIKvgIBAzCCCncGCSqGSIb3DQEHAaCCCmgEggpkMII...`

#### `IOS_CERTIFICATES_PASSWORD`
- **Description**: Password used when exporting the .p12 certificate
- **How to get**: The password you created during .p12 export
- **Example**: `MySecureP12Password123!`

#### `IOS_PROVISIONING_PROFILE`
- **Description**: Base64-encoded iOS App Store provisioning profile
- **How to get**:
  1. Download `.mobileprovision` from [Apple Developer Portal](https://developer.apple.com/account/resources/profiles/list)
  2. Run: `base64 -i profile.mobileprovision | pbcopy`
  3. Paste into GitHub secret
- **Example**: `MIIMgAYJKoZIhvcNAQcCoIIMcTCCDG0CAQExDzANBglgh...`

#### `APP_STORE_CONNECT_API_KEY`
- **Description**: App Store Connect API key (.p8 file content)
- **How to get**:
  1. Go to [App Store Connect](https://appstoreconnect.apple.com)
  2. Navigate to Users and Access > Keys
  3. Create new key with Developer access
  4. Download the `.p8` file (only shown once!)
  5. Run: `cat AuthKey_ABC123XYZ4.p8`
  6. Copy the entire content including headers
- **Example**:
  ```
  -----BEGIN PRIVATE KEY-----
  MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
  -----END PRIVATE KEY-----
  ```

#### `APP_STORE_CONNECT_KEY_ID`
- **Description**: Key ID from App Store Connect API key
- **How to get**: Shown when creating the API key (e.g., `ABC123XYZ4`)
- **Example**: `ABC123XYZ4`

#### `APPLE_ID`
- **Description**: Your Apple ID email address
- **How to get**: The email you use to log into App Store Connect
- **Example**: `developer@aivolearning.com`

#### `ITC_PROVIDER`
- **Description**: iTunes Connect provider (Team ID)
- **How to get**:
  1. Go to App Store Connect > Users and Access > Keys
  2. Find "Issuer ID" at the top of the page
- **Example**: `12345678-1234-1234-1234-123456789012`

#### `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`
- **Description**: App-specific password for Apple ID
- **How to get**:
  1. Go to [appleid.apple.com](https://appleid.apple.com)
  2. Sign in with your Apple ID
  3. Navigate to Security section
  4. Click "Generate Password" under App-Specific Passwords
  5. Enter "AIVO Learning Fastlane" as the label
  6. Copy the generated password
- **Example**: `abcd-efgh-ijkl-mnop`

#### `KEYCHAIN_PASSWORD`
- **Description**: Temporary password for CI keychain
- **How to get**: Generate a strong random password (e.g., UUID)
- **Example**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Android Secrets

#### `ANDROID_KEYSTORE_BASE64`
- **Description**: Base64-encoded Android release keystore
- **How to get**:
  1. Create keystore (see `android/app/KEYSTORE_SETUP.md`)
  2. Run: `base64 -i release.keystore | pbcopy` (Mac) or `certutil -encode release.keystore keystore.txt` (Windows)
  3. Paste into GitHub secret
- **Example**: `/u3+7QAAAAIAAAABAAAAAQALYWl2by1yZWxlYXNlAAAB...`

#### `ANDROID_KEYSTORE_PASSWORD`
- **Description**: Password for the Android keystore
- **How to get**: The password you set when creating the keystore
- **Example**: `MySecureKeystorePassword123!`

#### `ANDROID_KEY_ALIAS`
- **Description**: Alias name for the signing key
- **How to get**: The alias you used when creating the keystore (default: `aivo-release`)
- **Example**: `aivo-release`

#### `ANDROID_KEY_PASSWORD`
- **Description**: Password for the signing key
- **How to get**: The key password you set when creating the keystore
- **Example**: `MySecureKeyPassword123!`

#### `PLAY_STORE_JSON_KEY`
- **Description**: Google Play Store service account JSON key
- **How to get**:
  1. Go to [Google Play Console](https://play.google.com/console)
  2. Navigate to Setup > API access
  3. Create a new service account or use existing
  4. Grant "Release Manager" permissions
  5. Create and download JSON key
  6. Copy the entire JSON content
- **Example**:
  ```json
  {
    "type": "service_account",
    "project_id": "api-123456789",
    "private_key_id": "abc123...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "aivo-release@api-123456789.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token"
  }
  ```

### Optional Secrets

#### `SLACK_WEBHOOK_URL`
- **Description**: Slack webhook URL for deployment notifications
- **How to get**:
  1. Go to your Slack workspace settings
  2. Navigate to Apps > Manage > Custom Integrations > Incoming Webhooks
  3. Add new webhook
  4. Select a channel for notifications
  5. Copy the webhook URL
- **Example**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
- **Note**: Optional - remove if not using Slack notifications

## 📋 Adding Secrets to GitHub

### Via GitHub Web UI
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

### Via GitHub CLI
```bash
# iOS secrets
gh secret set IOS_CERTIFICATES_P12 < certificate.p12.base64
gh secret set IOS_CERTIFICATES_PASSWORD -b "password"
gh secret set IOS_PROVISIONING_PROFILE < profile.mobileprovision.base64
gh secret set APP_STORE_CONNECT_API_KEY < AuthKey.p8
gh secret set APP_STORE_CONNECT_KEY_ID -b "ABC123XYZ4"
gh secret set APPLE_ID -b "developer@aivolearning.com"
gh secret set ITC_PROVIDER -b "12345678-1234-1234-1234-123456789012"
gh secret set FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD -b "abcd-efgh-ijkl-mnop"
gh secret set KEYCHAIN_PASSWORD -b "$(uuidgen)"

# Android secrets
gh secret set ANDROID_KEYSTORE_BASE64 < release.keystore.base64
gh secret set ANDROID_KEYSTORE_PASSWORD -b "password"
gh secret set ANDROID_KEY_ALIAS -b "aivo-release"
gh secret set ANDROID_KEY_PASSWORD -b "password"
gh secret set PLAY_STORE_JSON_KEY < play-store-key.json

# Optional
gh secret set SLACK_WEBHOOK_URL -b "https://hooks.slack.com/services/..."
```

## ✅ Verification Checklist

Before running the mobile release workflow, ensure all secrets are configured:

### iOS Checklist
- [ ] `IOS_CERTIFICATES_P12` - Base64 certificate
- [ ] `IOS_CERTIFICATES_PASSWORD` - Certificate password
- [ ] `IOS_PROVISIONING_PROFILE` - Base64 profile
- [ ] `APP_STORE_CONNECT_API_KEY` - .p8 key content
- [ ] `APP_STORE_CONNECT_KEY_ID` - Key ID
- [ ] `APPLE_ID` - Apple ID email
- [ ] `ITC_PROVIDER` - Team ID/Issuer ID
- [ ] `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` - App-specific password
- [ ] `KEYCHAIN_PASSWORD` - CI keychain password

### Android Checklist
- [ ] `ANDROID_KEYSTORE_BASE64` - Base64 keystore
- [ ] `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- [ ] `ANDROID_KEY_ALIAS` - Key alias
- [ ] `ANDROID_KEY_PASSWORD` - Key password
- [ ] `PLAY_STORE_JSON_KEY` - Service account JSON

### Optional Checklist
- [ ] `SLACK_WEBHOOK_URL` - Webhook URL (or remove Slack steps from workflow)

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
   - Use `.gitignore` for keystore, certificates, and keys
   - Use GitHub Secrets for CI/CD

2. **Rotate secrets regularly**
   - Change passwords every 90 days
   - Regenerate API keys annually

3. **Limit access**
   - Only grant necessary permissions to service accounts
   - Use separate keys for development and production

4. **Backup important files**
   - Keep encrypted backups of keystores and certificates
   - Store recovery information securely

5. **Monitor usage**
   - Review GitHub Actions logs for suspicious activity
   - Enable alerts for failed builds

## 🆘 Troubleshooting

### iOS Certificate Issues
- **Error**: "No signing identity found"
  - Verify `IOS_CERTIFICATES_P12` is correctly base64 encoded
  - Check `IOS_CERTIFICATES_PASSWORD` is correct

### Android Keystore Issues
- **Error**: "Keystore was tampered with, or password was incorrect"
  - Verify `ANDROID_KEYSTORE_PASSWORD` matches keystore password
  - Check `ANDROID_KEY_PASSWORD` matches key password

### App Store Connect Issues
- **Error**: "Authentication failed"
  - Verify `APP_STORE_CONNECT_API_KEY` includes BEGIN/END headers
  - Check `APP_STORE_CONNECT_KEY_ID` is correct
  - Verify API key has "Developer" or "Admin" access

### Play Store Issues
- **Error**: "Permission denied"
  - Verify service account has "Release Manager" role
  - Check `PLAY_STORE_JSON_KEY` is valid JSON

## 📚 Related Documentation

- [iOS Build Configuration](./IOS_BUILD_CONFIGURATION.md)
- [Android Keystore Setup](./android/app/KEYSTORE_SETUP.md)
- [Fastlane Configuration](./fastlane/Fastfile)
- [Mobile Release Workflow](../../.github/workflows/mobile-release.yml)
