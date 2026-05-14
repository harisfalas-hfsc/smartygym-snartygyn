Direct answer: No, the 23-minute advanced BODYWEIGHT WOD is not enough as currently programmed. Three finisher rounds can be enough only when the main block is substantial; here it is not. The 32-minute EQUIPMENT WOD can be acceptable for advanced only if the main block has proper EMOM prescriptions and the finisher volume supports the challenge; the current content still needs correction because the main EMOM exercise lines are missing clear reps before the exercise tokens.

Plan:

1. Fix the two live WODs first, without changing format or page layout
   - Update only the two active WOD database rows for the current WOD date.
   - Keep the same 5-section structure and existing WOD fields.
   - Keep exercise-library markup using `{{exercise:ID:Name}}`.
   - BODYWEIGHT advanced CHALLENGE:
     - Rebuild the main block into a real advanced bodyweight challenge, not a short generic 3-exercise block.
     - Increase Main + Finisher duration to a professional advanced range, likely around 40-45 minutes.
     - Keep the finisher as clear rounds for time or AMRAP, with explicit rounds/sets.
   - EQUIPMENT advanced CHALLENGE:
     - Fix the EMOM so every minute has measurable reps/time before each exercise token.
     - Keep a strong advanced duration, likely around 40-45 minutes unless the final content calculation proves otherwise.
     - Keep the finisher with explicit rounds/sets and enough volume.

2. Replace weak duration logic with a coaching minimum gate
   - Add a shared WOD quality rule that checks duration against difficulty and category before a WOD can publish.
   - Proposed minimum Main + Finisher duration gates for normal non-recovery WODs:
     - Beginner: 20-30 minutes minimum depending on category.
     - Intermediate: 30-40 minutes minimum depending on category.
     - Advanced: 40 minutes minimum for Challenge/Strength/Metabolic/Calorie Burning, with 35 minutes only allowed for intentionally brutal short formats like Tabata/EMOM when the protocol proves enough work.
   - Recovery remains separate and is not judged like Challenge/Strength.

3. Make duration content-based and reject contradictions
   - Keep duration as Main Workout + Finisher only, matching the current product rule.
   - Do not accept an AI-estimated duration if the actual content parses lower than the difficulty/category minimum.
   - For `FOR TIME`, require explicit rounds plus enough total reps/exercises to estimate real work.
   - For `EMOM`, require labelled minute structure or a repeated-minute pattern that can be calculated.
   - For `REPS & SETS`, calculate sets, reps, tempo/rest estimate instead of returning `Various` for WOD publish checks.

4. Strengthen finisher validation
   - Raise the current finisher density gate from “at least 1 exercise” to a professional rule:
     - Non-recovery WOD finisher must contain at least 3 exercise tokens.
     - Must include explicit rounds, sets, AMRAP cap, Tabata blocks, or EMOM minutes.
     - Advanced finishers must have either 3+ rounds, a meaningful AMRAP/EMOM cap, or equivalent calculated volume.
   - Reject finishers that list exercises without sets/rounds/time context.

5. Strengthen main-workout prescription validation
   - Reject exercise lines in Main Workout and Finisher where the exercise token appears without a measurable prescription before it.
   - Examples to reject:
     - `{{exercise:0295:dumbbell clean}} (moderate weight)`
     - `{{exercise:1160:burpee}}` with no reps/time/sets/round context.
   - Examples to allow:
     - `Minute 1: 10 reps {{exercise:0295:dumbbell clean}}`
     - `4 sets x 8 reps {{exercise:0662:push-up}}`
     - `Complete 3 rounds: 12 reps {{exercise:1160:burpee}}`

6. Put the gate in every WOD path
   - Apply the same quality contract inside:
     - `generate-workout-of-day`
     - `select-wod-from-library`
     - `backup-wod-generation` / orchestrator verification paths where relevant
     - watchdog/rollover verification checks
   - This prevents one path from publishing content that another path would reject.

7. Add admin-visible audit output for failures
   - When a generated WOD is rejected, log the exact reason:
     - duration below advanced minimum
     - missing EMOM minute prescriptions
     - missing sets/rounds in finisher
     - too few finisher exercises
     - unmeasurable exercise line
   - This makes the failure actionable instead of silently publishing weak content.

8. Validate after implementation
   - Query the two live WOD rows and confirm:
     - both are still the active WODs for the correct date
     - both have correct durations
     - both have explicit main-workout prescriptions
     - both have finisher rounds/sets/time caps
     - both pass the new WOD quality contract
   - Run the relevant backend function tests or direct function checks for the quality gate.
   - Do not touch unrelated pages, navigation, footer, design, or non-WOD content.