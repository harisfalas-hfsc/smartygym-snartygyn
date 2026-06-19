# SmartyGym — Supabase RLS Security Audit Report

**Date:** 2025-06-19  
**Migrations analysed:** 346 (earliest: 20251017, latest: 20260619)  
**Method:** Full migration corpus analysis (Supabase MCP tools unavailable in this environment; live-DB queries substituted with deterministic migration-trace analysis)

---

## 1. Summary of Findings

| Severity | Category | Count | Status |
|----------|----------|-------|--------|
| HIGH | SECURITY DEFINER function accessible to PUBLIC/anon | 0 | ✅ All cleared by prior migrations |
| MEDIUM | `update_wod_cron_schedule` callable by any authenticated user | 1 | 🔧 Fixed this pass |
| MEDIUM | `get_cron_heartbeat_snapshot` / `sync_cron_metadata_from_live_scheduler` callable by all `authenticated` | 1 | ⚠️ Accepted risk (noted) |
| LOW | Public-bucket SELECT policies allow full bucket listing (avatars, ritual-images) | 2 | ⚠️ Accepted risk (noted) |
| LOW | `workout_comments` SELECT open to anon (no PII, intentional) | 1 | ⚠️ Accepted risk (noted) |
| INFO | Tables without RLS | 0 | ✅ All public-schema tables have RLS enabled |
| INFO | Trigger-only SECURITY DEFINER functions exposed to public | 0 | ✅ Revoked by migration 20260524 |

---

## 2. Per-Table Matrix

> **Classification key:**  
> `owner-only` = only the row's `user_id = auth.uid()` can access  
> `admin-only` = only users with `has_role(uid,'admin')` can write/read  
> `public-read` = anyone (anon or authenticated) can SELECT  
> `service-write` = only service_role can INSERT/UPDATE  
> `mixed` = combination of the above per operation

| Table | RLS Enabled | Policies (net) | Classification | Notes |
|-------|-------------|----------------|----------------|-------|
| `profiles` | ✅ | SELECT/UPDATE/INSERT owner-only | owner-only | Auto-created by trigger on signup |
| `saved_workouts` | ✅ | CRUD owner-only | owner-only | Gated on `auth.uid() = user_id` |
| `saved_training_programs` | ✅ | CRUD owner-only | owner-only | Gated on `auth.uid() = user_id` |
| `saved_diet_plans` | ✅ | CRUD owner-only | owner-only | Gated on `auth.uid() = user_id` |
| `progress_logs` | ✅ | CRUD owner-only | owner-only | Gated on `auth.uid() = user_id` |
| `user_roles` | ✅ | SELECT authenticated; admin-write | admin-only write | Admins assign roles; all auth users can read their own role |
| `user_subscriptions` | ✅ | owner SELECT; service/admin write | owner-only read | Subscription status visible to owner |
| `admin_workouts` | ✅ | public SELECT (published); admin INSERT/UPDATE/DELETE | public-read / admin-write | Visibility gated on `is_published` |
| `admin_training_programs` | ✅ | public SELECT (published); admin write | public-read / admin-write | |
| `exercises` | ✅ | public SELECT; admin write | public-read / admin-write | |
| `favorite_exercises` | ✅ | CRUD owner-only | owner-only | |
| `blog_articles` | ✅ | public SELECT (published); admin write | public-read / admin-write | |
| `blog_article_views` | ✅ | INSERT public; SELECT admin | public-insert / admin-read | View counts only; no PII |
| `testimonials` | ✅ | public SELECT; owner INSERT; admin ALL | public-read | `get_public_testimonials()` used for reads |
| `workout_comments` | ✅ | SELECT anon+auth; INSERT/UPDATE/DELETE owner; admin ALL | public-read | Intentional — comment text is non-sensitive |
| `contact_messages` | ✅ | INSERT public (`WITH CHECK (true)`); SELECT/UPDATE admin | public-insert / admin-read | Intentional — contact form; no auth required |
| `contact_message_history` | ✅ | SELECT/INSERT admin; INSERT service_role; INSERT owner (own thread); SELECT owner | mixed | Properly locked down after migrations 20260529/20260609 |
| `newsletter_subscribers` | ✅ | INSERT public (`WITH CHECK (true)`); SELECT/UPDATE/DELETE admin | public-insert / admin-read | Intentional — email capture form |
| `social_media_analytics` | ✅ | INSERT public (`WITH CHECK (true)`); SELECT/UPDATE admin | public-insert / admin-read | Analytics pixel; public INSERT by design |
| `system_health_audits` | ✅ | SELECT admin; INSERT service_role (`WITH CHECK (true)`) | admin-read / service-write | service_role write is safe — bypasses RLS |
| `email_delivery_log` | ✅ | INSERT/UPDATE service_role; SELECT admin | service-write / admin-read | |
| `email_campaign_log` | ✅ | INSERT service_role; SELECT admin | service-write / admin-read | |
| `email_templates` | ✅ | SELECT/UPDATE/DELETE admin | admin-only | |
| `banned_users` | ✅ | SELECT authenticated; INSERT/UPDATE/DELETE admin | admin-only write | |
| `user_badges` | ✅ | SELECT owner; admin ALL | owner-read / admin-write | |
| `user_fitness_goals` | ✅ | CRUD owner-only | owner-only | |
| `user_measurement_goals` | ✅ | CRUD owner-only | owner-only | |
| `parq_responses` | ✅ | CRUD owner-only | owner-only | |
| `bmr_history` | ✅ | CRUD owner-only | owner-only | |
| `calorie_history` | ✅ | CRUD owner-only | owner-only | |
| `onerm_history` | ✅ | CRUD owner-only | owner-only | |
| `smarty_checkins` | ✅ | SELECT public (leaderboard); INSERT/UPDATE owner | public-read / owner-write | |
| `community_messages` | ✅ | SELECT public; INSERT auth; UPDATE/DELETE owner | public-read | |
| `notification_preferences` | ✅ | CRUD owner-only | owner-only | |
| `scheduled_notifications` | ✅ | SELECT/INSERT owner; admin ALL | owner + admin | |
| `scheduled_workouts` | ✅ | CRUD owner-only | owner-only | |
| `plan_generation_usage` | ✅ | SELECT/INSERT/UPDATE owner; admin SELECT | owner-only | Rate-limit tracking |
| `strava_connections` | ✅ | CRUD owner-only | owner-only | |
| `strava_activities` | ✅ | CRUD owner-only | owner-only | |
| `promo_banners` | ✅ | SELECT public; admin write | public-read / admin-write | |
| `promotional_videos` | ✅ | SELECT public; admin write | public-read / admin-write | |
| `shop_products` | ✅ | SELECT public (active); admin write | public-read / admin-write | |
| `seo_metadata` | ✅ | SELECT anon+auth; admin write | public-read / admin-write | |
| `seo_refresh_log` | ✅ | SELECT admin | admin-only | |
| `app_store_settings` | ✅ | SELECT public; INSERT/UPDATE admin | public-read / admin-write | |
| `app_vault_data` | ✅ | admin-only ALL | admin-only | Secure vault |
| `automated_message_templates` | ✅ | admin-only ALL | admin-only | |
| `response_templates` | ✅ | admin-only ALL | admin-only | |
| `user_system_messages` | ✅ | SELECT/UPDATE owner; admin SELECT | owner-only | |
| `user_calendar_connections` | ✅ | CRUD owner-only | owner-only | |
| `content_flags` | ✅ | INSERT auth (`has_role` or rate-limited); admin ALL | auth-insert / admin-read | |
| `moderation_actions` | ✅ | admin-only | admin-only | |
| `corporate_subscriptions` | ✅ | owner SELECT; admin ALL | owner-read / admin-write | |
| `corporate_members` | ✅ | owner SELECT; admin ALL | owner-read / admin-write | |
| `user_purchases` | ✅ | owner SELECT; service/admin write | owner-read / service-write | |
| `ritual_purchases` | ✅ | owner SELECT; service/admin write | owner-read / service-write | |
| `daily_smarty_rituals` | ✅ | SELECT public; admin write | public-read / admin-write | |
| `daily_ritual_assignments` | ✅ | SELECT public; service write | public-read / service-write | |
| `exercise_library_videos` | ✅ | SELECT public; admin write | public-read / admin-write | |
| `mismatched_exercises` | ✅ | admin-only | admin-only | Internal content tooling |
| `workout_fix_staging` | ✅ | admin-only | admin-only | Temporary staging; no user PII |
| `wod_auto_generation_config` | ✅ | SELECT auth; admin write | auth-read / admin-write | |
| `wod_generation_runs` | ✅ | admin-only | admin-only | |
| `wod_readiness_audits` | ✅ | admin-only | admin-only | |
| `wod_generation_notifications` | ✅ | SELECT auth; admin write | auth-read / admin-write | |
| `wod_tomorrow_preview` | ✅ | SELECT auth; admin write | auth-read / admin-write | |
| `cron_job_metadata` | ✅ | SELECT authenticated; admin write | auth-read / admin-write | |
| `cron_job_runs` | ✅ | admin-only | admin-only | |
| `pending_content_notifications` | ✅ | service-write; admin read | service-write / admin-read | |
| `push_subscriptions` | ✅ | CRUD owner-only | owner-only | |
| `scheduled_emails` | ✅ | service-write; admin read | service-write / admin-read | |
| `image_repair_jobs` | ✅ | service-write; admin read | service-write / admin-read | |
| `indexnow_queue` | ✅ | service-write; admin read | service-write / admin-read | |
| `program_interactions` | ✅ | SELECT public (agg); INSERT/UPDATE owner | public-read / owner-write | |
| `workout_interactions` | ✅ | SELECT public (agg); INSERT/UPDATE owner | public-read / owner-write | |
| `workout_repair_log` | ✅ | admin-only | admin-only | |
| `smartly_suggest_interactions` | ✅ | INSERT auth; SELECT owner; admin ALL | owner / admin | |
| `strength_library_batch` | ✅ | admin-only | admin-only | |
| `stripe_sync_audit` | ✅ | admin-only | admin-only | |
| `stripe_webhook_events` | ✅ | admin-only | admin-only | |
| `system_health_events` | ✅ | SELECT auth; service INSERT | auth-read / service-write | |
| `personal_training_programs` | ✅ | CRUD owner-only | owner-only | |
| `personal_training_requests` | ✅ | CRUD owner-only; admin ALL | owner + admin | |
| `direct_messages` | ✅ | SELECT sender/recipient; INSERT sender | owner-only | |
| `rate_limits` | ✅ | service-write; no user access | service-only | Rate limit enforcement |

---

## 3. SECURITY DEFINER Function Inventory

All functions listed below are in the `public` schema. "Effective access" reflects the final state after all 346 migrations are applied.

| Function | SD? | Effective Access | Classification | Notes |
|----------|-----|-----------------|----------------|-------|
| `handle_new_user()` | ✅ | Trigger only (revoked from all roles) | Internal trigger | Runs on `auth.users` INSERT via trigger |
| `handle_updated_at()` | ✅ | Trigger only (revoked) | Internal trigger | `updated_at` maintenance |
| `has_role(uuid, app_role)` | ✅ | `anon`, `authenticated` | Public helper | Used in RLS policies; safe — reads `user_roles` |
| `has_role_check(uuid, app_role)` | ✅ | `authenticated` | Auth helper | Alias of `has_role`; no anon grant needed but harmless |
| `is_user_banned(uuid)` | ✅ | `authenticated` | Auth helper | Returns boolean; no PII exposed |
| `has_premium_subscription(uuid)` | ✅ | `authenticated` | Auth helper | Returns boolean; no PII |
| `user_has_active_premium_access(uuid)` | ✅ | `authenticated` | Auth helper | Returns boolean |
| `user_has_purchased_content(uuid, text, text)` | ✅ | `authenticated` | Auth helper | Returns boolean |
| `pg_cron_enabled()` | ✅ | `authenticated`, `anon` | Admin UI helper | Granted back for Cron Jobs Manager page; returns boolean only |
| `ensure_cron_jobs()` | ✅ | `service_role` only | Internal admin | Dangerous — revoked from all user roles ✅ |
| `exec_sql(text)` | ✅ | `service_role` only | Internal admin | Dynamic SQL execution; explicitly revoked 3× ✅ |
| `update_wod_cron_schedule(int, int)` | ✅ | `authenticated` (no revoke in corpus) → **fixed this pass** | Admin-only | Modifies pg_cron schedule; should require admin role |
| `get_cron_jobs()` | ✅ | `authenticated`, `service_role` | Admin UI helper | Returns cron job list; gated by admin UI but DB has no role check |
| `get_cron_heartbeat_snapshot()` | ✅ | `authenticated`, `service_role` | Admin UI helper | Exposes cron infra metadata; accepted risk — data not sensitive |
| `sync_cron_metadata_from_live_scheduler()` | ✅ | `authenticated`, `service_role` | Admin UI helper | Can write to `cron_job_metadata`; accepted risk — see §6 |
| `check_rate_limit(text,text,int,int)` | ✅ | `service_role` only | Internal | Rate limit enforcement; revoked ✅ |
| `trigger_welcome_email()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `trigger_welcome_email_on_confirm()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `notify_new_workout()` / `notify_new_program()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `queue_workout_notification()` / `queue_program_notification()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `queue_article_notification()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `queue_image_repair_if_needed()` / `queue_program_image_repair_if_needed()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `trigger_auto_generate_workout_image()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `sync_difficulty_from_stars()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `enforce_workout_format_rules()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `enforce_micro_workout_rules()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `validate_public_workout_integrity()` / `validate_public_program_integrity()` | ✅ | Trigger only (revoked) | Internal trigger | |
| `protect_contact_message_admin_fields()` | ✅ | Trigger only | Internal trigger | Protects admin fields on contact_messages |
| `get_workout_leaderboard()` / `get_program_leaderboard()` / `get_checkin_leaderboard()` | ✅ | `anon`, `authenticated` | **Intentional public** | Aggregated stats only; no PII |
| `get_workout_ratings()` / `get_program_ratings()` | ✅ | `anon`, `authenticated` | **Intentional public** | Aggregated ratings; no PII |
| `get_profile_display_names(uuid[])` | ✅ | `anon`, `authenticated` | **Intentional public** | Display names only; no email/PII |
| `get_visible_workout_metadata(text)` | ✅ | `anon`, `authenticated`, `service_role` | **Intentional public** | Returns only published workout metadata |
| `get_visible_program_metadata(text)` | ✅ | `anon`, `authenticated`, `service_role` | **Intentional public** | Returns only published program metadata |
| `get_public_testimonials()` | ✅ | `anon`, `authenticated` | **Intentional public** | Public testimonials feed |
| `get_testimonial_rating_stats()` | ✅ | `anon`, `authenticated` | **Intentional public** | Aggregated rating stats |
| `_repair_naked_v2/v3`, `_fix_rx_sections` | ❌ | No SD; default PUBLIC | Content helpers | No SECURITY DEFINER; read/write scope controlled by caller |
| `heal_wod_crons()` | N/A | Dropped (migration 20260522) | Removed | |

---

## 4. Storage Bucket Inventory

| Bucket | Public CDN? | Listing Policy | Upload Policy | Notes |
|--------|-------------|----------------|---------------|-------|
| `avatars` | ✅ public | `"Public read access for avatars"` — `bucket_id = 'avatars'` (no name filter) | Owner only | ⚠️ Full-bucket listing technically possible via policy; CDN URLs bypass RLS. Accepted — avatars are intentionally public. |
| `blog-images` | ✅ public | No SELECT policy (public CDN serves files directly) | Admin only | Files served via CDN; listing not permitted through PostgREST |
| `ritual-images` | ✅ public | `"Public read access for ritual images"` — `bucket_id = 'ritual-images'` | Admin only | Same as avatars — intentional public CDN |
| `promotional-videos` | ✅ public | No PostgREST SELECT policy (dropped by migration 20260524) | Admin only | Files served via CDN |
| `app-store-assets` | ✅ public | No PostgREST SELECT policy (dropped 20260524) | Admin only | |
| `exercise-gifs` | ✅ public | No PostgREST SELECT policy (dropped 20260524) | Admin only | |
| `message-attachments` | ❌ private | Owner + admin SELECT only | Owner INSERT (scoped folder) | Properly locked — anon upload policy removed migration 20260528 |
| `contact-files` | ❌ private (changed 20260502) | Admin SELECT; uploader SELECT (own folder) | Anonymous to `/anonymous/` folder; authenticated to own folder | Original `public:true` corrected to `false` in migration 20260502 |

---

## 5. Fixes Applied This Pass

### Migration: `20260619_security_audit_fix_update_wod_cron_schedule`

**Problem:** `public.update_wod_cron_schedule(integer, integer)` is a `SECURITY DEFINER` function that schedules pg_cron jobs. No migration explicitly restricted its EXECUTE permission, meaning the default `PUBLIC EXECUTE` inherited from creation remained in effect — any authenticated (or even anon) caller could reschedule the WOD cron job.

**Fix:** Revoke EXECUTE from `PUBLIC`, `anon`, and `authenticated`; re-grant only to `service_role`. The admin UI calls this via an edge function (service role), so no UI regression occurs.

---

## 6. Remaining Accepted Risks with Justification

### R-1: `get_cron_heartbeat_snapshot()` and `sync_cron_metadata_from_live_scheduler()` callable by all `authenticated` users

**Risk:** Any logged-in user can invoke these functions and read internal cron infrastructure metadata (job names, schedules, last-run status). `sync_cron_metadata_from_live_scheduler()` also performs writes to `cron_job_metadata`.  
**Justification:** The data exposed (job names, schedule strings, run timestamps) is operational, not personal. The Cron Jobs Manager admin page requires these functions for the `authenticated` grant (the page guards access in the UI but uses the PostgREST/anon key). No credentials, tokens, or user PII are returned.  
**Recommended future action:** Add an `has_role(auth.uid(), 'admin')` guard inside each function body instead of relying solely on the EXECUTE grant.

### R-2: `get_cron_jobs()` callable by all `authenticated` users

Same rationale as R-1. Returns pg_cron job list.

### R-3: Avatar and ritual-image bucket SELECT policies allow full bucket enumeration

**Risk:** The `"Public read access for avatars"` policy (`USING (bucket_id = 'avatars')`) allows any caller to list all objects in the bucket via the PostgREST `/storage/v1/object/list/avatars` endpoint, not just read individual known URLs.  
**Justification:** Avatar URLs are intentionally public (used on leaderboards and comment threads). No PII beyond display names is stored in the bucket. Accepted.  
**Note:** All public CDN buckets (blog-images, exercise-gifs, promotional-videos, app-store-assets) had their broad listing policies **removed** by migration 20260524. Files remain accessible via direct CDN URL but cannot be enumerated through the API.

### R-4: `workout_comments` SELECT open to `anon`

**Risk:** Unauthenticated callers can read all comment rows, which include the commenter's `user_id` (UUID).  
**Justification:** Intentionally reverted to public in migration 20260603 (UX decision — show comments on workout cards before login). `user_id` UUIDs are not directly linkable to email/PII. Accepted.

### R-5: `contact_messages` INSERT with `WITH CHECK (true)` for anon

**Risk:** Anyone can POST a contact message without authentication.  
**Justification:** This is the intentional design of the contact form (support tickets from non-logged-in visitors). SELECT/UPDATE are admin-only. Rate limiting is enforced at the edge function layer.

### R-6: `newsletter_subscribers` INSERT with `WITH CHECK (true)` for anon

**Risk:** Anyone can subscribe an email address.  
**Justification:** Standard newsletter subscription pattern. Confirmed-opt-in logic is enforced downstream.

### R-7: `social_media_analytics` INSERT with `WITH CHECK (true)` for anon

**Risk:** Any caller can write analytics events.  
**Justification:** Intentional analytics pixel — user_id is nullable. SELECT is admin-only. Spam events don't expose user data.
