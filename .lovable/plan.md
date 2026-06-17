## Two changes only

### 1. Smarty Programs page → Weight Loss CATEGORY card gets a different image
- Generate one new image (waist measuring-tape theme, navy/teal grade) and save to `public/images/programs/weight-loss-card-mobile.jpg` (and matching `weight-loss-bg.jpg`), overwriting the current files.
- These files are referenced by `src/pages/TrainingProgramFlow.tsx` for the Weight Loss category tile only.
- The 90-Day Shred Challenge currently points its `image_url` to `https://smartygym.com/images/programs/weight-loss-card-mobile.jpg` — that DB row is NOT touched, so the program card/detail page will update to the new image automatically (same URL, new content) and stay in sync with itself.

### 2. Sync Stripe product image with the 90-Day Shred Challenge
- Call the existing `update-stripe-product` edge function for `prod_TiX1ILxJNwxNyv` with `imageUrl = https://smartygym.com/images/programs/weight-loss-card-mobile.jpg`.
- After this, the Stripe checkout image matches the program's `image_url` exactly.

## Not touched
- No DB writes.
- No code edits in `TrainingProgramFlow.tsx` or any component.
- No changes to any other program or category.

## Files
- Overwrite: `public/images/programs/weight-loss-card-mobile.jpg`, `public/images/programs/weight-loss-bg.jpg`
- Stripe API call only — no edge function code change.
