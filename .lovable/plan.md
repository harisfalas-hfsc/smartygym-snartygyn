
Goal: Make the Calorie Counter feel truly live for partial typing (like “chic” / “chick”) and make quantity controls consistent instead of relying on browser-only spinner arrows.

What I found from debugging
1) The current UI is calling the backend correctly as you type (debounced).
2) The current backend returns:
- “chi” → empty
- “chic” → empty
- “chick” → mostly CHICK-FIL-A matches
- “chicken” → expected chicken items
3) So this is not a broken search bar; it is a data-provider search behavior/ranking issue for short prefixes.
4) Quantity input arrows are not controlled by your app logic. Native number spinners are browser-dependent (some desktop/mobile combinations hide or minimize them even when CSS tries to show them).

Implementation approach

1) Improve backend search quality for partial words
File: `supabase/functions/search-food-nutrition/index.ts`

Plan:
- Keep current base query call.
- Add smart fallback stages when results are weak:
  - Stage A: exact query (current behavior)
  - Stage B: wildcard query (`query + "*"`) when exact is empty or too limited
  - Stage C: inferred completion query (example: infer “chicken” from partial results and run that once)
- Merge and deduplicate by `fdcId`.
- Apply a ranking pass so generic food matches are surfaced before brand-heavy noise.
- Return top 15 ranked foods.

Why this works:
- Fixes “chic” returning nothing.
- Reduces the “chick only shows CHICK-FIL-A” problem by expanding and re-ranking results.
- Keeps USDA as source (no AI credits, no new database required).

2) Keep the frontend live-search behavior but make results more stable
File: `src/pages/CalorieCounter.tsx`

Plan:
- Keep 3-character minimum trigger (it avoids useless calls).
- Add response-order protection (ignore stale/out-of-order responses) so fast typing doesn’t briefly show wrong/older results.
- Keep dropdown behavior the same, but results quality will improve from backend changes.

3) Make quantity controls consistent across devices
File: `src/pages/CalorieCounter.tsx`

Plan:
- Replace “depend on native spinner arrows” with explicit controls:
  - Add visible “−” and “+” buttons around the grams input.
  - Keep manual typing enabled.
  - Clamp minimum to 1g.
- This guarantees consistent behavior on desktop and mobile, regardless of browser spinner UI.

Why this works:
- Eliminates uncertainty about whether spinner arrows should appear.
- Gives predictable, always-visible controls for users.

Technical details (implementation notes)
- Backend ranking heuristic (lightweight):
  - Prefer names where a word starts with user query or inferred completion.
  - Prefer cleaner/generic descriptors over noisy brand-heavy names when tied.
  - Keep dedupe by `fdcId`.
- No database schema changes needed.
- No auth changes needed.
- No new secrets needed.

Validation checklist after implementation
1) Search behavior
- Type: `chi`, `chic`, `chick`, `chicken`, `bana`
- Confirm dropdown appears while typing and gives relevant food options.
2) Selection + calculation
- Select a result, set 100g / 200g / 300g, verify macros scale correctly.
3) Quantity control UX
- Desktop: plus/minus buttons always visible and working.
- Mobile: same controls visible and working.
- Manual number typing still works.
4) Regression
- No console errors during rapid typing.
- Dropdown closes/open behavior still correct.

Files planned for edits
- `supabase/functions/search-food-nutrition/index.ts`
- `src/pages/CalorieCounter.tsx`
