# App Store Metadata & Assets Guide

Complete guide for creating and managing App Store and Play Store listings for AIVO Learning mobile app.

---

## 📋 Table of Contents
- [Overview](#overview)
- [App Icons](#app-icons)
- [Screenshots](#screenshots)
- [App Store Descriptions](#app-store-descriptions)
- [Keywords & SEO](#keywords--seo)
- [Privacy & Legal](#privacy--legal)
- [Localization](#localization)
- [Asset Checklist](#asset-checklist)

---

## Overview

This guide covers all metadata and assets required for publishing to:
- **iOS App Store** (via App Store Connect)
- **Google Play Store** (via Play Console)

---

## 🎨 App Icons

### iOS App Icon Requirements

**App Store Connect:**
- **1024x1024 px** - App Store icon (PNG, no alpha channel)
  - Location: `assets/store/ios-app-icon-1024.png`
  - Requirements: RGB color space, no transparency, no rounded corners (Apple adds them)

**Xcode Asset Catalog:**
Located in `ios/AivoLearner/Images.xcassets/AppIcon.appiconset/`

Required sizes:
- **20x20** @1x, @2x, @3x (iPad notifications)
- **29x29** @1x, @2x, @3x (Settings)
- **40x40** @2x, @3x (Spotlight)
- **60x60** @2x, @3x (App icon - iPhone)
- **76x76** @1x, @2x (App icon - iPad)
- **83.5x83.5** @2x (App icon - iPad Pro)

### Android App Icon Requirements

**Play Console:**
- **512x512 px** - High-res icon (PNG, 32-bit, with transparency)
  - Location: `assets/store/android-app-icon-512.png`

**Adaptive Icons:**
Located in `android/app/src/main/res/`

Required sizes (foreground + background):
- **mipmap-mdpi**: 48x48 px
- **mipmap-hdpi**: 72x72 px
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px

**Feature Graphic:**
- **1024x500 px** - Feature graphic for Play Store
  - Location: `assets/store/android-feature-graphic.png`
  - Format: PNG or JPEG, 24-bit

### Design Guidelines for Icons

**Brand Colors:**
```
Primary: #4F46E5 (Indigo)
Secondary: #10B981 (Green)
Accent: #F59E0B (Amber)
Background: #FFFFFF (White)
```

**Design Elements:**
- Use the "AIVO" wordmark with friendly, rounded typography
- Include a simple, recognizable symbol (e.g., lightbulb, brain, or star)
- Ensure high contrast for accessibility
- Test on both light and dark backgrounds
- Keep design simple and child-friendly
- Avoid text that's too small to read at icon size

**Tools:**
- Adobe Illustrator or Figma for vector design
- Export to PNG at required sizes
- Use [App Icon Generator](https://appicon.co/) for batch exports

---

## 📱 Screenshots

### iOS Screenshot Requirements

**Required Device Sizes:**
1. **6.7" Display (iPhone 15 Pro Max)**: 1290 x 2796 px
2. **6.5" Display (iPhone 14 Plus)**: 1284 x 2778 px
3. **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 px
4. **12.9" Display (iPad Pro)**: 2048 x 2732 px

**Location:** `fastlane/screenshots/en-US/`

**Naming Convention:**
```
01-home-screen.png
02-lessons.png
03-games.png
04-progress.png
05-achievements.png
```

**Recommended Screenshots (5-10 images):**
1. **Home Screen** - Welcoming dashboard with daily goals
2. **Lesson Screen** - Interactive lesson with visual aids
3. **Educational Game** - Engaging game interface
4. **Progress Tracking** - Visual progress charts and achievements
5. **Accessibility Features** - High contrast mode, text-to-speech
6. **Parent Dashboard** - Progress monitoring view
7. **Homework Help** - Camera feature for homework assistance
8. **Streaks & Rewards** - Motivation system

### Android Screenshot Requirements

**Required Device Types:**
1. **Phone**: 1080 x 1920 px (minimum)
2. **7-inch Tablet**: 1200 x 1920 px
3. **10-inch Tablet**: 1600 x 2560 px

**Location:** `fastlane/metadata/android/en-US/images/`
- `phoneScreenshots/` - Phone screenshots (2-8 images)
- `tenInchScreenshots/` - Tablet screenshots (optional)

**Format:** PNG or JPEG, 24-bit RGB

### Screenshot Design Tips

**Best Practices:**
- Use actual app UI (no mockups or marketing graphics in main screenshots)
- Add captions/overlays explaining features (optional but recommended)
- Show diverse, inclusive representation of children
- Highlight accessibility features prominently
- Use consistent branding across all screenshots
- Show happy, engaged children (stock photos or illustrations)
- Test on actual devices before uploading

**Tools:**
- [Fastlane Screenshots](https://docs.fastlane.tools/getting-started/ios/screenshots/) - Automated screenshots
- [Screenshot Pro](https://screely.com/) - Add device frames
- Figma or Sketch - Add captions and overlays

**Automated Screenshot Capture:**
```bash
cd apps/mobile-learner

# iOS
bundle exec fastlane snapshot

# Android
bundle exec fastlane screengrab
```

---

## 📝 App Store Descriptions

### iOS App Store Copy

**Location:** App Store Connect > My Apps > AIVO Learning > App Information

#### App Name
```
AIVO Learning - Kids Education
```
(Max 30 characters)

#### Subtitle
```
AI Learning for Neurodiverse Kids
```
(Max 30 characters)

#### Promotional Text
```
🎉 NEW: Homework Camera Help! Take a photo of homework and get personalized, step-by-step guidance. Perfect for kids who need extra support!
```
(Max 170 characters - can be updated without app review)

#### Description
```
AIVO Learning: Empowering Neurodiverse Children Through AI-Powered Education

🌟 PERSONALIZED LEARNING FOR EVERY CHILD
AIVO Learning is designed specifically for neurodiverse children, including those with autism, ADHD, and dyslexia. Our AI adapts to each child's unique learning style.

✨ KEY FEATURES

🎯 Adaptive AI Curriculum
• Real-time difficulty adjustment
• Multi-sensory learning experiences
• Personalized learning paths
• Evidence-based teaching methods

🎮 Engaging Interactive Content
• Educational games for accessibility
• Animated lessons with audio
• Homework help with camera
• Progress tracking with rewards

♿ ACCESSIBILITY FIRST
• Screen reader support (VoiceOver)
• High contrast themes
• Voice commands & text-to-speech
• Reduced motion options
• Haptic feedback

🏆 MOTIVATION & ENGAGEMENT
• Streak tracking
• Achievement system (14+ milestones)
• Daily goals
• Parent/teacher notifications

📊 COMPREHENSIVE TRACKING
• Real-time progress monitoring
• Detailed analytics
• Skill mastery indicators
• Emotional well-being check-ins

👨‍👩‍👧 FAMILY COLLABORATION
• Parent portal
• Teacher dashboard
• Secure messaging
• Privacy-focused (COPPA & FERPA compliant)

Download AIVO Learning today and unlock your child's potential!

Privacy Policy: https://aivolearning.com/privacy
Terms: https://aivolearning.com/terms
```
(Max 4000 characters)

#### Keywords
```
autism,adhd,dyslexia,special education,learning disability,educational games,kids learning,personalized learning,AI education,neurodiverse,accessible learning,speech therapy,occupational therapy,behavioral support,IEP,special needs
```
(Max 100 characters - comma separated, no spaces after commas)

#### Support URL
```
https://aivolearning.com/support
```

#### Marketing URL
```
https://aivolearning.com
```

#### Privacy Policy URL
```
https://aivolearning.com/privacy
```

### Android Play Store Copy

**Location:** Play Console > AIVO Learning > Store presence > Main store listing

Already created in:
- `fastlane/metadata/android/en-US/title.txt`
- `fastlane/metadata/android/en-US/short_description.txt`
- `fastlane/metadata/android/en-US/full_description.txt`

#### App Category
**Primary:** Education
**Secondary:** Educational Games

#### Tags (up to 5)
```
special education
autism
adhd
personalized learning
educational games
```

#### Content Rating
Complete questionnaire: Target Age 4-12, Educational content, No violence/mature themes

---

## 🔍 Keywords & SEO

### iOS App Store Optimization (ASO)

**Primary Keywords:**
- autism app
- adhd learning
- dyslexia help
- special education
- neurodiverse learning
- adaptive learning
- kids education app
- personalized learning
- special needs app
- educational games

**Long-tail Keywords:**
- autism learning app for kids
- adhd educational games
- dyslexia reading app
- special education software
- apps for autistic children
- learning apps for special needs
- personalized education app

**Competitor Analysis:**
Research similar apps:
- ABCmouse
- Khan Academy Kids
- Endless Reader
- Special Words
- Otsimo

### Android Play Store SEO

**Short Description (80 chars):**
Focus on primary value proposition and accessibility

**Full Description (4000 chars):**
- Lead with benefits, not features
- Use bullet points for scannability
- Include keywords naturally (avoid keyword stuffing)
- Add emojis for visual appeal
- Include social proof (testimonials, awards)

**Search Terms to Target:**
- "autism app"
- "adhd app"
- "special education app"
- "learning disability app"
- "neurodiverse"
- "personalized learning"
- "accessible education"

---

## 🔒 Privacy & Legal

### Required Documents

#### Privacy Policy
**URL:** https://aivolearning.com/privacy

**Must Include:**
- Data collection practices
- How data is used
- Third-party services (analytics, crash reporting)
- Data retention policies
- User rights (access, deletion)
- COPPA compliance statement
- FERPA compliance (if applicable)
- Contact information

#### Terms of Service
**URL:** https://aivolearning.com/terms

**Must Include:**
- User responsibilities
- Acceptable use policy
- Account termination conditions
- Intellectual property rights
- Limitation of liability
- Dispute resolution
- Governing law

#### COPPA Compliance
Children's Online Privacy Protection Act (under 13):
- Parental consent mechanisms
- No behavioral advertising
- Limited data collection
- Transparent privacy practices

#### FERPA Compliance
Family Educational Rights and Privacy Act:
- Student data protection
- Parent access rights
- Data sharing restrictions

### App Store Declarations

**iOS:**
- Privacy Nutrition Label (App Store Connect)
- Data types collected
- Data usage purposes
- Data linking and tracking

**Android:**
- Data safety section (Play Console)
- Data collection declaration
- Security practices
- Data deletion options

---

## 🌍 Localization

### Supported Languages

**Phase 1 (Launch):**
- English (US)

**Phase 2 (Future):**
- Spanish (US & Latin America)
- French (Canada & France)
- German
- Mandarin Chinese
- Portuguese (Brazil)

### Localization Structure

**iOS:**
```
fastlane/metadata/
  ├── en-US/
  ├── es-ES/
  ├── fr-FR/
  └── de-DE/
```

**Android:**
```
fastlane/metadata/android/
  ├── en-US/
  ├── es-ES/
  ├── fr-FR/
  └── de-DE/
```

### Translation Guidelines

**What to Translate:**
- App name (if appropriate)
- Description text
- Keywords (localized SEO)
- Screenshot captions
- What's New notes

**What NOT to Translate:**
- Brand name "AIVO"
- URLs
- Email addresses
- Technical specifications

---

## ✅ Asset Checklist

### iOS Assets

- [ ] App Icon 1024x1024 (App Store)
- [ ] App Icon Set (Xcode - all sizes)
- [ ] 6.7" Screenshots (5-10 images)
- [ ] 6.5" Screenshots (5-10 images)
- [ ] 5.5" Screenshots (5-10 images)
- [ ] 12.9" iPad Screenshots (5-10 images)
- [ ] App Name (30 chars)
- [ ] Subtitle (30 chars)
- [ ] Promotional Text (170 chars)
- [ ] Description (4000 chars)
- [ ] Keywords (100 chars)
- [ ] Support URL
- [ ] Marketing URL
- [ ] Privacy Policy URL
- [ ] Privacy Nutrition Label (completed)
- [ ] App Preview Video (optional, 15-30 sec)

### Android Assets

- [ ] App Icon 512x512 (Play Store)
- [ ] Adaptive Icon Set (all densities)
- [ ] Feature Graphic 1024x500
- [ ] Phone Screenshots (2-8 images)
- [ ] Tablet Screenshots (optional, 2-8 images)
- [ ] Title (50 chars)
- [ ] Short Description (80 chars)
- [ ] Full Description (4000 chars)
- [ ] App Category
- [ ] Content Rating (questionnaire completed)
- [ ] Tags (up to 5)
- [ ] Contact Email
- [ ] Privacy Policy URL
- [ ] Data Safety Section (completed)
- [ ] Promo Video (optional, YouTube link)

### Both Platforms

- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Support email active (support@aivolearning.com)
- [ ] Website live (https://aivolearning.com)
- [ ] COPPA compliance verified
- [ ] FERPA compliance verified (if applicable)
- [ ] All screenshots show diverse, inclusive representation
- [ ] All text proofread and error-free
- [ ] Accessibility features highlighted in screenshots
- [ ] Brand guidelines followed consistently

---

## 🎬 App Preview Videos (Optional but Recommended)

### iOS App Preview

**Specifications:**
- Duration: 15-30 seconds
- Orientation: Portrait or Landscape
- Format: .mov, .m4v, or .mp4
- Resolution: Matches screenshot sizes
- File size: Max 500 MB

**Content Ideas:**
1. Quick app tour (5-10 sec)
2. Child using the app (5-10 sec)
3. Key accessibility features (5-10 sec)
4. Call to action (3-5 sec)

**Location:** Upload via App Store Connect

### Android Promo Video

**Specifications:**
- Duration: 30 seconds to 2 minutes
- Platform: YouTube (unlisted or public)
- Format: Standard YouTube formats

**Content:** Same as iOS app preview

**Location:** Add YouTube URL to `fastlane/metadata/android/en-US/video.txt`

---

## 📊 A/B Testing

### App Store Experiments

**iOS (Product Page Optimization):**
Test variations of:
- App icon
- Screenshots (order and content)
- App preview videos

**Android (Store Listing Experiments):**
Test variations of:
- App icon
- Feature graphic
- Screenshots
- Short description

**Run experiments for:**
- Minimum 7-14 days
- Sufficient traffic (1000+ impressions)
- Statistical significance

---

## 🔄 Maintenance & Updates

### Regular Updates

**Monthly:**
- Review and update keywords based on search trends
- Analyze conversion rates and adjust assets
- Update promotional text for new features

**Quarterly:**
- Refresh screenshots with new features
- Update descriptions with latest capabilities
- Add new localized languages

**Annually:**
- Conduct full ASO audit
- Refresh all creative assets
- Update privacy policy and terms

### What's New Section

**Format:**
```
🎉 What's New in v1.2.0

NEW FEATURES
• 📸 Homework Camera Help - Take photos for step-by-step guidance
• 🏆 14 New Achievements - Unlock milestones as you learn
• 🔊 Enhanced Audio Descriptions - Better screen reader support

IMPROVEMENTS
• Faster lesson loading
• Improved offline mode
• Bug fixes and performance enhancements

---

Questions? Contact support@aivolearning.com
```

---

## 📚 Resources

### Design Tools
- [Figma](https://figma.com) - UI/UX design
- [Sketch](https://sketch.com) - macOS design tool
- [Adobe Illustrator](https://adobe.com/products/illustrator) - Vector graphics
- [App Icon Generator](https://appicon.co) - Batch icon exports

### ASO Tools
- [App Radar](https://appradar.com) - ASO optimization
- [Sensor Tower](https://sensortower.com) - Market intelligence
- [App Annie](https://appannie.com) - App analytics
- [TheTool](https://thetool.io) - ASO tracking

### Screenshot Tools
- [Fastlane Snapshot](https://docs.fastlane.tools/actions/snapshot/) - Automated iOS screenshots
- [Screengrab](https://docs.fastlane.tools/actions/screengrab/) - Automated Android screenshots
- [Screenshot Designer](https://www.screely.com/) - Add device frames

### Accessibility Testing
- iOS VoiceOver - Test screen reader
- Android TalkBack - Test screen reader
- Color Contrast Checker - WCAG compliance

---

## 🆘 Troubleshooting

### Common Issues

**App Icon Rejected:**
- Ensure no transparency (iOS)
- Correct dimensions and file format
- No rounded corners (iOS adds them)

**Screenshots Rejected:**
- Must show actual app UI (no mockups in main screenshots)
- No marketing graphics in primary screenshots
- Match required dimensions exactly

**Description Rejected:**
- Remove promotional language ("best," "#1")
- No competitor mentions
- No pricing information (use In-App Purchases section)

### Support Contacts

**App Store Connect:** https://developer.apple.com/support/
**Play Console:** https://support.google.com/googleplay/android-developer/

---

**App Store Metadata Guide - Complete! ✅**
