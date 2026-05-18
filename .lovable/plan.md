## Hero Bento — make the WOD card unmistakable + add hover enhancement to all tiles

Scope: `src/components/home/HeroDestinationConstellation.tsx` only (the desktop bento grid that renders the hero on `/`).

### 1. Make the WOD card clearly the "Workout of the Day"

Today the only signal is a tiny "Today" pill at top-left of the featured tile. Change the featured (WOD) bento tile so it reads as the hero:

- Replace the small "Today" pill with a prominent header band at the top of the WOD card:
  - Large, all-caps title: **"Workout of the Day"**
  - Subtitle line: today's date (e.g. "Monday, May 18") + a small live "Today" chip
  - Sit on a translucent dark gradient so it stays legible over the image
- Keep the existing workout name + description + category/difficulty badges anchored at the bottom (unchanged content), but tighten spacing so the new header has room.
- Bump the WOD tile's visual weight: thicker primary ring (already `ring-2`, go to `ring-4`), stronger primary glow shadow, and a subtle persistent pulse on the ring instead of only when live.
- Slightly enlarge the workout name typography (e.g. `text-2xl md:text-3xl`) so it reads as the dominant element on the page.
- No layout/grid-size changes — the bento footprint stays the same so the surrounding cards aren't disturbed (per the layout standard memory).

### 2. Enhance hover on every bento tile

Apply a consistent, premium hover to all 7 tiles (workouts, blog, library, WOD, programs, tools, community) inside `BentoTile`:

- Smooth scale-up (`hover:scale-[1.025]`, featured WOD `1.015` to stay proportional) with GPU transform and `cubic-bezier(0.22,1,0.36,1)` easing (~450ms).
- Ring transitions from `border/60` → `primary` on hover; featured card deepens from `primary` → `primary` + glow.
- Shadow lifts: `shadow-lg` → `shadow-2xl shadow-primary/30`.
- Background image gains a slow `scale-105` zoom on hover (already cycling, so wrap in a transform layer).
- Bottom gradient darkens slightly on hover for better text contrast.
- Icon chip nudges up + scales `1.1` with primary-tinted ring.
- All transitions `motion-safe` only, respecting reduced motion.

### 3. Out of scope

- Mobile constellation layout (untouched — desktop bento only, matching memory: no permanent structural layout changes on mobile).
- No content/data changes, no new components, no business logic.

### Technical notes

- Edits localized to `BentoTile` JSX and class strings in `src/components/home/HeroDestinationConstellation.tsx`.
- New header block conditionally rendered only when `dest.featured` is true.
- Date formatted with `Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" })`.
- Uses existing semantic tokens (`primary`, `primary-foreground`, `background`) — no hardcoded colors.
