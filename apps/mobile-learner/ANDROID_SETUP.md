# Android SDK Setup Guide for Aivo Learning Mobile App

## 🎯 Overview

This guide will help you set up Android development environment for the Aivo Learning React Native mobile app on Windows.

## 📋 Prerequisites

- Windows 10/11 64-bit
- At least 8 GB RAM (16 GB recommended)
- At least 10 GB free disk space
- Administrator access to install software

## 🔧 Step 1: Install Android Studio

### Download and Install

1. **Download Android Studio**
   - Go to: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept the terms and conditions
   - Size: ~1.1 GB

2. **Run the Installer**
   - Double-click `android-studio-<version>-windows.exe`
   - Click "Next" through the welcome screen
   - Choose **"Standard"** installation type (recommended)
   - Select your preferred UI theme
   - Review settings and click "Next"
   - Click "Finish" to start installation

3. **Initial Setup**
   - Android Studio will launch the SDK Manager
   - It will download required SDK components
   - This may take 15-30 minutes depending on your internet speed
   - Click "Finish" when complete

## 🛠️ Step 2: Install Android SDK Components

### Using SDK Manager

1. **Open SDK Manager**
   - Launch Android Studio
   - Click "More Actions" > "SDK Manager"
   - Or go to: Tools > SDK Manager

2. **Install SDK Platforms** (SDK Platforms tab)
   
   Check these items:
   - ☑️ **Android 14.0 (UpsideDownCake)** - API Level 34
   - ☑️ **Android 13.0 (Tiramisu)** - API Level 33 (fallback)
   
   Click "Show Package Details" (bottom right) and ensure:
   - ☑️ Android SDK Platform 34
   - ☑️ Google APIs Intel x86_64 Atom System Image
   - OR Google Play Intel x86_64 Atom System Image

3. **Install SDK Tools** (SDK Tools tab)
   
   Check these items:
   - ☑️ **Android SDK Build-Tools 34.0.0** (or latest)
   - ☑️ **Android SDK Command-line Tools (latest)**
   - ☑️ **Android Emulator**
   - ☑️ **Android SDK Platform-Tools**
   - ☑️ **Google Play Services**
   - ☑️ **Intel x86 Emulator Accelerator (HAXM installer)** (for Intel processors)
   
4. **Apply Changes**
   - Click "Apply" button
   - Accept licenses
   - Wait for downloads to complete (5-10 minutes)
   - Click "Finish"

## 🌍 Step 3: Configure Environment Variables

### Automatic Setup (Recommended)

**Run this PowerShell script** (copy all lines together):

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell icon > Run as Administrator

# Set ANDROID_HOME
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")

# Add platform-tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*Android\Sdk\platform-tools*") {
    $newPath = "$currentPath;$androidSdkPath\platform-tools;$androidSdkPath\emulator;$androidSdkPath\tools;$androidSdkPath\tools\bin"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✓ PATH updated successfully" -ForegroundColor Green
} else {
    Write-Host "✓ PATH already contains Android SDK" -ForegroundColor Green
}

# Refresh environment in current session
$env:ANDROID_HOME = $androidSdkPath
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "User")

# Verify
Write-Host "`n✓ Configuration Complete!" -ForegroundColor Green
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "`nPlease RESTART your terminal/IDE for changes to take effect"
```

### Manual Setup (Alternative)

1. **Open Environment Variables**
   - Press `Win + X`, select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. **Add ANDROID_HOME**
   - Under "User variables", click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - Click "OK"

3. **Update PATH**
   - Under "User variables", find and select "Path"
   - Click "Edit"
   - Click "New" and add: `%ANDROID_HOME%\platform-tools`
   - Click "New" and add: `%ANDROID_HOME%\emulator`
   - Click "New" and add: `%ANDROID_HOME%\tools`
   - Click "OK" on all dialogs

4. **Restart Terminal**
   - Close all terminals and VS Code
   - Reopen to apply changes

## 📱 Step 4: Create Android Virtual Device (Emulator)

### Using AVD Manager

1. **Open AVD Manager**
   - Launch Android Studio
   - Click "More Actions" > "Virtual Device Manager"
   - Or go to: Tools > Device Manager

2. **Create New Device**
   - Click "Create Device" button
   - Select a device definition (recommended: **Pixel 5** or **Pixel 7**)
   - Click "Next"

3. **Select System Image**
   - Click "Download" next to **UpsideDownCake (API Level 34, x86_64)**
   - Wait for download to complete
   - Select the downloaded image
   - Click "Next"

4. **Configure AVD**
   - AVD Name: `Pixel_5_API_34` (or your choice)
   - Startup orientation: Portrait
   - Enable "Show Advanced Settings" for more options:
     - RAM: 2048 MB (or more if available)
     - VM heap: 512 MB
     - Internal Storage: 2048 MB
   - Click "Finish"

5. **Test Emulator**
   - Click the ▶️ play button next to your AVD
   - Wait for the emulator to boot (first boot takes 2-3 minutes)
   - You should see an Android home screen

## ✅ Step 5: Verify Installation

### Run Verification Commands

Open a **new** PowerShell terminal and run:

```powershell
# Check ANDROID_HOME
$env:ANDROID_HOME
# Should output: C:\Users\<YourUsername>\AppData\Local\Android\Sdk

# Check ADB
adb version
# Should output: Android Debug Bridge version X.X.X

# List connected devices/emulators
adb devices
# Should list your running emulator

# List available AVDs
emulator -list-avds
# Should list: Pixel_5_API_34 (or your AVD name)
```

### Expected Output

✅ **All working correctly:**
```
ANDROID_HOME: C:\Users\ofema\AppData\Local\Android\Sdk
Android Debug Bridge version 1.0.41
List of devices attached
emulator-5554   device

Pixel_5_API_34
```

❌ **If you see errors:**
- `adb: command not found` → Restart terminal, check PATH
- `ANDROID_HOME` is empty → Re-run environment setup script
- No emulators listed → Create an AVD in Android Studio

## 🚀 Step 6: Run the Aivo Learning Mobile App

### Start the Emulator

**Option A: From Android Studio**
- Open Device Manager
- Click ▶️ next to your AVD

**Option B: From Command Line**
```powershell
emulator -avd Pixel_5_API_34
```

### Start Metro Bundler

In terminal 1:
```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native start
```

Wait for "Metro ready" message.

### Launch the App

In terminal 2 (keep Metro running):
```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native run-android
```

### First Build

⏱️ **First build takes 5-10 minutes**
- Gradle downloads dependencies
- App is compiled and installed
- App launches automatically

### What You'll See

1. Terminal shows build progress
2. App installs on emulator
3. App launches with Aivo Learning splash screen
4. You can navigate and test features

## 🧪 Testing Features

### Core Features to Test

1. **Authentication Flow**
   - Login/Sign up screens
   - Onboarding flow

2. **Navigation**
   - Bottom tabs work correctly
   - Stack navigation (push/pop)
   - Deep linking

3. **Settings Screen (NEW!)**
   - Navigate to Settings tab
   - See new card-based UI
   - 7+ settings options displayed

4. **Screenshot Generator (Dev Mode)**
   - In Settings, tap "Screenshot Generator"
   - Test screenshot capture
   - View saved screenshots

5. **Accessibility Features**
   - Text-to-Speech (TTS)
   - Voice Input
   - Screen reader compatibility
   - Font scaling
   - High contrast mode

6. **Offline Functionality**
   - Turn off WiFi in emulator
   - App should still work
   - Data syncs when back online

## 🐛 Troubleshooting

### Common Issues

#### 1. "SDK location not found"

**Solution:**
```powershell
# Check if SDK exists
Test-Path "$env:LOCALAPPDATA\Android\Sdk"

# If False, reinstall Android Studio
# If True, set ANDROID_HOME again
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

#### 2. "adb: command not found"

**Solution:**
```powershell
# Add to PATH manually
$env:Path += ";$env:ANDROID_HOME\platform-tools"

# Or restart terminal after environment setup
```

#### 3. Emulator won't start

**Check virtualization:**
```powershell
# Run in PowerShell as Admin
systeminfo | findstr /C:"Virtualization"
```

Should show: `Virtualization Enabled In Firmware: Yes`

**If No:**
- Restart PC
- Enter BIOS (usually F2, F10, or Delete key)
- Enable Intel VT-x or AMD-V
- Save and restart

#### 4. "Unable to boot virtual device"

**Solution:**
- Delete and recreate AVD
- Use x86_64 image (not ARM)
- Increase RAM allocation in AVD settings

#### 5. Build fails with "Unable to resolve module"

**Solution:**
```powershell
# Clean cache and rebuild
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native start --reset-cache

# In another terminal
npx react-native run-android
```

#### 6. "Execution failed for task ':app:installDebug'"

**Solution:**
```powershell
# Clean Android build
cd android
.\gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

## 📝 Development Tips

### Hot Reload

- Press `R` twice in the app to reload
- Or shake device (Ctrl+M in emulator) > "Reload"
- Enable Fast Refresh for automatic reload on save

### Developer Menu

**Open Dev Menu:**
- Press `Ctrl + M` (Windows)
- Or shake the device

**Menu Options:**
- Reload
- Debug
- Enable Fast Refresh
- Toggle Inspector
- Show Perf Monitor

### Running on Physical Device

1. **Enable Developer Options**
   - Settings > About phone
   - Tap "Build number" 7 times
   - Go back to Settings > Developer options

2. **Enable USB Debugging**
   - In Developer options
   - Toggle "USB debugging" ON

3. **Connect Device**
   - Connect via USB
   - Accept "Allow USB debugging" prompt on phone
   - Run: `adb devices` (should see your device)

4. **Run App**
   ```powershell
   npx react-native run-android
   ```

### Performance Testing

```powershell
# Show FPS monitor
adb shell settings put global show_fps_overlay 1

# Show touch locations (useful for demos)
adb shell settings put system pointer_location 1

# Turn off
adb shell settings put system pointer_location 0
adb shell settings put global show_fps_overlay 0
```

## 🔗 Useful Links

- **Android Studio:** https://developer.android.com/studio
- **React Native Docs:** https://reactnative.dev/docs/environment-setup
- **Android SDK Manager:** https://developer.android.com/studio/intro/update#sdk-manager
- **AVD Manager Guide:** https://developer.android.com/studio/run/managing-avds
- **ADB Commands:** https://developer.android.com/studio/command-line/adb

## 💡 Quick Reference

### Common Commands

```powershell
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Clean and rebuild
cd android && .\gradlew clean && cd .. && npx react-native run-android

# List devices
adb devices

# Start emulator
emulator -avd Pixel_5_API_34

# Install APK manually
adb install app-debug.apk

# View logs
adb logcat

# Clear app data
adb shell pm clear com.aivolearning.mobile

# Reverse port (for API calls)
adb reverse tcp:8080 tcp:8080
```

## ✅ Checklist

Before running the app, ensure:

- [ ] ✅ Android Studio installed
- [ ] ✅ Android SDK installed (API 34)
- [ ] ✅ Build tools installed (34.0.0)
- [ ] ✅ ANDROID_HOME environment variable set
- [ ] ✅ platform-tools added to PATH
- [ ] ✅ Emulator created (AVD)
- [ ] ✅ `adb devices` shows device
- [ ] ✅ Metro bundler running
- [ ] ✅ Terminal restarted after environment setup

## 🎉 Success!

Once setup is complete, you should be able to:

1. ✅ Start Android emulator
2. ✅ Run `npx react-native run-android`
3. ✅ See Aivo Learning app launch
4. ✅ Test all features
5. ✅ Develop and hot reload

---

**Need Help?**

If you encounter issues not covered here:
1. Check React Native documentation
2. Search GitHub issues
3. Check Stack Overflow
4. Review Android Studio logs

**Happy Coding!** 🚀
