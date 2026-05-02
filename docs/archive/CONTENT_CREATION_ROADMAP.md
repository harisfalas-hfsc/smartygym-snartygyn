# Content Creation Roadmap: Workouts & Training Programs

## Complete Workflow Documentation from Creation to User Execution

---

## Part 1: Creating a New Workout (Step-by-Step)

### Step 1: Access Admin Back Office
- Navigate to **Admin Back Office**
- Click on **"Workouts Manager"** tab
- Click **"New Workout"** button
- **WorkoutEditDialog** opens

### Step 2: Basic Information
Fill in the following required fields:
- **Name**: Workout title (e.g., "Cardio Blast Workout")
- **Category**: Select from dropdown (e.g., Cardio, Strength, HIIT, Mobility)
- **Format**: Select workout format (e.g., Circuit, AMRAP, EMOM, For Time)
- **Type**: Additional classification
- **Duration**: Workout length (e.g., 15 min, 30 min, 45 min, 60 min, Varies)
- **Equipment**: Required equipment (e.g., None, Dumbbells, Resistance Bands)
- **Focus**: Target area (e.g., Upper Body, Lower Body, Full Body, Core)

**Auto-Generated Fields:**
- **Serial Number**: Automatically assigned based on category (e.g., CB-001, STR-015)
- **ID**: Auto-generated as `CATEGORY_PREFIX-SERIAL_NUMBER`

### Step 3: Set Content Access Level

#### Option A: Free Content
- **Toggle "Premium Content" = OFF**
- Workout is accessible to **ALL users** (visitors, subscribers, premium members)
- No payment required
- Skip to Step 5

#### Option B: Premium Content
- **Toggle "Premium Content" = ON**
- Workout requires either:
  - Gold or Platinum subscription, OR
  - Individual standalone purchase
- Proceed to Step 4

### Step 4: Configure Standalone Purchase (Only Available if Premium = ON)

#### Option A: Subscription-Only Access
- **Toggle "Standalone Purchase" = OFF**
- Workout only accessible to Gold/Platinum members
- Cannot be purchased individually
- Skip to Step 5

#### Option B: Standalone Purchase Available
- **Toggle "Standalone Purchase" = ON**
- Enter **Price in EUR** (e.g., 9.99)
- System automatically creates:
  - **Stripe Product** (e.g., "Cardio Blast Workout")
  - **Stripe Price** (e.g., €9.99)
  - **Product ID** and **Price ID** stored in database
- Workout can be purchased by anyone without a subscription
- Also accessible to Gold/Platinum members for free

### Step 5: Add Workout Content
- **Difficulty**: Select 1-6 stars
  - 1-2 stars = Beginner
  - 3-4 stars = Intermediate
  - 5-6 stars = Advanced
- **Description**: Brief overview of the workout
- **Instructions**: Full workout content (supports rich text formatting)
  - Warm Up section
  - Main Workout section
  - Cool Down section
  - Tips and notes
- **Image**: Either:
  - Toggle "Generate Unique Image" = ON (AI generates image)
  - Toggle OFF and enter manual image URL

### Step 6: Save Workout
- Click **"Save Workout"** button
- System processes:
  1. If standalone purchase enabled → Creates Stripe product/price
  2. Saves workout to `admin_workouts` database table
  3. Generates unique ID and serial number
  4. Stores all content and metadata
- Workout now appears in **Workouts Manager** table
- Workout is live on the website

---

## Workout Visibility & Access Matrix

| Content Type | Visitor | Subscriber (No Plan) | Gold/Platinum Member |
|-------------|---------|---------------------|---------------------|
| **Free Workout** | ✅ View & Use | ✅ View & Use | ✅ View & Use |
| **Premium Only** | 👁️ View Only | 👁️ View Only | ✅ View & Use |
| **Premium + Standalone** | 👁️ View + 💳 Buy | 👁️ View + 💳 Buy | ✅ View & Use |

**Legend:**
- 👁️ = Can browse/view description only
- 💳 = Can purchase individually
- ✅ = Full access included

---

## Workout Purchase Flow (For Standalone Purchases)

### Step 7: User Discovers Workout
- User browses **Workouts** section on website
- Sees workout card with:
  - Workout image
  - Workout name
  - Duration, difficulty, equipment
  - **Price badge** (e.g., "€9.99") if standalone purchase enabled
- Clicks **"View Workout"**

### Step 8: Workout Detail Page
- User sees full workout description
- System checks user's access level:
  - **Not logged in**: Shows "Sign In to Purchase" or "Purchase for €9.99"
  - **Logged in (no access)**: Shows "Purchase for €9.99" button
  - **Already purchased**: Shows "Already Purchased" badge
  - **Gold/Platinum member**: Shows full workout content (no purchase needed)

### Step 9: Purchase Process
1. User clicks **"Purchase for €9.99"**
2. System calls `create-individual-purchase-checkout` edge function
3. Edge function:
   - Authenticates user (requires login)
   - Checks if user already owns content
   - Creates/retrieves Stripe customer
   - Creates Stripe Checkout session
   - Returns checkout URL
4. User redirected to **Stripe Checkout** page
5. User completes payment with credit/debit card
6. Stripe processes payment

### Step 10: Payment Verification
1. After successful payment, user redirected to **Payment Success** page
2. `verify-purchase` edge function called with session ID
3. Function verifies payment with Stripe
4. Purchase recorded in `user_purchases` table:
   - User ID
   - Content type: "workout"
   - Content ID
   - Content name
   - Price paid
   - Purchase timestamp
5. System message sent to user's dashboard:
   - Subject: "Purchase Confirmation"
   - Content: "Thank you for your purchase of [Workout Name]!"

### Step 11: User Access After Purchase
- Workout appears in **"My Purchases"** tab on user dashboard
- User can click **"View Content"** to access workout anytime
- Full workout content now visible:
  - Warm up instructions
  - Main workout details
  - Cool down routine
  - Tips and modifications
- User can interact with workout:
  - Mark as **Completed**
  - Add to **Favorites**
  - **Rate** the workout (1-5 stars)
  - Leave **Comments** (if premium member)

### Step 12: Workout Execution & Tracking
- User performs the workout
- Can mark as "Completed" via **WorkoutInteractions** component
- System tracks in `workout_interactions` table:
  - View status
  - Completion status
  - Rating
  - Favorite status
- Completed workouts show badge on workout card
- User can view workout history in dashboard

---

## Part 2: Creating a New Training Program (Step-by-Step)

### Step 1: Access Admin Back Office
- Navigate to **Admin Back Office**
- Click on **"Programs Manager"** tab
- Click **"New Program"** button
- **ProgramEditDialog** opens

### Step 2: Basic Information
Fill in the following required fields:
- **Name**: Program title (e.g., "12-Week Muscle Hypertrophy Program")
- **Category**: Select from dropdown (e.g., Strength, Hypertrophy, Cardio, Mobility)
- **Duration**: Program length:
  - **Weeks**: Select 4, 6, 8, 12, or 16 weeks
  - **Days per Week**: Select 3, 4, 5, or 6 days
- **Difficulty**: Select from dropdown (Beginner, Intermediate, Advanced)
- **Equipment**: Required equipment (e.g., Full Gym, Dumbbells Only, Bodyweight)

**Auto-Generated Fields:**
- **Serial Number**: Automatically assigned based on category (e.g., STR-001, HYP-012)
- **ID**: Auto-generated as `CATEGORY_PREFIX-SERIAL_NUMBER`

### Step 3: Set Content Access Level

#### Option A: Free Program
- **Toggle "Premium Content" = OFF**
- Program is accessible to **ALL users**
- No payment required
- Skip to Step 5

#### Option B: Premium Program
- **Toggle "Premium Content" = ON**
- Program requires either:
  - Gold or Platinum subscription, OR
  - Individual standalone purchase
- Proceed to Step 4

### Step 4: Configure Standalone Purchase (Only Available if Premium = ON)

#### Option A: Subscription-Only Access
- **Toggle "Standalone Purchase" = OFF**
- Program only accessible to Gold/Platinum members
- Skip to Step 5

#### Option B: Standalone Purchase Available
- **Toggle "Standalone Purchase" = ON**
- Enter **Price in EUR** (e.g., 49.99)
- System automatically creates:
  - **Stripe Product** (e.g., "12-Week Muscle Hypertrophy Program")
  - **Stripe Price** (e.g., €49.99)
  - **Product ID** and **Price ID** stored in database
- Program can be purchased by anyone without a subscription
- Also accessible to Gold/Platinum members for free

### Step 5: Add Program Content
- **Difficulty Stars**: Select 1-6 stars (auto-converted from difficulty level)
- **Description**: Brief overview of the program
- **Overview**: Detailed program introduction
- **Target Audience**: Who this program is designed for
- **Program Structure**: How the program is organized
- **Weekly Schedule**: Breakdown of training days
- **Progression Plan**: How intensity/volume increases over time
- **Nutrition Tips**: Dietary recommendations
- **Expected Results**: What users can achieve

**Weekly Training Content:**
- System generates dynamic structure based on:
  - Number of weeks selected
  - Days per week selected
- For each Week and Day, enter:
  - Training focus for that day
  - Specific workouts or exercises
  - Sets, reps, rest periods
  - Notes or modifications

**Example Structure:**
- 8 weeks × 5 days = 40 training sessions to define
- Each session gets its own content entry

### Step 6: Add Program Image
- **Option A**: Toggle "Generate Unique Image" = ON
  - AI generates custom program image
- **Option B**: Toggle OFF and enter manual image URL

### Step 7: Save Program
- Click **"Save Program"** button
- System processes:
  1. If standalone purchase enabled → Creates Stripe product/price
  2. Saves program to `admin_training_programs` table
  3. Stores all weekly training content as structured data
  4. Generates unique ID and serial number
- Program now appears in **Programs Manager** table
- Program is live on the website

---

## Program Visibility & Access Matrix

| Content Type | Visitor | Subscriber (No Plan) | Gold/Platinum Member |
|-------------|---------|---------------------|---------------------|
| **Free Program** | ✅ View & Use | ✅ View & Use | ✅ View & Use |
| **Premium Only** | 👁️ View Only | 👁️ View Only | ✅ View & Use |
| **Premium + Standalone** | 👁️ View + 💳 Buy | 👁️ View + 💳 Buy | ✅ View & Use |

---

## Program Purchase Flow (For Standalone Purchases)

### Step 8: User Discovers Program
- User browses **Training Programs** section on website
- Sees program card with:
  - Program image
  - Program name
  - Duration (e.g., "8 weeks, 5 days/week")
  - Difficulty level
  - **Price badge** (e.g., "€49.99") if standalone purchase enabled
- Clicks program card to view details

### Step 9: Program Detail Page
- User sees:
  - Full program overview
  - Target audience
  - Program structure
  - Expected results
  - Weekly schedule preview
- System checks user's access level:
  - **Not logged in**: Shows "Sign In to Purchase" or "Purchase for €49.99"
  - **Logged in (no access)**: Shows "Purchase for €49.99" button
  - **Already purchased**: Shows "Start Program" button
  - **Gold/Platinum member**: Shows "Start Program" button (no purchase needed)

### Step 10: Purchase Process
1. User clicks **"Purchase for €49.99"**
2. System calls `create-individual-purchase-checkout` edge function
3. Edge function:
   - Authenticates user (requires login)
   - Checks if user already owns content
   - Creates/retrieves Stripe customer
   - Creates Stripe Checkout session with program price
   - Returns checkout URL
4. User redirected to **Stripe Checkout** page
5. User completes payment
6. Stripe processes payment

### Step 11: Payment Verification
1. After successful payment, user redirected to **Payment Success** page
2. `verify-purchase` edge function called
3. Function verifies payment with Stripe
4. Purchase recorded in `user_purchases` table:
   - User ID
   - Content type: "program"
   - Content ID
   - Content name
   - Price paid
   - Purchase timestamp
5. System message sent to user's dashboard:
   - Subject: "Purchase Confirmation"
   - Content: "Thank you for your purchase of [Program Name]! Your training program is ready."

### Step 12: User Access After Purchase
- Program appears in **"My Purchases"** tab on user dashboard
- User can click **"View Content"** to access program
- Full program content now visible:
  - Complete overview
  - All weekly schedules
  - Day-by-day training details
  - Nutrition tips
  - Progression plan

### Step 13: Program Execution
- User clicks **"Start Program"** or navigates to program page
- Sees complete training program structure:
  - **Week 1**: Day 1, Day 2, Day 3, etc.
  - **Week 2**: Day 1, Day 2, Day 3, etc.
  - And so on for all weeks
- Each day shows:
  - Training focus
  - Specific exercises
  - Sets, reps, rest periods
  - Notes and modifications

### Step 14: Progress Tracking
- User can interact with program:
  - Mark entire program as **Completed**
  - Add to **Favorites**
  - **Rate** the program (1-5 stars)
  - Leave **Comments** (if premium member)
- System tracks in `program_interactions` table:
  - View status
  - Completion status
  - Rating
  - Favorite status
- User can log progress in **Progress Logs** section:
  - Record weight changes
  - Upload progress photos
  - Add notes about training sessions

### Step 15: Long-Term Use
- User can access purchased program indefinitely
- Can restart program at any time
- All progress history saved
- Program remains in "My Purchases" library forever

---

## Access Control System Summary

### AccessControlContext Logic
The system uses `AccessControlContext` to determine user access:

```
canAccessContent(contentType, contentId):
  1. Check if user is logged in
  2. If user has Gold/Platinum subscription → GRANT ACCESS
  3. If content is in user's purchasedContent list → GRANT ACCESS
  4. Otherwise → DENY ACCESS (show purchase options)
```

### User Tiers
- **Visitor**: Not logged in, can only browse
- **Subscriber (No Plan)**: Logged in, can access free content and purchase standalone items
- **Gold Member**: Subscription, full access to all premium content
- **Platinum Member**: Subscription, full access to all premium content + additional perks

---

## Database Tables Involved

### For Workouts:
- `admin_workouts`: Stores all workout data, pricing, Stripe IDs
- `workout_interactions`: Tracks user views, completions, ratings, favorites
- `workout_comments`: Stores user comments (premium members only)
- `user_purchases`: Records all standalone purchases

### For Training Programs:
- `admin_training_programs`: Stores all program data, weekly structure, pricing
- `program_interactions`: Tracks user views, completions, ratings, favorites
- `user_purchases`: Records all standalone purchases

### For User Management:
- `profiles`: User profile data
- `user_subscriptions`: Subscription status and tier
- `user_system_messages`: Purchase confirmations, notifications

---

## Stripe Integration Flow

### Product Creation (Admin Side):
1. Admin enables "Standalone Purchase" and sets price
2. System calls `create-stripe-product` edge function
3. Function creates:
   - Stripe Product with name and description
   - Stripe Price in EUR (converted to cents)
4. Returns Product ID and Price ID
5. IDs stored in workout/program record

### Checkout Session Creation (User Side):
1. User clicks "Purchase" button
2. `create-individual-purchase-checkout` called with:
   - Content ID, type, name
   - Price amount
   - Stripe Product ID and Price ID
3. Function creates Checkout Session:
   - Links to Stripe customer (or creates new one)
   - Sets success/cancel URLs
   - Includes metadata (user ID, content info)
4. Returns checkout URL
5. User redirected to Stripe payment page

### Purchase Verification (After Payment):
1. User completes payment on Stripe
2. Redirected to success page with session ID
3. `verify-purchase` function:
   - Retrieves session from Stripe
   - Verifies payment status = "paid"
   - Extracts metadata
   - Creates record in `user_purchases`
   - Sends system message to user
4. User granted permanent access

---

## Key Differences: Workout vs. Program

| Aspect | Workout | Training Program |
|--------|---------|------------------|
| **Duration** | Single session (15-60 min) | Multi-week (4-16 weeks) |
| **Structure** | Single workout content | Weekly schedule with multiple days |
| **Typical Price** | €5-15 | €30-100 |
| **Content Complexity** | Warm up, main, cool down | Week-by-week, day-by-day progression |
| **Use Case** | One-time workout | Long-term training plan |
| **Time Commitment** | 1 session | Multiple weeks of training |

---

## Testing the Complete Flow

### For Admins:
1. Create workout/program with standalone purchase enabled
2. Verify Stripe product created (check Stripe dashboard)
3. Verify content appears on website with price badge
4. Test purchase flow as a test user
5. Verify purchase recorded in database
6. Verify user receives system message
7. Verify content appears in "My Purchases"

### For Users:
1. Browse workouts/programs as visitor (should see price)
2. Click "Purchase" (should prompt login if not authenticated)
3. Complete payment on Stripe test checkout
4. Verify redirect to success page
5. Check dashboard "My Purchases" tab
6. Verify full content access
7. Test interactions (favorite, rate, complete)

---

## Common Troubleshooting

### Issue: Stripe product not created
- **Check**: Ensure "Premium Content" = ON before enabling standalone purchase
- **Check**: Verify price is a valid number (e.g., 9.99, not empty)
- **Check**: Check edge function logs for errors

### Issue: User can't access after purchase
- **Check**: Verify purchase recorded in `user_purchases` table
- **Check**: Verify user_id matches authenticated user
- **Check**: Verify content_id matches workout/program ID
- **Check**: Clear browser cache and refresh

### Issue: Price badge not showing
- **Check**: Verify `is_standalone_purchase` = true in database
- **Check**: Verify `price` field has value
- **Check**: Check that workout/program card component is using latest code

### Issue: Duplicate purchases allowed
- **System prevents this**: `create-individual-purchase-checkout` checks existing purchases
- If occurring, check edge function logic

---

## Summary: Creation to Execution Timeline

### Workout Timeline:
1. **Admin creates workout** (5-10 minutes)
2. **Workout goes live** (immediate)
3. **User discovers workout** (browsing)
4. **User purchases** (2-3 minutes)
5. **Payment verified** (30 seconds)
6. **User accesses workout** (immediate)
7. **User performs workout** (15-60 minutes)
8. **User marks complete** (immediate)

### Training Program Timeline:
1. **Admin creates program** (30-60 minutes - more complex content)
2. **Program goes live** (immediate)
3. **User discovers program** (browsing)
4. **User purchases** (2-3 minutes)
5. **Payment verified** (30 seconds)
6. **User accesses program** (immediate)
7. **User follows program** (4-16 weeks)
8. **User tracks progress** (ongoing)
9. **User completes program** (at end of duration)

---

## Final Notes

- **All purchases are permanent**: Users have lifetime access to purchased content
- **No refunds via system**: Refund requests handled manually by admin
- **Stripe test mode**: Use test cards for testing (4242 4242 4242 4242)
- **RLS Policies**: Ensure proper security - users can only access their own purchases
- **Analytics**: Track all purchases in admin back office analytics section

---

*This document provides the complete roadmap for creating, pricing, selling, and executing both workouts and training programs on the Smarty Gym platform.*
