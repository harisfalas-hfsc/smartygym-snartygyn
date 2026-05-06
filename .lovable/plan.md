## Goal

Make each destination bubble in the homepage hero constellation feel alive: on hover, it smoothly enlarges AND glides toward the center of the constellation, with a gentle elastic easing that returns it to its original spot when the cursor leaves. Mobile (no hover) stays unchanged.

## What changes (desktop only)

- Each bubble computes its delta from its own center to the constellation center (490, 295 — half of the 980×590 stage).
- On hover/focus the bubble:
  - Scales from 1 → ~1.18 (featured WOD slightly less, since it's already big).
  - Translates ~25–30% of the way toward the center.
  - Lifts above siblings via a higher `z-index`.
  - Brightens its glow (stronger primary ring + larger shadow).
- Transition: `transform 500ms cubic-bezier(0.22, 1, 0.36, 1)` (smooth ease-out with a soft settle), plus matching shadow/ring transitions.
- The existing idle float animation is paused while hovered so the gravitation motion reads cleanly.
- Decorative connection lines stay put — only the hovered bubble moves.
- The center Haris Falas bubble keeps a simple scale-up (no translation, since it's already at the center).
- Mobile bubbles keep the current subtle scale-only hover.

## Technical notes

- File touched: `src/components/home/HeroDestinationConstellation.tsx`.
- Pass each bubble its `dx` and `dy` toward center as CSS variables (`--pull-x`, `--pull-y`) on the wrapper.
- Hover transform: `translate(calc(var(--pull-x) * 0.28), calc(var(--pull-y) * 0.28)) scale(1.18)`.
- Use a `peer`/`group-hover` pattern on the wrapper so the label below also lifts slightly with its bubble.
- Add `will-change: transform` and `transform-gpu` for smooth 60fps motion.
- Respect `prefers-reduced-motion`: fall back to scale-only, no translation.
- No new dependencies; pure Tailwind + inline style variables.

## Out of scope

- No layout, color, copy, or image changes.
- No mobile behavior changes.
- No changes to routing or data sources.
