# Constellation Hover Descriptions

Replace the barely-visible tagline text under each constellation bubble with a hover/focus popover that appears in the empty space next to each circle. Works in both desktop constellation and tablet circular layouts; mobile is unaffected.

## File to edit
- `src/components/home/HeroDestinationConstellation.tsx`

## Changes

### 1. Add a `description` field to each destination
One short sentence per bubble (taken as the first sentence of each section's existing copy):

- **WOD**: "The Workout of the Day is a fresh, smart-coded session published every morning for you to train with."
- **Workouts**: "Smarty Workouts are single-session training routines designed to fit your lifestyle and goals."
- **Programs**: "Smarty Programs are long-term, structured plans designed to help you achieve your specific fitness goals."
- **Tools**: "Smarty Tools are calculators and timers that help you measure, plan and time your training."
- **Library**: "The Exercise Library shows you proper form and technique for every movement we use."
- **Blog**: "The Blog publishes evidence-based articles on training, nutrition and recovery."
- **Community**: "The Community is where Smarty members connect, share progress and train together."
- **Coach (Haris Falas)**: "Haris Falas is the founder and head coach behind every workout, program and article on SmartyGym."

### 2. Remove the always-visible tagline
Delete the `<p className="text-xs text-muted-foreground …">{dest.tagline}</p>` line under each bubble. Keep the bold short title (`Workouts`, `Programs`, etc.) — that stays as the always-visible label.

### 3. Add a hover/focus description popover per bubble
Inside `Bubble`, add an absolutely-positioned card that appears on `group-hover` and `group-focus-within`:

- Small box: `~220px wide`, padding `p-3`, `rounded-lg`, `border border-primary/30`, `bg-popover text-popover-foreground` (theme-aware in light + dark), `shadow-xl`, `text-xs leading-snug`.
- Hidden by default (`opacity-0 pointer-events-none translate-y-1`), shown on hover/focus (`group-hover:opacity-100 group-focus-within:opacity-100 transition`).
- `z-40` so it sits above neighbouring bubbles and connection lines.
- `aria-hidden` toggled appropriately; the description is also exposed via `aria-describedby` on the button for screen readers.

### 4. Per-bubble popover placement (desktop)
Each destination gets a `popoverSide` field that controls where the popover sits relative to its circle, chosen so it lands in the empty space of the constellation:

| Bubble | Side | Tailwind position on the popover |
|---|---|---|
| wod (top center) | top | `bottom-full mb-3 left-1/2 -translate-x-1/2` |
| workouts (top right) | bottom-left (diagonal) | `top-full mt-3 right-1/2` |
| programs (top left) | bottom-right (diagonal) | `top-full mt-3 left-1/2` |
| tools (mid-left) | right | `left-full ml-3 top-1/2 -translate-y-1/2` |
| library (mid-right) | left | `right-full mr-3 top-1/2 -translate-y-1/2` |
| blog (bottom-left) | top-right (diagonal) | `bottom-full mb-3 left-1/2` |
| community (bottom-right) | top-left (diagonal) | `bottom-full mb-3 right-1/2` |
| coach (center) | bottom | `top-full mt-3 left-1/2 -translate-x-1/2` |

### 5. Tablet layout
Bubbles are arranged in a circle, so use a simple radial rule: if the bubble is in the upper half of the ring put the popover below it (`top-full mt-2`), otherwise above (`bottom-full mb-2`); always horizontally centered on the bubble. Same styling and same `description` text reused.

### 6. Mobile
The mobile layout doesn't render this constellation, so no change is needed there. (The mobile hero card grid keeps its own descriptions.)

## Theme handling
Uses semantic tokens only (`bg-popover`, `text-popover-foreground`, `border-primary/30`) so the popover automatically renders correctly in both light and dark mode without any conditional logic.

## Out of scope
- No changes to bubble images, sizes, animations, layout positions, or routing.
- No new dependencies (pure Tailwind + group-hover; no Radix Tooltip needed).
- No backend or content changes.
