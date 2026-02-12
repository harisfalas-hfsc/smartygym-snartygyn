

# Enable Email Verification Before Account Activation

## What Changes

Right now, when someone signs up, the account is created instantly -- welcome email sent, welcome workout generated, dashboard notification created -- even if the email is completely fake. This wastes Resend credits and creates ghost accounts.

After this change, the flow will be:

1. User fills in signup form and submits
2. A verification email is sent to the provided email address (this is the welcome email, with a "Verify Your Account" button)
3. **Nothing else happens yet** -- no account activation, no welcome workout, no dashboard notification
4. User clicks the "Verify" button in the email
5. Account is confirmed and the user lands on the app
6. **Only then** do all the post-signup actions fire: welcome workout generation, dashboard welcome notification, avatar setup, etc.

## Technical Details

### 1. Disable auto-confirm for email signups
Use the configure-auth tool to turn off `autoconfirm` for email signups. This makes the authentication system require email verification before the account is usable.

### 2. Restructure `Auth.tsx` signup flow
Currently, right after `supabase.auth.signUp()`, the code immediately fires:
- `send-system-message` (welcome notification)
- `generate-welcome-workout` (complimentary workout)
- Avatar setup dialog
- Success toast

All of this needs to move to **after email verification**. On signup, the only thing that happens is a toast telling the user to check their email.

### 3. Move post-signup actions to the auth state listener
When the user clicks the verification link and lands back on the app, the `onAuthStateChange` listener fires. At that point, we detect it's a first-time verified user and trigger:
- Welcome workout generation
- Welcome dashboard notification
- Avatar setup dialog
- Redirect to tour

### 4. Modify the welcome email to include a verification button
Update the `send-welcome-email` edge function (which is triggered by a database trigger on profile creation) to include the verification/confirmation link. Since the authentication system sends its own confirmation email, we have two options:
- **Option A**: Use the authentication system's built-in confirmation email (simplest, most reliable) and keep the welcome email as a separate follow-up after verification
- **Option B**: Customize the confirmation email template to look like the current welcome email with a verify button

We'll go with **Option A** -- the authentication system handles the verification email automatically. The existing welcome email trigger will be adjusted to only fire after the user is confirmed.

### 5. Prevent the database trigger from firing prematurely
The `trigger_welcome_email` trigger fires on profile creation (which happens via `handle_new_user` trigger on `auth.users` insert). Since the profile is created even for unverified users, this trigger currently sends the welcome email immediately to potentially fake addresses. We need to either:
- Remove the DB trigger and handle the welcome email only after confirmation
- Or add a check in the trigger to skip unverified users

### 6. Handle the `handle_new_user` trigger
The profile is still created on signup (this is fine -- the authentication system needs the profile row). But the welcome email and welcome workout should not fire until verification.

## Summary of File Changes

| File | Change |
|------|--------|
| Auth config | Disable auto-confirm for email signups |
| `src/pages/Auth.tsx` | Remove post-signup actions from `handleSignUp`; add post-verification logic in `onAuthStateChange` |
| Database migration | Modify `trigger_welcome_email` to check if user email is confirmed before firing |
| `supabase/functions/send-welcome-email/index.ts` | Add email confirmation check as safety net |

