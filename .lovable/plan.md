

# Brighten Free Trial Popup Background Image

## Problem
The current popup uses a dark background image (`exit-popup-bg.jpg`) with a heavy dark overlay (`from-black/90 via-black/60 to-black/40`). On the SmartyGym dark-themed site, the popup borders blend in — especially on mobile — making it hard to tell where the popup starts and ends.

## Approach
Generate a new **bright, airy** background image using AI image generation. Same concept — a fitness person or couple using a tablet/phone showing SmartyGym — but with a **bright, well-lit environment** (bright gym, outdoor sunlight, or modern bright studio). Then adjust the overlay and text colors to match the brighter aesthetic while keeping the SmartyGym brand palette (navy + electric blue #29B6D2).

### Step 1: Generate new bright popup image
Use the AI image generation model to create a bright, high-contrast image:
- **Subject**: Fit person or couple holding a tablet/phone showing a workout app interface
- **Setting**: Bright, well-lit environment (sunlit gym, bright modern studio, or outdoor)
- **Tone**: Energetic, positive, bright whites and natural light
- **Colors**: Brand-aligned — touches of electric blue (#29B6D2) where natural

Save as `src/assets/trial-popup-bg.jpg`.

### Step 2: Redesign popup styling for bright background
Update `FreeTrialPopup.tsx`:
- Replace the dark overlay (`from-black/90 via-black/60 to-black/40`) with a **light semi-transparent overlay** or a bottom gradient that keeps text readable without darkening everything
- Change text colors from white to **dark navy** (brand color) for the heading and body text
- Adjust the close button, badge, and "No thanks" link colors to work on a bright background
- Add a visible **border or shadow** so the popup stands out against the dark site background on both mobile and desktop
- Keep the same layout, CTA button, and content structure

### Step 3: Update ExitIntentPopup similarly
`ExitIntentPopup.tsx` also uses the same dark image — update it with the same bright treatment for consistency.

## Files Changed
- `src/assets/trial-popup-bg.jpg` — new AI-generated bright image (replaces `exit-popup-bg.jpg` usage)
- `src/components/growth/FreeTrialPopup.tsx` — new image import, bright overlay/text styling
- `src/components/growth/ExitIntentPopup.tsx` — same bright styling update

