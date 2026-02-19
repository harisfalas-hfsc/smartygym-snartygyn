

# Create a Pre-Verified Test User for Trial Testing

## What We'll Do

Create a small edge function that uses the admin API to create a verified test user, then call it once to generate the account. This gives you a fresh user with no Stripe history, perfect for testing the 7-day trial checkout.

## Test Account Credentials

- **Email**: `trialtest@smartygym.com`
- **Password**: `TrialTest2025!`

## Steps

### 1. Create a utility edge function `create-test-user`
A simple one-time-use function that:
- Creates a user via the admin API with `email_confirm: true` (skips verification)
- Auto-creates the profile (existing trigger handles this)
- Returns the credentials for confirmation

### 2. Call the function to create the user
Invoke it once to seed the account into the database.

### 3. Test the trial flow
- Log in with `trialtest@smartygym.com` / `TrialTest2025!`
- Go to Smarty Plans
- Click "Start 7-Day Free Trial" on Gold
- Verify the Stripe checkout page shows the trial details clearly

### 4. Clean up
Delete the `create-test-user` edge function after use (it's only needed once).

## Technical Details

The edge function will use `supabase.auth.admin.createUser()` with `email_confirm: true` to bypass email verification. The existing `handle_new_user` trigger will automatically create the profile row.

| Action | File |
|--------|------|
| Create | `supabase/functions/create-test-user/index.ts` |
| Invoke | Call function once to create the account |
| Delete | Remove function after account is created |

