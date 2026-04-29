I understand the frustration. I checked the basics instead of doing another deep production audit.

What I confirmed right now:

1. The backend data is present for today.
   - Today's WODs exist:
     - Cadence Shift Flow
     - Cadence Ground Pilates
   - Both are visible, marked as Workout of the Day, have images, and are returned by the safe public metadata function.

2. The /workout/wod page works in the preview.
   - I tested mobile width matching your current viewport.
   - It shows both WOD cards.
   - The “Today's Workouts are Being Prepared” fallback is not visible there.

3. The /workout page works in the preview.
   - Workout of the Day is visible as a card/category.
   - Its background/image appears.
   - No “being prepared” message appears.

4. The actual homepage content at /home works in the preview.
   - “Your Workout of the Day” appears.
   - It shows both workout names.
   - No “Today's Workouts are Being Prepared” message appears.

5. The root / page is not the full homepage.
   - It currently shows a “Hello, Smarty / Ready to crush your goal?” landing router.
   - It links to /home for the real homepage.
   - This can easily look like the homepage is missing the WOD card, because the root page does not render the homepage cards at all.

6. There is also a free-trial popup showing over the page.
   - On mobile, it covers most of the screen and can make the page look broken or like cards are missing.
   - The WOD card exists behind it on /home, but the popup blocks the view.

Confirmed code risks I found:

1. Duplicate WOD fetching logic exists in several places.
   - Homepage /home
   - /workout
   - /workout/wod
   - Announcement modal
   - WorkoutOfTheDay component
   - useWorkoutData hook

2. Some public-facing pages still contain direct reads from admin_workouts.
   - Some are probably harmless counts/archive/admin-only, but they must be reviewed carefully because this was the cause of earlier false “being prepared” states.

3. The fallback message still exists in multiple components.
   - That is okay only if the shared WOD fetch confirms no WODs exist.
   - Right now it is duplicated, which increases the risk of one page being fixed while another page breaks.

Stabilization plan:

1. Create one shared WOD metadata helper/hook.
   - One source of truth for “today's WODs”.
   - It will use Cyprus date.
   - It will use the safe public metadata function.
   - It will normalize equipment values such as BODYWEIGHT, EQUIPMENT, VARIOUS, bodyweight, none.
   - It will return:
     - allTodayWods
     - bodyweightWod
     - equipmentWod
     - variousWod
     - isRecoveryDay
     - hasWods
     - loading/error state

2. Replace duplicated WOD logic with the shared helper.
   - Update /home WOD card.
   - Update /workout/wod.
   - Update WorkoutOfTheDay component.
   - Keep announcement logic aligned with the same shared rule.
   - This prevents future contradictions where one page says WOD exists and another says “being prepared”.

3. Fix the root/home confusion.
   - Make the real homepage visible at /, or make the landing router clearly route users to the homepage without hiding core business cards.
   - Recommended: change / to render the actual homepage and move the “Ready to crush your goal?” chooser to /start.
   - This matches user expectation: smartygym.com should show the homepage, not a chooser page that hides WOD cards.

4. Reduce popup obstruction on key pages.
   - Do not show the free-trial popup immediately over /home and /workout/wod while we are trying to confirm core content visibility.
   - Keep the popup available, but avoid blocking the first view of critical business content.
   - Recommended: do not show it on /workout/wod and delay/suppress it on /home mobile until after the user scrolls or waits longer.

5. Audit and clean public direct admin_workouts reads.
   - Review each public direct table read found in:
     - useWorkoutData
     - WorkoutFlow category counts
     - WODArchive
     - SmartyCoachModal
   - Keep admin-only reads inside admin components.
   - Convert public-facing reads to safe metadata functions where needed.

6. Add a lightweight WOD smoke test/check.
   - Not a deep audit.
   - A focused check that verifies:
     - today's WOD metadata returns at least one valid card
     - /home logic receives the same WODs
     - /workout/wod logic receives the same WODs
     - fallback only appears when zero WODs are returned

7. Verification after changes.
   - Test mobile viewport 390px wide.
   - Verify / shows the correct homepage behavior.
   - Verify /home shows “Your Workout of the Day” with Cadence Shift Flow and Cadence Ground Pilates.
   - Verify /workout/wod shows both cards.
   - Verify /workout shows WOD category/card.
   - Verify no false “Today's Workouts are Being Prepared” state appears when WODs exist.

Technical details:

```text
Current confirmed issue is not missing WOD data.
The WOD data exists and the WOD page can render it.

The remaining stability problem is fragmented frontend logic:
multiple components independently decide whether WOD exists.
That makes fixes fragile.

The safe fix is to centralize WOD visibility logic and remove duplicate assumptions.
```

I will not do a broad redesign or another deep audit. This is a focused basic-functionality stabilization pass: cards visible, data path consistent, no false fallback, no popup hiding the result.