# App Store Asset Specifications - Quick Reference

## 🎯 Essential Assets Summary

### Android (Google Play Store)

| Asset Type | Size | Format | Required |
|------------|------|--------|----------|
| App Icon | 512x512 | PNG | ✅ Yes |
| Feature Graphic | 1024x500 | PNG/JPEG | ⭐ Highly Recommended |
| Phone Screenshots | 1080x1920 | PNG/JPEG | ✅ Yes (min 2) |
| 7" Tablet Screenshots | 1200x1920 | PNG/JPEG | ❌ Optional |
| 10" Tablet Screenshots | 1600x2560 | PNG/JPEG | ❌ Optional |

### iOS (Apple App Store)

| Asset Type | Size | Format | Required |
|------------|------|--------|----------|
| App Icon | 1024x1024 | PNG | ✅ Yes |
| iPhone 6.7" | 1290x2796 | PNG/JPEG | ✅ Yes (3-10) |
| iPhone 6.5" | 1284x2778 | PNG/JPEG | ✅ Yes (3-10) |
| iPhone 5.5" | 1242x2208 | PNG/JPEG | ✅ Yes (3-10) |
| iPad 12.9" | 2048x2732 | PNG/JPEG | ✅ If iPad supported |

## 📱 Device Screenshot Sizes

### iPhone
- **iPhone 15 Pro Max / 15 Plus (6.7"):** 1290x2796
- **iPhone 14 Pro Max / 14 Plus (6.5"):** 1284x2778
- **iPhone 8 Plus / 7 Plus / 6s Plus (5.5"):** 1242x2208

### iPad
- **iPad Pro 12.9" (3rd gen+):** 2048x2732
- **iPad Pro 11":** 1668x2388

### Android
- **Phone (standard):** 1080x1920 (or 720x1280 minimum)
- **Tablet 7":** 1200x1920
- **Tablet 10":** 1600x2560

## 🎨 Icon Specifications

### App Store Icon (iOS)
```
Size: 1024x1024 pixels
Format: PNG
Color Space: RGB
Transparency: NO (no alpha channel)
Corners: Square (system applies mask)
File size: Under 1MB
```

### Play Store Icon (Android)
```
Size: 512x512 pixels
Format: PNG (32-bit)
Transparency: NO
Corners: Square (system applies mask)
File size: Under 1MB
```

### In-App Icons

#### Android Resource Folders
```
res/mipmap-mdpi/      48x48   (1x)
res/mipmap-hdpi/      72x72   (1.5x)
res/mipmap-xhdpi/     96x96   (2x)
res/mipmap-xxhdpi/    144x144 (3x)
res/mipmap-xxxhdpi/   192x192 (4x)
```

#### iOS Asset Catalog
```
20x20   @2x, @3x
29x29   @2x, @3x
40x40   @2x, @3x
60x60   @2x, @3x
76x76   @2x
83.5x83.5 @2x
1024x1024 @1x
```

## 🖼️ Screenshot Best Practices

### Quantity
- **iOS:** 3-10 screenshots per device size
- **Android:** 2-8 screenshots (2 minimum)

### Content Guidelines
1. **Show real app content** - No mockups or templates
2. **First screenshot is crucial** - It appears in search results
3. **Tell a story** - Order screenshots to showcase user journey
4. **Highlight key features** - Show what makes your app unique
5. **Use captions** - Add text overlays to explain features
6. **Consistent branding** - Use your brand colors and style

### What to Capture
1. Home/Landing screen
2. Main feature (SmartyWorkout generator)
3. Workout library
4. Training programs
5. User dashboard/progress
6. Unique selling points

### Tools
- **Browser DevTools:** Device emulation for web apps
- **Simulator/Emulator:** For native apps
- **Screenshot Maker Tools:**
  - https://www.appscreenshots.io
  - https://screenshots.pro
  - https://www.appmockup.com

## 🎬 Promotional Graphics

### Feature Graphic (Android Only)
```
Size: 1024x500 pixels
Format: PNG or JPEG
Aspect Ratio: 2:1
Content: App name, key visual, tagline
File size: Under 1MB
```

**Design Tips:**
- Keep important content in center 924x350 safe zone
- Text should be large and readable
- Use high contrast
- Avoid tiny details

### Promotional Text (App Store Only)
```
Max length: 170 characters
Purpose: Short pitch above description
Update frequency: Anytime (doesn't require review)
Best for: Limited time offers, new features
```

## 📝 Text Content Specifications

### App Name
- **iOS:** 30 characters max
- **Android:** 30 characters max (50 for title)

**SmartyGym Example:** `SmartyGym - AI Fitness Coach`

### Subtitle (iOS Only)
```
Max length: 30 characters
Purpose: Appears under app name
Should: Describe core benefit
```

**Example:** `Custom Workouts & Training`

### Short Description (Android Only)
```
Max length: 80 characters
Purpose: Appears before "Read more"
Should: Hook users immediately
```

**Example:** `Your AI-powered fitness coach with custom workouts and training programs`

### Full Description
- **iOS:** 4000 characters max
- **Android:** 4000 characters max

### Keywords (iOS Only)
```
Max length: 100 characters (comma-separated)
Purpose: App Store search optimization
Tips: Research competitors, avoid spam, no spaces after commas
```

**Example:** `fitness,workout,gym,training,exercise,strength,cardio,coach,personal trainer,fitness app`

### What's New
- **iOS:** 4000 characters max
- **Android:** 500 characters max

## 🔒 Required Legal Items

### Privacy Policy
- **URL required:** YES for both stores
- **Must be publicly accessible:** YES
- **SmartyGym URL:** `https://smartygym.com/privacy-policy`

**Must Cover:**
- Data collection types
- How data is used
- Third-party services (Stripe, analytics)
- User rights (GDPR)
- Contact information

### Terms of Service
- **Required:** Not mandatory but highly recommended
- **Should cover:** User conduct, liability, subscriptions, cancellations

### Age Rating
- **iOS:** Choose based on app content (4+, 9+, 12+, 17+)
- **Android:** Complete questionnaire (violence, sexual content, etc.)

**SmartyGym Recommendation:** 12+ or 13+ (fitness app, no sensitive content)

## 🌍 Localization

### Supported Languages
Start with English, add more later:
- Spanish (large market)
- German (fitness popular)
- French
- Portuguese (Brazil)

### What to Localize
- App name (if different)
- Descriptions
- Keywords
- Screenshots (with localized UI)
- What's New

## 📊 Media Asset Checklist

### Before Creating Assets

- [ ] Understand your target audience
- [ ] Research competitor screenshots
- [ ] Identify your unique selling points (USPs)
- [ ] Plan screenshot sequence/story
- [ ] Prepare high-quality app screens (clean data, good lighting)

### During Asset Creation

- [ ] Use correct dimensions for each platform
- [ ] Maintain consistent branding
- [ ] Ensure text is readable at small sizes
- [ ] Test on actual devices if possible
- [ ] Get feedback from team/users

### After Asset Creation

- [ ] Verify all file sizes are under limits
- [ ] Check image quality (no compression artifacts)
- [ ] Confirm no sensitive data in screenshots
- [ ] Review on actual app store mockups
- [ ] A/B test different versions if possible

## 🚀 Quick Start Commands

### Generate All Icon Sizes
```bash
# Using appicon.co (web-based)
# 1. Upload your 1024x1024 icon
# 2. Select iOS and Android
# 3. Download and extract
```

### Capture Screenshots with DevTools
```bash
# 1. Open app in browser
# 2. Open DevTools (F12)
# 3. Toggle device emulation
# 4. Set custom dimensions:
#    - iPhone 15 Pro Max: 430x932 viewport
#    - Android Phone: 360x640 viewport
# 5. Take screenshot
```

### Optimize Images
```bash
# Install ImageOptim (Mac) or similar
# Or use online tools:
# - tinypng.com
# - squoosh.app
```

## 💾 File Naming Convention

Use consistent naming for easy management:

```
android/
  icon-512.png
  feature-graphic.png
  screenshots/
    phone/
      01-home-screen.png
      02-workout-library.png
      03-smarty-generator.png
      
ios/
  icon-1024.png
  screenshots/
    iphone-6.7/
      01-home-screen.png
      02-workout-library.png
      03-smarty-generator.png
```

## 🔗 Useful Tools & Resources

### Icon Generators
- https://appicon.co (free, easy)
- https://www.appicon.build (advanced)
- https://makeappicon.com

### Screenshot Tools
- https://www.appscreenshots.io (templates)
- https://screenshots.pro (mockups)
- https://www.appmockup.com

### Image Optimization
- https://tinypng.com
- https://squoosh.app
- ImageOptim (Mac app)

### Design Resources
- https://www.figma.com (design tool)
- https://www.canva.com (templates)
- https://unsplash.com (free images)

### ASO Tools
- https://www.appfollow.io (keyword research)
- https://www.appannie.com (market intelligence)
- https://www.sensor tower.com (competitor analysis)

---

## 📞 Need Help?

Refer to the complete guide: `docs/APP_STORE_SUBMISSION_GUIDE.md`

**Quick Tips:**
- Start with Android (easier approval)
- Use TestFlight for iOS beta testing
- Monitor first reviews closely
- Update screenshots with each major release
- A/B test different screenshot sets

---

*Last updated: 2025*
