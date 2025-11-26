# SmartyGym - iOS & Android App Store Submission Guide

## 📋 Overview
This guide will walk you through submitting SmartyGym to both the Apple App Store and Google Play Store.

**Timeline:** 1-2 weeks total  
**App ID:** `com.smartygym.app`  
**App Name:** SmartyGym

---

## 🎯 Phase 1: Developer Account Setup

### Google Play Console
- **Cost:** $25 (one-time fee)
- **Sign up:** https://play.google.com/console/signup
- **Requirements:**
  - Google Account
  - Credit card for registration fee
  - Valid phone number
- **Approval Time:** Usually instant, can take up to 48 hours

### Apple Developer Program
- **Cost:** $99/year
- **Sign up:** https://developer.apple.com/programs/enroll/
- **Requirements:**
  - Apple ID
  - Credit card for annual fee
  - Valid phone number
  - **Mac computer (REQUIRED for iOS builds)**
- **Approval Time:** 1-2 business days

---

## 🎨 Phase 2: Asset Preparation

### App Icons

#### Android (Google Play)
Create these icon sizes and place in `assets/app-store/android/`:
- **512x512 PNG** - Play Store listing icon (required, no transparency)
- **1024x1024 PNG** - Feature graphic (optional but recommended)

For the actual app icons in the Android build, you'll need:
- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)

#### iOS (App Store)
Create these icon sizes and place in `assets/app-store/ios/`:
- **1024x1024 PNG** - App Store icon (required, no transparency, no alpha channel)

For the actual app icons in the iOS build, you'll need multiple sizes from 20x20 to 1024x1024.

**🔧 Tool Recommendation:** Use https://appicon.co or https://www.appicon.build
- Upload your 1024x1024 logo
- Generate all required sizes automatically
- Download separate packages for iOS and Android

### Screenshots

#### Android Screenshots
Place in `assets/app-store/android/screenshots/`:
- **Phone:** At least 2 screenshots, minimum 320px dimension
  - Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
- **7-inch Tablet (optional):** 1200x1920 or 1920x1200
- **10-inch Tablet (optional):** 1600x2560 or 2560x1600

#### iOS Screenshots
Place in `assets/app-store/ios/screenshots/`:
Required for multiple device sizes:
- **6.7" Display (iPhone 15 Pro Max):** 1290x2796
- **6.5" Display (iPhone 14 Plus):** 1284x2778
- **5.5" Display (iPhone 8 Plus):** 1242x2208
- **12.9" iPad Pro:** 2048x2732

**Minimum:** 3-10 screenshots per device size

**📸 How to Capture:**
1. Open your app in browser at correct dimensions
2. Use browser DevTools device emulation
3. Take screenshots using browser or OS tools
4. Or use actual devices/simulators

### Feature Graphic (Android Only)
- **Size:** 1024x500 PNG
- **Purpose:** Displayed at top of Play Store listing
- **Content:** Promotional banner with app name/logo
- Place in `assets/app-store/android/`

### App Descriptions

#### Short Description (Both Stores)
**Max 80 characters for Google Play, 30 for App Store subtitle**

```
Your AI-powered fitness coach with custom workouts and training programs
```

#### Full Description

**For Google Play (Max 4000 characters):**
```
🏋️ Transform Your Fitness Journey with SmartyGym

SmartyGym is your complete AI-powered fitness platform, combining the expertise of professional coach Haris Falas with cutting-edge technology to deliver personalized workout and training experiences.

✨ KEY FEATURES

🎯 Custom Workout Generator
- Generate personalized workouts instantly with SmartyWorkout
- Based on your goals, equipment, and fitness level
- 695+ exercises across all categories
- No generic AI - built on real coaching protocols

💪 Pre-Made Workouts Library
- 100+ professionally designed workouts
- Strength, cardio, metabolic, mobility categories
- Filter by difficulty, equipment, duration
- Detailed instructions and coaching tips

📊 Training Programs
- Multi-week structured programs
- Progressive overload built-in
- Track your progress week-by-week
- Programs for all goals: muscle gain, fat loss, performance

🧮 Smart Fitness Calculators
- BMR & Calorie Calculator
- One Rep Max Calculator
- Track your measurements
- Progress visualization

📝 Training Logbook
- Log your workouts and progress
- Add photos and notes
- Track weights and measurements
- View detailed analytics

💬 Direct Coach Communication
- Message system with real-time support
- Get personalized advice
- Ask questions anytime
- Community-driven platform

🔒 PRIVACY & SECURITY
- All data encrypted and secure
- GDPR compliant
- No data selling
- Your privacy is our priority

🎁 FLEXIBLE PLANS
- Free tier with essential features
- Gold membership for workout access
- Platinum for unlimited everything
- One-time purchases available

👨‍🏫 ABOUT COACH HARIS FALAS
Professional fitness coach with years of experience in strength training, nutrition, and athletic performance. All workouts and programs are based on proven training methodologies.

📱 FEATURES OVERVIEW
✓ Offline access to purchased content
✓ Responsive design for all devices
✓ Beautiful, intuitive interface
✓ Regular content updates
✓ Progress tracking & analytics
✓ Customizable workout parameters

🚀 START YOUR TRANSFORMATION TODAY
Download SmartyGym and take control of your fitness journey. Whether you're a beginner or advanced athlete, we have the tools and guidance you need to succeed.

Website: https://smartygym.com
Support: https://smartygym.com/contact
Privacy Policy: https://smartygym.com/privacy-policy
```

**For App Store (Max 4000 characters):**
(Use the same description above)

### Privacy Policy URL
**REQUIRED for both stores:**
```
https://smartygym.com/privacy-policy
```

**✅ Your privacy policy page is already created and accessible**

### Keywords (App Store Only)
**Max 100 characters, comma-separated:**
```
fitness,workout,gym,training,exercise,strength,cardio,coach,personal trainer,fitness app
```

### Category Selection
- **Primary Category:** Health & Fitness
- **Secondary Category (optional):** Lifestyle or Sports

---

## 🔧 Phase 3: Technical Preparation

### Step 1: Local Development Setup
```bash
# Clone your project from GitHub
git clone [your-repo-url]
cd smartygym

# Install dependencies
npm install

# Build the production web app
npm run build
```

### Step 2: Add Native Platforms

#### For Android:
```bash
# Add Android platform
npx cap add android

# Sync web build to Android
npx cap sync android
```

#### For iOS (Mac only):
```bash
# Add iOS platform
npx cap add ios

# Sync web build to iOS
npx cap sync ios
```

### Step 3: Add App Icons

#### Android Icons
1. Generate icons using appicon.co
2. Download Android icon pack
3. Place icons in these folders:
```
android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png (48x48)
  ├── mipmap-hdpi/ic_launcher.png (72x72)
  ├── mipmap-xhdpi/ic_launcher.png (96x96)
  ├── mipmap-xxhdpi/ic_launcher.png (144x144)
  └── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

#### iOS Icons
1. Open project in Xcode: `npx cap open ios`
2. Navigate to `App > App > Assets.xcassets > AppIcon`
3. Drag and drop your generated icons into each size slot

### Step 4: Configure Splash Screen

#### Android Splash
1. Create splash screen image (1080x1920 with SmartyGym logo)
2. Place in `android/app/src/main/res/drawable/splash.png`

#### iOS Splash
1. Open Xcode: `npx cap open ios`
2. Navigate to `App > App > Assets.xcassets > Splash`
3. Add your splash screen image (2436x1125 or larger)

---

## 🤖 Phase 4: Android Build & Submission

### Step 1: Install Android Studio
1. Download from https://developer.android.com/studio
2. Install Android SDK and tools
3. Accept SDK licenses: `./android/sdk/tools/bin/sdkmanager --licenses`

### Step 2: Open Project in Android Studio
```bash
npx cap open android
```

### Step 3: Configure Signing
1. In Android Studio: `Build > Generate Signed Bundle / APK`
2. Select `Android App Bundle`
3. Create new keystore (save this securely!):
   - Key store path: Choose location
   - Password: Create strong password (SAVE THIS!)
   - Key alias: `smartygym`
   - Key password: Same as keystore password
   - Validity: 25 years
   - Certificate info: Your details

**⚠️ CRITICAL: Back up your keystore file and passwords! You'll need them for all future updates!**

### Step 4: Build Release Bundle
1. `Build > Generate Signed Bundle / APK`
2. Select `Android App Bundle`
3. Choose your keystore and enter passwords
4. Select `release` build variant
5. Click `Finish`

Output will be in: `android/app/release/app-release.aab`

### Step 5: Google Play Console Submission
1. Go to https://play.google.com/console
2. Click `Create app`
3. Fill in app details:
   - App name: `SmartyGym`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (or Paid if charging)
4. Complete store listing:
   - Short description (80 chars)
   - Full description
   - Screenshots (upload from `assets/app-store/android/screenshots/`)
   - App icon (512x512)
   - Feature graphic (1024x500)
   - App category: Health & Fitness
5. Content rating questionnaire
6. Target audience: 13+ (fitness app)
7. Privacy policy URL: `https://smartygym.com/privacy-policy`
8. Create new release:
   - Upload `app-release.aab`
   - Release name: `1.0.0`
   - Release notes: "Initial release"
9. Review and publish

**Review Time:** Usually 1-3 days

---

## 🍎 Phase 5: iOS Build & Submission

**⚠️ REQUIRES: Mac computer with Xcode installed**

### Step 1: Install Xcode
1. Download from Mac App Store
2. Install Command Line Tools: `xcode-select --install`
3. Open Xcode and accept license

### Step 2: Open Project in Xcode
```bash
npx cap open ios
```

### Step 3: Configure Signing & Capabilities
1. Select `App` target in Xcode
2. Go to `Signing & Capabilities` tab
3. Select your Team (Apple Developer account)
4. Bundle Identifier: `com.smartygym.app`
5. Xcode will automatically create provisioning profiles

### Step 4: Add App Icons
1. Select `Assets.xcassets` in project navigator
2. Click `AppIcon`
3. Drag and drop your generated icons for each size

### Step 5: Build Archive
1. Select `Any iOS Device (arm64)` as build target
2. Menu: `Product > Archive`
3. Wait for build to complete (5-10 minutes)
4. Xcode Organizer will open

### Step 6: Upload to App Store Connect
1. In Organizer, select your archive
2. Click `Distribute App`
3. Select `App Store Connect`
4. Upload (this takes 10-20 minutes)
5. Wait for processing (can take 1-2 hours)

### Step 7: App Store Connect Submission
1. Go to https://appstoreconnect.apple.com
2. Select `My Apps > + > New App`
3. Fill in app information:
   - Platform: iOS
   - Name: `SmartyGym`
   - Primary Language: English (U.S.)
   - Bundle ID: `com.smartygym.app`
   - SKU: `smartygym001`
4. Complete App Information:
   - Privacy Policy URL: `https://smartygym.com/privacy-policy`
   - Category: Health & Fitness
   - Subtitle (30 chars)
   - Keywords (100 chars)
5. Upload screenshots for all required device sizes
6. Upload app icon (1024x1024)
7. Add description
8. Select build (the one you uploaded earlier)
9. Complete App Review Information:
   - Test account credentials (if needed)
   - Demo video (optional)
   - Notes for reviewer
10. Submit for review

**Review Time:** Usually 1-3 days (can be up to 1 week)

---

## 📱 Phase 6: Testing Before Submission

### Android Testing
```bash
# Install on connected Android device
npx cap run android

# Or create debug APK for manual testing
cd android
./gradlew assembleDebug
# APK in: android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS Testing
```bash
# Install on connected iOS device
npx cap run ios

# Or use Xcode to run on simulator
npx cap open ios
# Then click Play button in Xcode
```

### Test Checklist
- [ ] App launches without crashes
- [ ] Login/Signup works
- [ ] Workouts load correctly
- [ ] Programs display properly
- [ ] Purchase flows work (use test mode)
- [ ] Navigation is smooth
- [ ] All images load
- [ ] Splash screen displays
- [ ] App icon shows correctly
- [ ] Offline functionality works
- [ ] Push notifications work (if enabled)

---

## 🔄 Future Updates

### For Android Updates:
1. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"  // Your version number
   ```
2. Make your code changes
3. Run `npm run build && npx cap sync android`
4. Build new signed bundle
5. Upload to Google Play Console as new release

### For iOS Updates:
1. Update version in Xcode:
   - Select App target
   - General tab
   - Version: "1.0.1"
   - Build: "2"
2. Make your code changes
3. Run `npm run build && npx cap sync ios`
4. Archive and upload new build
5. Submit for review in App Store Connect

---

## 📊 App Store Listing Copy (Ready to Use)

### App Name
```
SmartyGym - AI Fitness Coach
```

### Promotional Text (App Store only, 170 chars)
```
Get personalized workouts instantly with our AI generator. Over 100 pre-made workouts, training programs, and direct coach support. Start your transformation today!
```

### What's New (for updates)
```
Version 1.0.0 - Initial Release
• Custom AI workout generator
• 100+ professionally designed workouts
• Multi-week training programs
• BMR & 1RM calculators
• Training logbook with progress tracking
• Direct coach messaging
• Flexible membership plans
```

---

## ✅ Final Checklist

### Before Google Play Submission:
- [ ] Developer account created and verified
- [ ] App icons generated (512x512)
- [ ] Screenshots captured for phone (and tablets if desired)
- [ ] Feature graphic created (1024x500)
- [ ] Privacy policy URL live and accessible
- [ ] Short & full descriptions written
- [ ] App category selected
- [ ] Content rating completed
- [ ] Keystore created and backed up securely
- [ ] Release bundle built and tested
- [ ] Test the app thoroughly on Android device

### Before App Store Submission:
- [ ] Apple Developer account created and verified
- [ ] Mac computer available with Xcode installed
- [ ] App icons generated (1024x1024)
- [ ] Screenshots captured for all required iPhone sizes
- [ ] Screenshots captured for iPad (if supporting iPad)
- [ ] Privacy policy URL live and accessible
- [ ] Descriptions and metadata written
- [ ] Keywords selected (100 chars)
- [ ] App category selected
- [ ] Signing certificates configured
- [ ] Archive built and uploaded to App Store Connect
- [ ] Test the app thoroughly on iOS device/simulator

---

## 🆘 Common Issues & Solutions

### Android Issues

**Issue:** "SDK location not found"
```bash
# Solution: Create local.properties file
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > android/local.properties
```

**Issue:** "Execution failed for task ':app:processReleaseResources'"
```bash
# Solution: Clean and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
```

**Issue:** Keystore password forgotten
- Unfortunately, you'll need to create a new keystore
- This means you can't update the existing app
- You'll need to publish as a new app with a different package name

### iOS Issues

**Issue:** "No signing certificate found"
- Open Xcode > Preferences > Accounts
- Add your Apple ID
- Download certificates
- Select team in project settings

**Issue:** "Provisioning profile doesn't match"
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Clean build folder: Xcode menu > Product > Clean Build Folder
- Try again

**Issue:** "Build input file cannot be found"
- Run `npx cap sync ios`
- Delete and re-add the ios platform if needed

---

## 💡 Pro Tips

1. **Start with Android** - It's easier and faster to get approved
2. **Use TestFlight** - Before App Store submission, use TestFlight for beta testing
3. **ASO (App Store Optimization)** - Research keywords before submitting
4. **Monitor Reviews** - Respond to user reviews quickly
5. **Update Regularly** - Monthly updates show active development
6. **A/B Test Screenshots** - Try different screenshots to improve conversion
7. **Localization** - Consider adding multiple languages later
8. **Crash Reporting** - Integrate Sentry or similar for production crash tracking

---

## 📞 Support & Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **App Store Connect Help:** https://developer.apple.com/help/app-store-connect/
- **AppIcon Generator:** https://appicon.co
- **Screenshot Maker:** https://www.appscreenshots.io

---

## 🎉 Launch Day Checklist

- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to support requests
- [ ] Share on social media
- [ ] Send email to mailing list
- [ ] Update website with app store links
- [ ] Create app store badges on website
- [ ] Monitor download numbers
- [ ] Collect user feedback
- [ ] Plan first update based on feedback

---

**Good luck with your app store submissions! 🚀**

*Last updated: 2025*
