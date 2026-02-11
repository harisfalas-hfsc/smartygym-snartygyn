

# Four Fixes

## 1. Back button no longer hides the page title on mobile
The fixed back button will be repositioned so it does not overlap the page title. On mobile, it will move to a position that does not cover any content -- shifting it down or making the page content start lower to leave room.

## 2. Back button respects dashboard history
When you are inside the dashboard and navigate between tabs (Messages, Orders, etc.), pressing back will take you to the previous dashboard tab or the main dashboard grid -- not to the homepage. The back button will detect when you are in `/userdashboard?tab=X` and navigate to `/userdashboard` instead of leaving the dashboard entirely. On the main dashboard grid (no tab selected), the back button will be hidden (same as homepage).

## 3. Avatar name fixed
The avatar currently reads the name from the auth session metadata, which can be wrong or stale. It will be updated to read the name from the `profiles` database table instead (where "Maria" is correctly stored). The `loadUserData` function already queries the profiles table for the avatar -- it will now also fetch `full_name` and use that for the initials.

## 4. Complimentary welcome workout for all new signups
Currently, the welcome workout is only generated when someone signs up through the exit-intent popup (which adds `?welcome_workout=true` to the URL). This will be changed so that **every new signup** gets a complimentary welcome workout, regardless of how they signed up. The `welcome_workout=true` check in `Auth.tsx` will be removed -- the welcome workout function will be called for all new users.

---

## Technical Details

### Files to change:

**`src/components/FixedBackButton.tsx`**
- Add dashboard-aware logic: if on `/userdashboard?tab=X`, back goes to `/userdashboard`
- If on `/userdashboard` (no tab), hide the button (treat as user's home)
- Adjust top position to avoid overlapping page titles (increase offset)

**`src/components/Navigation.tsx`**
- In `loadUserData()`: also fetch `full_name` from profiles table (currently only fetches `avatar_url`)
- Store profile name in state
- In `getUserInitials()`: use profile name first, fall back to `user_metadata`, then email

**`src/pages/Auth.tsx`**
- Remove the `if (welcomeWorkout === "true")` condition around the welcome workout generation
- Call `generate-welcome-workout` for every new signup
- Always show the "Your free workout is being prepared" toast on signup

