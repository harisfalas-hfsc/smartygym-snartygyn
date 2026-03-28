

# Fix Duplicate & Repetitive Workout Names

## The Problem

Two issues with workout naming:

1. **Duplicate names exist** — Multiple workouts share the exact same name (e.g., "Foundation Glute Core" for both bodyweight and equipment). These also have matching Stripe products with wrong names.

2. **Repetitive naming patterns** — The AI prompt on lines 771-789 of `generate-workout-of-day/index.ts` literally *suggests* the same words: "Foundation", "Forge", "Builder" for Strength; "Melt", "Torch" for Calorie Burning. The AI follows the suggestions, producing near-identical names daily.

3. **No uniqueness enforcement** — The generator never checks existing workout names before inserting. The only deduplication is between the bodyweight/equipment pair on the *same day* (line 764), not against the entire library.

## Plan

### Part 1: Audit & Fix Existing Duplicates (script via `code--exec`)

- Query `admin_workouts` for all duplicate `name` values
- Query `admin_training_programs` for duplicate names
- Generate a report showing all duplicates
- For each duplicate group, rename workouts to unique names (keeping the oldest one unchanged)
- For renamed workouts that have `stripe_product_id`, update the Stripe product name to match
- This will be a careful script — preview duplicates first, then fix

### Part 2: Prevent Future Duplicates in WOD Generation

Changes to `supabase/functions/generate-workout-of-day/index.ts`:

1. **Fetch recent names before generation** — Query the last 100+ workout names for the same category from `admin_workouts` and pass them to the AI prompt as a "DO NOT USE" list

2. **Rewrite naming instructions (lines 771-789)** — Remove the fixed word lists that cause repetition. Instead:
   - Instruct the AI to create unique, creative names
   - Provide naming *principles* (short, category-relevant, professional) instead of specific word banks
   - Explicitly ban reusing any name from the provided list

3. **Post-generation uniqueness check** — After the AI returns a name, query the database for exact matches. If a duplicate is found, append a differentiator or request regeneration

4. **Same-day pair check already exists** (line 764) — enhance it to also block near-duplicates (not just exact matches)

### Part 3: Database constraint (optional but recommended)

- Add a unique index on `admin_workouts.name` to prevent duplicates at the database level as a final safety net

## Execution Order

1. First: Audit duplicates (read-only report)
2. Second: Fix duplicates + Stripe sync
3. Third: Update the WOD generator prompt and add uniqueness checking
4. Fourth: Add database constraint after all duplicates are resolved

## Files Changed

- `supabase/functions/generate-workout-of-day/index.ts` — naming instructions rewrite + recent-names query + post-generation duplicate check
- Database migration — unique index on `admin_workouts.name` (after cleanup)
- `code--exec` scripts for audit and fixing existing duplicates with Stripe sync

