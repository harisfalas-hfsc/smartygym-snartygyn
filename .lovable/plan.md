## Scope

Only the **"Direct Access to Your Coach"** form on the Contact page (Premium-only). The general contact form stays untouched.

## Problem

`send-direct-coach-email` currently:
- Sends to `coach_inbox_email` which resolves to `smartygym@outlook.com` (same as admin).
- Uses a different HTML layout than the proven general contact form.
- Sends nothing back to the sender, and no AI/automated response is generated — so when you tested with your own Gmail, your inbox only showed the customer-facing replies from the OTHER form.

## Fix

### 1. Hardcode recipient to your personal Gmail
- In `supabase/functions/send-direct-coach-email/index.ts`, set recipient to `harisfalas@gmail.com` (constant at the top of the file, easy to change later).
- Remove the `getCoachInboxEmail` lookup for this function. Admin's Outlook is unaffected — it's still used by the general contact form.

### 2. Rebuild the email to you (the coach) using the proven format
Mirror the admin-notification HTML from `send-contact-email`:
- Header bar: "Direct Message from Premium Member" + user name badge
- Table: From / Email / Subject
- **📥 Original Message** panel (cyan left border, white background) — full sender message
- Attachments list (if any)
- Footer: "Reply directly to this email to respond to {name}" (`reply_to: <sender email>`)
- Subject: `[SmartyGym Premium Direct] {subject}`
- From: `SmartyGym Premium <notifications@smartygym.com>`

### 3. Add an automated reply to the sender
A short branded confirmation sent to the Premium member who submitted the form, so they know it was received:
- Subject: `Your message to Haris was received`
- Body: "Hi {name}, your message has reached Haris directly. As a Premium member you'll get a personal reply soon. Best, The SmartyGym Team"
- NO AI-generated response (this channel is advertised as "100% human, no automated responses" — only a delivery confirmation, which is standard transactional)
- Logged via `logEmailDelivery` like the other sends.

### 4. Test
Submit the Direct-to-Coach form as a Premium user → confirm:
- `harisfalas@gmail.com` receives an email with the full original message clearly visible
- Sender receives the "message received" confirmation
- Reply button in your Gmail goes to the sender

## Files changed
- `supabase/functions/send-direct-coach-email/index.ts` (rewrite only)

No DB migration, no settings UI changes, no impact on the general contact form.