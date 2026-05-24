# Permanent Security Fixes — Pre-Submission

Goal: clear all 4 outstanding warnings/errors so they do not reappear in the Security panel before Apple/Google submission.

## Findings to fix

1. **ERROR — `workout_comments` exposes `user_id` to anonymous visitors**
   The `SELECT` policy is still `USING (true)`. Even though we discussed it before, the policy was never tightened.

2. **WARN — Public can EXECUTE `SECURITY DEFINER` functions (anon role)**
   Sensitive admin/maintenance functions are callable without signing in.

3. **WARN — Signed-in users can EXECUTE `SECURITY DEFINER` functions (authenticated role)**
   Same functions are also callable by any logged-in user.

4. **WARN — Public storage bucket allows listing**
   At least one public bucket has a broad `SELECT` policy on `storage.objects` that lets clients list every file in the bucket (URL access still works; only directory listing is blocked).

## Fix plan (single migration)

### 1. Lock down `workout_comments`
- Drop the `Anyone can view comments` policy.
- Add: `CREATE POLICY "Authenticated users can view comments" ON public.workout_comments FOR SELECT TO authenticated USING (true);`
- Comments remain visible to logged-in users (community feature preserved). Anonymous visitors no longer see `user_id`.

### 2. Harden `SECURITY DEFINER` functions
- Enumerate all `SECURITY DEFINER` functions in `public` via `pg_proc`.
- For functions that must only run from cron / edge functions / admins (e.g. SQL execution helpers, cron managers, archival/maintenance, role grants, internal sync):
  `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon, authenticated;`
  `GRANT EXECUTE ON FUNCTION ... TO service_role;`
- For user-facing helpers that legitimately need authenticated callers (e.g. `has_role`, profile helpers): keep `EXECUTE` for `authenticated` only, revoke from `anon` and `PUBLIC`.
- Keep behavior identical for the app — only the role grants change.

### 3. Block storage directory listing
- For each public bucket (avatars, blog images, exercise GIFs, etc.), replace any broad `SELECT` on `storage.objects` with policies that:
  - Allow reading a specific object by id/name (so existing `getPublicUrl` links keep working).
  - Disallow unscoped listing (`SELECT *` without a filter).
- Keep owner-scoped write/update/delete policies as they are.

### 4. Update security memory
- Record: comments require auth, definer functions are service-role/admin-only, public buckets are read-by-URL not listable.
- Mark all 4 findings as fixed via `manage_security_finding` after the migration runs.

## What does NOT change
- No frontend code changes.
- No edge function logic changes (they use `service_role` and keep working).
- Avatars, blog images, GIFs, etc. continue to load via their public URLs.
- Logged-in users keep seeing comments and profile data exactly as today.

## Verification
After migration runs:
1. Re-run the security scan — expect 0 findings.
2. Spot-check: load a workout page as a logged-in user (comments visible), load a public image URL (works), try to list a bucket as anon (blocked).
3. Mark each finding fixed and update `@security-memory`.

Approve this plan and I will implement it in one migration + memory update.
