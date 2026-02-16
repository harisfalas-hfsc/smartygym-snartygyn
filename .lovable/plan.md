

# Fix All Unlinked Exercises Across Workouts and Programs

## The Problem

There are **487 unresolved mismatched exercises** across your workouts and programs. The specific issues you found in "Foundation Pull Build" are symptoms of systemic bugs in the exercise matching system:

1. **"C: balance board"** -- Exercise `balance board` (id: 0020) EXISTS in your library. The prefix "C:" should be stripped by the matcher, but the replacement step fails to insert the `{{exercise:0020:balance board}}` markup.

2. **"l-pull-up"** -- Exercise `l-pull-up` (id: 3418) EXISTS in your library. The matcher fails because "l-pull-up" starts with a lowercase "l" which the prefix pattern `[A-D]` interprets as a potential superset label.

3. **"chin-up-up-up"** -- The markup inserter has a bug where it duplicates the "-up" suffix from "chin-up", producing `{{exercise:1326:chin-up}}-up-up`.

4. **"A1:", "A2:" prefixes** -- The AI generation adds superset labels that should be stripped before display but are being kept in the rendered output.

## The Fix (2 Steps)

### Step 1: Fix the Exercise Matching Bugs

Update `supabase/functions/_shared/exercise-matching.ts` to fix three specific bugs:

- **Prefix stripping**: Ensure "C:", "A1:", "A2:", "B:" etc. are properly stripped before matching AND before reinsertion into HTML
- **Suffix duplication**: Fix the regex that inserts `{{exercise:ID:name}}` markup so it doesn't duplicate parts of hyphenated names like "chin-up", "l-pull-up"
- **Case-sensitive prefix detection**: Stop "l-pull-up" from being misidentified as a superset label (the letter "l" is NOT a superset prefix A-D)

### Step 2: Reprocess ALL Workouts and Programs

Run the existing `reprocess-wod-exercises` and `reprocess-program-exercises` edge functions across ALL content:

- **214 workouts**: Call `reprocess-wod-exercises` with `processAll: true` in batches of 50
- **28 training programs**: Call `reprocess-program-exercises` with no filter (processes all)

This will strip all old markup, re-run the improved matching, and update every workout and program in the database.

## What Will NOT Change

- No UI changes needed -- the View button rendering already works correctly when markup is present
- No changes to the exercise library itself
- No changes to workout generation prompts
- Existing correctly-linked exercises will remain linked (strip + re-match produces the same result)

## Cost Estimate

This runs entirely on database queries and string processing in Edge Functions -- no AI model calls. The only cost is the Edge Function execution time, which is minimal (under $0.01 total).

## Technical Details

### Bug Fix 1: Prefix Stripping in Markup Insertion

The current code strips prefixes during name extraction but fails to strip them in the HTML replacement step. The fix ensures the replacement regex accounts for prefix text before the exercise name.

### Bug Fix 2: Hyphenated Name Duplication

The current replacement uses a regex that matches the exercise name but then the surrounding text still contains parts of the name (e.g., "-up" from "chin-up"). The fix will use word-boundary-aware replacement that consumes the full matched text.

### Bug Fix 3: Single-Letter Prefix False Positive

The PREFIX_PATTERNS regex `[A-D]\d*[\.:]` matches "l:" at the start of "l-pull-up" because it's case-insensitive. The fix will make this pattern case-sensitive or require uppercase letters only.

### Reprocessing Sequence

1. Deploy updated `exercise-matching.ts`
2. Deploy updated `reprocess-wod-exercises` and `reprocess-program-exercises`
3. Call `reprocess-wod-exercises` with `{ processAll: true, batchSize: 50 }` for offsets 0, 50, 100, 150, 200
4. Call `reprocess-program-exercises` with `{}` (all programs)
5. Verify the `mismatched_exercises` table count drops significantly
6. Spot-check "Foundation Pull Build" to confirm all exercises now have View buttons
