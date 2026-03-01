

# Make All Smarty Tools Public + Update Compare Access Levels Table

## 1. Make All Smarty Tools Public Routes

Move the 4 calculator/timer routes out of the `ProtectedRoute` wrapper in `App.tsx` so they become public like Calorie Counter:
- `/1rmcalculator`
- `/bmrcalculator`
- `/macrocalculator` and `/caloriecalculator`
- `/workouttimer`

These will be placed alongside the existing public `/caloriecounter` route.

## 2. Update the Compare Access Levels Table in SmartyPlans.tsx

### Rename categories and reorder the `comparisonFeatures` array:

**New order and naming:**
1. **Smarty Workouts** (was "Workouts") -- visitor: X, subscriber: limited, premium: check
2. **Smarty Training Programs** (was "Training Programs") -- visitor: X, subscriber: limited, premium: check
3. **Smarty Ritual** (was "Daily Smarty Ritual") -- visitor: X, subscriber: check, premium: check
4. **Smarty Check-ins** (unchanged) -- visitor: X, subscriber: X, premium: check
5. **Smarty Tools (1RM, BMR, Macro, Calories, Timer)** (was "Calculators") -- visitor: CHECK (now public), subscriber: check, premium: check
6. Dashboard -- unchanged
7. LogBook -- unchanged
8. Exercise Library -- unchanged
9. Blog -- unchanged
10. Workout Interactions -- unchanged
11. Program Interactions -- unchanged
12. WhatsApp Interaction with Coach -- unchanged

Key changes:
- "Workouts" renamed to "Smarty Workouts"
- "Training Programs" renamed to "Smarty Training Programs"
- "Daily Smarty Ritual" renamed to "Smarty Ritual"
- "Calculators (1RM, BMR, Macro)" renamed to "Smarty Tools (1RM, BMR, Macro, Calories, Timer)" and moved below Smarty Check-ins
- Smarty Tools visitor access changed from `false` to `true` (green check)

## 3. Update Access Control Context

In `AccessControlContext.tsx`, add `"calculator"` and `"tool"` to the public content check so guests can access them without login.

## Technical Details

**Files to modify:**
- `src/App.tsx` -- Move 4 tool routes from protected to public section
- `src/pages/SmartyPlans.tsx` -- Update `comparisonFeatures` array (rename, reorder, update visitor access)
- `src/contexts/AccessControlContext.tsx` -- Add calculator/tool to public content types

