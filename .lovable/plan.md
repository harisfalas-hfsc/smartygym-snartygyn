# Add Jump Starter as the 5th rotating hero image

## Goal
Extend the desktop homepage hero image carousel from 4 to 5 rotating workout covers by appending **Jump Starter** (Micro-Workout MW-006) to the existing crossfade rotation.

## Change
File: `src/components/home/HeroDestinationConstellation.tsx`

Append a 5th entry to the `HERO_ROTATING_IMAGES` array (after Anchor Point Flow):

- `url`: the newly regenerated Jump Starter cover
  `https://cvccrvyimyzrxcwzmxwk.supabase.co/storage/v1/object/public/avatars/workout-covers/workout-regen-1779439836806-5lots.png`
- `alt`: `"Jump Starter micro-workout"`

No other code changes required — the existing `setInterval` and crossfade logic automatically picks up the new length (`% HERO_ROTATING_IMAGES.length`), so the rotation becomes 5 images at 2.5s intervals with the same fade transition.

## Verification
- Open homepage on desktop, watch the hero cycle through 5 images: Helix Cascade → Compass Blitz → Metabolic Mesh → Anchor Point Flow → Jump Starter → loop.
- Confirm the new image loads (no broken image) and the crossfade timing remains smooth.