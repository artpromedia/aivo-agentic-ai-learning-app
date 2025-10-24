# Asset Requirements & Templates

Quick reference for all required app store assets.

---

## 📱 App Icons

### iOS
| Size | Purpose | Location |
|------|---------|----------|
| 1024x1024 | App Store | `assets/store/ios-app-icon-1024.png` |
| 180x180 | iPhone @3x | `ios/.../AppIcon.appiconset/` |
| 120x120 | iPhone @2x | `ios/.../AppIcon.appiconset/` |
| 167x167 | iPad Pro @2x | `ios/.../AppIcon.appiconset/` |
| 152x152 | iPad @2x | `ios/.../AppIcon.appiconset/` |

### Android
| Size | Purpose | Location |
|------|---------|----------|
| 512x512 | Play Store | `assets/store/android-app-icon-512.png` |
| 192x192 | xxxhdpi | `android/app/src/main/res/mipmap-xxxhdpi/` |
| 144x144 | xxhdpi | `android/app/src/main/res/mipmap-xxhdpi/` |
| 96x96 | xhdpi | `android/app/src/main/res/mipmap-xhdpi/` |
| 72x72 | hdpi | `android/app/src/main/res/mipmap-hdpi/` |
| 48x48 | mdpi | `android/app/src/main/res/mipmap-mdpi/` |

---

## 📸 Screenshots

### iOS
| Device | Resolution | Quantity | Location |
|--------|-----------|----------|----------|
| 6.7" (15 Pro Max) | 1290x2796 | 5-10 | `fastlane/screenshots/en-US/` |
| 6.5" (14 Plus) | 1284x2778 | 5-10 | `fastlane/screenshots/en-US/` |
| 5.5" (8 Plus) | 1242x2208 | 5-10 | `fastlane/screenshots/en-US/` |
| 12.9" (iPad Pro) | 2048x2732 | 5-10 | `fastlane/screenshots/en-US/` |

### Android
| Device | Resolution | Quantity | Location |
|--------|-----------|----------|----------|
| Phone | 1080x1920 | 2-8 | `fastlane/metadata/android/en-US/images/phoneScreenshots/` |
| 10" Tablet | 1600x2560 | 2-8 | `fastlane/metadata/android/en-US/images/tenInchScreenshots/` |

---

## 📝 Text Content

### iOS App Store

| Field | Character Limit | Location |
|-------|----------------|----------|
| App Name | 30 | App Store Connect |
| Subtitle | 30 | App Store Connect |
| Promotional Text | 170 | App Store Connect |
| Description | 4000 | App Store Connect |
| Keywords | 100 | App Store Connect |
| What's New | 4000 | App Store Connect |

### Android Play Store

| Field | Character Limit | Location |
|-------|----------------|----------|
| Title | 50 | `fastlane/metadata/android/en-US/title.txt` |
| Short Description | 80 | `fastlane/metadata/android/en-US/short_description.txt` |
| Full Description | 4000 | `fastlane/metadata/android/en-US/full_description.txt` |
| What's New | 500 | Play Console |

---

## 🎨 Feature Graphics (Android Only)

| Size | Purpose | Location |
|------|---------|----------|
| 1024x500 | Feature Graphic | `assets/store/android-feature-graphic.png` |

---

## 🎬 Videos (Optional)

### iOS App Preview
- Duration: 15-30 seconds
- Format: .mov, .m4v, .mp4
- Max Size: 500 MB
- Upload: App Store Connect

### Android Promo Video
- Duration: 30 sec - 2 min
- Platform: YouTube
- Add URL to: `fastlane/metadata/android/en-US/video.txt`

---

## ✅ Quick Checklist

### Before Submitting to iOS App Store
- [ ] 1024x1024 app icon ready
- [ ] All Xcode app icon sizes generated
- [ ] Screenshots for all 4 device sizes (5-10 each)
- [ ] App name (≤30 chars)
- [ ] Subtitle (≤30 chars)
- [ ] Description (≤4000 chars)
- [ ] Keywords (≤100 chars)
- [ ] Privacy policy URL live
- [ ] Support URL live
- [ ] Privacy Nutrition Label completed

### Before Submitting to Google Play
- [ ] 512x512 app icon ready
- [ ] All adaptive icon sizes generated
- [ ] 1024x500 feature graphic ready
- [ ] Phone screenshots (2-8 images)
- [ ] Tablet screenshots (optional)
- [ ] Title (≤50 chars)
- [ ] Short description (≤80 chars)
- [ ] Full description (≤4000 chars)
- [ ] Privacy policy URL live
- [ ] Data safety section completed
- [ ] Content rating completed

---

## 📚 File Structure

```
apps/mobile-learner/
├── assets/
│   └── store/
│       ├── ios-app-icon-1024.png
│       ├── android-app-icon-512.png
│       └── android-feature-graphic.png
├── fastlane/
│   ├── screenshots/
│   │   └── en-US/
│   │       ├── 01-home-screen.png
│   │       ├── 02-lessons.png
│   │       ├── 03-games.png
│   │       ├── 04-progress.png
│   │       └── 05-achievements.png
│   └── metadata/
│       └── android/
│           └── en-US/
│               ├── title.txt
│               ├── short_description.txt
│               ├── full_description.txt
│               ├── video.txt
│               └── images/
│                   ├── phoneScreenshots/
│                   │   ├── 1.png
│                   │   ├── 2.png
│                   │   └── ...
│                   └── tenInchScreenshots/
│                       ├── 1.png
│                       └── ...
└── ios/
    └── AivoLearner/
        └── Images.xcassets/
            └── AppIcon.appiconset/
                ├── Contents.json
                └── icon-*.png
```

---

## 🎯 Screenshot Content Suggestions

1. **Home Dashboard** - Daily goals, welcome message, quick actions
2. **Interactive Lesson** - Math, reading, or science lesson in progress
3. **Educational Game** - Engaging game interface with colorful graphics
4. **Progress Tracking** - Charts showing skill mastery and achievements
5. **Accessibility Features** - High contrast mode, large text, voice controls
6. **Achievements** - Trophy case with unlocked milestones
7. **Homework Help** - Camera feature scanning homework
8. **Parent View** - Progress reports and analytics

**Tips:**
- Show diverse children using the app
- Add captions explaining each feature
- Use consistent brand colors
- Highlight accessibility prominently
- Keep UI clean and uncluttered

---

## 🌈 Brand Guidelines

### Colors
```
Primary:   #4F46E5 (Indigo)
Secondary: #10B981 (Green)
Accent:    #F59E0B (Amber)
Background:#FFFFFF (White)
Text:      #1F2937 (Gray-800)
```

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Accessible**: Minimum 16px for body text

### Logo Usage
- Clear space: Minimum logo height on all sides
- Don't stretch or distort
- Don't change colors
- Don't add effects (shadows, gradients)

---

## 🔗 Useful Links

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Icon Generator](https://appicon.co/)
- [Screenshot Frames](https://www.screely.com/)
- [ASO Stack](https://asostack.com/) - ASO tool comparison

---

**Asset Requirements - Ready for Design! 🎨**
