

# Smarty Coach — Full Redesign Plan

## Summary

Rename "Smartly Suggest" to "Smarty Coach," make the floating button visible to all users (including visitors), enlarge the button with a Brain icon, and add a new top-level "I want to..." menu with four paths. All users can complete the full questionnaire in every path. The suggestion result is shown at the end with full details. When a user taps the suggestion card, standard navigation happens and the existing AccessGate on the destination page handles any upgrade/login prompt as it already does today.

The suggestion engines for both workouts and programs will check the user's interaction history and avoid suggesting content that the user has already completed or is currently in progress.

---

## What Changes

### 1. Rename everywhere
- Directory `src/components/smartly-suggest/` to `src/components/smarty-coach/`
- Directory `src/utils/smartly-suggest/` to `src/utils/smarty-coach/`
- All component names: `SmartlySuggest*` to `SmartyCoach*`
- All references: tooltip, dialog title, import paths in `WorkoutFlow.tsx`, `WorkoutDetail.tsx`, and any other consumers

### 2. Floating button changes (`SmartyCoachButton.tsx`)
- Remove the `if (userTier !== 'premium') return null` gate — show for everyone
- Increase button size: `h-16 w-16` (from `h-14 w-14`)
- Replace `Lightbulb` icon with `Brain` from `lucide-react`
- Tooltip: "Smarty Coach"

### 3. New "I want to..." entry screen (Step 0 in the modal)
When the modal opens, show four large options before any questionnaire:

| Option | Label | Flow |
|--------|-------|------|
| Workout | "Start a Workout" | Existing 5-step workout questionnaire |
| Program | "Start a Program" | New 4-step program questionnaire |
| Measure | "Make a Measurement" | Navigate to `/userdashboard?scroll=active-goals` and close modal |
| Knowledge | "Upgrade My Knowledge" | New 2-step blog questionnaire |

### 4. Access control: normal flow, no special gate
- Every user (guest, free subscriber, premium) completes the full questionnaire for any path.
- The suggestion card at the end shows the workout/program/article name, image, category, difficulty — fully visible, no lock overlay.
- Tapping the suggestion card navigates to the content page (e.g. `/workout/strength/WOD-123` or `/programs/functional-strength/TP-005`).
- The existing AccessGate component on the workout/program detail page handles the rest: if the user lacks access, they see the standard upgrade/purchase prompt. If they are a guest, they see the login prompt. No new gate logic inside Smarty Coach.

### 5. Avoid suggesting completed and in-progress content

**Workouts:**
- The existing `useSmartyContext` already fetches `workout_interactions` and derives `completedWorkoutIds`. The existing `suggestionEngine.ts` already gives a small bonus for uncompleted workouts (`+5`).
- Change: convert the `+5` bonus into a hard penalty (`-1000`) for workouts where `is_completed = true` in the user's `workout_interactions`, so completed workouts are never suggested.

**Programs:**
- The `useSmartyContext` already fetches `program_interactions` with `is_completed` and `is_ongoing` fields.
- Add two new derived arrays to the context: `completedProgramIds` (from `program_interactions` where `is_completed = true`) and `ongoingProgramIds` (from `program_interactions` where `is_ongoing = true`).
- The new `programSuggestionEngine.ts` will apply a hard penalty (`-1000`) for any program that is already completed or currently in progress, so it is never suggested.
- Note: the existing `completedProgramIds` derived from `user_activity_log` tracks day completions, not full program completions. The new derivation from `program_interactions.is_completed` is the correct source.

**Context data for visitors/free users:**
- Change the `enabled` flag on the `workout_interactions` and `program_interactions` queries in `useSmartyContext` from `!!userId && isPremium` to just `!!userId`, so interaction history is available for all logged-in users. Visitors (not logged in) will have empty arrays, so all content is eligible for suggestion.

### 6. "Start a Workout" flow (existing, unchanged logic)
Same 5-step questionnaire as today (mood, energy, goal, duration, equipment). The only change is the completed-workout penalty described above.

### 7. New "Start a Program" flow (4 questions)
Sequential chip-selection steps for all users:

**Step P1 — Category:**
Cardio Endurance, Functional Strength, Muscle Hypertrophy, Weight Loss, Low Back Pain, Mobility and Stability

**Step P2 — Difficulty:**
Beginner, Intermediate, Advanced

**Step P3 — Duration:**
4 weeks, 6 weeks, 8 weeks, 12 weeks

**Step P4 — Equipment:**
No equipment (bodyweight), Equipment available

**Result:** Query `admin_training_programs` (which is publicly readable via RLS) filtered by the four answers, score by best match, exclude completed and in-progress programs, display the top program card. Tapping it navigates to the program detail page where AccessGate handles premium gating.

### 8. New "Upgrade My Knowledge" flow (2 questions)

**Step K1 — Category:**
Fitness, Nutrition, Wellness

**Step K2 — Recency:**
"Something new" (recent articles first) or "A classic read" (older articles)

**Result:** Query `blog_articles` (published ones are publicly readable) filtered by category and recency, display the top article card. Tapping navigates to `/blog/{slug}`.

### 9. New DB table: `blog_article_views`

```sql
CREATE TABLE public.blog_article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES blog_articles(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);
ALTER TABLE public.blog_article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reads" ON public.blog_article_views
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reads" ON public.blog_article_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

The blog detail page will upsert into this table on view. The knowledge flow will deprioritize already-read articles for logged-in users.

---

## Files Touched

| File | Action |
|------|--------|
| `src/components/smartly-suggest/*` | Rename directory to `src/components/smarty-coach/`, rename all files and exports |
| `src/components/smarty-coach/SmartyCoachButton.tsx` | Bigger button, Brain icon, visible to all tiers |
| `src/components/smarty-coach/SmartyCoachModal.tsx` | Add "I want to..." entry screen, embed workout flow, program flow, knowledge flow |
| `src/components/smarty-coach/ProgramSuggestionFlow.tsx` | New: 4-step program questionnaire + scoring + result card |
| `src/components/smarty-coach/KnowledgeSuggestionFlow.tsx` | New: 2-step blog questionnaire + result card |
| `src/utils/smartly-suggest/*` | Rename directory to `src/utils/smarty-coach/` |
| `src/utils/smarty-coach/suggestionEngine.ts` | Change completed-workout bonus to hard penalty (-1000) |
| `src/utils/smarty-coach/programSuggestionEngine.ts` | New: scoring logic for programs (category, difficulty, duration, equipment) with hard penalty for completed/ongoing programs |
| `src/utils/smarty-coach/knowledgeSuggestionEngine.ts` | New: article selection logic (category, recency, read status) |
| `src/hooks/useSmartyContext.ts` | Add `completedProgramIds` and `ongoingProgramIds` derived from `program_interactions`; change `enabled` flags from `isPremium` to `!!userId` for interaction queries |
| `src/pages/WorkoutFlow.tsx` | Update import path |
| `src/pages/WorkoutDetail.tsx` | Update import path |
| Blog detail page | Add upsert to `blog_article_views` on page load |
| DB migration | Create `blog_article_views` table with RLS |

## What Will NOT Change
- The existing workout suggestion scoring engine logic (same flow, just the completed penalty change)
- The AccessGate component and its behavior on workout/program pages
- Training program or workout content in the database
- The `program_interactions` or `workout_interactions` tables (already have all needed columns)
- Any page layouts, themes, or navigation outside the Smarty Coach modal

