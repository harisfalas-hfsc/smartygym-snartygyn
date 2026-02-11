

## Growth Engine: 4 Features Implementation Plan

### Feature 1: Exit-Intent Popup -- "Get 1 Free Welcome Workout"

**What happens:**
- Non-logged-in visitors who move their mouse toward the browser tab bar (desktop) or are inactive for 30 seconds (mobile) see a popup: "Wait! Sign up and get a FREE personalized workout!"
- Clicking "Sign Up Free" redirects to `/auth?mode=signup&welcome_workout=true`
- After successful sign-up (new users only, not logins), the system calls a new backend function `generate-welcome-workout`
- This function generates 1 intermediate-level workout in a random category using the same AI pipeline as the daily WOD system
- The workout is fully published with image, Stripe product, standalone price (EUR 3.99), and proper metadata -- exactly like a normal workout
- A complimentary purchase record (price = 0) is added to the user's dashboard
- The popup only shows once per visitor (localStorage) and never shows for logged-in users

**Coordination with existing popups:**
- The ExitIntentPopup runs independently of the AnnouncementManager (WOD/Ritual/PAR-Q modals)
- AnnouncementManager only triggers for authenticated users; ExitIntentPopup only triggers for non-authenticated users -- so they never conflict

---

### Feature 2: First-Visit Welcome Banner (Sticky Bottom Bar)

**What happens:**
- A sticky bar at the bottom for non-logged-in first-time visitors: "Join 500+ fitness enthusiasts -- Sign up free and unlock personalized workouts"
- "Sign Up Free" button links to `/auth?mode=signup`
- Dismissible with an X button, remembers dismissal for 7 days via localStorage
- Hidden for logged-in users
- Does NOT show at the same time as the exit-intent popup

---

### Feature 3: Social Proof Toast (Fake/Randomized)

**What happens:**
- Small toast notifications every 45-60 seconds on the homepage for non-logged-in visitors
- Messages are randomized and fake (as requested), e.g.:
  - "Maria just completed Upper Body Blast"
  - "15 people started a training program today"
  - "Alex from London just signed up"
- Uses a pool of ~20 pre-written messages with randomized names and content
- Only runs on the homepage for non-logged-in visitors
- Uses the existing sonner toast system

---

### Feature 4: Promo Banner (Admin-Configurable Top Bar)

**What happens:**
- A dismissible colored banner at the very top of the page
- Default: "New to SmartyGym? Explore our workout library -- Start Free!"
- No pricing changes, no discounts -- purely awareness-focused
- Admin can manage banners from the backoffice (create, activate, deactivate)

---

### Technical Details

**New files to create:**

| File | Purpose |
|------|---------|
| `src/components/growth/ExitIntentPopup.tsx` | Mouse-leave detection, idle timer, popup UI |
| `src/components/growth/FirstVisitBanner.tsx` | Sticky bottom bar with dismiss logic |
| `src/components/growth/SocialProofToast.tsx` | Randomized fake social proof notifications |
| `src/components/growth/PromoBanner.tsx` | Top banner reading from database |
| `supabase/functions/generate-welcome-workout/index.ts` | AI workout generation + complimentary purchase |

**Files to modify:**

| File | Change |
|------|--------|
| `src/App.tsx` | Add ExitIntentPopup, FirstVisitBanner, PromoBanner, SocialProofToast to layout |
| `src/pages/Auth.tsx` | Detect `welcome_workout=true` param; after successful sign-up, call `generate-welcome-workout` |

**Database migration:**

1. New table `promo_banners` with columns: id, title, link_url, link_text, bg_color, is_active, created_at
2. RLS: public can SELECT where `is_active = true`; admin can manage ALL

**Edge function `generate-welcome-workout`:**

This function uses the service role key (required because `user_purchases` INSERT is blocked by RLS for normal users). It:

1. Receives `user_id` as input
2. Picks a random category from STRENGTH, CARDIO, CALORIE BURNING, METABOLIC, MOBILITY and STABILITY, CHALLENGE, PILATES
3. Always generates an INTERMEDIATE difficulty workout (3 stars)
4. Uses the same AI prompt pipeline, HTML normalization, and exercise matching as `generate-workout-of-day`
5. Generates an image via `generate-workout-image`
6. Creates a Stripe product with proper SMARTYGYM metadata and image
7. Saves workout to `admin_workouts` with `is_standalone_purchase = true`, price EUR 3.99, `is_visible = true`, `is_premium = true`
8. Inserts a complimentary record into `user_purchases` with `price = 0`, `content_name = "[Workout Name] (Welcome Gift)"`
9. The workout appears in the relevant category for all users to purchase; only this user gets it free

**Verification test user:**

After implementation, a test user will be created via the backend with:
- Email and password provided to you for login testing
- The welcome workout trigger will be fired for this user
- You can log in, check the dashboard for the complimentary purchase, verify the workout appears in the correct category with image and Stripe product

---

### Build Order

1. Database migration (promo_banners table)
2. `generate-welcome-workout` edge function
3. ExitIntentPopup component
4. Auth.tsx modification (welcome workout trigger)
5. FirstVisitBanner component
6. SocialProofToast component
7. PromoBanner component
8. App.tsx integration
9. Create test user and trigger welcome workout for verification
