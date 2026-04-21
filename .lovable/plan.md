
# Smarty Coach Fix Plan

## What is actually broken

1. Program suggestions are navigating to the wrong route.
   - Current code in `ProgramSuggestionFlow.tsx` sends users to `/programs/{slug}/{id}`.
   - The app routes in `src/App.tsx` are actually `/trainingprogram/:type/:id`.
   - That is why “View Program” lands on 404.

2. The floating Smarty Coach button is not global.
   - Right now it is only mounted inside `WorkoutFlow.tsx` and `WorkoutDetail.tsx`.
   - So it only appears on those pages instead of being persistent across the site.

3. Program fallback logic is too weak.
   - If no strong match exists, `programSuggestionEngine.ts` can fall back to an arbitrary first item.
   - It does not clearly explain “12 weeks is unavailable, but this 6-week option is the closest match.”
   - This is why the program logic feels less intelligent than the workout flow.

4. There is also a modal accessibility warning.
   - `SmartyCoachModal.tsx` uses a plain `<p>` under `DialogTitle` instead of a proper dialog description component.
   - That is causing the Radix warning shown in the console.

---

## What I will change

### 1. Fix all Smarty Coach destination links
Create one centralized route-mapping helper for Smarty Coach suggestions so workouts, programs, and articles always navigate to valid pages.

This helper will:
- map program categories to the real program route slugs:
  - `CARDIO ENDURANCE` → `cardio-endurance`
  - `FUNCTIONAL STRENGTH` → `functional-strength`
  - `MUSCLE HYPERTROPHY` → `muscle-hypertrophy`
  - `WEIGHT LOSS` → `weight-loss`
  - `LOW BACK PAIN` → `low-back-pain`
  - `MOBILITY & STABILITY` → `mobility-stability`
- build program URLs as:
  - `/trainingprogram/{slug}/{id}`
- keep article URLs as:
  - `/blog/{slug}`
- align workout URLs with the app’s existing route expectations as well, so Smarty Coach never generates invalid category paths.

Files:
- `src/components/smarty-coach/ProgramSuggestionFlow.tsx`
- `src/components/smarty-coach/SmartyCoachModal.tsx`
- new shared helper such as `src/utils/smarty-coach/routes.ts`

### 2. Make Smarty Coach permanently visible site-wide
Move the button from page-level rendering to the app shell so it stays visible during navigation.

Implementation:
- mount a single `<SmartyCoachButton />` in `App.tsx` inside the main customer-facing layout
- remove duplicate button renders from:
  - `src/pages/WorkoutFlow.tsx`
  - `src/pages/WorkoutDetail.tsx`

Result:
- the button stays visible on homepage, blog, workouts, programs, dashboard, auth pages, and all regular site pages
- no duplicate buttons
- no page-specific mounting gaps

### 3. Upgrade program suggestion logic to real “closest match” behavior
Refactor `programSuggestionEngine.ts` so it behaves like a recommendation engine, not a raw first-item fallback.

New logic order:
1. Prefer exact matches:
   - category
   - difficulty
   - duration/weeks
   - equipment
2. If no exact duration exists:
   - choose the closest available duration in the same category
   - keep equipment and difficulty as high-priority constraints where possible
3. If difficulty is unavailable:
   - allow adjacent difficulty with an explicit explanation
4. Never fall back to a random first program.

Example reason text:
- “No 12-week Functional Strength bodyweight program is available right now.”
- “This 6-week option is the closest match for your goal and level.”
- “Intermediate was prioritized, and duration was matched as closely as possible.”

### 4. Align workout fallback behavior with the same standard
The workout engine currently also has a weak last-resort fallback (`allContent[0]`).

I will align workout and program behavior so both use the same rule:
- exact match first
- closest sensible alternative second
- always explain the compromise
- never suggest a random item without context

Files:
- `src/utils/smarty-coach/suggestionEngine.ts`
- `src/utils/smarty-coach/programSuggestionEngine.ts`

### 5. Preserve completion/in-progress exclusions
Keep the exclusion logic already added, but make sure it remains part of the new fallback system.

That means:
- completed workouts are still excluded
- completed programs are still excluded
- ongoing programs are still excluded
- closest-match fallback only considers eligible content

Files:
- `src/hooks/useSmartyContext.ts`
- `src/utils/smarty-coach/suggestionEngine.ts`
- `src/utils/smarty-coach/programSuggestionEngine.ts`

### 6. Remove the current Smarty Coach modal warning
Update the dialog header to use proper accessible dialog metadata.

Implementation:
- add `DialogDescription` to `SmartyCoachModal.tsx`
- wire it correctly so the modal no longer shows the missing description warning

File:
- `src/components/smarty-coach/SmartyCoachModal.tsx`

---

## Expected result after the fix

- “View Program” opens the correct program page instead of 404.
- Smarty Coach is permanently visible across the whole website, not only on workout pages.
- Program suggestions feel intelligent:
  - exact match when available
  - closest valid alternative when not
  - clear explanation when a perfect 12-week match does not exist
- Workout and program suggestion logic behave consistently.
- Existing access behavior stays intact:
  - users can complete the questionnaire
  - tapping the result still follows the normal site access rules on the destination page
- current dialog warning is removed.

---

## Files to update

- `src/App.tsx`
- `src/pages/WorkoutFlow.tsx`
- `src/pages/WorkoutDetail.tsx`
- `src/components/smarty-coach/SmartyCoachModal.tsx`
- `src/components/smarty-coach/ProgramSuggestionFlow.tsx`
- `src/utils/smarty-coach/suggestionEngine.ts`
- `src/utils/smarty-coach/programSuggestionEngine.ts`
- new shared route helper in `src/utils/smarty-coach/`

## No backend/database changes needed
This is a frontend routing, rendering, and recommendation-logic fix. No new tables or migrations are required for this round.
