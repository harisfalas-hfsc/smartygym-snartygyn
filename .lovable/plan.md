# Codebase Cruft Audit — Report Only, Zero Changes

## What changed vs. previous plan

Previous plan: scan + clean + verify in one pass.
**This plan: scan only. Produce a detailed report. You approve each item before any deletion happens in a future session.**

No file is modified. No `// SMARTY-FLAG` comments are inserted. No cleanup executed. The deliverable is a single report.

---

## What I'm looking for (the "cruft" categories)

After a year of fixes, codebases accumulate these specific patterns. I'll hunt each one explicitly:

1. **Superseded duplicates** — two functions/hooks/components that do the same job, where a newer one replaced an older one but the older was never deleted (e.g. `useWodState` vs `useTodayWods`, `WorkoutDisplay` vs an older display component, two versions of the same edge function helper).

2. **Orphaned edge functions** — functions in `supabase/functions/` that are no longer called from anywhere (no cron job, no client call, no other function calling them, no docs referencing them).

3. **Dead cron jobs** — `cron.job` rows pointing at edge functions that no longer exist OR superseded by a newer cron (e.g. old single WOD cron sitting next to the new Plan 2 split crons).

4. **Stale migrations / SQL artifacts** — DB functions or triggers in the schema that are no longer referenced (e.g. `trigger_welcome_email` on profiles, now superseded by `trigger_welcome_email_on_confirm` on auth.users — both currently exist).

5. **Overwritten logic left behind** — within a single file, two implementations of the same thing where only the newer is reachable (dead branch, dead helper above the active one).

6. **Unused imports / dead variables / commented-out blocks** — purely cosmetic, but I'll catalog volume per file so you can decide threshold.

7. **Conflicting notification triggers** — same notification fireable from 2+ paths (DB trigger + edge function + cron), causing potential duplicates.

8. **Abandoned audit/repair scripts** — one-off `repair-*`, `fix-*`, `audit-*`, `migrate-*` edge functions and pages that were used once and never deleted (I see ~15 of these in `supabase/functions/` and `src/pages/MigrateContent.tsx`).

9. **Stale documentation files at repo root** — 40+ `.md` audit reports (`COMPLETE_FIX_REPORT_2025.md`, `FINAL_AUDIT_REPORT.md`, etc.) — most are point-in-time and likely outdated.

10. **Duplicate DB functions** — e.g. two versions of `update_wod_cron_schedule` (one with 1 arg, one with 2 args) currently coexist in the schema.

---

## Method (read-only)

For each candidate I find, I'll establish:

- **What it is** (file path + symbol name + ~size)
- **What replaced it** (the newer working version, with file path)
- **Proof it's unused** (grep results across `src/`, `supabase/functions/`, `cron.job`, DB triggers, migrations, docs — showing zero references outside its own definition)
- **Risk level** to remove:
  - 🟢 **Safe** — zero references anywhere, newer version verified working
  - 🟡 **Likely safe** — zero code references but referenced in docs/comments only, or newer version exists but not yet validated in production
  - 🔴 **Do not touch** — has references, or is in the protected list (WOD orchestrator, periodization, library, logbook, programs, tools, schemas, auth)
- **Why removing is safe** (one-paragraph justification per item)
- **What would break if removed in error** (worst case)

---

## Specific known-suspicious areas I'll prioritize

Based on what I already see in the codebase context:

### A. Welcome email triggers (we just touched this yesterday)
- `trigger_welcome_email()` — old, on `profiles`
- `trigger_welcome_email_on_confirm()` — new, on `auth.users` (created yesterday)
- **Need to confirm the OLD trigger is actually still attached and whether it's now redundant or harmful.**

### B. Two `update_wod_cron_schedule` overloads
- One with `(new_hour integer)` only
- One with `(new_hour integer, new_minute integer)`
- Likely the single-arg version is the older one. Confirm caller(s).

### C. WOD-related cron jobs
- `generate-wod-daily` (old single cron from `update_wod_cron_schedule` 1-arg version)
- `generate-workout-of-day` (referenced from 2-arg version)
- Plan 2 split crons at 21:05 / 21:25
- Likely 2-3 of these are stale. Will not delete — only flag — until tomorrow's Plan 2 validation.

### D. Repair / audit / migrate one-off functions
Candidates (I'll verify each is unused):
`repair-pilates-workouts`, `repair-missing-images`, `repair-stripe-metadata`, `fix-stripe-metadata`, `fix-blog-images`, `fix-program-images`, `audit-stripe-images`, `audit-workout-durations`, `audit-fix-bodyweight-workouts`, `bulk-format-consistency-repair`, `batch-relink-exercises`, `regenerate-broken-programs`, `reprocess-wod-exercises`, `pull-stripe-images`, `sync-stripe-images`, `update-corporate-product-images`, `start-image-repair`, `process-image-repair`, `get-repair-job-status`, `repair-stripe-metadata`, `tag-smartygym-products`, `MigrateContent.tsx` page.

### E. 40+ root-level `.md` audit reports
List, identify the few that contain still-relevant standards (vs point-in-time reports), recommend archival of the rest to `/docs/archive/`.

### F. Duplicate hooks / components
Will scan `src/hooks/` and `src/components/` for name-similar files (e.g. `useWODState` vs `useTodayWods`, `WorkoutTools*` variants, multiple notification managers).

### G. Notification trigger overlap
Map every code path that fires each notification type. Specifically check WOD notifications, welcome email, renewal reminders, content notifications.

---

## Hard "do not touch — flag only" list (unchanged)

WOD orchestrator + periodization, all workout categories, the 500+ library/gallery, logbook, 6/8/12-week programs, Smarty Tools (1RM, macros, BMR), notification/messaging behavior, all DB schemas/tables/RLS, auth, `src/integrations/supabase/*`, `.env`, `supabase/config.toml` project-level settings.

If something in these areas looks like cruft, it gets reported as 🔴 with explanation — **never** marked safe to delete.

---

## Deliverable

A single markdown report in chat, structured as:

### Section 1 — Safe to remove (🟢)
Table: item | type | location | replaced by | proof unused | one-line justification

### Section 2 — Likely safe, needs your call (🟡)
Same table + a "what to verify first" column

### Section 3 — Do not touch (🔴)
Items that look like cruft but are protected or still referenced — with explanation of the reference

### Section 4 — Conflicting/duplicate logic still active
Pairs of things doing the same job, both currently live, with recommendation on which to keep

### Section 5 — Cron job inventory
Every `cron.job` row + status (active / orphan / superseded)

### Section 6 — Notification trigger map
Every notification type + every path that can fire it + duplicate risk

### Section 7 — Stale docs at repo root
List + recommendation (keep / archive / delete)

### Section 8 — Volume summary
File-by-file count of unused imports, dead vars, commented blocks (no per-line listing — too noisy; just totals)

### Section 9 — Recommended order of operations
If you decide to clean later, the safest sequence (e.g. "remove 🟢 items first, validate Plan 2 tomorrow, then handle 🟡 WOD-related items, then archive docs").

---

## What this plan is NOT

- Not making any code changes.
- Not inserting flag comments in source files.
- Not deleting anything.
- Not running migrations.
- Not touching the WOD system before tomorrow's Plan 2 validation.

After you read the report, you tell me which 🟢 items to remove, and I'll do it in a follow-up session with your explicit approval per batch.

## Estimated effort

~30-45 minutes of read-only exploration (file scans, DB queries via `read_query`, edge function inventory, cron inventory, grep cross-references). Output is one detailed report — no follow-on work without your sign-off.