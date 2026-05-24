I understand. The current watchdog is not enough. It checks, tries once, and reports — it does not operate like a persistent self-healing system.

## What failed today

1. `watchdog-wod-check` runs only once daily, not every 10 minutes.
2. It currently checks only the current Cyprus day, not today + tomorrow + day after tomorrow.
3. It tries the library picker once, but has no retry cycle, no cooldown, no repair history, and no exact failure reason stored for admin review.
4. The health audit reports problems, but it is passive. It does not trigger a fix pipeline.
5. If the library has no valid candidate for a slot, the system cannot safely invent or auto-edit a workout because this project is library-first and human-designed. In that case it must report the exact rejected candidate IDs and reasons.

## Fix to implement

### 1. Upgrade `watchdog-wod-check` into the WOD self-healing controller

It will check:

```text
today
tomorrow
day after tomorrow
```

For each date it will calculate the 84-day periodization and expected slots:

```text
RECOVERY = 1 slot: VARIOUS
Everything else = 2 slots: BODYWEIGHT + EQUIPMENT
```

For every expected slot it will verify:

- WOD exists for that exact date
- Correct equipment slot
- Correct category from the periodization cycle
- Correct difficulty / star range where applicable
- Visible
- Image exists
- Stripe product exists
- Stripe price exists
- WOD publish contract passes

### 2. Add retry + auto-heal behavior

When something is missing or broken, watchdog will immediately try the correct repair:

| Problem | Watchdog action |
|---|---|
| Missing WOD slot | Repick from library for that exact date/slot |
| Missing image | Trigger image repair |
| Missing Stripe link | Trigger WOD Stripe linker |
| Wrong date/category/difficulty/equipment | Clear only the invalid WOD flag, then repick correct slot |
| Candidate fails publish contract | Try next valid library candidate |
| No candidate passes | Stop safely and report exact reason |

It will retry automatically every 10 minutes through cron, with a max attempt cap so it does not loop forever.

### 3. Add persistent watchdog event logging

Create a `system_health_events` table to store every issue and repair attempt:

```text
check_type
severity
status
scheduled_for_date
equipment_slot
category
difficulty
issue_message
autofix_attempted
autofix_status
autofix_result
candidate_rejection_reasons
attempt_count
resolved_at
created_at
```

This gives a real timeline:

```text
Failure detected -> watchdog attempted fix -> fixed
Failure detected -> watchdog attempted fix -> blocked because no valid library candidate
```

### 4. Schedule watchdog every 10 minutes

Add cron:

```text
*/10 * * * * watchdog-wod-check
```

The function itself will decide what to check and repair. That means if something breaks after the normal WOD selection time, it will not wait until the next day.

### 5. Make health audit explain what happened

Update `run-quick-health-audit` and `run-system-health-audit` so the report says:

- what failed
- whether watchdog already fixed it
- whether watchdog is still retrying
- or why watchdog could not fix it

Example report wording:

```text
WOD failure detected for 2026-05-24 EQUIPMENT.
Watchdog attempted repair from library.
Result: blocked.
Reason: 9 Mobility & Stability / Advanced / Equipment candidates failed publish contract.
Top reasons: missing finisher density, raw exercise markup, blocked public names.
Manual action required: repair one matching library workout.
```

Or:

```text
WOD failure detected for 2026-05-25 BODYWEIGHT.
Watchdog repicked from library successfully after 1 attempt.
Status: resolved.
```

### 6. Refactor safely to avoid function-to-function fragility

Move the shared WOD slot repair logic into a shared backend module used by both:

- `select-wod-from-library`
- `watchdog-wod-check`

So watchdog does not depend on blindly calling another backend function and hoping it worked. It will perform the repair and log the result directly.

### 7. Keep strict safety rules

The watchdog will never:

- delete paid content
- modify HFSC assets/data
- invent workouts
- generate exercises
- permanently delete WODs
- auto-edit workout content/name/instructions

If content quality is the blocker, it reports the exact reason and candidate IDs instead of silently failing.

## Files to change

- `supabase/functions/watchdog-wod-check/index.ts`
- `supabase/functions/select-wod-from-library/index.ts`
- `supabase/functions/run-quick-health-audit/index.ts`
- `supabase/functions/run-system-health-audit/index.ts`
- new shared WOD repair module under `supabase/functions/_shared/`
- new database migration for `system_health_events`
- cron configuration for 10-minute watchdog schedule

## Expected result

After this, watchdog becomes the active repair system, health audit becomes the reporting layer, and WOD failures will either be automatically fixed within the next 10-minute cycle or reported with a precise reason why auto-fix was impossible.