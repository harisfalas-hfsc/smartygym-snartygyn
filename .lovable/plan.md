## Goal

Restyle the homepage to feel like **smarttgym.co.uk** — bold uppercase display typography, dark cinematic sections, a signature "ghost outline" word sitting behind a solid section heading, generous vertical rhythm, alternating image/text rows — **without changing the content, the order, or removing/adding any sections**.

Same sections, same copy, new clothes.

## Scope (do not change)

- The hero video block ("Your gym, reimagined…")
- "Who is SmartyGym for"
- 4-card row: Built for Real Life · Scientific Approach · Accessible to All · Safe & Effective
- "The SmartyGym Promise" block
- "What We Stand For" 4-card row
- "Message from Haris Falas"
- Final CTA

All copy, images, links, and buttons remain identical. Only visual treatment changes.

Hard constraints from project memory:
- **Brand colors stay**: electric blue `#29B6D2` primary + existing gold border. No yellow/gold accent replacement. The *style language* of smarttgym.co.uk is adopted, not its palette.
- Light theme remains the default. Dark sections are local to the page (full-bleed dark bands), not a global theme switch.
- Authority links, footer, navigation: untouched.

## Visual language (borrowed from smarttgym.co.uk)

1. **Section header pattern**: a huge outlined ghost word (e.g. `WHO WE ARE`, `OUR VALUES`, `THE PROMISE`, `FROM THE COACH`) sitting behind the real H2, slightly offset, ~120–160px, transparent fill with 1px primary-tinted stroke. Pure CSS — `-webkit-text-stroke` + `color: transparent`. Decorative only (`aria-hidden`); the real semantic H2 stays in DOM.
2. **Display typography**: H2/H3 promoted to uppercase, tight tracking, heavy weight. Use existing Tailwind tokens (`text-4xl md:text-6xl font-black tracking-tight uppercase`). No new font files.
3. **Full-bleed dark bands**: alternate sections between default surface and a `bg-foreground text-background` (or `bg-[hsl(var(--background-inverse))]` if defined; otherwise inline `bg-neutral-950 text-neutral-50` via semantic token) band. Edge-to-edge backgrounds, inner content stays inside the standard desktop container width.
4. **Zig-zag image/text rows** for narrative sections: "Who is SmartyGym for" and "Message from Haris Falas" become two-column split (image left/right alternating) on `lg:`, stacked on mobile.
5. **Card refresh** (4-card rows): keep current card content + images, but switch to flat dark cards with thin primary-tinted hairline border, large numeral `01–04` in the top-left, icon top-right, uppercase title, generous padding. Hover: lift + primary glow shadow.
6. **Pill CTAs**: existing buttons restyled to fully-rounded pill outline-on-dark / solid-on-light, with chevron arrow, matching reference.
7. **Vertical rhythm**: bump section vertical padding to `py-20 md:py-28`, mirroring the airy spacing of the reference.

## Files to touch

- `src/pages/Index.tsx` — desktop branch only (lines ~723–1194). The mobile branch (lines 487–721) stays as-is since the reference is desktop-heavy and mobile is already curated.
- `src/index.css` — add 3 small utility classes only if needed: `.ghost-headline`, `.dark-band`, `.section-eyebrow`. No token changes.

No new components are created; the markup is restructured inline because each section has unique content. No router, no data, no backend changes.

## Out of scope

- The hero video card itself (already strong, keep as-is).
- The mobile branch of `Index.tsx`.
- Navigation, footer, announcements, popups.
- Any other page.

## Verification

1. `/` at 1440×900: every section in original order; new ghost headlines visible behind each H2; alternating dark/light bands; zig-zag rows render correctly; brand blue + gold accents preserved (no yellow drift).
2. `/` at 1024×768: layout collapses cleanly, ghost headlines scale down, no overflow.
3. `/` at 390×844: **unchanged** — mobile branch still renders the existing curated layout.
4. All buttons still navigate to the same routes.
5. Lighthouse/console: no new errors, no layout shift.
