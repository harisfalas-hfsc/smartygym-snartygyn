# Fix Desktop Hero Issues

Three corrections to the recent desktop hero changes.

## 1. Restore card alignment (remove the 25% scale)

The previous change wrapped the bento grid in a `scale(0.75)` transform, which shrank every card uniformly and broke the spacing/alignment that existed before.

**Fix in `src/components/home/HeroDestinationConstellation.tsx`:**
- Remove `* 0.75` from the wrapper height (`height: ${530 * desktopScale}px`).
- Remove `* 0.75` from the transform (`transform: translateX(-50%) scale(${desktopScale})`).
- Cards return to their original sizes/positions — exactly as they were before the video was added.

Note: the user originally asked to reduce only the **height** by 10%, which was already done in an earlier step (cards now ~519px tall instead of ~570px). That height reduction stays. Only the new 25% uniform shrink is reverted.

## 2. Align the video banner with the cards below

Currently `DesktopVideoBanner` uses `w-full` and stretches edge-to-edge of the hero container, while the bento grid is centered at `desktopStageWidth` (the card grid's actual width).

**Fix:**
- Wrap the video banner in a centered container that matches `desktopStageWidth` (same width the bento stage uses).
- The video card's left/right edges will line up vertically with the leftmost and rightmost cards in the grid below (Workouts / Library / Community column edges).
- Keep the existing height (180px), rounded corners, CTA, and premium gating untouched.

## 3. Regenerate the hero video — real training, not dancing

The current `src/assets/hero-banner-video.mp4` shows two people doing dance-like movements. Replace it with a proper fitness training clip.

**New video prompt direction:**
- Two athletic fitness models in a modern bright gym.
- Clearly performing real strength/conditioning exercises — e.g. one doing a barbell back squat with controlled form, the other doing kettlebell swings or dumbbell presses alongside.
- Cinematic side-angle, slow camera, natural gym lighting, focused training expressions.
- No dance moves, no synchronized choreography, no jumping in place for show.
- 5s loop, 1080p, 16:9, same path (`src/assets/hero-banner-video.mp4`) so no imports change.

## Out of scope

- Mobile layout (untouched).
- WOD card header, hover effects, bento positions — all left as they are now.
- No backend, no Stripe, no DB changes.
