You are right. The fix must cover both sides:

- Existing bad names already shown on the website
- The associated Stripe products using the same bad names
- Future WOD generation so this never happens again

Plan:

1. Fix the generator so public names never contain internal codes
   - Remove the current fallback that appends codes like `0427BW`, `0427EQ`, or `0427V`.
   - That code exists because the system was trying to avoid duplicate workout names, but it exposed an internal uniqueness suffix to customers. That is not acceptable.
   - Replace it with a clean professional naming fallback.

2. Add a final name safety check before saving
   - Before any new WOD is saved, validate the final name.
   - Reject or replace names containing:
     - Date/equipment suffixes: `0427BW`, `0427EQ`, `0427V`
     - Random serial numbers
     - Version-style endings: `II`, `V2`, `#1`, etc. when used only to avoid duplication
     - Anything that looks like an internal code instead of a customer-facing workout name
   - If a generated name fails, replace it with a clean name such as:
     - `Core Tempo Circuit`
     - `Midline Control Session`
     - `Athletic Core Builder`
     - `Bodyweight Core Flow`

3. Strengthen the AI naming instructions
   - Update the WOD prompt so names must be professional, human-readable, and customer-facing.
   - Explicitly ban dates, codes, random letters, equipment suffixes, serial numbers, and lazy duplicate variations.
   - Keep the rule: names should be short, serious, premium, and relevant to the workout focus.

4. Rename existing bad workout records
   - Search existing workouts for names ending with patterns like:

```text
0427BW
0427EQ
0427V
0328BW
1125EQ
```

   - Rename only those bad names.
   - Preserve the workout ID, content, image, purchase settings, visibility, WOD date, and all metadata.
   - This avoids breaking existing links or user purchases.

5. Update associated Stripe products
   - For each renamed workout that has an associated Stripe product, update the Stripe product name to match the cleaned workout name.
   - Do not recreate products.
   - Do not change prices.
   - Do not touch purchase history.
   - Only update the public product name, and if needed the product description/metadata name reference.

6. Add a maintenance safety net
   - Add a reusable helper in the WOD generation function to sanitize workout names consistently.
   - Use it after AI generation and before database insert/update.
   - Log when a bad name is caught, so future issues can be detected quickly.

Technical implementation notes:

- Main generator file: `supabase/functions/generate-workout-of-day/index.ts`
- Problematic current logic:

```ts
const dateSuffix = effectiveDate.replace(/-/g, '').slice(-4);
const eqSuffix = equipment === "EQUIPMENT" ? "EQ" : equipment === "BODYWEIGHT" ? "BW" : "V";
const uniqueName = `${nameToCheck} ${dateSuffix}${eqSuffix}`;
```

- This will be replaced with a clean name fallback/sanitizer.
- Existing database records will be cleaned through Lovable Cloud database changes.
- Stripe product names will be updated through the Stripe integration, matching the corrected website names.

Expected result:

- No customer sees names like `Velocity Core Cadence 0427BW` again.
- Existing bad workout names are cleaned.
- Matching Stripe product names are cleaned.
- Future WODs are protected by validation before they go live.