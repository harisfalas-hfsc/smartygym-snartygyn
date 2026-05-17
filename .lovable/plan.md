## Fix-and-recheck plan

### Goal
Repair every issue found in the mobile audit, then run a full mobile recheck at 390×844 using:
- Guest/visitor mode
- Free-subscriber test account: `hfsc.nicosia@gmail.com`
- Premium test account: `harisfalas@gmail.com`

I will not mark this complete until the broken routes, popups, navigation, access gates, logbook, Exercise Library, dashboard, notifications, and mobile manifest have been rechecked.

## Phase 1 — Critical stability fixes

### 1. Fix the broken LogBook / Calculator History blank screen
**Problem:** `/calculator-history` currently crashes with `Cannot access 'checkAuth' before initialization`.

**Fix:**
- Move `checkAuth` and all data-fetching helper functions above the first `useEffect` / render return in `CalculatorHistory.tsx`.
- Make sure premium gating does not call functions before they exist.
- Confirm `/calculator-history?tab=1rm`, `?tab=bmr`, `?tab=macro`, and `?tab=measurements` all render on mobile.
- Confirm non-premium users are redirected cleanly instead of seeing a blank screen.

### 2. Fix Free Trial popup blocking login/auth pages
**Problem:** the trial popup appears on `/auth`, blocking login/signup fields.

**Fix:**
- Add a hard route exclusion list for sensitive/functional pages:
  - `/auth`
  - `/reset-password`
  - `/calculator-history`
  - `/userdashboard`
  - checkout/payment/result pages
  - unsubscribe/newsletter utility pages
- Store dismissal in session storage so it does not reappear every few minutes during the same visit.
- Keep the popup only on appropriate guest marketing/browsing pages.
- Recheck login flow on mobile with no popup interruption.

### 3. Fix admin-role 406 console spam
**Problem:** non-admin users trigger errors because admin role lookup uses `.single()` when no row is normal.

**Fix:**
- Update `useAdminRole.ts` to use `.maybeSingle()`.
- Treat “no admin role found” as a normal non-admin state, not an error.
- Avoid console error noise for normal subscriber/premium users.
- Recheck subscriber and premium sessions for no repeated 406 admin-role errors.

## Phase 2 — Mobile navigation and UI fixes

### 4. Fix disappearing hamburger icon on mobile
**Problem:** the mobile hamburger button becomes a blank blue circle on some logged-in pages.

**Fix:**
- Make the hamburger icon color explicit in all states: normal, hover, active, light mode, dark mode.
- Avoid inherited button styling that makes the icon match the background.
- Verify it remains visible on:
  - Home logged out
  - Home logged in
  - `/userdashboard`
  - `/exerciselibrary`
  - workout/program/detail pages

### 5. Restore Exercise Library mobile filters
**Problem:** Exercise Library filters are hidden on mobile; mobile users only get search.

**Fix:**
- Replace the desktop-only filter section with a responsive mobile-friendly filter panel.
- On mobile, show a clear “Filters” control with body part, equipment, target muscle, difficulty, and category selectors.
- Keep the desktop layout intact.
- Confirm filters work and results update on mobile.

### 6. Make Goals visible and reachable from the dashboard
**Problem:** Goals exist in code but were not discoverable during the mobile dashboard audit.

**Fix:**
- Make the Goals/Active Goals area clearly visible in the dashboard overview.
- Add a dashboard card/entry point for Goals if needed.
- Ensure “Set Goals” opens the measurement goals flow correctly.
- Keep premium access rules intact for detailed calculator history.

## Phase 3 — Mobile/PWA and notification fixes

### 7. Fix `manifest.webmanifest` mobile/PWA 401 issue
**Problem:** the manifest request returned Unauthorized during audit.

**Fix:**
- Verify the manifest file is served from `public/manifest.webmanifest` without auth.
- Check index manifest link and any service-worker interception that could cause 401.
- Ensure manifest icons resolve publicly.
- Recheck the network request on mobile: `/manifest.webmanifest` must return 200 with JSON.

### 8. Fix stale notification behavior
**Problem:** notification/badge/toast behavior can become stale or noisy.

**Fix:**
- Recheck unread message count logic and “mark as read” events.
- Ensure dashboard message reads trigger navigation badge refresh.
- Ensure social proof toasts never show for logged-in users and are cleaned up on route/auth changes.
- Verify no fake/stale social proof appears inside subscriber or premium sessions.

## Phase 4 — Access-level regression checks

### 9. Recheck access rules after fixes
I will verify that the fixes do not weaken access control:

**Visitor:**
- Can browse public pages, blog, public workout/program listings, Exercise Library, and public tools.
- Cannot access premium-only content or dashboard.
- Sees correct upgrade/login prompts.

**Free subscriber:**
- Can log in.
- Can access dashboard basics, purchases/orders/messages/account.
- Cannot access premium-only content unless purchased individually.
- Does not see admin UI.
- Does not get admin-role console spam.

**Premium customer:**
- Can access premium workouts, programs, logbook/calculator history, dashboard tools, ritual/check-ins if available, and premium flows.
- Does not see trial popup.
- Does not lose hamburger menu icon.

## Phase 5 — Full mobile recheck before reporting

After implementation, I will run a mobile verification pass at 390×844 and report evidence per tier.

### Required validation checklist
- `/calculator-history` no blank screen.
- All calculator-history tabs render.
- `/auth` is not blocked by the trial popup.
- Hamburger icon visible and functional on affected pages.
- `/manifest.webmanifest` returns 200, not 401.
- Non-admin users do not produce admin-role 406 spam.
- Exercise Library mobile filters are visible and usable.
- Dashboard Goals are visible/reachable.
- Notification badge/read-state updates correctly.
- Social proof/trial popups do not appear in logged-in premium/subscriber sessions.
- Guest, subscriber, and premium access levels still match the intended rules.

## Files expected to change

- `src/pages/CalculatorHistory.tsx`
- `src/components/growth/FreeTrialPopup.tsx`
- `src/hooks/useAdminRole.ts`
- `src/components/Navigation.tsx`
- `src/components/ExerciseDatabase.tsx`
- `src/pages/UserDashboard.tsx`
- `src/components/UserMessagesPanel.tsx` and/or `src/hooks/useUnreadMessages.ts` if notification refresh needs repair
- `src/components/growth/SocialProofToast.tsx` if stale logged-in toasts are confirmed
- `public/manifest.webmanifest`, `index.html`, or service-worker-related files only if the 401 source is confirmed there

## Final deliverable after implementation

I will provide a mobile QA report with:
- What was fixed
- What was retested
- Guest result
- Free-subscriber result
- Premium result
- Any remaining risks or items that still need attention

I will not claim clearance unless the mobile recheck confirms the fixes.