## Scope (desktop only, ≥1024px)

Mobile view stays untouched. All changes gated behind desktop breakpoint.

## 1. Header — match the mobile layout

Rebuild the desktop header in `src/components/Navigation.tsx` so it mirrors the mobile header:

- **Far-left edge:** hamburger menu icon (opens the existing "Explore SmartyGym" sheet — desktop variant kept).
- **Center / left of center:** the `SMARTYGYM` wordmark (green + primary), same as mobile, instead of the large logo image.
- **Far-right edge:** Smarty Coach round button + a single avatar dropdown button.
  - Inside the avatar dropdown: Dashboard, Messages (with unread red dot inside), Light/Dark toggle, Admin (if admin), Logout — same items the mobile dropdown already shows.
  - No separate bell/notification icon on the right anymore — unread state collapses into a small red dot on the avatar (like mobile).
  - No social media icons in the header on desktop.
- Edges flush to viewport: replace the centered `max-w-7xl` wrapper with full-width `px-4` so hamburger sits at the very left and avatar at the very right.
- Header height reduced (~h-12) to feel light, matching the mobile compactness the user described.

The existing mobile branch stays exactly as it is.

## 2. Homepage hero — replace with 4 stacked "section rows"

In `src/pages/Index.tsx`, the desktop hero block (videos, buttons, MobilePhoneIllustration, the "Train smarter, not harder" copy block, etc.) is replaced with a single new compact section: **4 horizontal rows**, one per pillar, designed to fit roughly within one viewport height so users don't have to scroll heavily.

Each row is a horizontal card (~150–170px tall) split into two parts:

```
┌────────────────────────────────────────────────────────────┐
│ [pillar image + title overlay]  │  [3 featured items]  →  │
│ Smarty Workouts                  │  card · card · card     │
└────────────────────────────────────────────────────────────┘
```

Rows:
1. **Smarty Workouts** → 3 latest visible workouts (reuses `fetchVisibleWorkoutMetadata`, already wired for mobile).
2. **Smarty Programs** → 3 latest visible programs (reuses `get_visible_program_metadata`).
3. **Smarty Blog** → 3 latest published articles (reuses the existing blog query).
4. **Smarty Tools** → 3 tool cards (static, picked from existing `toolsCards`: Timer, 1RM, Macro for example).

Featured items are small compact cards (image + title + 1-line meta), each linking to the item's detail page. The pillar tile on the left links to the index page (`/workout`, `/trainingprogram`, `/blog`, `/tools`) with an "Explore" chevron.

The existing `latestWorkouts` / `latestPrograms` / `latestArticles` queries are made available on desktop too (drop `enabled: isMobile`, or duplicate without the gate).

Decision on carousels vs. static: use **static 3-up grids per row** (no carousels). Reason: with 4 rows already on screen, internal carousels add noise and break the "one glance, everything visible" goal the user asked for. Each row's left pillar tile is the gateway to the full list/carousel on its dedicated page. Carousels are kept for mobile only.

## 3. What gets removed from desktop hero

- Hero video background + the big "SmartyGym" overlay copy block
- "Train smarter, not harder" headline + sub-copy + CTA buttons
- `MobilePhoneIllustration` on the right
- Hero promise cards (Real Expertise / Personal Touch / Not a Robot / Never Stop Expanding) — these stay on `/about` and mobile, but desktop home no longer duplicates them above the fold

Everything below the hero on desktop (community, ritual, promise sections lower down, FAQs, footer, etc.) stays untouched.

## Technical notes

- Gate all new desktop hero JSX behind `!isMobile`.
- Header changes only touch the `{!isMobile && (...)}` branch in `Navigation.tsx`.
- New component file: `src/components/home/DesktopHeroRows.tsx` to keep `Index.tsx` from growing further.
- Data fetching: lift `enabled: isMobile` off the three featured queries so they also run on desktop.
- Styling uses existing design tokens (primary, border, card, muted-foreground). No new colors.

## Open question before I build

You said "I don't know if it's good to put carousels or just a big picture." My recommendation above is **3-up static featured items per row** (no carousels on desktop, big pillar tile on the left, 3 small featured cards on the right). If you'd rather have a single big pillar image per row with a tiny carousel of featured items, say the word and I'll switch to that variant — otherwise I'll build the 3-up version.