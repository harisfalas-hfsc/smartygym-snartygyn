## Goal
Reduce vertical space taken by the hero header (3 icons + "100% Human. 0% AI." + tagline) on desktop so the navigation carousel sits higher and feels like the main focus.

## Changes — `src/pages/Index.tsx` (desktop hero block, ~lines 805–838)

1. **Card padding**: `p-8 md:p-12` → `p-6 md:p-8` (less internal padding).

2. **Icon row** (line 817–827):
   - Container: `gap-3 mb-6` → `gap-2 mb-3`
   - Each circle: `w-16 h-16` → `w-10 h-10`
   - Each icon: `w-8 h-8` → `w-5 h-5`

3. **Heading** (line 829):
   - `text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6` → `text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3`

4. **Tagline block** (line 833–837):
   - Wrapper: `space-y-5 text-center mb-10` → `space-y-2 text-center mb-4`
   - Paragraph: `text-xl font-semibold` → `text-base sm:text-lg font-medium`

5. **Section padding** (line 789): `py-2 sm:py-2` is already minimal — leave as-is.

## Result
- Header block height drops from ~280px to ~140px on desktop.
- Carousel cards (220px tall) become the dominant element above the fold at 1128×672 viewport.
- No changes to mobile branch, carousel, or copy text.
- No changes to tablet sub-cards or other templates referenced in codebase.

## Out of scope
- Editing brand templates in `src/components/admin/instagram/*` (those are exports, not the homepage).
- Any copy or color changes.
