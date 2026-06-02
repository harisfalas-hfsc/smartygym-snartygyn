## What I found

The screenshots you attached are not the real fullscreen/locked state. They show the normal Rounds Tracker card with the small maximize icon still visible in the bottom-right. The true locked state already exists in `RoundsTracker.tsx` and should show:

- a full-screen blue tap area
- no normal card chrome
- a floating circular HOLD/Unlock control
- the text “Locked — hold button to exit”

So if the website/PWA stays like your screenshots after pressing maximize, the click is not reliably entering the `locked` UI state on that environment.

## Why APK can be different

Your APK/native wrapper is detected as a native platform and the app clears old PWA service workers/caches there. The browser/PWA version can still be affected by browser display/fullscreen limitations and older cached PWA behavior. Also, `requestFullscreen()` is not equally supported in every mobile browser/PWA shell, so the current code ties the visual lock action too closely to browser fullscreen support.

## Implementation plan

1. **Make the visual lock independent from browser fullscreen**
   - When the user taps the maximize icon, immediately render the locked full-screen overlay.
   - Treat native fullscreen/orientation lock as optional enhancements only.
   - If browser fullscreen fails, the visual locked overlay will still appear identically.

2. **Harden mobile/PWA behavior**
   - Add mobile-safe viewport sizing using `100dvh/100svh` fallback styling for the locked overlay.
   - Prevent page scrolling/body movement while locked.
   - Keep the HOLD unlock button visible above safe-area/bottom navigation on Android, iOS, PWA, and browser.

3. **Improve the maximize button reliability**
   - Use pointer/touch-safe handling so one tap reliably triggers locked mode.
   - Stop accidental event conflicts with the surrounding card/tap area.
   - Keep changes only inside the standalone `/tools/rounds-tracker` page.

4. **Do not touch workout/training program tool popups**
   - No changes to `RoundsCounterPopup.tsx`, workout pages, or training program pages.

5. **Verification**
   - Check the standalone Rounds Tracker route at a mobile viewport similar to your screenshots.
   - Confirm pressing maximize switches to the locked overlay and shows the HOLD unlock control.

## Files to change

- `src/pages/RoundsTracker.tsx` only.