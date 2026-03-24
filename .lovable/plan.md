
# Native App Conversion — Phase 1 Complete

## What was implemented

### 1. ✅ Native platform utility (`src/utils/native.ts`)
- `isNativePlatform()` — detects Capacitor WebView
- `openExternal(url)` — uses Capacitor Browser plugin on native, falls back to window.open in browser
- `configureStatusBar()` — sets dark status bar on native app launch

### 2. ✅ Safe-area CSS (`src/index.css`)
- Added `env(safe-area-inset-*)` CSS variables for notch/Dynamic Island/home indicator
- Body gets automatic safe-area padding
- `.safe-area-bottom` and `.safe-area-top` utility classes available

### 3. ✅ PWA service worker disabled in Capacitor (`src/main.tsx`)
- When running inside native shell, all service workers are unregistered
- Prevents caching conflicts in WebView

### 4. ✅ External links use Capacitor Browser plugin
Updated 8 user-facing files to use `openExternal()`:
- WhatsAppButton, ShareButtons, Contact, Index, SmartyPlans, JoinPremium, SmartyCorporate, UserDashboard
- Stripe checkout windows use `isNativePlatform()` check to skip popup-blocker workaround

### 5. ✅ Status bar plugin installed and configured
- `@capacitor/status-bar` + `@capacitor/browser` installed
- Dark style with #0F0F0F background auto-configured on launch

### 6. ✅ Deep link files created
- `public/.well-known/apple-app-site-association` — iOS Universal Links
- `public/.well-known/assetlinks.json` — Android App Links
- **Note:** Freelancer must replace `TEAM_ID` and SHA256 fingerprint with actual values

## What the freelancer still needs to do
1. Replace `TEAM_ID` in apple-app-site-association with Apple Developer Team ID
2. Replace SHA256 fingerprint in assetlinks.json with signing key fingerprint
3. Generate app icons (1024×1024 for iOS, mipmap set for Android)
4. `npm install` → `npm run build` → `npx cap add ios` → `npx cap add android` → `npx cap sync`
5. Configure signing certificates
6. Test on real devices
7. Capture App Store screenshots
8. Submit to App Store and Google Play
