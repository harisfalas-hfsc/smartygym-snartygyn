I can fix this. The current system is too weak because it only adds review warnings; it still lets a bad generated draft reach the editor and be saved.

Revised plan:

1. Add a hard generation contract for the full workout structure
- Validate every required section before delivery: Soft Tissue Preparation, Activation, Main Workout, Finisher, Cool Down.
- Soft Tissue Preparation must be foam rolling / lacrosse ball / tennis ball / trigger-point / self-massage / release work only.
- Soft Tissue Preparation must not contain `{{exercise:...}}` tokens and must not contain stretches, mobility drills, squats, presses, lunges, bridges, jumps, or other exercise movements.
- Activation, Main Workout, Finisher, and Cool Down must use valid library exercise tokens where exercises appear.

2. Add strict exercise-token validation
- Fail the draft if any exercise-bearing section still contains plain exercise names instead of `{{exercise:ID:Name}}`.
- Fail the draft if any token uses a fake/slug ID like `bird-dog`, `glute-bridge`, or `jumping-jacks` instead of a real exercise-library ID.
- Fail the draft if a token ID exists but the name does not match the actual library exercise.
- Fail Main Workout and Finisher if any exercise has no measurable prescription before the token.

3. Make generation self-repair before returning
- Keep the existing matcher, final sweep, and non-library replacement.
- After repair, run the new hard contract.
- If the contract fails, return an error and do not deliver the workout draft as “ready”.
- This prevents a broken workout from being accepted silently after credits are spent.

4. Block saving broken generated workouts
- Add the same contract check in the admin workout save flow before inserting into `admin_workouts`.
- If a generated or manually edited workout still has missing/broken exercise links, invalid Soft Tissue content, fake IDs, or unsafe prescription structure, the save stops with a clear error.
- This closes the current gap where `needs_review` is deleted before saving.

5. Tighten the exact failure cases from these two workouts
- Cover prescriptions before exercise names like `5 sets × 5 reps Handstand Push-up`.
- Cover activation/cooldown fake IDs like `{{exercise:bird-dog:Bird Dog}}`.
- Cover glued output like `{{exercise:forearm-plank:Forearm Plank}}30 sec`.
- Cover finisher/main plain exercise names that should have eye buttons.
- Cover Soft Tissue lines that accidentally contain exercise movements instead of foam/ball release work.

6. Add regression tests
- Edge-function tests for the generation contract and exercise linker.
- Tests proving Soft Tissue is foam-only and rejects exercise markup/movement content.
- Tests proving fake exercise IDs are rejected.
- Tests proving Main Workout and Finisher cannot pass with plain exercise names or missing prescriptions.
- Existing reader eye test remains, but the main protection moves upstream where bad content is created.

7. Deploy and verify
- Run the relevant frontend tests and edge-function tests.
- Deploy the changed edge function(s).
- Test `generate-admin-workout` directly and confirm broken drafts are rejected instead of delivered.