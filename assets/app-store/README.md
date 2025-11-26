# SmartyGym App Store Assets

This folder contains all assets needed for iOS App Store and Google Play Store submissions.

## 📁 Folder Structure

```
assets/app-store/
├── android/
│   ├── icon-512x512.png          # Play Store listing icon
│   ├── feature-graphic.png        # 1024x500 feature graphic
│   └── screenshots/
│       ├── phone/
│       │   ├── 01-home.png
│       │   ├── 02-workouts.png
│       │   ├── 03-programs.png
│       │   └── 04-dashboard.png
│       ├── tablet-7inch/ (optional)
│       └── tablet-10inch/ (optional)
│
├── ios/
│   ├── icon-1024x1024.png         # App Store icon
│   └── screenshots/
│       ├── iphone-6.7/ (iPhone 15 Pro Max)
│       │   ├── 01-home.png
│       │   ├── 02-workouts.png
│       │   ├── 03-programs.png
│       │   └── 04-dashboard.png
│       ├── iphone-6.5/ (iPhone 14 Plus)
│       ├── iphone-5.5/ (iPhone 8 Plus)
│       └── ipad-12.9/ (iPad Pro)
│
└── splash-screens/
    ├── android-splash.png         # 1080x1920 or higher
    └── ios-splash.png             # 2436x1125 or higher
```

## 📐 Required Asset Sizes

### Android

#### Icons
- **Play Store Icon:** 512x512 PNG (no transparency)
- **Feature Graphic:** 1024x500 PNG (promotional banner)
- **App Icons (in android/app/src/main/res/):**
  - 48x48 (mdpi)
  - 72x72 (hdpi)
  - 96x96 (xhdpi)
  - 144x144 (xxhdpi)
  - 192x192 (xxxhdpi)

#### Screenshots
- **Phone:** Minimum 320px on shortest side, recommended 1080x1920
- **7-inch Tablet:** 1200x1920 (optional)
- **10-inch Tablet:** 1600x2560 (optional)
- **Required:** At least 2 screenshots per device type
- **Format:** PNG or JPEG

### iOS

#### Icons
- **App Store Icon:** 1024x1024 PNG (no alpha channel, no transparency)
- **App Icons (in Xcode Assets.xcassets):**
  - Multiple sizes from 20x20 to 1024x1024
  - Generated automatically using appicon.co

#### Screenshots
Required for these device sizes:
- **6.7" Display (iPhone 15 Pro Max):** 1290x2796
- **6.5" Display (iPhone 14 Plus):** 1284x2778
- **5.5" Display (iPhone 8 Plus):** 1242x2208
- **12.9" iPad Pro (3rd gen):** 2048x2732
- **Required:** 3-10 screenshots per device size
- **Format:** PNG or JPEG

### Splash Screens
- **Android:** 1080x1920 PNG (or higher resolution, 9:16 ratio)
- **iOS:** 2436x1125 PNG (or higher resolution)
- **Content:** SmartyGym logo centered on dark background (#0F0F0F)
- **Logo Color:** Gold (#FFD700) to match brand

## 🎨 Design Guidelines

### App Icons
- Use your SmartyGym logo
- Gold (#FFD700) on dark background (#0F0F0F)
- Ensure logo is clearly visible at small sizes
- No text in icon (use logo only)
- Icon should work with and without rounded corners

### Screenshots
Capture these key screens:
1. **Home Page** - Show hero section and main features
2. **Workout Library** - Display workout cards and filters
3. **Individual Workout** - Show detailed workout view
4. **Training Programs** - Display program cards
5. **Dashboard** - Show user progress and stats
6. **SmartyWorkout Generator** - Highlight AI feature

**Tips:**
- Use browser DevTools device emulation for precise dimensions
- Capture on clean data (not test accounts)
- Ensure text is readable
- Show actual app content, not placeholder text
- Consider adding captions or text overlays highlighting features

### Feature Graphic (Android)
- 1024x500 PNG
- Promotional banner displayed at top of Play Store
- Include app name "SmartyGym"
- Show key feature or benefit
- Use brand colors (gold and black)

## 🔧 How to Generate Assets

### Method 1: Using appicon.co (Recommended)
1. Create a 1024x1024 PNG of your logo
2. Go to https://appicon.co
3. Upload your icon
4. Select platforms (iOS, Android)
5. Download generated packs
6. Extract and copy to appropriate folders

### Method 2: Manual Creation
1. Use design software (Figma, Photoshop, etc.)
2. Create artboards for each required size
3. Export as PNG
4. Ensure no transparency for Android icons
5. Save to appropriate folders

### Screenshot Capture
1. Open app in browser
2. Open DevTools (F12)
3. Enable device emulation
4. Set custom dimensions:
   - iPhone 15 Pro Max: 430x932 (viewport)
   - Phone: 360x640 (viewport)
5. Take screenshots using:
   - Browser screenshot tool
   - OS screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
   - Or use actual device/emulator

## 📝 Asset Checklist

### Before Android Submission
- [ ] 512x512 Play Store icon created
- [ ] 1024x500 feature graphic created
- [ ] At least 2 phone screenshots captured (1080x1920)
- [ ] Android app icons generated for all densities
- [ ] Splash screen created (1080x1920)
- [ ] All assets are PNG format
- [ ] No transparency in icons

### Before iOS Submission
- [ ] 1024x1024 App Store icon created
- [ ] iPhone 6.7" screenshots captured (1290x2796)
- [ ] iPhone 6.5" screenshots captured (1284x2778)
- [ ] iPhone 5.5" screenshots captured (1242x2208)
- [ ] iPad 12.9" screenshots captured (2048x2732) if supporting iPad
- [ ] iOS app icons generated using appicon.co
- [ ] Splash screen created (2436x1125)
- [ ] No alpha channel in App Store icon
- [ ] All assets are PNG or JPEG

## 🎯 Next Steps

1. **Create your app icon** using your SmartyGym logo
2. **Generate all icon sizes** using appicon.co
3. **Capture screenshots** from your live app
4. **Design feature graphic** for Android
5. **Create splash screens** with your branding
6. **Follow the main guide** in `docs/APP_STORE_SUBMISSION_GUIDE.md`

## 💡 Pro Tips

- **Consistency:** Use the same screenshots for both iOS and Android (cropped to fit)
- **Localization:** Create separate screenshot folders for each language later
- **Updates:** Keep source files so you can update screenshots when UI changes
- **Testing:** View your assets on actual devices before submitting
- **ASO:** Your first screenshot is most important for conversions

---

**Need help?** Check the main submission guide: `docs/APP_STORE_SUBMISSION_GUIDE.md`
