
# Fix Today's WOD + Prevent Future Mistakes

## What's Wrong (3 issues found)

1. **View buttons in WRONG sections**: The Activation and Cool Down sections have exercise markup (walking lunge, skin the cat, spine stretch) -- these should be plain text per your rules
2. **NO View buttons in Main Workout and Finisher**: Exercises like Sphinx, Dead Bug, Glute Bridge March ARE in the library but have no View buttons
3. **AI invented exercises NOT in the library**: "Child's Pose", "Bird-Dog", "Happy Baby", "World Greatest Stretch", "Kneeling Lat Stretch", "Plank with alternating leg lift" do NOT exist in your exercise database at all. The AI ignored the "MUST ONLY" instruction

## Why This Happened

The WOD generator at line 2030 calls `processContentWithExerciseMatching` which processes the ENTIRE workout HTML blindly -- it doesn't know which section is which. The section-aware function `processContentSectionAware` already exists and correctly limits View buttons to only Main Workout and Finisher sections, but the WOD generator never uses it.

Additionally, the AI still generated exercises that don't exist in the library despite the strict prompt language.

## The Fix (3 changes)

### Change 1: Switch WOD generator to section-aware processing

File: `supabase/functions/generate-workout-of-day/index.ts`

- Replace import of `processContentWithExerciseMatching` with `processContentSectionAware`
- At line 2030, change the call to use `processContentSectionAware` instead
- This ensures View buttons ONLY appear in Main Workout and Finisher sections -- never in Soft Tissue, Activation, Warm-up, or Cool Down

### Change 2: Fix today's WOD (WOD-REC-V-1771194608723)

- Strip the wrong exercise markup from Activation and Cool Down sections
- Re-run `ai-exercise-linker` on this single workout to properly add View buttons ONLY to Main Workout and Finisher
- Exercises that exist in the library (Sphinx, Dead Bug, Glute Bridge March) will get View buttons
- Exercises the AI invented that don't exist in the library (Child's Pose, Bird-Dog, Happy Baby) will remain as plain text with no View button -- they simply don't exist in the database

### Change 3: Strengthen the AI prompt to ACTUALLY enforce library-only exercises

The current prompt says "MUST ONLY use exercises from this list" but the AI clearly ignored it. The fix:
- Add an explicit post-generation VALIDATION step: after the AI returns the workout JSON, scan every exercise name in the response and check it against the library
- If any exercise is NOT in the library, either replace it with the closest match from the library, or flag it
- This is a CODE-LEVEL enforcement, not just prompt language -- the AI cannot bypass it

## What Will NOT Change
- Workout structure, formatting, and layout
- Equipment workouts
- Training programs (separate fix if needed)
- The exercise library itself
