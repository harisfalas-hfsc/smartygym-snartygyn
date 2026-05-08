## Goal
Make SmartyGym pass Apple App Store and Google Play automated review for the Capacitor builds, without breaking the web experience.

## Direct answers to your questions

**1. Is Sign in with Apple a must?**  
Yes — for **iOS only**, and only because you already offer Google sign-in. Apple Guideline 4.8 says: if your iOS app uses any third-party social login (Google, Facebook, etc.), you **must also offer Sign in with Apple**. Skipping it = guaranteed iOS rejection.  
Google Play does **not** require it. So it only matters for the App Store submission.

**2. Will hiding Stripe buttons in the iOS shell break the website?**  
No. The change is gated by a runtime check (`Capacitor.isNativePlatform() && platform === 'ios'`). Web, Android APK, and PWA users see Stripe exactly as today. Only the iOS native app hides them.

**3. Will the privacy page break anything?**  
No — it's a new public route `/privacy`. Existing `/disclaimer` stays.

**4. Are these 3 items enough to pass review?**  
These are the **three blockers**. There are also smaller fixes that, if skipped, will trigger warnings or rejections. I've grouped everything into Phase 1 (must-do for submission) and Phase 2 (do before/right after first review).

---

## Phase 1 — Required for submission (this plan)

### A. Sign in with Apple
- Use Lovable Cloud's managed Apple provider (no Apple Developer credentials needed from you up front — you can switch to your own later).
- On the `Auth.tsx` page, add a "Continue with Apple" button **next to** the existing Google button. Identical UX and styling.
- Use `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })`.
- Show the Apple button on **all platforms** (Apple requires it visible on iOS; harmless elsewhere — many apps do the same).

### B. Hide Stripe purchase UI in iOS Capacitor shell
- Add a tiny helper `src/utils/platform.ts`:
  ```ts
  export const isIOSNative = () =>
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  ```
- Wrap purchase CTAs with `{!isIOSNative() && <PurchaseButton .../>}` in:
  - `src/components/PurchaseButton.tsx` (return null if iOS native)
  - `src/components/shop/ProductCard.tsx` (hide buy button)
  - `src/pages/JoinPremium.tsx`, `src/pages/SmartyPlans.tsx` (hide checkout CTAs)
  - `src/components/AccessGate.tsx` (replace "Upgrade to access" with a softer "Available on the web version" message on iOS)
- Web, Android, and PWA: zero changes. Existing Stripe flow untouched.
- This satisfies Apple Guideline 3.1.1 (no external payment links for digital goods on iOS).

### C. Dedicated `/privacy` page
- New route `src/pages/PrivacyPolicy.tsx` linked in router and footer.
- Store-listing-grade content:
  - Data collected: email, auth tokens, push tokens, payment metadata (via Stripe), workout activity, usage analytics (Google Analytics), USDA food queries.
  - Purposes: account, content delivery, billing, analytics.
  - Third parties: Lovable Cloud (Supabase), Stripe, Resend, Google Analytics, USDA FoodData Central.
  - User rights: access, export, deletion (point to Account → Delete Account).
  - Children: not for under 13 / 16.
  - Contact: smartygym@outlook.com.
  - Last-updated date.
- Public route, indexable. Must match the URL you submit to the stores.

### Conflicts / risks
- **None for the website or Android APK.** All three changes are additive or runtime-gated.
- **iOS revenue impact:** while Stripe is hidden inside the iOS app, iOS users can still subscribe via the web at smartygym.com and their account works in the app. This is the standard "reader app" pattern (Netflix, Spotify, Kindle).
- Apple Sign In requires the iOS app to be built with the Sign in with Apple capability enabled in Xcode — your developer must check that box when packaging the IPA. I'll add a one-line note in the deliverable.

---

## Phase 2 — Strongly recommended before submission (separate plan, ask me)

These are not part of this plan's code changes, but you should fix them or your APK/IPA will be flagged:

1. **`public/.well-known/assetlinks.json`** — replace `REPLACE_WITH_YOUR_SIGNING_KEY_SHA256_FINGERPRINT` with the SHA-256 from your release keystore (your Android developer has it).
2. **`public/.well-known/apple-app-site-association`** — replace `TEAM_ID` with your real Apple Developer Team ID.
3. **Android app icons** — `public/app-icons/android/mipmap-*/` are empty. Your developer must place real icons in `android/app/src/main/res/mipmap-*` inside the native project (not in `public/`).
4. **iOS `Info.plist`** — your developer must add usage strings for any permission used (push notifications, etc.).
5. **Splash background color** — `capacitor.config.ts` uses `#0F0F0F`; change to brand `#0F172A`. Cosmetic.

I will handle 5 in code if you want; 1–4 are native/config tasks for your developer.

---

## What I will NOT change
- Existing Google sign-in flow.
- Web Stripe checkout (unchanged on web/Android).
- Existing `/disclaimer` page (kept; `/privacy` is a separate, store-formatted page).
- Any backend/database logic.

## Files affected
- `src/pages/Auth.tsx` — add Apple button
- `src/utils/platform.ts` — new helper
- `src/components/PurchaseButton.tsx`
- `src/components/shop/ProductCard.tsx`
- `src/components/AccessGate.tsx`
- `src/pages/JoinPremium.tsx`
- `src/pages/SmartyPlans.tsx`
- `src/pages/PrivacyPolicy.tsx` — new
- `src/App.tsx` — register `/privacy` route
- `src/components/Footer.tsx` — add Privacy link

After approval I will also call the social-auth tool to enable Apple in Lovable Cloud.