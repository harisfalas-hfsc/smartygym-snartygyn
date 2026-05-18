# Desktop Hero — Video-First Redesign

Replace the 7-card bento grid (Workouts, Blog, Library, WOD, Programs, Tools, Community) on the desktop hero with a single large video as the primary visual, and surface those destinations as a rotating link banner overlaid on top of the video (similar to the existing CTA banner pattern).

Mobile layout stays untouched.

## 1. Remove the desktop bento card grid

In `src/components/home/HeroDestinationConstellation.tsx`:
- Hide the entire desktop bento stage (the 530px-tall grid wrapper with Workouts / Programs / Library / WOD / Blog / Tools / Community cards) on `md+`.
- Keep mobile rendering (HeroThreeColumns carousel) exactly as it is — no change for users under 1024px.

## 2. Make the video the full hero

- The `DesktopVideoBanner` becomes the main hero on desktop, not a small strip above cards.
- Width: same `desktopStageWidth` the cards used (so it stays aligned with the rest of the page container).
- Height: grow to roughly the space the cards previously occupied (~500–540px) so the hero keeps its current vertical footprint and the page below doesn't jump.
- Keep `object-cover`, autoplay, muted, loop, playsInline. Add a subtle dark gradient overlay (bottom → top) so overlaid text stays readable.
- Existing fitness training video stays (`src/assets/hero-banner-video.mp4`).

## 3. Rotating link banner overlaid on the video

A single banner pinned over the lower-center of the video, cycling through the 7 destinations every ~2.5s:

- Workouts → `/workout`
- Programs → `/trainingprogram`
- Exercise Library → `/exerciselibrary`
- Workout of the Day → `/wod` (current WOD route)
- Blog & Insights → `/blog`
- Tools → `/tools`
- Community → `/community`

Banner design:
- Glass card (frosted background, rounded, border in `border-white/20`), centered horizontally, sitting ~24px above the bottom of the video.
- Content: small icon (lucide, matching the card icons already used) + destination title + short tagline + a `ChevronRight`.
- Whole banner is one clickable link routing to the destination.
- Crossfade between entries (`animate-fade-in` / opacity transition, ~300ms), 2.5s dwell.
- Pause rotation on hover; resume on mouse leave.
- Reuse the existing CTA banner ("Start your fitness journey now") for guests + subscribers, shown above or beside the rotating link banner (premium users still see no CTA, as today).

Accessibility:
- `aria-live="polite"` on the rotating banner region.
- Each rotation entry is a real `<a>`/`Link` so keyboard + screen readers can navigate.
- `prefers-reduced-motion`: disable autorotation, show all 7 as a static inline row of pill links instead.

## 4. Out of scope

- Mobile layout, WOD logic, AccessControl, Stripe, DB, edge functions — all untouched.
- No new video generation (current fitness clip is reused).
- No changes to the cards component itself (`HeroThreeColumns.tsx`) — it stays available for mobile.

## Technical notes

- All edits stay inside `src/components/home/HeroDestinationConstellation.tsx` (and a small new internal sub-component for the rotating banner, kept in the same file or a sibling file under `src/components/home/`).
- Destination list defined once as a typed array reused for both the rotation and the reduced-motion fallback.
- Premium gating for the CTA reuses the existing `useAccessControl` check already present in this file — no new tier logic.
