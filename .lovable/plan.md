

# Fix Two Issues: Lovable Icon in WhatsApp + Overly Bright Popup Image

## Issue 1: Lovable Icon in WhatsApp Link Previews

The `index.html` favicon links correctly point to `/smarty-gym-logo.png`, and og:image points to the social share banner. However, browsers and messaging apps like WhatsApp automatically request `/favicon.ico` as a fallback. Since no `favicon.ico` exists in `public/`, the hosting platform may serve a default Lovable icon.

**Fix**: Create a proper `favicon.ico` file in `public/` by converting the existing `smarty-gym-logo.png` to ICO format. This ensures any client requesting `/favicon.ico` gets the SmartyGym logo instead of any platform default.

Note: WhatsApp caches link previews aggressively. After deploying, the old preview may persist for hours/days. You can force a refresh by appending a query parameter when sharing (e.g., `smartygym.com/blog?v=2`).

### File changed
- `public/favicon.ico` — new file generated from `smarty-gym-logo.png`

---

## Issue 2: Trial Popup Image Too Bright

The AI-generated image is overexposed / too bright, making it hard to see. The overlay (`from-white/95 via-white/75 to-white/30`) compounds the problem by adding even more whiteness on top.

**Fix**: Generate a new, more balanced popup background image — same concept (fit person/couple with tablet in a well-lit gym) but with **natural, moderate lighting** instead of blown-out brightness. Then reduce the white overlay intensity slightly so the image is actually visible behind the text.

### Changes
- `src/assets/trial-popup-bg.jpg` — regenerate with prompt specifying natural indoor lighting, not overexposed
- `src/components/growth/FreeTrialPopup.tsx` — reduce overlay from `from-white/95 via-white/75 to-white/30` to something like `from-white/90 via-white/60 to-white/20`
- `src/components/growth/ExitIntentPopup.tsx` — same overlay adjustment

