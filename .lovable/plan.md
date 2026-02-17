

# Fix Incomplete Workouts

## 1. Rebuild S-013 "tess" (Strength Category)

This is clearly a test workout. The current state:
- Name: "tess" (placeholder)
- Description/Instructions/Tips: all contain "eeee"
- Main workout: only 2 exercises (Archer Pull-Up + All Fours Squad Stretch)
- Format set to TABATA but category is STRENGTH (violation -- Strength must be REPS and SETS)
- Equipment: BODYWEIGHT
- Difficulty: 3 stars (Intermediate)
- Duration: 20 min
- Free workout, serial #13

**What will be done:**
- Rename to a proper strength workout name (e.g., "Bodyweight Strength Foundations")
- Fix format from TABATA to REPS and SETS (mandatory for Strength category)
- Write a full main workout section with proper exercises from the Exercise Library (8-10 exercises covering major movement patterns: push, pull, squat, hinge, core)
- Write a proper description, instructions, and tips
- All exercises tagged with `{{exercise:ID:Name}}` format
- Keep it free, bodyweight, intermediate, serial #13
- Use M-3 gold standard formatting (no `<ul>` tags, numbered lists in `<p>` tags)

## 2. Add Missing Instructions for Recovery Workouts

Four recovery workouts have NULL instructions. Their descriptions and tips already exist and are well-written, so only the instructions field needs to be filled in:

- **rec-001 "Total Body Renewal"** -- Write step-by-step instructions for the full-body stretching session
- **rec-002 "Deep Stretch & Decompress"** -- Write instructions for PNF techniques and foam rolling protocol
- **rec-003 "Hip Liberation Flow"** -- Write instructions for hip CARs and deep opener sequence
- **rec-004 "Mindful Recovery Session"** -- Write instructions for breathing protocols and gentle stretching

These will be clear, professional, HTML-formatted instructions matching the tone of existing content.

## Technical Approach

All changes will be made via database updates using the `regenerate-broken-programs` edge function or direct SQL updates:
- S-013: Full content regeneration (name, format, description, instructions, tips, main_workout with all sections)
- rec-001 to rec-004: Update instructions field only

No frontend code changes are needed -- the existing `WorkoutDisplay` component will render everything correctly once the database content is properly populated.

