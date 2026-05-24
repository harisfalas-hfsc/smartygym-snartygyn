## Goal

Give the carousel cards on the **Smarty Workouts**, **Smarty Programs**, and **Smarty Tools** pages enough vertical breathing room so the description text never touches the bottom edge on mobile, and is ~25% taller on tablet portrait.

## The problem

All three pages share the same mobile carousel card markup. The cards have:

- A fixed mobile height of `h-[260px]` with the image taking `h-[70%]` (~182px) and only ~78px left for the icon + title + description. With `line-clamp-2 min-h-[2.5rem]` on both title and description, the description sits flush against the bottom border — no breathing space.
- A tablet portrait sizing (`min-[540px]:`) that uses `aspect-[25/16]` for the image and `min-h-[96px]` for the content. The user wants this ~25% taller.

## Files to change (same edit applied to each)

1. `src/pages/WorkoutFlow.tsx` — mobile carousel `CarouselItem` (around line 424–472)
2. `src/pages/TrainingProgramFlow.tsx` — mobile carousel `CarouselItem` (around line 359–397)
3. `src/pages/Tools.tsx` — mobile carousel `CarouselItem` (around line 213–242)

The desktop grid (`lg:` branch) is **not** touched.

## Concrete CSS changes

For the outer card div (currently):
```
flex flex-col h-[260px] min-[540px]:h-auto ...
```
→
```
flex flex-col h-[300px] min-[540px]:h-auto ...
```
(+40px mobile height = roughly one extra line of breathing space below the description)

For the image wrapper (currently):
```
relative h-[70%] min-[540px]:h-auto min-[540px]:aspect-[25/16] ...
```
→
```
relative h-[58%] min-[540px]:h-auto min-[540px]:aspect-[16/11] ...
```
(reduces image share on mobile so content area grows; changes tablet aspect from 25/16 → 16/11 so the image isn't disproportionately tall when the content area grows)

For the content wrapper (currently):
```
flex flex-col justify-center flex-1 px-3 py-2 min-[540px]:p-3 min-[540px]:min-h-[96px] text-center
```
→
```
flex flex-col justify-center flex-1 px-3 py-3 min-[540px]:p-4 min-[540px]:min-h-[120px] text-center
```
(adds vertical padding on mobile = bottom breathing space; raises tablet `min-h` from 96px → 120px = ~25% taller as requested; bumps tablet padding from `p-3` → `p-4`)

## Out of scope

- Desktop grid layouts on all three pages (untouched)
- The "Smarty Tools" desktop big-timer + 4-card grid (untouched)
- Any text content, icons, or navigation behavior
- Carousel arrows, dots, swipe hint
