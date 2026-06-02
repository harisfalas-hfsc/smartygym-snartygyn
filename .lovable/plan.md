## Goal

Force the screen to stay ON while the user is actively using the **Rounds Tracker** or **Workout Timer** tools — especially when maximized — on iOS, Android, PWA, and in-app WebView. No more screen sleeping mid-set.

## Current state

- `RoundsTracker.tsx` — already requests `navigator.wakeLock` but only when the user taps the maximize/lock button (`enterLock`). Released when unlocked.
- `WorkoutTimer.tsx` — already requests `navigator.wakeLock` but only while `isRunning === true`. Released when paused.
- Neither re-acquires the lock after the tab is backgrounded and returns (Wake Lock API drops the sentinel automatically on visibility change).
- Neither has an iOS Safari / iOS WebView fallback. The Wake Lock API is supported on iOS Safari 16.4+, but unreliable in older iOS versions and in some in-app WebViews / PWA standalone — which is exactly why the user sees the screen go dark.

## Changes

### 1. New shared hook `src/hooks/useKeepScreenAwake.ts`

A single reusable hook that keeps the screen on while `active === true`.

- Primary: `navigator.wakeLock.request("screen")`.
- Re-acquire on `visibilitychange` when the document becomes visible again (Wake Lock auto-releases on hide).
- iOS fallback: a tiny inline, muted, `playsinline`, looping 1-pixel video element appended to the DOM and played while active. This is the standard NoSleep.js technique that keeps iOS Safari awake when Wake Lock is unavailable. Use a base64 data-URI so no extra asset is shipped.
- Clean teardown: release sentinel, pause+remove the video, remove the visibility listener.

Signature: `useKeepScreenAwake(active: boolean): void`.

### 2. `src/pages/RoundsTracker.tsx`

- Remove the ad-hoc wake-lock calls inside `enterLock` / `exitLock`.
- Call `useKeepScreenAwake(locked || isRunning)` at the top of the component, where `isRunning` is the existing timer-running state. This means the screen stays awake whenever the user is either timing a round OR has the tool maximized — matching the user's request.

### 3. `src/pages/WorkoutTimer.tsx`

- Remove the existing `useEffect` block that manages `wakeLockRef` directly.
- Call `useKeepScreenAwake(isRunning || isMaximized)` where `isMaximized` is the equivalent locked/fullscreen state if present; if WorkoutTimer doesn't currently expose a maximized state, just pass `isRunning` (still better than today because of the visibilitychange re-acquire and the iOS fallback). Confirm during implementation by reading the file.

### 4. No other pages touched

Workout pages, training program pages, popups (`RoundsCounterPopup`, etc.) are left untouched, per the user's standing instruction.

## Technical notes

- Wake Lock API: supported on Chrome/Edge Android, Chrome desktop, Safari iOS 16.4+. Auto-releases on tab hide → re-acquire on `visibilitychange`.
- iOS video fallback: 1×1 transparent webm/mp4 data URI, `muted`, `playsinline`, `loop`, `autoplay`. Triggered inside a user gesture (the user already tapped Start / Maximize before `active` becomes true, so autoplay policies are satisfied).
- Capacitor / APK: Wake Lock works in the Android WebView when the app is in foreground; the video fallback also works as a second line of defense.
- All API calls wrapped in `try/catch`; failures are silent and the timer still functions.

## Verification

- Open `/tools/rounds-tracker` on Android Chrome, start a long round (e.g. 4 min), lock the phone-screen timeout to 30 s in OS settings, leave the phone idle → screen stays on for the full round.
- Same on iOS Safari and iOS PWA (Add to Home Screen).
- Same on `/tools/workout-timer` with a 10-min timer running.
- Confirm no regression when the user leaves the page: wake lock is released, video element removed (check DOM).
