## Problem

The 10 micro-workout covers (`MICRO-WORKOUTS` category) are generic gym shots — flying jumps, gym push-ups — that contradict the category's description: *"No time for a run or a trip to the gym? Exercise snacks are the answers. All you need is some stairs, a chair, a wall, or just your body."*

Root cause: none of the three image generators (`auto-generate-workout-image`, `regenerate-workout-image`, `generate-workout-image`) has a branch for `MICRO-WORKOUTS`. They fall through to the generic "gym/outdoor/home" prompt, so the AI defaults to gym scenes.

Stripe products are linked 1:1 to each micro-workout (all 10 have `stripe_product_id`), and the existing sync pushes `images[0]` on update — but we need to verify each product actually shows the new image after the run, not assume.

## Fix

### 1. Add a MICRO-WORKOUTS branch to all three image generators

Files:
- `supabase/functions/auto-generate-workout-image/index.ts`
- `supabase/functions/regenerate-workout-image/index.ts`
- `supabase/functions/generate-workout-image/index.ts`

New `isMicro` branch (placed BEFORE the generic else), with strict allowed/banned imagery:

```text
- Show a real-life "exercise snack" scene — someone training in 5 minutes WITHOUT a gym
- Setting MUST be one of: home living room, bedroom, hallway, kitchen, office/desk area,
  outdoor stairs, indoor stairwell, against a wall, on a chair/sofa, sidewalk, park bench,
  hotel room, street corner. Casual everyday clothing (not gym attire).
- Exercise MUST use only the body + at most one of: chair, wall, stairs, sofa, desk,
  resistance band, foam roller, medicine ball, Swiss/fit ball
- Example moves to show: chair tricep dips, wall sits, stair step-ups, sofa Bulgarian
  split squats, desk incline push-ups, standing calf raises on a stair, wall push-ups,
  bodyweight squats in the living room
- Mood: quick, accessible, real, "I can do this right now"
- BANNED: gym interiors, barbells, dumbbells, kettlebells, weight plates, cable machines,
  squat racks, benches, treadmills, mid-air "flying" jumps, athletes in professional gym
  attire, dramatic sports photography energy
```

The existing PHYSICAL REALITY / BANNED POSES block stays in place.

### 2. Regenerate all 10 existing micro-workout covers

Loop the 10 `MICRO-WORKOUTS` rows and call `regenerate-workout-image` for each. The function already:
- saves the new file to `avatars/workout-covers/`,
- updates `admin_workouts.image_url`,
- POSTs `images[0]` to the linked Stripe product.

### 3. Verify Stripe sync — actually verify, not assume

After each regeneration:
1. Read `admin_workouts.image_url` back from the DB.
2. Call Stripe `GET /v1/products/{id}` for that workout's `stripe_product_id`.
3. Assert `product.images[0] === image_url`.
4. Build a results table (workout id, name, db image, stripe image, match Y/N).

If any row mismatches, retry the Stripe update once, then re-verify. Only report "done" once all 10 rows are `match=Y`.

### 4. Persist the rule

Add a project memory `mem://content-creation/micro-workout-image-standard` capturing:
- Allowed settings + props (chair/wall/stairs/sofa/desk + optional band/foam roller/medicine ball/Swiss ball)
- Banned: gyms, barbells/dumbbells/kettlebells/machines, flying poses
- Every micro-workout cover MUST be regenerated through these generators and re-synced to Stripe; no manual gym stock photos.

Add the rule reference to the index Core list so future micro-workout image jobs respect it.

## Technical notes

- All three generators share the same prompt skeleton; the new `isMicro` branch is a copy-paste pattern matching the existing `isPilates` / `isRecovery` branches.
- Stripe verification uses the `STRIPE_SECRET_KEY` secret already present.
- No schema changes, no migrations, no UI changes — backend prompt + one-time regenerate + verification only.
- Existing `enforce_micro_workout_rules` DB trigger already normalizes category metadata; we are only changing imagery, not touching that trigger.