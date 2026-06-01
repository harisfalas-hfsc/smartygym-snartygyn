
## What the audit really shows

The "0% delivery / 3 emails failed / Critical" alert in today's audit is **mostly a false alarm caused by a database bug**, plus **3 real Resend send failures** mixed in. I diagnosed both below.

### Issue A — False 0% delivery rate (silent logging bug)

`public.email_delivery_log` has this CHECK constraint:

```
status IN ('success', 'failed', 'skipped')
```

But the shared helper `supabase/functions/_shared/email-log.ts` and **26+ call sites** across every email-sending edge function insert `status: 'sent'`. Every successful send tries to insert `'sent'`, the CHECK rejects it, the helper's `try/catch` swallows the error silently → **no successful sends ever get persisted**. Only failures land in the table.

Result: the audit divides `today_success / today_total` and sees only the 3 failed rows → reports "0% success (0/3)". In reality many more emails went out successfully today; they just never got logged.

### Issue B — 3 real Resend failures today

The 3 rows in the table are genuine. All 3 are this week's `weekly-motivation` cron run on 2026-06-01 08:00 UTC:

```
example@example.com       failed  Unexpected token '<', "<!DOCTYPE "... is not valid JSON
ar.andreas@gmail.com      failed  Failed to process email sending
antoinc597@bellsouth.net  failed  Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

"Unexpected token `<`, `<!DOCTYPE`" is the Resend SDK choking on an HTML response — Resend returned an HTML error page (typically 429 rate-limit, 5xx, or auth/quota page) instead of JSON. The send-weekly-motivation function already delays 600 ms between sends, but if Resend's free-tier daily quota or per-second rate limit was hit, this is what it looks like.

Also notable: `example@example.com` is a junk address that shouldn't be in `profiles` at all — it pollutes every weekly run.

---

## Plan

### 1. Fix the status-mismatch (kills the false alarm permanently)

Migration: widen the CHECK constraint to accept both `'sent'` and `'success'` so the existing 26+ call sites work and old rows stay valid:

```sql
ALTER TABLE public.email_delivery_log DROP CONSTRAINT email_delivery_log_status_check;
ALTER TABLE public.email_delivery_log ADD CONSTRAINT email_delivery_log_status_check
  CHECK (status IN ('sent', 'success', 'failed', 'skipped'));
```

Then update the audit query in `supabase/functions/run-system-health-audit/index.ts` (lines 1268–1290) and `run-quick-health-audit/index.ts` to count successes as `status IN ('sent','success')` rather than "total minus failed" — that way one stale junk row can't drag the rate to 0%.

No code changes needed in the 26 call sites — they keep writing `'sent'` and it now persists.

### 2. Harden Resend error handling

In `_shared/email-log.ts` and in `send-weekly-motivation/index.ts`:
- When the Resend SDK throws the "Unexpected token '<'" JSON-parse error, capture and log the raw response status/text snippet into `metadata` so future failures are diagnosable instead of opaque.
- In the weekly-motivation loop, on a rate-limit / HTML response, back off (e.g. 5 s) and retry once before logging `failed`.

### 3. Clean junk recipient

Add a guard in `send-weekly-motivation` (and the other bulk senders) to skip obvious placeholder addresses (`@example.com`, `@test.com`, `noreply@`) so they never count against delivery health.

### 4. Verify

After deploy:
- Trigger `send-test-admin-email` once → confirm a row with `status='sent'` actually persists.
- Re-run `run-quick-health-audit` → "Today's Delivery Rate" should now reflect reality (not 0%).
- Check Resend dashboard for any quota/billing flag explaining the HTML response. (User-visible: I'll surface what I find; no manual action expected from you unless Resend's quota is actually exceeded.)

### Files touched
- New migration: widen `email_delivery_log_status_check`.
- `supabase/functions/run-system-health-audit/index.ts` — fix success-rate query.
- `supabase/functions/run-quick-health-audit/index.ts` — same fix.
- `supabase/functions/_shared/email-log.ts` — richer error metadata.
- `supabase/functions/send-weekly-motivation/index.ts` — retry + junk-email skip.

### Not touched
HFSC, WOD generation, SEO conquest pages, brand, layout, auth, payments, RLS, the 26 other email-sending functions' call sites.
