# Store Assets - Placeholder Files

This directory contains all required assets for App Store and Play Store submissions.

## 📋 Required Assets

### App Icons

#### iOS
- **ios-app-icon-1024.png** (1024x1024 px)
  - PNG format
  - RGB color space
  - No alpha channel (no transparency)
  - No rounded corners (Apple adds them automatically)
  - Square aspect ratio

#### Android
- **android-app-icon-512.png** (512x512 px)
  - PNG format
  - 32-bit color with alpha channel (transparency supported)
  - Square aspect ratio

### Feature Graphic (Android Only)
- **android-feature-graphic.png** (1024x500 px)
  - PNG or JPEG format
  - 24-bit RGB
  - No alpha channel
  - Used at top of Play Store listing

---

## 🎨 Design Guidelines

### Brand Identity
- Use AIVO Learning brand colors
- Primary: #4F46E5 (Indigo)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)

### Icon Design
- Keep it simple and recognizable at small sizes
- Use child-friendly, approachable design
- Ensure high contrast for accessibility
- Test on both light and dark backgrounds
- Avoid text that's too small to read

### Feature Graphic Design
- Showcase key app benefits
- Include app name and tagline
- Show inclusive, diverse representation
- Highlight accessibility features
- Use engaging, colorful visuals

---

## 🛠️ Creation Tools

### Recommended Software
1. **Adobe Illustrator** - Vector graphics for scalability
2. **Figma** - Collaborative design
3. **Sketch** - macOS design tool
4. **Photoshop** - Raster graphics editing

### Online Tools
1. **[Canva](https://www.canva.com)** - Easy design templates
2. **[App Icon Generator](https://appicon.co/)** - Generate all sizes from one design
3. **[Figma Community](https://www.figma.com/community)** - Free templates

---

## 📦 Export Settings

### iOS App Icon (1024x1024)
```
Format: PNG
Color Mode: RGB
Bit Depth: 8-bit
Transparency: No
Resolution: 72 or 144 PPI
```

### Android App Icon (512x512)
```
Format: PNG
Color Mode: RGBA
Bit Depth: 32-bit
Transparency: Yes (for adaptive icons)
Resolution: 72 or 144 PPI
```

### Android Feature Graphic (1024x500)
```
Format: PNG or JPEG
Color Mode: RGB
Bit Depth: 24-bit
Transparency: No
Resolution: 72 PPI
```

---

## ✅ Quality Checklist

Before uploading assets:

- [ ] Correct dimensions (use exact pixel sizes)
- [ ] Correct file format (PNG for icons)
- [ ] No blurriness or pixelation
- [ ] High contrast for visibility
- [ ] Tested on multiple backgrounds
- [ ] No copyright violations (stock images licensed)
- [ ] Accessible color combinations (WCAG AA compliant)
- [ ] Professional, polished appearance
- [ ] Consistent with brand guidelines
- [ ] Approved by design team

---

## 📝 File Naming Convention

Use these exact names when adding files to this directory:

```
ios-app-icon-1024.png          # iOS App Store icon
android-app-icon-512.png       # Android Play Store icon
android-feature-graphic.png    # Android feature graphic
```

---

## 🔄 Update Process

When updating store assets:

1. Create new versions with updated design
2. Test in App Store Connect / Play Console preview
3. Replace files in this directory
4. Update version in file name (optional): `ios-app-icon-1024-v2.png`
5. Commit changes to repository
6. Upload to respective stores

---

## 📚 Additional Resources

- [iOS App Icon Specifications](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Design Guidelines](https://developer.android.com/google-play/resources/icon-design-specifications)
- [Material Design Icon Principles](https://material.io/design/iconography)
- [App Store Screenshot Guidelines](https://developer.apple.com/app-store/product-page/)
- [Play Store Graphic Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

---

## 🆘 Need Help?

Contact the design team or refer to:
- Full guide: [`APP_STORE_METADATA_GUIDE.md`](../APP_STORE_METADATA_GUIDE.md)
- Asset requirements: [`ASSET_REQUIREMENTS.md`](../ASSET_REQUIREMENTS.md)

---

**Store Assets - Ready for Design Team! 🎨**
