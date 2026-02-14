
# AI-Powered Exercise Replacement and Linking

## Why Previous Approaches Failed

The regex-based extraction and replacement has been attempted twice and keeps failing because:
- HTML structures vary wildly (bold tags, br-separated lines, list items, comma-separated, inline text)
- Replacement patterns can't handle all edge cases (artifacts like "push-up -Ups")
- 41 out of 211 workouts still have ZERO markup after two passes
- Training programs have partial/broken markup

## The New Approach: Use AI to Do It Right

Instead of fragile regex patterns, we will use a Lovable AI supported model (Gemini 2.5 Flash) to process each workout and program. The AI will:

1. Receive the full exercise library (1,329 exercises with id, name, body_part, equipment, target)
2. Receive the workout/program HTML content
3. Identify every exercise in the content
4. For each exercise, find the exact match from the library OR the closest substitute following the user's hierarchy (category, equipment, movement pattern)
5. Return structured JSON with the replacements
6. The edge function applies the replacements to the HTML

This guarantees 100% coverage because the AI understands context, handles name variations, and makes intelligent biomechanical substitutions.

## Implementation Steps

### Step 1: Create New Edge Function `ai-exercise-linker`

A new backend function that:
- Accepts a content type (`workout` or `program`) and content ID(s)
- Fetches the exercise library from the database
- Fetches the workout/program content
- For workouts: extracts only Main Workout and Finisher sections (using emoji section headers)
- For programs: processes `program_structure`, `weekly_schedule`, and `progression_plan` fields
- Sends the content + library to the AI model with a strict prompt
- AI returns JSON array: `[{original_text, exercise_id, exercise_name, was_replaced}]`
- Applies replacements: wraps each exercise with `{{exercise:id:name}}` markup
- Strips any existing broken markup first
- Saves the updated content back to the database
- Reports results

### Step 2: AI Prompt Design

The prompt will instruct the AI to:
- Read the HTML and identify every exercise name (in bold, in lists, in br-separated lines, etc.)
- For each exercise, search the provided library for an exact or near-exact match
- If no match exists, find the closest substitute using: same body_part, same equipment type, similar target muscle, similar movement pattern
- Return the original text as it appears in the HTML (so we can do exact string replacement) and the matched library exercise
- Never invent exercises, only use ones from the provided library

### Step 3: Process All 211 Workouts

Run the function in batches of 5-10 workouts at a time (to stay within compute limits). For each workout:
- Strip ALL existing markup from the entire `main_workout` field
- Parse sections using emoji headers
- Send ONLY Main Workout and Finisher sections to the AI
- Apply AI's exercise mappings as `{{exercise:id:name}}` markup
- Leave Warm Up, Cool Down, Activation sections as plain text (no markup)
- Save back to DB

### Step 4: Process All 28 Training Programs

Same approach but:
- Process `program_structure`, `weekly_schedule`, and `progression_plan` fields
- No section filtering (all exercises get View buttons in programs)
- Strip existing broken markup first, then re-process with AI

### Step 5: Fix Text Artifacts

The AI-based replacement will cleanly replace exercise names without leaving artifacts like "push-up -Ups" because:
- It identifies the EXACT text span in the HTML
- It replaces the full span with the markup, not just a substring

### Step 6: Verification

After all processing:
- Query every workout to confirm Main Workout and Finisher sections have markup
- Query every workout to confirm Warm Up, Cool Down, Activation have NO markup
- Query every program to confirm exercise fields have markup
- Report total counts

## Technical Details

### Edge Function Structure

```text
supabase/functions/ai-exercise-linker/index.ts
```

The function will:
1. Accept POST with `{type: "workout"|"program", ids: string[], batchSize?: number}`
2. Fetch exercise library (compact format: id, name, body_part, equipment, target)
3. For each item, call the AI model via Lovable AI gateway
4. Parse the AI response (JSON array of exercise mappings)
5. Apply mappings to the HTML content
6. Save to database
7. Return results summary

### AI Model

Using `google/gemini-2.5-flash` via the Lovable AI gateway (no API key needed). This model is fast, cost-effective, and handles the structured extraction task well.

### Section Handling for Workouts

Reuses the existing `splitIntoSections()` function from `exercise-matching.ts` to identify sections by emoji headers. Only sends processable sections (Main Workout and Finisher) to the AI.

### Files Changed

1. `supabase/functions/ai-exercise-linker/index.ts` -- NEW: AI-powered exercise matching and replacement
2. `supabase/functions/_shared/exercise-matching.ts` -- Minor: ensure `stripExerciseMarkup` and `splitIntoSections` are exported properly (they already are)
3. No frontend changes needed -- the frontend already correctly renders `{{exercise:id:name}}` markup as View buttons
