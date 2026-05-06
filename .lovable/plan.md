## Goal

Fix the admin "Today's WODs" widget so it reflects reality (both WODs are live for 2026-05-06) and confirm tonight's archive + tomorrow's pre-build will run on schedule.

## Diagnosis

**Database reality (verified):**
- ✅ Both WODs exist for today (Cyprus date 2026-05-06):
  - `Granite Glute Control` — BODYWEIGHT, visible, `is_workout_of_day=true`
  - `Granite Hip Builder` — EQUIPMENT, visible, `is_workout_of_day=true`
- ✅ `wod_generation_runs` shows both ran successfully yesterday at 06:30 / 06:50 UTC for cyprus_date `2026-05-06`.

**Crons (verified active):**
- `generate-wod-bodyweight-daily` → `30 6 * * *` UTC = **09:30 Cyprus** (builds tomorrow)
- `generate-wod-equipment-daily` → `50 6 * * *` UTC = **09:50 Cyprus** (builds tomorrow)
- `archive-old-wods` → `0 21 * * *` UTC = **00:00 Cyprus** (archives yesterday)
- All retry passes + post-gen audit active

So tonight's archive and tomorrow's pre-build are **already correctly scheduled**. No cron change needed.

**Widget bug (root cause):**
`src/components/admin/WODStatusWidget.tsx` has three issues that make it show stale/wrong data:
1. **Fetches once on mount only** — never refreshes. If the first call ran during a transient state (or before publish), it shows "missing" forever until page reload.
2. **No manual refresh button** — admin has no way to re-sync.
3. **Queries `admin_workouts` directly** instead of the security-definer RPC `get_visible_workout_metadata`, which is the canonical visibility source used by the rest of the app. RLS differences can cause the admin row to be invisible to this query.

## Plan

### Single file change: `src/components/admin/WODStatusWidget.tsx`

1. **Switch the WOD query** from direct `admin_workouts` select to `supabase.rpc("get_visible_workout_metadata", { _workout_id: null })`, then filter client-side for `is_workout_of_day === true && generated_for_date === cyprusDate`. This matches `useTodayWods` and guarantees the widget sees the same reality as the public site.
2. **Auto-refresh every 60 seconds** via `setInterval`, plus refresh on window focus.
3. **Add a small "Refresh" icon button** in the card header so the admin can force a re-check on demand.
4. **Add a Supabase realtime subscription** to `admin_workouts` filtered on `is_workout_of_day=true` so the widget reacts immediately when WODs are published or archived.
5. Keep loading/error UI; show "Last checked" timestamp so it's obvious the data is live.

### No cron / DB / edge function changes needed

Verified live state already matches the user's intent:
- 09:30 + 09:50 Cyprus → tomorrow's BW + EQ pre-built
- 00:00 Cyprus → today's archive + tomorrow's pre-built becomes visible

I'll note this in the response so the user has explicit confirmation.

## Files Modified

- `src/components/admin/WODStatusWidget.tsx` — switch to RPC, add 60s polling + focus refresh + realtime + manual refresh button + last-checked timestamp.