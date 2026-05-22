Approving this plan switches me to build mode so I can ship the code (I can't edit project files from plan mode). Scope is locked — no more questions.

## What gets built

### 1. New table `wod_tomorrow_preview` (migration ✅ already applied)
One row per future date, admin-only RLS:
- `bodyweight_workout_id`, `equipment_workout_id`, `recovery_workout_id`
- `is_recovery_day`, `category`, `difficulty`, `difficulty_stars_min/max`
- `status` (`pending` / `approved` / `rejected`), `picked_by`, `approved_by`, `approved_at`, `notes`

### 2. New cron job (metadata row ✅ already inserted)
`preview-tomorrow-wod-evening` — `0 16 * * *` (18:00 Europe/Athens), category `wod`.
Already shows up in the existing **Cron Jobs admin panel** with the same Edit / Test / History parity as every other job. A `cron.schedule(...)` insert via the platform's secret-aware insert tool wires up the actual pg_cron entry.

### 3. New edge function `preview-tomorrow-wod`
Single endpoint, action-routed:
- `preview` (default, called by the 6 PM cron) — picks tomorrow's BW + EQ from the library using the same 84-day periodization and exhaustion-first rotation as `select-wod-from-library`, **without publishing**. Upserts into `wod_tomorrow_preview`.
- `repick` — re-runs picker for that date, marks `picked_by='admin'`.
- `set { slot, workoutId }` — admin swap.
- `approve` — promotes the preview to active WOD: ensures Stripe product/price, sets `is_workout_of_day=true, generated_for_date=date`, runs the existing `validateWodPublishContract` quality gate, inserts cooldown rows. The morning 06:30/06:50 UTC picker safely no-ops because it already skips when WODs exist for the date.
- `reject` — deletes the preview row so the morning job re-picks fresh.
- `list` — returns upcoming preview rows for the UI.

The morning library picker is **not modified** — approval just publishes early and the existing skip-if-exists guard handles the rest. This keeps the live WOD rollover regression-proof.

### 4. Admin UI — new button + dialog in `WODManager.tsx`
A new **"Tomorrow's WOD Preview"** button placed next to **"View Periodization"** in the WODManager header (Content Library → Workouts section). Opens `<TomorrowWODPreviewDialog />` which shows:
- Header with the target date, category, difficulty.
- **Date selector** so the admin can preview/override any future date, not just tomorrow.
- Two cards (BW + EQ, or one Recovery card) each showing image, name, focus, difficulty stars, duration. Per-card actions: **View**, **Edit** (reuses `WorkoutEditDialog`), **Swap…** (opens a small library picker filtered by category + equipment + difficulty band).
- Footer: **Re-pick automatically**, **Approve & publish**, **Reject**.
- Live status badge (`pending` / `approved` / `rejected`) with who approved.

### 5. Cron Jobs admin panel
No code changes needed — `CronJobsManager` and `CronJobsDocumentation` read from `cron_job_metadata`, so the new job appears automatically with Edit/Test/Toggle controls.

---

Approve to flip into build mode and I'll ship steps 3, 4 and the `cron.schedule(...)` wiring immediately.