# SmartyGym Mobile Readiness Report

## Capacitor Configuration
- **App ID:** `com.smartygym.app`
- **Name:** `SmartyGym`
- **Web Directory:** `dist`
- **Plugins:** Includes SplashScreen with custom #0F172A background and large spinner.

## PWA Manifest
The project includes a standard `manifest.json` ensuring it can be installed as a PWA on iOS/Android.
- **Theme Color:** #0F172A
- **Icons:** Standard 192x192 and 512x512 assets provided.

## Safe-Area Handling
Key screens utilize Tailwind's `safe-area` utilities or `padding-top: env(safe-area-inset-top)` to ensure UI elements do not overlap with notches or home indicators.
- **Verified Screens:** Dashboard, Workout Player, Timer, Checkout, Account Settings.

## Stripe-in-Mobile Policy & Mitigation
**CRITICAL:** Apple and Google strictly forbid selling digital content (subscriptions/workouts) via external payment processors (Stripe) inside native app shells. 
- **The Risk:** Binary rejection if the app contains a "Buy" button that opens a webview with a credit card form.
- **The Mitigation:** 
    - The app detects if it is running in a native context.
    - Payment flows use `Browser.open` from `@capacitor/browser` with `presentationStyle: 'popover'`.
    - This opens the checkout in the System Browser (Safari/Chrome), which is a common (though not 100% foolproof) way to bypass IAP requirements for "Reader" apps or apps with "Cross-Platform" services.
    - Long-term: Consider implementing Native IAP if the app is heavily marketed on the stores.

## Push Notifications
Handled via the AppMySite manual notification system.
- Push tokens are registered upon app launch.
- Notifications are routed through the `send-notification` edge function which interfaces with the AppMySite API.

## Recommendations
1. **App Store Assets:** Ensure `generate-app-icons` edge function is run to produce all required splash and icon sizes.
2. **Apple Pay:** Enable Apple Pay in the Stripe Dashboard to allow 1-tap checkout in the mobile browser.

## Detailed Safe-Area Audit
The mobile application requires specific CSS handling to ensure UI elements do not collide with native hardware features (notches, dynamic islands, home bars).

### Implementation Strategy
We utilize Tailwind's `safe` utilities and CSS environment variables:
- `pt-[env(safe-area-inset-top)]` for headers.
- `pb-[env(safe-area-inset-bottom)]` for bottom navigation bars.
- `px-[env(safe-area-inset-left)]` for landscape support.

### Screen-by-Screen Status
1. **Dashboard:** Top-left profile icon and top-right notifications are offset by 20px + safe-area-inset-top.
2. **Workout Player:** Timer controls and "End Workout" button are padded to avoid the iOS home indicator.
3. **Checkout:** Sticky "Complete Purchase" button is raised by the bottom inset.
4. **Auth Screens:** Input fields are centered to avoid keyboard overlap where possible.

## AppMySite & Push Notifications
The app leverages the AppMySite manual system for push delivery.
- **Registration:** Upon `app_launch`, the device token is sent to the `register-push-token` edge function.
- **Segmentation:** Users are tagged by `plan_type` (free, premium, lifetime) to allow targeted motivational pushes.
- **Automation:**
    - **Daily Ritual:** Sent at 8:00 AM local time.
    - **Abandoned Cart:** Sent 2 hours after a failed checkout.
    - **New Content:** Sent when a new "Program of the Month" is published.

## PWA vs Native Comparison
| Feature | PWA (Web) | Native (Capacitor) |
|---------|-----------|--------------------|
| Biometric Auth | No | Yes (FaceID/TouchID) |
| Push Notifications | Yes (FCM) | Yes (Native APNs/FCM) |
| Offline Cache | Yes (Service Worker) | Yes (Filesystem) |
| Payment Method | Stripe Web | External Browser (Stripe) |
| App Store Presence | No | Yes |

## Troubleshooting Native Builds
If the build fails `npx cap open ios`, check the following:
1. **CocoaPods:** Ensure `pod install` was run in the `ios/App` directory.
2. **Bundle Identifier:** Must match the provisioning profile in Xcode.
3. **Permissions:** `Info.plist` must contain descriptions for `NSCameraUsageDescription` (if scanning QR codes) and `NSPhotoLibraryUsageDescription` (for profile photos).
