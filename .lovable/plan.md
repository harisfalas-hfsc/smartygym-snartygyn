

## Problem

The cool down of "Center Balance Flow" (and many other workouts) has formatting inconsistencies:
- Multiple exercises crammed on one `<li>` line separated by commas (e.g., `seated glute stretch, butterfly yoga pose`)
- Structural labels mixed with exercises (e.g., `<strong>Static Stretching (8 min):</strong> {{exercise:...}}`)
- Bullet points with plain instructional text and no exercise View button
- Empty/orphan bullets

This violates the rule: **every exercise must be on its own `<li>` with its own View button**.

## Root Cause

The exercise matching pipeline (`processContentWithExerciseMatching`) inserts `{{exercise:...}}` markup inline but never splits multi-exercise `<li>` items into separate ones. The existing `fix-workout-formatting` function splits commas but only for lines WITHOUT existing markup. Neither the normalizer nor the repair function handles post-markup splitting.

## Solution

### 1. Add "split multi-exercise lines" step to `_shared/html-normalizer.ts`

New function `splitMultiExerciseLines()` that:
- Finds `<li>` items containing 2+ `{{exercise:...}}` patterns
- Splits each into individual `<li>` items, one exercise per line
- Strips structural labels (e.g., `<strong>Static Stretching (8 min):</strong>`) that precede exercises
- Preserves any suffix text (sets/reps) that follows each exercise

This gets called as a new step in `normalizeWorkoutHtml()` so it applies everywhere automatically.

### 2. Update `repair-content-formatting/index.ts`

Add the same splitting logic to the repair function's pipeline so the bulk repair catches these cases.

### 3. Update `reprocess-wod-exercises/index.ts` 

Ensure the reprocessing pipeline also applies the split after matching, before saving.

### 4. Create and run a bulk repair edge function call

A new edge function `bulk-format-consistency-repair` that:
- Iterates ALL workouts (batched, paginated)
- Iterates ALL training programs
- For each, applies: strip markup → re-match exercises → split multi-exercise lines → normalize HTML → save
- Processes ALL HTML fields: `main_workout`, `warm_up`, `cool_down`, `activation`, `finisher`, `instructions`, `tips`, `notes` for workouts; `weekly_schedule`, `program_structure` for programs

### 5. Fix the specific workout immediately

Run the repair on `WOD-PIL-E-1772577006728` first, then bulk across all content.

## Technical Detail: Split Logic

```typescript
function splitMultiExerciseLines(html: string): string {
  return html.replace(/<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gi, (match, content) => {
    const exerciseMatches = content.match(/\{\{exercise:[^}]+\}\}/g);
    if (!exerciseMatches || exerciseMatches.length <= 1) return match;
    
    // Split by exercise markup, creating one <li> per exercise
    const parts = content.split(/(\{\{exercise:[^}]+\}\})/);
    const items: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (/^\{\{exercise:/.test(parts[i])) {
        // Grab any suffix (sets/reps) from next part
        const suffix = (parts[i+1] || '').replace(/^[,\s-–]+/, '').trim();
        // Strip structural labels from prefix
        items.push(`<li class="tiptap-list-item"><p class="tiptap-paragraph">${parts[i]}${suffix ? ' ' + suffix : ''}</p></li>`);
        if (suffix) parts[i+1] = ''; // consumed
      }
    }
    return items.length > 0 ? items.join('') : match;
  });
}
```

## Implementation Steps

1. Add `splitMultiExerciseLines` to `_shared/html-normalizer.ts` and call it in `normalizeWorkoutHtml`
2. Create `bulk-format-consistency-repair` edge function that processes ALL workouts and programs in batches (reprocess exercises + split + normalize)
3. Deploy and execute the bulk repair
4. Verify today's Pilates workout and spot-check others

## Files to modify
- `supabase/functions/_shared/html-normalizer.ts` -- add split logic
- `supabase/functions/bulk-format-consistency-repair/index.ts` -- new bulk repair function
- `supabase/functions/repair-content-formatting/index.ts` -- integrate split step

