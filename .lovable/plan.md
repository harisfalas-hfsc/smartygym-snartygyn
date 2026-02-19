

# Fix: Delete the Still-Deployed `generate-welcome-workout` Edge Function

## The Problem

The `generate-welcome-workout` edge function was **deleted from the codebase** previously, but it was **never removed from the deployed environment**. It is still running in production.

Evidence:
- The function's logs show it was active at 12:18 UTC today -- right after the test user was created
- The `user_purchases` table has a record for the test user: "Tempo Sprint Circuit (Welcome Gift)" at price 0.00, created at 12:15 UTC
- The function code (`supabase/functions/generate-welcome-workout/`) does not exist in the repository
- But the function is still deployed and being triggered

This means every new user signup is generating a complimentary welcome workout and inserting a $0 purchase record -- even though you thought this was removed.

## The Fix

Delete the deployed edge function from the production environment. This is a single command -- no code changes needed since the code is already gone.

## Steps

1. **Delete the deployed function** using the Supabase delete edge function tool for `generate-welcome-workout`
2. **Verify** it no longer appears in function logs

## Optional Cleanup

If you want, we can also:
- Delete the test user's phantom purchase record ("Tempo Sprint Circuit (Welcome Gift)")
- Delete the orphaned workout record (`WEL-CA-E-1771503308759`) from `admin_workouts`

| Action | Target |
|--------|--------|
| Delete deployed function | `generate-welcome-workout` |
| (Optional) Clean up purchase | Remove $0 welcome gift purchase for test user |
