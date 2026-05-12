# Fix the broken "Cadence Push Reel" cover image

## What's wrong

The current cover for **Cadence Push Reel** (`WOD-CA-E-1778482202216`, Stripe `prod_UUnFDkup6K0HwM`) shows a woman in a horizontal plank position with her hands clapped together in mid-air, not touching the floor. She appears to be floating. It is an anatomical glitch from the AI generator — not normal, not acceptable for a paid product cover.

Note: you said "Cadence Push Rim" — there is no workout by that exact name. The closest match (and the WOD currently visible on `/workout/wod`) is **Cadence Push Reel**. I will fix that one. If you actually meant a different workout, tell me the name and I'll redo this on the right asset.

## What I will do

1. **Regenerate the cover image** with a corrected prompt that explicitly enforces:
   - Hands flat on the floor in a proper push-up / plank position, OR
   - A clearly grounded standing/dynamic pose
   - No floating limbs, no mid-air clapping, anatomically correct contact with the ground
   - Same brand look (bright gym, daylight, athletic woman, teal/orange accent palette) so it stays consistent with the other Cadence covers
2. **Save it** to `avatars/workout-covers/` in storage with a new filename and update `admin_workouts.image_url` for `WOD-CA-E-1778482202216`.
3. **Update the Stripe product** `prod_UUnFDkup6K0HwM` so its `images` array points to the new URL — no rename, no price change, no metadata change. Only the image is swapped.
4. **Verify**: re-open the new image, confirm hands are on the floor, then confirm the Stripe product reflects the new image URL.

## Out of scope (not touching)

- Workout name, slug, ID, content, sections, exercises, prompts, density rules
- Stripe product name, price, metadata, product ID
- Any other workout's image
- Any code, route, or business-logic change

## Technical notes

- Image generation: `imagegen--generate_image` with `model: premium` and a tight anatomical-grounding prompt, 1024x1024, no transparent background.
- DB write: single `UPDATE admin_workouts SET image_url = ... WHERE id = 'WOD-CA-E-1778482202216'` via migration.
- Stripe sync: `stripe--stripe_api_execute` to `POST /v1/products/prod_UUnFDkup6K0HwM` with `images[]` set to the new public URL.
- If the WOD has a published variant pair, only this one cover changes; nothing else in the WOD pipeline is touched.