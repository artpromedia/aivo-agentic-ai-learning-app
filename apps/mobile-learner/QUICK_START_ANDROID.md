# Quick Start: Android Testing for Aivo Learning

## ⚡ Fast Track Guide

### Prerequisites Check

Before running the app, verify:

```powershell
# Check ANDROID_HOME
$env:ANDROID_HOME
# Expected: C:\Users\ofema\AppData\Local\Android\Sdk

# Check ADB
adb version
# Expected: Android Debug Bridge version X.X.X

# List emulators
emulator -list-avds
# Expected: Pixel_5_API_34 (or your AVD name)
```

### 🚀 Launch Sequence (3 Commands)

**Terminal 1: Start Emulator**
```powershell
emulator -avd Pixel_5_API_34
```
Wait for Android home screen (~2-3 minutes first time)

**Terminal 2: Start Metro**
```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native start
```
Wait for "Metro ready" message

**Terminal 3: Run App**
```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native run-android
```
First build: 5-10 minutes. Subsequent builds: 1-2 minutes.

### ✅ Success Indicators

- ✓ Terminal shows "BUILD SUCCESSFUL"
- ✓ Terminal shows "Installing APK"
- ✓ App launches on emulator
- ✓ See Aivo Learning splash screen
- ✓ Can navigate between screens

## 🔧 Alternative: One-Command Launch

After emulator is running:

```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native run-android --port 8081
```

This will:
1. Start Metro if not running
2. Build the app
3. Install on device/emulator
4. Launch automatically

## 📱 Physical Device (No Emulator Needed)

### Setup

1. **Enable Developer Mode on phone:**
   - Settings > About phone
   - Tap "Build number" 7 times
   - Go back to Settings > Developer options

2. **Enable USB Debugging:**
   - In Developer options
   - Toggle "USB debugging" ON

3. **Connect USB Cable:**
   - Connect phone to computer
   - Accept "Allow USB debugging" prompt on phone

4. **Verify Connection:**
   ```powershell
   adb devices
   ```
   Should show your device

### Run on Physical Device

```powershell
cd C:\Users\ofema\aivo-learning\apps\mobile-learner
npx react-native run-android
```

App installs directly to your phone!

## 🐛 Quick Troubleshooting

### "SDK location not found"
```powershell
# Set environment variable
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
# Restart terminal
```

### "No connected devices"
```powershell
# Check devices
adb devices

# If empty, start emulator first
emulator -avd Pixel_5_API_34

# Or connect physical device via USB
```

### "BUILD FAILED"
```powershell
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

### "Unable to load script"
```powershell
# Reset Metro cache
npx react-native start --reset-cache
```

### Port 8081 already in use
```powershell
# Find and kill process
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or use different port
npx react-native start --port 8082
npx react-native run-android --port 8082
```

## 🧪 Testing Checklist

After app launches, test:

- [ ] Authentication flow (if enabled)
- [ ] Bottom tab navigation
- [ ] Navigate to Settings tab
- [ ] See new card-based Settings UI
- [ ] Click "Screenshot Generator" (dev mode)
- [ ] Test screenshot capture
- [ ] Test other accessibility features
- [ ] Rotate device (portrait/landscape)
- [ ] Test offline mode (disable WiFi)

## 🎯 Features to Demonstrate

### New in Phase 10

1. **Settings Screen Redesign**
   - Navigate: Bottom tabs > Settings
   - See: Card-based UI with 7+ options
   - Test: Tap each card for navigation

2. **Screenshot Generator**
   - Navigate: Settings > Screenshot Generator
   - Test: Capture screenshots for app store
   - Location: Check app directory for saved images

3. **Accessibility Features**
   - Navigate: Settings > Accessibility
   - Test: TTS, Voice Input, Font scaling
   - Test: High contrast, Reduce motion

## ⌨️ Developer Shortcuts

### Hot Reload
- **Enable:** Shake device or press `Ctrl+M` > Enable Fast Refresh
- **Reload:** Press `R` twice OR `Ctrl+M` > Reload

### Dev Menu
- **Open:** Press `Ctrl+M` (Windows) or shake device
- **Options:**
  - Reload
  - Debug
  - Enable/Disable Fast Refresh
  - Toggle Inspector
  - Show Performance Monitor

### Debugging
```powershell
# View logs
adb logcat | findstr ReactNative

# Clear app data
adb shell pm clear com.aivolearning.mobile

# Take screenshot
adb exec-out screencap -p > screenshot.png

# Record screen
adb shell screenrecord /sdcard/demo.mp4
# Stop with Ctrl+C, then:
adb pull /sdcard/demo.mp4
```

## 📊 Performance Testing

```powershell
# Show FPS overlay
adb shell settings put global show_fps_overlay 1

# Show touch locations
adb shell settings put system pointer_location 1

# Disable overlays
adb shell settings put global show_fps_overlay 0
adb shell settings put system pointer_location 0
```

## 🔄 Workflow Tips

### Development Loop

1. Make code changes in VS Code
2. Save file (Fast Refresh auto-reloads)
3. Or press `R` twice for manual reload
4. Test changes on emulator
5. Repeat

### When to Rebuild

Full rebuild needed when:
- Adding/removing dependencies
- Changing native code
- Updating gradle configuration
- Changing app permissions
- Adding native modules

Quick rebuild:
```powershell
npx react-native run-android
```

Clean rebuild:
```powershell
cd android && .\gradlew clean && cd .. && npx react-native run-android
```

## 📚 Resources

- **Full Setup Guide:** `ANDROID_SETUP.md`
- **Setup Script:** `scripts/setup-android.ps1`
- **Dev Guide:** `MOBILE-DEVELOPMENT-GUIDE.md`
- **User Guide:** `USER-GUIDE.md`

## ⏱️ Time Estimates

| Task | First Time | Subsequent |
|------|-----------|------------|
| Start Emulator | 2-3 min | 1-2 min |
| Start Metro | 30 sec | 10 sec |
| Build App | 5-10 min | 1-2 min |
| Install App | 30 sec | 10 sec |
| Launch App | 10 sec | 5 sec |
| **Total** | **8-14 min** | **2-4 min** |

## 🎉 Success!

Once you see the Aivo Learning app running on the emulator with the new Settings UI and Screenshot Generator accessible, you've successfully completed the setup!

**Next Steps:**
- Generate app store screenshots
- Test on multiple device sizes
- Record demo videos
- Prepare for app store submission

---

**Quick Help:**
- Issues? Check `ANDROID_SETUP.md` troubleshooting section
- Need commands? See this file's Quick Reference
- Environment? Run `scripts/setup-android.ps1`
