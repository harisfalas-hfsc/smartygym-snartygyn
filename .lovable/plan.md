# Make the bottom nav adapt to every phone's system UI

## The problem (visible in your screenshots)

Your bottom navigation bar must sit **above** whatever the phone shows at the very bottom of the screen. That bottom area is different on every device:

| Device type | What's at the bottom |
|---|---|
| iPhone (Face ID) | Home indicator (the thin horizontal pill) |
| Android with gesture nav | Thin gesture pill |
| Android with 3-button nav (Samsung/Pixel old mode) | Full bar with Back / Home / Recents |
| Older iPhones / browser tabs | Nothing |

Right now the code uses one CSS trick (`env(safe-area-inset-bottom)`) that only works correctly on iPhones and modern Android gesture mode. On Samsung/Pixel devices using the **3-button navigation** (your Image 3), the system reports `0`, and our bar gets covered by the system buttons.

There are also two related issues:
- The viewport meta tag is missing `viewport-fit=cover`, which iOS needs before it will report the safe-area values at all.
- On mobile Chrome, the URL bar collapses on scroll and our fixed bar can briefly jump.

## What will change

**1. Fix the viewport meta tag** (`index.html`)
Add `viewport-fit=cover` so iOS reports the home-indicator inset correctly. Also enables proper edge-to-edge rendering on Android.

**2. Make `MobileBottomNav` truly adaptive** (`src/components/MobileBottomNav.tsx`)
Replace the single `env(safe-area-inset-bottom)` rule with a layered approach that handles every case:

- Use the modern `dvh` (dynamic viewport height) and `max(...)` CSS so the bar always honors whichever is bigger: the iOS safe area, the Android gesture pill, **or** a sensible fallback when the OS reports 0 but a system bar is actually present.
- Add a small bottom padding fallback (8px) so even when the OS reports `0`, the bar never sits flush against the screen edge or under a 3-button navbar in browsers that resize the viewport.
- Detect Android 3-button nav using `window.visualViewport` height vs `window.screen.height`. When the difference exceeds the safe-area inset by more than ~30px, we know a system nav bar is eating space the browser didn't report — add that delta as extra padding. This recalculates on `resize`, `orientationchange`, and `visualViewport` events.
- Use `position: fixed` with `bottom: 0` and `paddingBottom: max(env(safe-area-inset-bottom), <measured-android-gap>, 8px)`.

**3. Update the body padding token** (`src/index.css`)
The existing `--mobile-bottom-nav-h` variable currently uses only `env(safe-area-inset-bottom)`. Update it to mirror the same `max(...)` logic so page content (especially the last item in scroll lists) is never hidden behind the bar on any device.

**4. Native Capacitor app**
For the wrapped iOS/Android app the project already supports via Capacitor: the safe-area insets work natively on both platforms, so the same code automatically does the right thing inside the installed app — no extra work needed.

## Result per device

- **iPhone (notch/home indicator)** → bar sits above the home indicator (uses iOS safe-area inset).
- **Android gesture nav (modern Samsung/Pixel)** → bar sits above the gesture pill (uses Android safe-area inset).
- **Android 3-button nav** → bar sits above the Back/Home/Recents row (uses the visualViewport delta detection + fallback padding).
- **In-browser with collapsing URL bar** → bar follows the visible viewport without overlap.
- **Tablets / desktop** → unchanged (component is `md:hidden`).

## Files to touch

- `index.html` — add `viewport-fit=cover` to the existing viewport meta.
- `src/components/MobileBottomNav.tsx` — adaptive padding logic + visualViewport listener.
- `src/index.css` — update `--mobile-bottom-nav-h` to match.

No new dependencies, no database changes, no impact on desktop or non-mobile pages.
