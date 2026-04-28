No, I am not going to leave paid content RLS like this.

Clear answer: the website is working right now, but the paid-content database policy is too open. That is not acceptable for a production paid site. I paused it only because changing RLS too aggressively can instantly break browsing, checkout, WOD pages, and premium member access. The right fix is to harden it carefully, not leave it open and not make a rushed change that locks real users out.

## What I will do

### 1. Replace broad public read access
I will remove or narrow the current public read policies like:

```text
Public can view all workouts
Public can view all programs
```

Those policies currently allow too much direct database access.

### 2. Keep public browsing working
Visitors still need to see public/free content and marketing previews. I will keep safe public access for:

- visible free workouts/programs,
- public metadata needed for cards and listings,
- checkout pages that need product/price information,
- WOD preview/purchase flow.

I will not blindly block everything.

### 3. Protect paid full content at database level
Premium workout/program content should be readable only when the user is allowed:

- admin user,
- active Gold/Platinum member,
- user who purchased that exact standalone workout/program,
- free/non-premium content.

The database should enforce this, not only the frontend.

### 4. Add safe database helper functions
I will use server-side access-check functions so policies stay clean and avoid recursive RLS problems. The checks will cover:

- premium subscription status,
- individual purchases,
- admin role,
- free vs premium content.

### 5. Avoid breaking checkout
Standalone purchase flow must still work for free users. So I will make sure users can still read the minimum fields required to show and buy a paid item:

- id,
- name,
- description/summary if used by cards,
- image,
- price,
- Stripe product/price ids,
- category/type/difficulty/duration,
- premium/standalone flags.

If the current table structure cannot safely expose metadata while hiding full workout/program content, I will use a safer staged approach: keep public metadata readable, but lock full body/content fields behind secure access paths.

### 6. Verify access after the change
After applying the fix, I will verify these flows:

- guest can browse public pages,
- guest cannot read premium full content directly,
- free logged-in user can access free content,
- free user can buy standalone premium content,
- purchased user can access purchased content,
- Gold/Platinum user can access all premium content,
- premium user cannot buy standalone content,
- admin can still manage content,
- WOD remains visible and purchasable,
- checkout still starts correctly,
- no new console or network errors.

## Important safety note

I did not change paid-content RLS earlier because it is a high-impact production change. Done wrong, it can break the paid site immediately. But yes: it must be fixed. The correct production move is a controlled database policy hardening with verification, not leaving `USING true` on paid content forever.

## Technical implementation plan

### Database policy hardening
Create a migration that:

1. Adds or updates secure helper functions:
   - `has_role(auth.uid(), 'admin')`
   - premium subscription check
   - purchased workout check
   - purchased program check
   - content access check

2. Replaces broad public SELECT policies on:
   - `public.admin_workouts`
   - `public.admin_training_programs`

3. Allows SELECT only when one of these is true:
   - content is visible and free,
   - user is admin,
   - user has active premium membership,
   - user purchased the exact standalone item,
   - metadata access is needed for visible standalone purchase/listing flow.

4. Keeps admin insert/update/delete policies role-protected.

### Frontend compatibility check
Review and adjust queries in the main content pages/components if needed so locked content does not cause broken pages:

- workout listing/detail pages,
- training program listing/detail pages,
- WOD pages,
- shop/checkout cards,
- `PurchaseButton`,
- access-control hooks/context.

### Production verification
Run a focused post-change audit for:

- paid/free access,
- checkout,
- WOD,
- memberships,
- admin content management,
- browser console/network errors.

## Expected result

After this fix, paid content will no longer be exposed at the database level, while normal users should still experience the site smoothly: browse, log in, buy, access purchased content, or access everything with premium membership.