
## Cross-Promo Popup — SmartyGym → SmartyMove + SmartyDiet

Add a popup that appears **5 seconds after every page load**, on every route (desktop and mobile), promoting the two sister apps in the Smarty Wellness family.

### What appears in this project (SmartyGym)

A centered modal with two side-by-side clickable cards (stacked on mobile):

1. **SmartyMove** — https://smarty-motion-pro.lovable.app
   - Tagline: *"Check your posture. Correct your movement. Live better."*
2. **SmartyDiet** — https://smarty-meals-hub.lovable.app
   - Tagline: *"Eat smart. Fuel your body. Live longer."*

Small header: *"Complete your Smarty Wellness journey"*
Each card = image + app name + tagline + "Visit →" button. Clicking anywhere on a card opens the target URL in a **new tab**. A small close (×) button dismisses.

### Behavior

- Fires exactly 5 seconds after mount, every visit (per user's answer).
- Shows on every route including auth/checkout/admin (per user's answer).
- Same component/behavior on desktop and mobile (responsive: 2 columns ≥640px, stacked below).
- No dependency on auth state — works for logged-out visitors too.

### Files

- **New:** `src/components/growth/SisterAppsPopup.tsx` — the modal component (uses existing shadcn `Dialog`).
- **New:** `src/assets/promo-smartymove.jpg` — generated placeholder (athletic person doing a mobility/movement assessment, bright, clean).
- **New:** `src/assets/promo-smartydiet.jpg` — generated placeholder (fresh healthy meal / nutrition theme, bright, clean).
- **Edit:** `src/App.tsx` — mount `<SisterAppsPopup />` globally alongside existing popups (`FreeTrialPopup`, `SmartyCoachWelcomePopup`).

### Reusable across the three projects

The component will be self-contained (no project-specific imports beyond shadcn `Dialog` + `Button` + `lucide-react`, all present in all three projects). It exports a small `SISTER_APPS` config array. To port to SmartyMove and SmartyDiet, the user (or agent, in those projects) copies the file + two images and swaps which two entries the popup shows — a single `CURRENT_APP = "gym" | "move" | "diet"` constant at the top controls that.

### Verification

After implementing, run the project build to confirm no TS/build errors, then use Playwright against `http://localhost:8080` to load `/`, wait ~6s, screenshot, and confirm the modal appears with both cards and links resolve to the correct URLs.
