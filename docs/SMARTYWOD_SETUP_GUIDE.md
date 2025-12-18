# SmartyWOD Setup Guide
## Complete Knowledge Transfer Document

This document contains all established standards, patterns, and business rules from SmartyGym to be used in the SmartyWOD project.

---

## 1. PROJECT OVERVIEW

### What is SmartyWOD?
A streamlined fitness platform focused exclusively on the Workout of the Day (WOD) system. It's a "light version" of SmartyGym containing only core workout functionality.

### Core Pages
1. **Landing/Home Page** - Explains the WOD philosophy and benefits
2. **Workout of the Day Page** (/workout/wod) - Daily workouts display
3. **Workouts Page** - All workouts by category
4. **Exercise Library** - Video exercise demonstrations
5. **Daily Smarty Ritual** - Daily wellness content (premium only)
6. **Dashboard** - User hub with goals, workouts, purchases, messages, logbook
7. **About Page** - Platform information
8. **Auth Pages** - Login/Signup

### Pricing Structure
- **Gold Plan**: €6.99/month
- **Platinum Plan**: €59.99/year
- **Standalone Workout Purchase**: €2.99 per workout

---

## 2. WORKOUT FORMATTING STANDARDS

### CRITICAL: Master Template Philosophy
All workouts MUST follow the exact formatting established in "Lower Push - Upper Pull Synthesis" and "Bodyweight Force" master templates.

### HTML Structure Rules

#### Section Titles
```html
<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
```
- Always bold AND underlined
- Include duration in minutes with apostrophe (15')
- Use tiptap-paragraph class

#### Exercise Lists
```html
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Exercise name - sets x reps</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Another exercise - sets x reps</p></li>
</ul>
```
- ALWAYS use bullet lists (`<ul>`), NEVER numbered lists
- ALWAYS include `class="tiptap-list-item"` on every `<li>`
- ALWAYS use double quotes (") for HTML attributes, NEVER single quotes

#### Circuit/Round Headers
```html
<p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p>
```
- Bold only (NOT underlined)
- Circuit exercises as dashes in plain paragraphs

#### Section Separators
```html
<p class="tiptap-paragraph"></p>
```
- Empty paragraph between major sections (Warm-Up → Main Workout → Cool-Down)

### Complete Workout Structure Example
```html
<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Jacks - 2 min</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Arm Circles - 1 min</p></li>
</ul>

<p class="tiptap-paragraph"></p>

<p class="tiptap-paragraph"><strong><u>Main Workout 30'</u></strong></p>
<p class="tiptap-paragraph"><strong>4 Rounds of:</strong></p>
<p class="tiptap-paragraph">- 10 Push-ups</p>
<p class="tiptap-paragraph">- 15 Squats</p>
<p class="tiptap-paragraph">- 20 Mountain Climbers</p>

<p class="tiptap-paragraph"></p>

<p class="tiptap-paragraph"><strong><u>Cool Down 10'</u></strong></p>
<ul class="tiptap-bullet-list">
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Standing Quad Stretch - 1 min each leg</p></li>
  <li class="tiptap-list-item"><p class="tiptap-paragraph">Child's Pose - 2 min</p></li>
</ul>
```

### Instructions Field
- Contains ONLY execution guidance
- NO warm-up or cool-down content
- Plain paragraphs, no numbered lists

### Tips Field
- Contains coaching advice
- Can use plain paragraphs or `<br>` line breaks
- No numbered lists

### FORBIDDEN
- ❌ Leading empty paragraphs (content must start immediately)
- ❌ Single quotes for HTML attributes
- ❌ Numbered lists in instructions/tips
- ❌ Missing tiptap-list-item class on `<li>` elements
- ❌ `<br>` tags for exercise lists (use `<ul>` instead)

---

## 3. WOD GENERATION SYSTEM

### Daily Generation Timing (Cyprus Time)
1. **23:55** - Archive old WODs (set is_workout_of_day = false)
2. **00:00** - Generate two fresh WODs (bodyweight + equipment)
3. **00:05** - Generate Daily Smarty Ritual
4. **07:00** - Send combined morning notification (WOD + Ritual)

### 7-Day Category Cycle
```typescript
const CATEGORY_CYCLE_7DAY = [
  "Strength",           // Day 1
  "Calorie Burning",    // Day 2
  "Metabolic",          // Day 3
  "Cardio",             // Day 4
  "Mobility & Stability", // Day 5
  "Challenge",          // Day 6
  "Strength"            // Day 7 (cycle restarts)
];
```

### Difficulty Rotation Pattern
- Prevents consecutive high-intensity workouts
- After 5-6 star workout, next day must be 1-4 stars
- Weekly shift pattern for variety

### Difficulty Stars & Colors
| Level | Stars | Border Color |
|-------|-------|--------------|
| Beginner | 1-2 | Yellow (border-yellow-500) |
| Intermediate | 3-4 | Green (border-green-500) |
| Advanced | 5-6 | Red (border-red-500) |

### Format Rules by Category
- **Strength**: REPS & SETS format ONLY
- **Mobility & Stability**: REPS & SETS format ONLY
- **All Other Categories**: CIRCUIT, EMOM, FOR TIME, AMRAP, TABATA, MIX

### WOD Types Generated Daily
1. **Bodyweight WOD** - No equipment required
2. **Equipment WOD** - Uses gym equipment

### Critical Database Fields
```sql
generated_for_date  -- Date the WOD is for (used for filtering)
is_workout_of_day   -- Boolean flag for active WODs
type               -- 'bodyweight' or 'equipment'
```

### Defensive Filters (CRITICAL)
- WOD page: Query ONLY where `generated_for_date = TODAY`
- Category pages: EXCLUDE where `is_workout_of_day = true`

---

## 4. ACCESS CONTROL RULES

### User Tiers
1. **Guest** - Anonymous visitors
2. **Subscriber** - Free registered users
3. **Premium** - Gold/Platinum paid members

### Content Access Matrix
| Content | Guest | Subscriber | Premium |
|---------|-------|------------|---------|
| Marketing pages | ✅ | ✅ | ✅ |
| Exercise Library | ✅ | ✅ | ✅ |
| Free Workouts | ❌ | ✅ | ✅ |
| Premium Workouts | ❌ | Purchase | ✅ |
| Daily Ritual | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Tools | ❌ | ✅ | ✅ |

### CRITICAL BUSINESS RULE
**Premium users CANNOT purchase standalone content** - All content is included in their subscription.

### Standalone Purchase Rules
- Subscribers can purchase individual premium workouts for €2.99
- After purchase, user gets full access to that specific workout
- Purchased content appears in "My Purchases" dashboard tab

### Access Control Implementation
```typescript
// Central function in src/lib/access-control.ts
canUserAccessContent(params: AccessCheckParams): Promise<AccessCheckResult>

// Returns
{
  allowed: boolean,
  reason: string,
  canPurchase: boolean,  // false for premium users
  requiresAuth: boolean
}
```

---

## 5. NOTIFICATION SYSTEM

### Dual-Channel Delivery (MANDATORY)
ALL notifications must be delivered through BOTH channels simultaneously:
1. **Dashboard Message** - Stored in `user_system_messages` table
2. **Email** - Sent via Resend API

### Resend Rate Limiting (CRITICAL)
```typescript
// Add 600ms delay between individual email sends
await new Promise(resolve => setTimeout(resolve, 600));
```
This prevents 429 rate limit errors when batch-sending.

### Email Configuration
- **Sender**: notifications@smartywod.com (after domain verification)
- **Reply-To**: admin@smartywod.com
- **Include**: List-Unsubscribe headers

### Message Types Registry
Use centralized registry in `supabase/functions/_shared/notification-types.ts`:
```typescript
export const MESSAGE_TYPES = {
  WOD_NOTIFICATION: 'wod_notification',
  DAILY_RITUAL: 'daily_ritual',
  WELCOME: 'welcome_message',
  // ... etc
};
```

### Notification Schedule (Cyprus Time)
| Notification | Time | Frequency |
|--------------|------|-----------|
| Morning WOD + Ritual | 07:00 | Daily |
| Monday Motivation | 10:00 | Weekly (Monday) |
| Weekly Activity Report | 10:00 | Weekly (Monday) |
| Check-in Reminders | 08:00 & 20:00 | Daily (opt-in) |
| Renewal Reminders | 09:00 | As needed |

### Email Preferences (User-Controlled)
Users can individually toggle these in notification_preferences:
- email_wod
- email_ritual
- email_monday_motivation
- email_weekly_activity
- email_checkin_reminders (N/A for SmartyWOD)

---

## 6. DATABASE SCHEMA ESSENTIALS

### Core Tables to Keep
```sql
-- User Management
profiles
user_roles
user_subscriptions
user_purchases

-- Content
admin_workouts
daily_smarty_rituals
exercise_library_videos

-- Interactions
workout_interactions
scheduled_workouts
user_activity_log

-- Messaging
user_system_messages
automated_message_templates
notification_audit_log

-- Tools
bmr_history
calorie_history
onerm_history
user_measurement_goals

-- System
system_settings
system_health_audits
```

### Tables to REMOVE
```sql
admin_training_programs
program_interactions
blog_articles
testimonials
shop_products
corporate_subscriptions
corporate_members
smarty_checkins
```

### Critical Constraints
```sql
-- Workout interactions: Single record per user per workout
UNIQUE (user_id, workout_id)  -- NOT (user_id, workout_id, workout_type)
```

### RLS Policy Pattern
```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Admin access pattern
CREATE POLICY "Admins can do everything"
ON table_name FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 7. EDGE FUNCTION STANDARDS

### Required Headers
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

### Logging Pattern
```typescript
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FUNCTION-NAME] ${step}${detailsStr}`);
};
```

### Error Handling
```typescript
try {
  // Function logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logStep("ERROR", { message: errorMessage });
  return new Response(JSON.stringify({ error: errorMessage }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
}
```

### Stripe API Version
```typescript
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",  // Latest stable version
});
```

---

## 8. FEATURES TO KEEP VS REMOVE

### ✅ KEEP (Adapt for SmartyWOD)
- Landing/Home Page (rebrand)
- About Page
- Workout of the Day system (complete)
- Workouts page with categories
- Exercise Library
- Daily Smarty Ritual
- Dashboard with:
  - Active Goals
  - My Workouts (completed/favorites)
  - My Purchases
  - Messages
  - LogBook
- Auth system (login/signup)
- Subscription system (Gold/Platinum)
- Standalone purchase system
- Calculator tools (BMR, Calories, 1RM)
- Calculator history & measurements
- Email notification system
- Google Calendar integration
- Reader Mode
- Navigation (simplified)
- Admin panel (simplified)

### ❌ REMOVE Completely
- Training Programs (entire system)
- Blog & Articles
- Community page (leaderboards, ratings, comments, testimonials)
- Shop
- Smarty Check-ins (keep Ritual, remove Check-ins)
- Corporate subscriptions
- SmartyWorkout generator (AI coach)
- Take a Tour page

### Admin Panel: Keep
- WOD Manager
- Workout Manager
- Daily Ritual Manager
- Exercise Library Manager
- User Manager
- Notification Manager
- Settings
- System Health Audit

### Admin Panel: Remove
- Training Program Manager
- Blog Manager
- Shop Manager
- Corporate Manager

---

## 9. BRANDING GUIDELINES

### Color Scheme
- **Primary**: Light Blue (HSL: 195 82% 55%)
- **CTA Buttons**: Green borders (border-green-500)
- Use CSS variables from index.css, never hardcoded colors

### Naming Convention
- Platform: SmartyWOD
- Features: "Smarty" prefix (Smarty Workouts, Smarty Ritual, Smarty Tools)

### Tagline
"Your Daily Workout. Delivered."

### Domain
smartywod.com

---

## 10. STRIPE INTEGRATION

### Products to Create
1. **SmartyWOD Gold** - €6.99/month recurring
2. **SmartyWOD Platinum** - €59.99/year recurring
3. **Standalone Workout** - €2.99 one-time

### Edge Functions Needed
- `create-checkout` - Subscription checkout
- `check-subscription` - Verify subscription status
- `customer-portal` - Subscription management
- `create-individual-purchase-checkout` - Standalone purchases
- `stripe-webhook` - Handle Stripe events

### Subscription Check Pattern
```typescript
// Call on login, page load, and every minute
const { data } = await supabase.functions.invoke('check-subscription');
// Returns: { subscribed, product_id, subscription_end }
```

---

## 11. QUALITY STANDARDS

### Zero-Tolerance Rules
1. All work must be complete and correct at delivery
2. No post-delivery fixes for established patterns
3. Mobile responsiveness tested during development
4. All URLs verified against router structure
5. Broken features must be fixed or deleted (no non-functional UI)

### Testing Requirements
- Desktop, tablet, and mobile views
- Light and dark modes
- All user tiers (guest, subscriber, premium)
- All notification channels

### Mobile-First Patterns
```typescript
// Filters: Stack on mobile, row on desktop
className="flex flex-col sm:flex-row gap-2"

// Responsive widths
className="w-full sm:w-[200px]"

// Responsive chart heights
className="h-[300px] sm:h-[350px]"
```

---

## 12. SECRETS REQUIRED

These must be added to Lovable Cloud:
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `RESEND_API_KEY` - Email delivery
- `LOVABLE_API_KEY` - AI generation (for WOD/Ritual)
- `YOUTUBE_API_KEY` - Exercise library videos
- `VAPID_PUBLIC_KEY` - Push notifications (optional)
- `VAPID_PRIVATE_KEY` - Push notifications (optional)

---

## 13. CRON JOBS TO CONFIGURE

```sql
-- Archive old WODs (23:55 Cyprus = 21:55 UTC)
'55 21 * * *' - archive-old-wods

-- Generate WODs (00:00 Cyprus = 22:00 UTC)
'0 22 * * *' - generate-workout-of-day

-- Generate Ritual (00:05 Cyprus = 22:05 UTC)
'5 22 * * *' - generate-daily-ritual

-- Morning notifications (07:00 Cyprus = 05:00 UTC)
'0 5 * * *' - send-morning-notifications

-- Monday Motivation (10:00 Cyprus Monday = 08:00 UTC)
'0 8 * * 1' - send-weekly-motivation

-- Weekly Activity (10:00 Cyprus Monday = 08:00 UTC)
'0 8 * * 1' - send-weekly-activity-report

-- Renewal reminders (09:00 Cyprus = 07:00 UTC)
'0 7 * * *' - send-renewal-reminders
```

---

## 14. MIGRATION CHECKLIST

### Phase 1: Project Setup
- [ ] Remix SmartyGym project as "SmartyWOD"
- [ ] Enable Lovable Cloud
- [ ] Add all secrets
- [ ] Create Stripe products with new pricing

### Phase 2: Feature Removal
- [ ] Delete training programs code and routes
- [ ] Delete blog code and routes
- [ ] Delete community code and routes
- [ ] Delete shop code and routes
- [ ] Delete check-ins code (keep ritual)
- [ ] Delete corporate subscriptions
- [ ] Remove unused database tables
- [ ] Clean up navigation

### Phase 3: Adaptation
- [ ] Update pricing constants
- [ ] Update Stripe product IDs
- [ ] Rebrand to SmartyWOD
- [ ] Update email templates
- [ ] Update landing page content
- [ ] Simplify dashboard tabs
- [ ] Simplify admin panel

### Phase 4: Testing
- [ ] Test WOD generation
- [ ] Test subscription flow
- [ ] Test standalone purchases
- [ ] Test all notifications
- [ ] Test all user tiers
- [ ] Mobile responsiveness

### Phase 5: Launch
- [ ] Connect domain (smartywod.com)
- [ ] Verify Resend domain
- [ ] Configure cron jobs
- [ ] Run system health audit

---

## 15. IMPORTANT CONTEXT

### Why This Architecture?
The WOD system uses a 7-day category rotation to ensure balanced training across all fitness aspects while preventing consecutive high-intensity days that could lead to overtraining.

### Why Dual-Channel Notifications?
Users have different preferences - some check dashboards, others rely on email. Dual delivery ensures maximum engagement without forcing preference.

### Why 600ms Email Delay?
Resend has a 2 requests/second rate limit. Without delays, batch emails fail silently.

### Why Separate User Bases?
SmartyGym and SmartyWOD serve different markets. Separate databases prevent confusion and allow independent business operations.

---

*This document serves as the complete knowledge transfer for SmartyWOD development. All patterns, standards, and business rules established in SmartyGym apply unless explicitly noted otherwise.*
