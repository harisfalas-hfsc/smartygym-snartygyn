## Goal
Make all newly generated workout and program cover images load fast on mobile by converting them to WebP format and resizing to 800px wide before upload. No visual quality change, no risk to WOD generation, Stripe, or any other feature.

## Scope (only 2 files)

### 1. `supabase/functions/generate-workout-image/index.ts`
After the AI returns the base64 PNG, before uploading to storage:
- Decode the PNG buffer using `imagescript` (Deno-compatible, no native deps)
- Resize to max 800px wide, keeping aspect ratio (16:9 → ~800x450)
- Re-encode as WebP at quality ~82
- Upload with filename `workout-{ts}-{rand}.webp` and `contentType: "image/webp"`
- Wrap resize/convert in try/catch — on any failure, fall back to uploading the original PNG (so worst case = today's behavior)

### 2. `supabase/functions/generate-program-image/index.ts`
Same exact change as above, with filename `program-{ts}-{rand}.webp`.

## What does NOT change
- AI prompt, model (`google/gemini-2.5-flash-image-preview`), generation logic
- WOD orchestrator, retries, library-first selection, 06:30/06:50 UTC cron, archival
- Stripe product/price flows (Stripe doesn't read image bytes)
- Existing PNG images in storage (left untouched, keep working)
- Database schema, `image_url` column, frontend `<img>` tags
- All other edge functions

## Risk assessment
- **WOD generation:** zero impact — the orchestrator only checks that `image_url` is set, format is irrelevant
- **Stripe:** zero impact — Stripe checkout supports WebP natively
- **Browser display:** zero impact — WebP supported in all browsers used by your audience (Chrome, Safari, Firefox, Edge since 2020)
- **Edge function timeout:** resize takes ~200-500ms, well within Edge limits
- **Fallback:** if `imagescript` ever fails to decode/encode, we upload the original PNG so the workout still gets an image

## File size impact (expected)
- Current: ~2-3 MB PNG @ 1920px
- After: ~150-300 KB WebP @ 800px
- ~85-90% smaller, identical visual quality at card display size

## Deliverable
Two edge function edits. Auto-deployed. Next workout/program created uses the optimized pipeline.
