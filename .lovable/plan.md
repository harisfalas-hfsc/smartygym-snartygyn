

# Fix Structural Labels and Content Quality Across All Workouts

## Problems Found

### 1. "Set X:" Labels Not Being Stripped
15 workouts have `<strong>Set 1:</strong>`, `<strong>Set 2:</strong>` etc. labels displayed to users. The existing regex only catches single-letter labels (A1:, B:, C2.) but NOT multi-word patterns like "Set 1:", "Station 2:", "Exercise 3:".

**Affected workouts:**
- WOD-S-E-1771367407134 (Leg Day Power Builder -- today's WOD)
- WOD-S-B-1771367407134 (Lower Body Iron Builder -- today's WOD)
- WOD-PIL-B-1769293803193 (Align Core Precision)
- WOD-MS-B-1769898605155 (Align Flow Foundation)
- WOD-MS-B-1767479405871 (Align Flow Restore)
- WOD-PIL-E-1766881802343 (Anchor Balance Flow)
- WOD-MS-B-1766622604142 (Anchor Flow Restore)
- WOD-MS-E-1770589804488 (Balance & Ground Flow)
- WOD-PIL-E-1770849008078 (Center Balance Flow)
- WOD-PIL-E-1769293803193 (Centrum Pilates Form)
- WOD-PIL-E-1767738619158 (Core Restore Sequence)
- WOD-S-E-1766527205118 (Foundation Forge)
- WOD-S-B-1768084204024 (Foundation Push Hinge)
- WOD-S-B-1770762603515 (Glute Core Foundation)
- WOD-MS-B-1770589804488 (Align & Restore Flow -- superset labels)
- WOD-S-E-1770503406959 (Foundation Press Forge -- superset labels)

### 2. Missing Section Spacing
"Lower Body Iron Builder" is missing empty paragraph separators before Finisher and Cool Down headers.

### 3. Unmatched Exercise
"Lower Body Iron Builder" has a plain-text exercise "single leg squat (pistol) male" that was not matched to the exercise library.

## Fix Strategy (Three Parts)

### Part 1: Expand Label-Stripping Regex (Permanent Prevention)

**Frontend** (`src/components/ExerciseHTMLContent.tsx`):
Add new regex patterns to strip multi-word structural labels wrapped in bold tags:
- `<strong>Set 1:</strong>` --> stripped
- `<strong>Station 2:</strong>` --> stripped
- `<strong>Exercise 3:</strong>` --> stripped
- `<strong>Block 1:</strong>` --> stripped
- `<strong>Round 2:</strong>` --> stripped

Pattern: `/<(?:strong|b)>(?:Set|Station|Exercise|Block|Round|Circuit)\s*\d*[\.\:\)]\s*<\/(?:strong|b)>\s*/gi`

This will NOT strip descriptive headers like `<strong>Mobility (5 min):</strong>` or `<strong>Static Stretching (8 min):</strong>` which are legitimate section descriptors.

**Backend** (`supabase/functions/_shared/exercise-matching.ts`):
Add the same expanded pattern to the post-processing pipeline so future AI-generated content is cleaned at the source.

### Part 2: Database Cleanup (All 15 Affected Workouts)

Run SQL UPDATE statements on all 15 affected workouts to:
1. Remove `<strong>Set X:</strong>` labels from the HTML
2. Remove any remaining single-letter superset labels
3. Ensure proper spacing exists before each section header
4. Match the unmatched "single leg squat (pistol) male" exercise

### Part 3: Reprocess Both Today's WODs

After database cleanup, trigger the reprocess function to ensure exercise matching is up to date and all formatting is correct.

## Technical Details

### File: `src/components/ExerciseHTMLContent.tsx`
- Add regex after the existing superset-label stripping (around line 117):
```
processedHtml = processedHtml.replace(
  /<(?:strong|b)>(?:Set|Station|Exercise|Block|Round|Circuit)\s*\d*[\.\:\)]\s*<\/(?:strong|b)>\s*/gi, 
  ''
);
```

### File: `supabase/functions/_shared/exercise-matching.ts`
- Add the same pattern to the post-processing section (around line 611):
```
processedContent = processedContent.replace(
  /<(?:strong|b)>(?:Set|Station|Exercise|Block|Round|Circuit)\s*\d*[\.\:\)]\s*<\/(?:strong|b)>\s*/gi,
  ''
);
```

### Database: Bulk cleanup
- Run regex-based UPDATE on all 15 workout IDs to remove structural labels from main_workout, finisher, warm_up, cool_down, and activation fields
- Verify spacing enforcement via the normalizer

## What This Prevents Going Forward
- The expanded regex catches ALL common structural label patterns (Set, Station, Exercise, Block, Round, Circuit) in addition to the existing single-letter patterns
- Three independent layers (database, backend, frontend) all strip these labels
- No manual checking required -- any label pattern will be automatically removed before reaching users

