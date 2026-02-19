
# Fix: Welcome Email Re-sent on Every Login

## The Problem

When `hfsc.nicosia@gmail.com` logged in today, the system sent them a welcome email. This happened because:

1. **Auth.tsx (line 51-72)** checks on every login whether the user has a welcome message in the `user_system_messages` table
2. If no welcome message is found, it assumes the user is a first-time verified user and sends a welcome email
3. This user has **deleted** their welcome dashboard message -- so the table has zero records for them
4. Result: every login triggers a new welcome email

## The Fix

Instead of checking `user_system_messages` (which users can delete), check the `notification_audit_log` table -- which users cannot delete and permanently records that a welcome was sent.

### Changes to `src/pages/Auth.tsx`

Replace the current check (lines 52-57):
```typescript
// CURRENT (broken): checks deletable table
const { data: existingWelcome } = await supabase
  .from('user_system_messages')
  .select('id')
  .eq('user_id', session.user.id)
  .eq('message_type', 'welcome')
  .limit(1);
```

With a check against the audit log:
```typescript
// FIXED: checks non-deletable audit log
const { data: existingWelcome } = await supabase
  .from('notification_audit_log')
  .select('id')
  .eq('message_type', 'welcome')
  .limit(1);
```

**Wait** -- `notification_audit_log` has admin-only RLS, so the client can't query it. We need a different approach.

### Better Approach: Use the `profiles` table

Add a `welcome_sent` boolean flag to the `profiles` table. This is not deletable by users and provides a simple, fast check.

### Step 1: Database Migration
Add a `welcome_sent` column to `profiles`:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_sent boolean DEFAULT false;

-- Mark all existing users as having received welcome
UPDATE profiles SET welcome_sent = true;
```

### Step 2: Update Auth.tsx
Replace the welcome check with:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('welcome_sent')
  .eq('user_id', session.user.id)
  .single();

if (!profile?.welcome_sent) {
  // First-time verified user -- send welcome
  // ... existing welcome logic ...

  // Mark as sent
  await supabase
    .from('profiles')
    .update({ welcome_sent: true })
    .eq('user_id', session.user.id);
}
```

### Step 3: Update send-system-message Edge Function
After successfully sending the welcome message, also set `welcome_sent = true` on the profile (as a safety net using the service role).

## Why This Works

- Users cannot delete or modify the `welcome_sent` flag (no UPDATE RLS on this column needed -- it's set by the edge function with service role)
- Fast single-row lookup on an indexed table
- All existing users are pre-marked as `welcome_sent = true` so they won't get duplicate emails
- New users get marked immediately after their welcome is sent

## Files Changed

| Action | File |
|--------|------|
| Migration | Add `welcome_sent` column to `profiles` |
| Modify | `src/pages/Auth.tsx` -- use `welcome_sent` flag instead of message table |
| Modify | `supabase/functions/send-system-message/index.ts` -- set `welcome_sent = true` after sending |
