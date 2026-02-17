

# Fix All Training Programs to Match Hypertrophy Accelerator Format

## The Problem

The regenerated programs use a COMPLETELY DIFFERENT format from the gold standard (Hypertrophy Accelerator / M-3). There are 4 critical issues:

### Issue 1: Wrong HTML Structure
The AI prompt tells the AI to use `<ul>/<li>` bullet lists, but M-3 (the gold standard) uses numbered exercises inside `<p>` tags with `<br>` line breaks. This is why the regenerated programs look completely different.

**M-3 format (CORRECT):**
```text
<p class="tiptap-paragraph"><strong><u>Day 1 - Push:</u></strong></p>
<p class="tiptap-paragraph"><br>
1. {{exercise:0025:barbell bench press}}-- 4 sets x 10 reps @ 70% 1RM
<br>2. {{exercise:0438:dumbbell w-press}}-- 4 sets x 12 reps
</p>
```

**Regenerated format (WRONG):**
```text
<p><strong>Day 1: Full Body Push</strong></p>
<ul><li><p><strong>Warm-Up:</strong></p></li></ul>
<ul><li><p>{{exercise:ID:Name}} -- 2x10</p></li></ul>
<ul><li><p><strong>Main Workout:</strong></p></li></ul>
<ul><li><p><strong>1.</strong> {{exercise:ID:Name}} -- 3x10</p></li></ul>
```

### Issue 2: Broken Exercise Tags
The `fixMalformedExerciseTags` function calls `findBestMatch` but never imports it, causing a `ReferenceError`. This means malformed tags like `{{cat-cow-stretch:Cat-Cow Stretch}}` are NOT being fixed.

### Issue 3: Malformed Tag Patterns Not Caught
The AI generates tags like:
- `{{walking-on-incline-treadmill:3666:walking on incline treadmill}}` (slug:ID:Name instead of exercise:ID:Name)
- `{{butt-kicks-cardio:butt-kicks-cardio:Butt Kicks}}` (slug:slug:Name)
- `{{forearm-plank:forearm-plank:Forearm Plank}}` (slug:slug:Name)

These patterns are not handled by the current regex fixes.

### Issue 4: "Green" Programs Also Have Issues
Programs marked as "good" (L-1, F-2, MS-1) also have corrupted content:
- L-1: `(male)(male)(male)(male)(male)(male)(male)` repeated text
- F-2: Same push-up listed twice, exercises without markup
- MS-1: Exercises like "Hip Circles" without View buttons

---

## The Fix (3 Steps)

### Step 1: Rewrite the AI Prompt Format in the Edge Function

Change `buildSystemPrompt` to output the M-3 format:
- Week headers: `<strong><u>Week X: Theme</u></strong>` in `<p>` tags
- Day headers: `<strong><u>Day X - Focus:</u></strong>` in `<p>` tags  
- Exercises: numbered inside `<p>` with `<br>` separators, NOT bullet lists
- Each exercise: `1. {{exercise:ID:Name}}-- sets x reps @ intensity`
- Include 1RM calculator links where relevant: `(<a href="/1rmcalculator">calculate</a>)`
- Include Smarty Tools references where appropriate

### Step 2: Fix the `fixMalformedExerciseTags` Function

- Import `findBestMatch` from `../_shared/exercise-matching.ts` (it is exported but not imported in `index.ts`)
- Add patterns for ALL malformed tag types:
  - `{{slug:ID:Name}}` (e.g., `{{walking-on-incline-treadmill:3666:name}}`)
  - `{{slug:slug:Name}}` (e.g., `{{butt-kicks-cardio:butt-kicks-cardio:Butt Kicks}}`)
  - Exercise names as plain text without any tags

### Step 3: Re-run ALL 24 Programs Through the Fixed Pipeline

Not just the 15 broken ones -- ALL programs need to be checked and fixed because even the "green" programs (L-1, L-2, MS-1, F-2) have corrupted text and missing View buttons.

Process:
1. Deploy the updated edge function
2. Run each program through regeneration (broken ones get full rewrite, "green" ones get tag-fixing pass only)
3. Validate every program has:
   - All weeks present with all training days
   - Every exercise in `{{exercise:ID:Name}}` format
   - No corrupted/repeated text
   - Correct M-3 formatting style
   - Professional exercise selection matching category protocols

---

## Technical Changes

### File: `supabase/functions/regenerate-broken-programs/index.ts`

**Change 1:** Update `buildSystemPrompt` to use M-3 HTML format (numbered `<br>` lists in `<p>` tags instead of `<ul>/<li>`)

**Change 2:** Import `findBestMatch` from the shared module at the top of the file

**Change 3:** Expand `fixMalformedExerciseTags` regex patterns to handle all observed malformed patterns:
- Pattern for `{{slug:numericID:Name}}`
- Pattern for `{{slug:slug:Name}}`  
- Pattern for untagged exercise names that exist in the library

**Change 4:** Add a "fix-only" mode that cleans existing content without full regeneration (for programs that have good content but bad tags)

### Execution Plan
After deploying the fix:
1. Full regeneration for RED programs (7): L-4, L-3, MS-3, MS-4, W-4, W-3, C-3
2. Full regeneration for ORANGE programs (8): F-1, M-4, M-1, M-2, C-4, C-2, C-1, W-1, W-2  
3. Tag-fix-only pass for GREEN programs (9): L-1, L-2, MS-1, MS-2, F-2, F-3, F-4, C-5, C-5K
4. Validation query to confirm zero malformed tags remain

