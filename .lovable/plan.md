I found the exact failure pattern.

What is wrong:
- `Granite Compass Ascent` has malformed nested exercise markup in Activation, e.g. `{{jumping-jacks:{{exercise:jumping-jacks:Jumping Jacks}} }}`. That is why the visible text looks duplicated/weird.
- Both `Granite Compass Ascent` and `Athletic Challenge Builder` have Cool Down content after the closing bullet list, so breathing/static stretching renders as plain paragraphs instead of consistent bullets.
- This is not only those two WODs: the backend scan found many visible workouts with the same Cool Down-after-list pattern, and one visible workout with malformed nested exercise tokens.

Implementation plan:

1. Repair tomorrow’s two pre-built WODs immediately
   - Update `Granite Compass Ascent` Activation so these become clean library-first tokens:
     - `30 seconds {{exercise:jumping-jacks:Jumping Jacks}}`
     - `30 seconds {{exercise:high-knees-cardio:High Knees}}`
     - `30 seconds {{exercise:butt-kicks-cardio:Butt Kicks}}`
   - Update `Granite Compass Ascent` Cool Down so all stretch items and diaphragmatic breathing live inside the same `<ul class="tiptap-bullet-list">`.
   - Update `Athletic Challenge Builder` Cool Down so breathing is also inside the same bullet list.

2. Sweep all currently visible/listed workouts for the same mistakes
   - Scan `admin_workouts` where `is_visible = true`.
   - Fix malformed nested tokens like `{{some-id:{{exercise:some-id:Name}} }}` into valid `{{exercise:some-id:Name}}`.
   - Move orphan Cool Down paragraphs such as `Breathing`, `Diaphragmatic Breathing`, and `Static Stretching` into the existing Cool Down bullet list instead of leaving them as detached paragraphs.
   - Keep the repair non-destructive: no workout deletion, no visibility changes, no HFSC changes.

3. Add a permanent code-level rule so this cannot keep happening
   - Strengthen the shared HTML normalizer used by WOD generation and bulk repair.
   - Add a dedicated cleanup step for malformed nested exercise tokens before validation.
   - Add a dedicated Cool Down post-processor that absorbs post-list breathing/static-stretching paragraphs into the Cool Down `<ul>`.
   - Make the validator fail if, after the Cool Down `<ul>`, it sees detached breathing/static-stretching paragraphs.

4. Run the repair function against all visible workouts
   - Deploy the updated backend repair logic.
   - Run a dry-run first to verify affected rows.
   - Run the live repair for visible workouts.
   - Re-query the database to confirm:
     - zero malformed nested exercise tokens
     - zero visible workouts with detached Cool Down breathing/static-stretching paragraphs
     - the two tomorrow WODs are clean

5. Validate the generation path
   - Re-run the formatting audit/repair path after code changes.
   - Confirm future generated WODs pass the stricter normalizer before they are saved.