I verified the problem. The 12 workouts have content in the database, but the live workout pages are not showing it because the public workout metadata function returns premium workout text as null before purchase/subscription. That means the detail page receives the image and payment metadata, but not the workout sections, so it renders like “only the picture”.

Plan:
1. Restore the 12 workouts into the exact standardized section columns
   - Move each workout from one oversized `main_workout` blob into the proper fields: `warm_up`, `activation`, `main_workout`, `finisher`, `cool_down`, plus `instructions` and `tips`.
   - Preserve all existing exercise-library tokens so the eye/exercise linking remains available.

2. Fix the detail-page data path for entitled users only
   - Keep public visitors/paywall users protected.
   - After `AccessGate` confirms the user has premium/subscription or purchased access, load the full workout row for that entitled user so content appears.
   - Do not expose paid workout content through the public metadata list.

3. Add a visible fail-safe for purchased/premium users
   - If an entitled user lands on a workout with missing sections, show a clear content-loading/error state instead of silently showing only the image.

4. Verify properly before reporting done
   - Database audit: 12/12 workouts have content in all standard section fields.
   - Library-token audit: exercise IDs still resolve to exercise library entries.
   - Stripe audit: product and price IDs remain linked.
   - Browser verification: open one bodyweight and one equipment workout page and confirm sections render beyond the hero image.

Technical notes:
- Files involved: `src/hooks/useWorkoutData.ts`, `src/pages/IndividualWorkout.tsx`, and a one-time database update for these 12 workout rows.
- The public RPC should remain metadata-only for premium content; the fix should load full content only through the authenticated table query after access is validated.