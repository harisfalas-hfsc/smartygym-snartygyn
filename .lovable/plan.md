# Admin Workout Creation — Reliability & UX Fixes

Four fixes to make manual workout creation in the admin panel trustworthy, format-consistent, and faster.

## 1. Repair serial numbers (one-time data migration)

Problem: `admin_workouts.serial_number` is sparse on legacy rows. STRENGTH has 130 rows but `MAX(serial_number)=79`, and the counter in `system_settings.serial_number_counters.workouts.STRENGTH` says `80`. Creating a new workout today would generate `STR-080`, which likely collides with an existing ID.

Steps:
- Backfill `serial_number` on every legacy `admin_workouts` row where it is NULL, per category, using a deterministic order (`created_at ASC, id ASC`) so existing IDs keep their numeric ordering. Skip WOD-flagged rows so they don't poison library counters.
- Rewrite `system_settings.serial_number_counters.workouts` so each category equals `MAX(serial_number) + 1` across the now-backfilled `admin_workouts` table.
- Same treatment for `admin_training_programs` / `serial_number_counters.programs` (same drift is likely there).
- Run as a one-time SQL migration with a per-category before/after log.

Note: existing `admin_workouts.id` values are NOT changed. Only NULL `serial_number` fields are filled and the counter is reset. Public URLs stay intact.

## 2. Duplicate-ID guard in `handleSave`

In `src/components/admin/WorkoutEditDialog.tsx`, before insert (create mode only):
- Check `select id from admin_workouts where id = $newId`.
- If it exists, auto-increment the serial (and matching ID) up to 50 attempts, showing a toast: "ID was taken — bumped to {newId}".
- If still colliding, show a hard error toast and abort.
- Wrap the insert in a try/catch on Postgres `code === '23505'` (unique violation) as a final safety net.

## 3. "Insert standard 5-section structure" button

Next to the "9. Workout Content *" label in `WorkoutEditDialog.tsx`:
- Add a small secondary button: "Insert standard structure".
- Disabled when the editor already has content (or shows a confirm before overwriting).
- Inserts the canonical scaffold into the `RichTextEditor`:
  - 🧘 Soft Tissue Preparation
  - 🔥 Activation
  - 💪 Main Workout
  - ⚡ Finisher
  - 🧊 Cool Down
- Each section is an `<h3>` plus an empty bullet list, wrapped in the `workout-content` container so the normalizer and density validator treat it identically to AI/library output.

## 4. "Duplicate from library" action in `WorkoutsManager`

In `src/components/admin/WorkoutsManager.tsx`, each row gets a new Duplicate action (icon + tooltip) alongside Edit/Delete:
- Opens `WorkoutEditDialog` in create mode, prefilled with the source workout's content (main_workout, description, instructions, tips, equipment, format, duration, difficulty, category, focus).
- Cleared/regenerated: `id`, `serial_number`, `name` (suggested as `"<source> (Copy)"`), `image_url`, `stripe_*`, `is_workout_of_day`, `generated_for_date`, `wod_source`.
- Serial number is auto-generated via the existing category counter (correct after fix #1).

## Technical notes

- Files touched:
  - `supabase/migrations/<timestamp>_repair_serial_counters.sql` (new)
  - `src/components/admin/WorkoutEditDialog.tsx` (duplicate guard + template button + optional `prefillFrom` prop)
  - `src/components/admin/WorkoutsManager.tsx` (Duplicate action wiring)
- No schema changes — only data backfill + `system_settings` update.
- Existing triggers (`validate_public_workout_integrity`, `enforce_workout_format_rules`, image auto-generation) keep working unchanged.

## Out of scope

- No changes to the WOD library-mode picker.
- No changes to `{{exercise:ID:Name}}` markup or View-button rendering.
- No changes to public workout pages.
