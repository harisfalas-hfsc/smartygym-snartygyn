# Today's Safe Backend Fixes

## Goal
Apply 3 backend cleanups in **one database migration**. Zero changes visible to users on the website.

---

## The 3 Fixes

| # | Fix | Risk | What Users See |
|---|-----|------|----------------|
| 1 | Make `contact-files` storage bucket **private** + admin-only read policy | 🟢 Zero | Nothing. Contact form still uploads files. Only admins read inbox. |
| 2 | Remove broken `cleanup-old-rate-limits` cron job | 🟢 Zero | Nothing. Rate limiting still works (handled inline by `check_rate_limit`). |
| 3 | Drop the **duplicate** image-generation trigger on `admin_workouts` | 🟢 Zero | Nothing. Workout images still auto-generate — once instead of twice. Saves AI credits. |

---

## What I Will NOT Touch
- All frontend code
- All edge functions
- All other cron jobs
- All other triggers
- Any user-facing feature, page, button, or design

---

## Technical Steps

**Step 1 — Verify** (read-only query first to confirm exact trigger names before dropping anything):
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.admin_workouts'::regclass;
SELECT jobname FROM cron.job WHERE jobname LIKE '%rate-limit%';
```

**Step 2 — One migration:**
```sql
-- Fix 1: Lock contact-files bucket
UPDATE storage.buckets SET public = false WHERE id = 'contact-files';

CREATE POLICY "Admins read contact files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contact-files' AND has_role(auth.uid(), 'admin'));

-- Fix 2: Remove dead cron
SELECT cron.unschedule('cleanup-old-rate-limits');

-- Fix 3: Remove duplicate image trigger (keep the newer one)
DROP TRIGGER IF EXISTS <verified_name> ON public.admin_workouts;
```

**Step 3 — Confirm** each fix succeeded and report back.

---

## Deliverable
- 1 migration file
- A short confirmation message listing what was fixed

**Click Approve to execute.**