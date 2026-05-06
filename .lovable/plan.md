
# Hero Redesign — Interactive Circle Constellation

Replace the carousel inside the homepage hero card with a static, **interactive cluster of circular image "bubbles"** — inspired by the reference photo you shared (the floating circle portraits) — but instead of faces, each circle is a destination card (WOD, Workouts, Programs, Tools, Library, Blog, Community).

No more swiping. No more dots. Everything visible at a glance, more premium, more impressive.

---

## What stays (you said you like these)

- The **"100% Human. 0% AI."** headline with the three top icons.
- The **"Your Gym Re-imagined Anywhere, Anytime"** card with the 3 feature mini-cards (Real Expertise / Personal Touch / Not a Robot) and "Discover The Smarty Method" link.
- The **"Who is SmartyGym For?"** row at the bottom (Busy Adults, Parents, Beginners, Intermediate, Travelers, Gym-Goers) with tooltips.
- The science-based "every workout by Haris Falas" line.
- All SEO metadata, structured data, schema attributes.

## What gets replaced

- The desktop **carousel of 7 nav cards** (Workout of the Day / Workouts / Programs / Tools / Library / Blog / Community).
- The mobile **swipe carousel** of 6 cards (mirrors the desktop one).
- Removes the chevrons, "Swipe to explore", and dot navigation tied to those carousels.

---

## The new component: `HeroDestinationConstellation`

A single new component used on **both desktop and mobile** (responsive), placed exactly where the desktop carousel sits today (right above the "Your Gym Re-imagined" card) and where the mobile swipe carousel sits today.

### Visual concept

An asymmetric "floating bubbles" cluster — like the reference image, but each circle is a clickable destination with the card's hero image inside, a soft glow ring, an icon chip, and a label underneath.

```text
Desktop layout (≈ 560px tall, fits inside hero card):

                    ┌──── WOD ────┐               ← largest (180px), pulsing primary ring
                    │   image     │
                    └─────────────┘
       ┌─Programs─┐                  ┌─Workouts─┐  ← large (140px)
       │  image   │                  │  image   │
       └──────────┘                  └──────────┘
              ┌─Tools─┐    ┌─Library─┐            ← medium (120px)
              │ image │    │  image  │
              └───────┘    └─────────┘
                ┌─Blog─┐  ┌Community┐             ← small (100px)
                │image │  │  image  │
                └──────┘  └─────────┘

Mobile layout (compact 2-column "honeycomb" stack):

           ┌── WOD ──┐
           │  image  │   ← featured, full-width centered (160px)
           └─────────┘
   ┌Workouts┐    ┌Programs┐
   │ image  │    │ image  │
   └────────┘    └────────┘
   ┌─Tools──┐    ┌Library─┐
   │ image  │    │ image  │
   └────────┘    └────────┘
   ┌─Blog───┐    ┌Community┐
   │ image  │    │ image   │
   └────────┘    └─────────┘
```

### Each "bubble" =
- Perfectly **round** (`rounded-full`), thick **primary-color ring** (2–4px depending on size).
- **Card image** filling the circle (`object-cover`).
- A small **icon chip** (Lucide icon, brand-color background) pinned to bottom-right of the circle, like a status badge.
- **Label** under the circle (e.g. "Workout of the Day"), short tagline below in muted text on hover/focus.
- Soft **drop shadow** + subtle **gradient tint overlay** on the image so the white text/badge stays legible.

### Interactivity / "fancy" touches
1. **Idle floating animation** — each bubble bobs up/down 3–6px on a slow, staggered loop (CSS keyframes, respects `prefers-reduced-motion`).
2. **Hover/tap**: bubble scales to 1.08, ring brightens to solid primary, drop shadow grows, a tooltip-like caption ("Today's featured workout…") slides in below.
3. **Featured WOD bubble** has a **slow pulsing ring** (animate-ping style) to draw the eye — also shows a tiny "TODAY" pill if a WOD is published.
4. **Connecting lines** (decorative SVG, primary @ 15% opacity) faintly link bubbles into a constellation — pure visual flourish, `aria-hidden`.
5. **Click → navigate** to that route (same destinations as today's carousel).

### Accessibility
- Each bubble is a real `<button>` / `<Link>` with descriptive `aria-label`.
- Floating + pulse animations gated by `prefers-reduced-motion: reduce`.
- Focus rings visible (primary outline).
- All decorative SVG / glow layers `aria-hidden`.

---

## File changes

1. **NEW**: `src/components/home/HeroDestinationConstellation.tsx`
   - Self-contained component, accepts no required props (reads `useTodayWods()` itself to know if WOD is published, to show the "TODAY" pill / live state on the WOD bubble).
   - Uses the same 7 destinations (`heroWodImage`, `heroWorkoutsImage`, `heroProgramsImage`, `heroToolsImage`, `heroLibraryImage`, `heroBlogImage`, `heroCommunityImage`).
   - Two internal layouts switched via Tailwind responsive classes (`md:` breakpoint), no JS branching, so it works for both mobile and desktop in one component.

2. **EDIT**: `src/pages/Index.tsx`
   - **Mobile branch (line ~572–643)**: remove the `<Carousel>` block + "Swipe to explore" chevron header + dots. Replace with `<HeroDestinationConstellation />`. Keep the "Quick Access Menu" (WOD card with images, About, Smarty Plans, FAQ, etc.) below it untouched.
   - **Desktop branch (line ~839–927)**: remove the `<Carousel>` block + dots inside the hero card. Replace with `<HeroDestinationConstellation />`.
   - Remove now-unused state: `carouselApi`, `currentSlide`, `desktopNavApi`, `desktopNavSlide`, `highlightedCardIndex`, `isHoveringDesktopNav`, plus their `useEffect` cyclers and the `desktopNavCards` array. Keep `heroCards` only if still used elsewhere; otherwise also remove.
   - Trim now-unused Lucide imports (`ChevronLeft` if no other consumer, `CalendarCheck` if only used by `desktopNavCards`).

3. **NO changes** to: `Footer`, `Navigation`, mobile bottom nav, "Who is SmartyGym For", "Your Gym Re-imagined" card, FAQ, science blurb, schema/SEO blocks.

---

## Technical details

- Tailwind only — no new packages.
- Animations via `tailwindcss-animate` (already installed) + a small inline `@keyframes float` block, or a tiny `<style>` tag inside the component for the 3 staggered float variants.
- Sizes use fixed `w-[Npx] h-[Npx]` values for desktop, percentage / clamp for mobile, so the constellation never reflows awkwardly.
- Connecting lines: one `<svg>` absolutely positioned behind the bubbles, with thin `stroke-current text-primary/15` paths between bubble centers (hardcoded coordinates per layout).
- WOD bubble subscribes to `useTodayWods()` (already imported in `Index.tsx`) — passes `isWodLive` as a prop OR reads the hook itself. Showing/hiding the "TODAY" pill is the only conditional bit.
- Fully self-contained, ~250 LOC, easy to tweak sizes/positions later.

---

## What you'll see after the change

- **Desktop**: walk into the hero card and instead of a sliding strip you see 7 floating image circles arranged in a constellation, the WOD circle largest and gently pulsing, each link visible in one glance, no swiping needed. Below it, the "Your Gym Re-imagined" card stays exactly as you like it, then the "Who is SmartyGym For" row.
- **Mobile**: the WOD circle sits big and centered up top, then 3 rows of paired circles (Workouts/Programs, Tools/Library, Blog/Community) — everything tappable, no swiping. The Quick Access Menu (WOD images, About, Plans, FAQ…) follows underneath as today.

If after seeing it live you want a **different cluster shape** (e.g. orbital ring, hexagon grid, masonry of mixed sizes), it's a one-file tweak.
