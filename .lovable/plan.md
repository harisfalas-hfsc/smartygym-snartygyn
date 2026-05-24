## What's actually going on

I checked both findings against the live database and the codebase. Here's the truth:

### 1. Testimonials — FALSE ALARM, no real problem
- The `testimonials` table SELECT policy is correctly locked down: only the owner or admins can read raw rows.
- Public reads happen through two `SECURITY DEFINER` functions (`get_public_testimonials`, `get_testimonial_rating_stats`) that are intentionally callable by anonymous visitors for SEO and the public testimonials section.
- Even the scanner's own note says: *"No issue — this is a documentation note. (No actionable finding.)"*
- So this is exactly how we designed it. Nothing to fix. We just need to tell the scanner to stop re-flagging it.

### 2. Calendar OAuth tokens — REAL leftover, but from a removed feature
- The `user_calendar_connections` table still stores Google `access_token` and `refresh_token` in plaintext.
- RLS limits each user to their own row, but the user can still read their own tokens through the client API. That's the real risk the scanner is flagging.
- BUT: per project memory, the Google Calendar feature was removed and replaced with internal reminders + native `.ics` export. I searched the entire codebase and there are zero references to `user_calendar_connections` anywhere (no edge functions, no frontend, nothing). The table is orphaned.

## Plan

### Step 1 — Remove the orphaned calendar tokens table
Migration that drops `public.user_calendar_connections` entirely. This eliminates the plaintext OAuth tokens completely — nothing to encrypt because nothing reads or writes them anymore.

Safety:
- Confirmed zero code references.
- Aligned with the existing "Calendar Removal" memory (internal reminders only).
- Not HFSC-related, not paid content — safe to drop.

### Step 2 — Mark the testimonials finding as intentional
Use `manage_security_finding` to ignore `testimonials_select_restricted_to_owner_admin` with the reason: public reads go through `get_public_testimonials` / `get_testimonial_rating_stats` SECURITY DEFINER functions; the restrictive table policy is the correct design.

### Step 3 — Update security memory
Record that:
- Calendar OAuth tokens table was dropped; feature is internal reminders only.
- Testimonials are intentionally read-restricted at the table level; SEO reads use SECURITY DEFINER functions.

So future scans don't re-raise these.

### What I will NOT touch
- The shop products / `contact-files` finding (you asked to skip it since shop is hidden).
- Any HFSC asset.
- Any working feature.

After Step 1 the scanner's `error`-level finding disappears for real. After Step 2 the testimonials `warn` is acknowledged as by-design.
