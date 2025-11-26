# App Store Screenshot Capture Guide

## Overview

This guide explains how to capture high-quality screenshots of SmartyGym for iOS App Store and Google Play Store submission.

## Required Screenshot Sizes

### iOS App Store

| Device | Resolution | Viewport Size (Browser DevTools) |
|--------|------------|----------------------------------|
| iPhone 6.7" (Pro Max) | 1290×2796 | 430×932 (scale 3x) |
| iPhone 6.5" (Plus) | 1284×2778 | 428×926 (scale 3x) |
| iPhone 5.5" | 1242×2208 | 414×736 (scale 3x) |
| iPad Pro 12.9" | 2048×2732 | 1024×1366 (scale 2x) |

**Requirements:**
- Minimum 6 screenshots required
- Maximum 10 screenshots allowed
- Format: PNG or JPEG
- Color space: sRGB

### Google Play Store

| Device | Resolution | Viewport Size (Browser DevTools) |
|--------|------------|----------------------------------|
| Phone | 1080×1920 | 360×640 (scale 3x) |
| 7-inch Tablet | 1200×1920 | 600×960 (scale 2x) |
| 10-inch Tablet | 1600×2560 | 800×1280 (scale 2x) |

**Requirements:**
- Minimum 2 screenshots required
- Maximum 8 screenshots allowed
- Format: PNG or JPEG
- 16:9 or 9:16 aspect ratio

---

## Recommended Screenshots to Capture

### 1. Hero/Landing Page (Homepage)
**URL:** `https://smartygym.com/`

**Content to show:**
- SmartyGym logo prominently displayed
- Main hero section with tagline
- Call-to-action button

**Why:** First impression, shows branding and value proposition

---

### 2. SmartyWorkout Generator
**URL:** `https://smartygym.com/smartyworkout`

**Content to show:**
- The workout generator form
- Generated workout example (if possible, show completed generation)
- Highlights the AI-powered personalization

**Why:** Key differentiator feature that sets SmartyGym apart

---

### 3. Workout Library
**URL:** `https://smartygym.com/workout`

**Content to show:**
- Grid of workout cards
- Filters/categories visible
- Variety of workout types

**Why:** Shows content depth and variety

---

### 4. Individual Workout Detail
**URL:** `https://smartygym.com/workout/strength/[any-id]`

**Content to show:**
- Full workout details
- Instructions, difficulty rating
- Clean, professional layout

**Why:** Shows content quality and detail

---

### 5. Training Programs
**URL:** `https://smartygym.com/trainingprogram`

**Content to show:**
- Training program cards
- Duration, difficulty, goals
- Professional program layout

**Why:** Highlights structured long-term training options

---

### 6. User Dashboard (Requires Login)
**URL:** `https://smartygym.com/dashboard`

**Content to show:**
- Activity calendar
- Progress tracking charts
- Saved workouts/favorites

**Why:** Shows personalization and progress tracking features

---

### 7. Premium Benefits (Optional)
**URL:** `https://smartygym.com/premiumbenefits`

**Content to show:**
- Premium plan comparison
- Benefits list
- Pricing tiers

**Why:** Clarifies monetization and value of premium membership

---

## Step-by-Step Capture Instructions

### Method 1: Browser DevTools (Recommended)

1. **Open Chrome or Edge browser**
2. **Navigate to the page you want to capture**
3. **Open DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
4. **Toggle Device Toolbar**: Click the phone icon or press `Ctrl+Shift+M` / `Cmd+Shift+M`
5. **Set custom dimensions**:
   - Click "Responsive" dropdown
   - Select "Edit..."
   - Add custom device dimensions from the table above
6. **Ensure scale is correct**:
   - For iPhone 6.7": Set scale to 300% (3x)
   - For Android: Set scale to 300% (3x)
7. **Capture screenshot**:
   - Click the three dots menu (⋮) in DevTools
   - Select "Capture screenshot"
   - Image will download automatically

### Method 2: Online Screenshot Tools

**Recommended tools:**
- **Screely** (https://screely.com) - Add device frames
- **Mockuper** (https://mockuper.net) - Device mockups
- **Browserframe** (https://browserframe.com) - Clean browser frames

**Note:** These tools add device frames but may not give exact pixel dimensions. Use DevTools for precision.

### Method 3: Physical Device (Most Accurate)

1. Install the app on a real device
2. Navigate to each screen
3. Take screenshot:
   - **iPhone**: Press Volume Up + Side Button
   - **Android**: Press Volume Down + Power Button
4. Transfer images to computer via AirDrop, USB, or cloud storage

---

## Screenshot Optimization Tips

### Visual Quality
- Use high-quality, sharp text
- Ensure proper contrast (dark mode vs light mode)
- Remove any personal/sensitive information
- Use realistic but not actual user data

### Content Selection
- Show the app in use, not empty states
- Highlight key features and benefits
- Use real workout content, not placeholders
- Ensure UI is clean with no errors/loading states

### Consistency
- Use the same device frame for all iOS screenshots
- Use the same device frame for all Android screenshots
- Maintain consistent theme (light or dark mode)
- Keep navigation/header visible for context

---

## After Capture: File Organization

Save your screenshots in the following structure:

```
public/app-store-screenshots/
├── ios/
│   ├── iphone-6.7/
│   │   ├── 01-home.png
│   │   ├── 02-smartyworkout.png
│   │   ├── 03-workout-library.png
│   │   ├── 04-workout-detail.png
│   │   ├── 05-training-programs.png
│   │   └── 06-dashboard.png
│   ├── iphone-6.5/
│   └── ipad-12.9/
└── android/
    ├── phone/
    │   ├── 01-home.png
    │   ├── 02-smartyworkout.png
    │   └── 03-workout-library.png
    └── tablet/ (optional)
```

---

## Quality Checklist

Before uploading to app stores, verify:

- [ ] All screenshots are correct dimensions
- [ ] File sizes are under 10MB each
- [ ] Format is PNG or JPEG
- [ ] No personal information visible
- [ ] Text is readable at all sizes
- [ ] UI is clean with no errors
- [ ] App branding (logo, colors) is consistent
- [ ] Screenshots show real, compelling content
- [ ] Minimum number met (6 for iOS, 2 for Android)

---

## Common Issues

### Screenshot too large
**Solution:** Use online image compressors like TinyPNG or ImageOptim

### Wrong aspect ratio
**Solution:** Double-check viewport dimensions in DevTools

### Blurry text
**Solution:** Ensure scale is set correctly (3x for iPhone, 3x for Android)

### Empty/placeholder content
**Solution:** Use test accounts with sample data populated

---

## Need Help?

- **Apple Guidelines:** https://developer.apple.com/app-store/product-page/
- **Google Guidelines:** https://developer.android.com/distribute/marketing-tools/device-art-generator
- **Screenshot Generator Tools:** https://appicon.co, https://www.applaunchpad.com

---

**Last Updated:** January 2025  
**Contact:** admin@smartygym.com
