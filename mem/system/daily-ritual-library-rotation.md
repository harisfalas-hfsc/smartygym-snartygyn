---
name: Daily Ritual Library Rotation
description: Today's Smarty Ritual is rotated from the admin-curated library (no AI). One per day, every ritual plays once per cycle before any repeat.
type: feature
---

- No AI generates Smarty Rituals. Admins create/edit them manually in the back office (`RitualsManager`).
- The `assign-daily-ritual` edge function runs nightly (`5 22 * * *` UTC = 00:05 Cyprus winter) and picks one ritual from `daily_smarty_rituals` for today.
- Selection rule: random within the current cycle, but every ritual in the library must be used once before a new cycle starts. Stored in `daily_ritual_assignments(ritual_date, ritual_id, cycle_number)`.
- All read paths (`DailySmartyRitual.tsx`, `send-morning-notifications`, `send-ritual-notifications`) resolve "today's ritual" by joining `daily_ritual_assignments` → `daily_smarty_rituals`.
- Never re-introduce the old `generate-daily-ritual` function or any AI-based ritual generation cron.