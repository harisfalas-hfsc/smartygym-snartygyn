# SmartyGym Manual QA Testing Checklist

Use this checklist to manually verify all critical user flows before production launch.

---

## 🔐 Authentication Flows

### Sign Up
- [ ] Navigate to `/auth`
- [ ] Fill in email and password
- [ ] Click "Sign Up"
- [ ] Verify email confirmation (if enabled)
- [ ] User redirected to home page
- [ ] User can access dashboard
- [ ] Profile created in database

### Login
- [ ] Navigate to `/auth`
- [ ] Enter existing credentials
- [ ] Click "Login"
- [ ] Redirected to home or return URL
- [ ] Session persists across page refreshes
- [ ] User can access protected content

### Logout
- [ ] Click "Logout" button
- [ ] Session cleared
- [ ] Redirected to home page
- [ ] Cannot access protected routes
- [ ] Login required to access dashboard

### Session Expiry
- [ ] Login and wait for session to expire (or manually invalidate)
- [ ] Try to access protected content
- [ ] See "Session Expired" toast
- [ ] Redirected to `/auth`
- [ ] Return URL stored correctly
- [ ] After login, redirected back to intended page

---

## 💰 Payment Flows

### Subscribe to Gold Plan
- [ ] Login as free user
- [ ] Navigate to pricing page
- [ ] Click "Subscribe to Gold"
- [ ] Redirected to Stripe Checkout
- [ ] Complete payment (use test card: 4242 4242 4242 4242)
- [ ] Redirected to success page
- [ ] Subscription activated immediately
- [ ] Can access all premium content
- [ ] Dashboard shows subscription status

### Subscribe to Platinum Plan
- [ ] Same steps as Gold plan
- [ ] Verify Platinum-specific features (if any)
- [ ] Check higher tier benefits

### Cancel Subscription
- [ ] Login as premium user
- [ ] Navigate to account settings or customer portal
- [ ] Click "Manage Subscription"
- [ ] Redirected to Stripe Customer Portal
- [ ] Cancel subscription
- [ ] Access continues until period end
- [ ] After period end, downgraded to free

### Purchase Standalone Workout (Free User)
- [ ] Login as free user (free@test.com)
- [ ] Navigate to premium workout with standalone purchase enabled
- [ ] See "Purchase for €XX.XX" button
- [ ] Click purchase button
- [ ] Redirected to Stripe Checkout
- [ ] Complete payment (test card)
- [ ] Redirected to payment success page
- [ ] See "Verifying purchase" message
- [ ] Access granted immediately
- [ ] Workout appears in dashboard
- [ ] Can mark workout as completed
- [ ] Logout and login again
- [ ] Still have access to purchased workout

### Purchase Standalone Training Program (Free User)
- [ ] Same steps as standalone workout
- [ ] Verify program appears in dashboard
- [ ] Can track progress through weeks/days

### Premium User CANNOT Purchase
- [ ] Login as premium user (premium-gold@test.com)
- [ ] Navigate to any premium workout
- [ ] Verify NO purchase button visible
- [ ] See "Included in Your Premium Plan" badge
- [ ] Can access content immediately
- [ ] Navigate to standalone purchasable workout
- [ ] Still no purchase option (all included)

### Failed Payment Handling
- [ ] Try to purchase with declined card (4000 0000 0000 0002)
- [ ] Payment fails
- [ ] See error message
- [ ] No access granted
- [ ] No record in user_purchases
- [ ] User remains on payment page or returned to content

---

## 🏋️ Content Access

### Guest (Not Logged In)

#### Public Pages ✅
- [ ] Home page loads
- [ ] About page loads
- [ ] FAQ page loads
- [ ] Blog page loads
- [ ] Contact page loads
- [ ] Exercise library loads
- [ ] Can browse workout categories (see cards)
- [ ] Can browse program categories (see cards)

#### Protected Content ❌
- [ ] Try to access `/workout/strength/ws001` directly
- [ ] See AccessGate with "Sign in to access"
- [ ] Try to access `/dashboard`
- [ ] Redirected to `/auth`
- [ ] Try to access tools
- [ ] Blocked from access

### Free User (Subscriber)

#### Free Content ✅
- [ ] Login as free@test.com
- [ ] Navigate to free workout (strength-049)
- [ ] Can view full workout content
- [ ] Can mark as viewed
- [ ] Can mark as favorite
- [ ] Can mark as completed
- [ ] Workout appears in dashboard
- [ ] Navigate to free program (T-W001)
- [ ] Can view full program content
- [ ] Can track progress

#### Premium Content (Not Purchased) ❌
- [ ] Navigate to premium workout (ws001)
- [ ] See AccessGate paywall
- [ ] See "Upgrade to Premium" button
- [ ] See "Purchase for €XX.XX" button (if enabled)
- [ ] Cannot view full workout content
- [ ] Try direct URL access
- [ ] Still blocked by AccessGate

#### Tools & Calculators ✅
- [ ] Access One RM Calculator
- [ ] Can use calculator
- [ ] Results save to history
- [ ] Access BMR Calculator
- [ ] Can use calculator
- [ ] Access Macro Calculator
- [ ] Can use calculator

### Premium User

#### All Content ✅
- [ ] Login as premium-gold@test.com
- [ ] Navigate to free workout
- [ ] Full access (no gate)
- [ ] Navigate to premium workout
- [ ] Full access (no gate)
- [ ] See "Included in Your Premium Plan" badge
- [ ] Navigate to all program categories
- [ ] Can access all programs
- [ ] No purchase buttons anywhere

#### Dashboard ✅
- [ ] All content accessible
- [ ] Can mark any workout as viewed/completed
- [ ] Can mark any program as ongoing/completed
- [ ] Favorites work correctly
- [ ] Logbook shows all activity

---

## 📧 Messaging System

### User → Admin Message

#### Send Message
- [ ] Login as user (free or premium)
- [ ] Navigate to `/contact`
- [ ] Fill form: name, email, subject, message
- [ ] Click "Send"
- [ ] See success toast
- [ ] Message saved to database

#### Admin Receives Message
- [ ] Login as admin
- [ ] Navigate to `/admin`
- [ ] See message in inbox or contact list
- [ ] Unread count accurate (shows new message)
- [ ] Click message to open
- [ ] Can read full message content
- [ ] Can mark as read
- [ ] Read status updates
- [ ] Unread count decreases

#### Admin Responds
- [ ] Admin writes response
- [ ] Click "Send Response"
- [ ] Response saved to database
- [ ] `responded_at` timestamp updated

#### User Receives Response
- [ ] Login as original user
- [ ] See notification badge (unread count)
- [ ] Navigate to messages/dashboard
- [ ] See response notification
- [ ] Click to read response
- [ ] Can mark response as read
- [ ] `response_read_at` timestamp updated
- [ ] Unread count updates correctly

### Admin → User System Message

#### Send to Single User
- [ ] Admin navigates to messaging panel
- [ ] Select "Send Message"
- [ ] Choose single user from list
- [ ] Write subject and content
- [ ] Click "Send"
- [ ] Message delivered to user

#### Send to User Segment
- [ ] Select "Send to Premium Users"
- [ ] Write message
- [ ] Click "Send"
- [ ] All premium users receive message
- [ ] Verify with test premium account

#### Send to All Users
- [ ] Select "Send to All Users"
- [ ] Write message
- [ ] Click "Send"
- [ ] All users receive message
- [ ] Verify with multiple test accounts

#### User Receives System Message
- [ ] Login as user
- [ ] See notification badge
- [ ] Navigate to messages
- [ ] See system message in list
- [ ] Click to open
- [ ] Can read message
- [ ] Can mark as read
- [ ] Read state persists

### Real-Time Updates
- [ ] Open two browser windows
- [ ] Login as user in Window 1
- [ ] Login as admin in Window 2
- [ ] Admin sends message to user
- [ ] User sees notification update within 30 seconds (real-time)
- [ ] User marks message as read
- [ ] Admin sees read status update in near real-time

---

## 🔧 Admin Operations

### Admin Login
- [ ] Navigate to `/auth`
- [ ] Login with admin credentials
- [ ] Can access `/admin` route
- [ ] Non-admin cannot access `/admin`

### Create New Workout
- [ ] Navigate to workout management
- [ ] Click "Create New Workout"
- [ ] Fill all required fields
- [ ] Set as Free workout
- [ ] Click "Save"
- [ ] Workout appears in database
- [ ] Navigate to frontend workout list
- [ ] New workout visible immediately
- [ ] Free users can access it

### Create Premium Workout
- [ ] Create workout
- [ ] Mark as "Premium" (`is_premium = true`)
- [ ] Enable standalone purchase (`is_standalone_purchase = true`)
- [ ] Set price (e.g., €29.99)
- [ ] Save workout
- [ ] Free user sees paywall + purchase button
- [ ] Premium user sees content immediately

### Edit Existing Workout
- [ ] Open workout in admin
- [ ] Change name
- [ ] Save
- [ ] Navigate to frontend workout page
- [ ] New name appears immediately (no deployment)
- [ ] Change `is_premium` from false to true
- [ ] Free users now blocked
- [ ] Premium users still have access

### Create Stripe Product
- [ ] Create workout with standalone purchase
- [ ] Leave Stripe fields empty
- [ ] On first purchase, Stripe product/price created automatically
- [ ] `stripe_product_id` and `stripe_price_id` saved to database
- [ ] Future purchases use existing Stripe product

### Manage Users
- [ ] View user list
- [ ] View user details
- [ ] Can see subscription status
- [ ] Can see purchase history
- [ ] Can send message to user

### View Analytics
- [ ] Access analytics dashboard
- [ ] View user activity
- [ ] View purchase reports
- [ ] View content performance metrics

---

## 📱 Responsive Design Testing

### Mobile (375px width)
- [ ] Home page renders correctly
- [ ] Navigation menu works (hamburger if applicable)
- [ ] Workout cards display properly
- [ ] Dashboard tabs usable
- [ ] Forms are usable
- [ ] Buttons not cut off
- [ ] Text not overflowing
- [ ] No horizontal scroll

### Tablet (768px width)
- [ ] All pages render correctly
- [ ] Grid layouts adjust properly
- [ ] Cards display in appropriate columns
- [ ] Navigation accessible
- [ ] Admin panel usable (if accessible on tablet)

### Desktop (1920px width)
- [ ] All pages render correctly
- [ ] Content centered and not stretched
- [ ] Admin panel fully functional
- [ ] Multiple columns display properly

---

## 📊 Dashboard & Logbook

### Dashboard Features
- [ ] Login as user
- [ ] Navigate to `/dashboard`
- [ ] See favorites section
- [ ] See workouts tab with all saved workouts
- [ ] See programs tab with all saved programs
- [ ] See calculator history
- [ ] Can filter by status (completed, in progress, etc.)
- [ ] Can filter by rating
- [ ] Avatar upload works
- [ ] Profile settings save correctly

### Logbook Tracking
- [ ] Complete a workout
- [ ] Mark as "Completed"
- [ ] Status saved to database
- [ ] Appears in "Completed" filter
- [ ] Start a training program
- [ ] Mark as "In Progress"
- [ ] Can track week/day progress
- [ ] Mark program as completed
- [ ] Completion status persists after logout/login

### Favorites
- [ ] Mark workout as favorite
- [ ] Appears in favorites tab
- [ ] Click favorite workout card
- [ ] Navigates to correct workout page (with ID)
- [ ] Mark program as favorite
- [ ] Appears in favorites
- [ ] Can unfavorite items
- [ ] Changes persist

---

## 📝 Blog & Articles

### Blog Listing
- [ ] Navigate to `/blog`
- [ ] All articles display
- [ ] Can filter by category
- [ ] Can sort by newest/oldest
- [ ] Article cards are clickable
- [ ] Images load correctly

### Article Detail
- [ ] Click article card
- [ ] Article content displays
- [ ] Formatting preserved (headings, lists, etc.)
- [ ] Images display
- [ ] No text overflow
- [ ] Share buttons work
- [ ] "Back to Blog" button works
- [ ] Breadcrumbs accurate

### Admin Article Management
- [ ] Admin creates new article
- [ ] Sets category
- [ ] Adds content with rich text editor
- [ ] Publishes article
- [ ] Article appears on frontend immediately
- [ ] Unpublished articles not visible to users

---

## 🔒 Security Verification

### Unauthorized Access Attempts
- [ ] Guest tries to access `/dashboard` → Blocked
- [ ] Guest tries to access `/admin` → Blocked
- [ ] Free user tries to access `/admin` → Blocked
- [ ] Premium user tries to access `/admin` → Blocked (unless also admin)
- [ ] Guest tries direct workout URL → AccessGate shown

### Purchase Security
- [ ] Premium user cannot see purchase buttons
- [ ] Premium user cannot complete API purchase (test via network)
- [ ] Free user cannot purchase already-purchased content
- [ ] Guest must login before purchasing

### Admin Security
- [ ] Non-admin redirected from `/admin`
- [ ] Admin role verified server-side (not just client)
- [ ] Admin changes logged (if audit log implemented)

---

## 🚀 Performance & UX

### Page Load Times
- [ ] Home page loads < 3 seconds
- [ ] Dashboard loads < 5 seconds
- [ ] Workout/Program pages load < 3 seconds
- [ ] Admin panel loads < 5 seconds

### Loading States
- [ ] Skeletons shown while loading content
- [ ] "Loading..." text appears appropriately
- [ ] No flash of wrong content (FOUC)
- [ ] Spinners for async operations

### Error Messages
- [ ] Failed login shows clear error
- [ ] Failed payment shows clear error
- [ ] Network errors handled gracefully
- [ ] 404 pages user-friendly
- [ ] No raw error objects shown to users

### Smooth Navigation
- [ ] No broken links
- [ ] Back buttons work correctly
- [ ] Breadcrumbs accurate
- [ ] History navigation works
- [ ] Deep links work (direct URL access)

---

## ✅ Final Verification

### Pre-Launch Checklist
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No console errors on any page
- [ ] Responsive design verified on 3 devices
- [ ] Stripe test mode transactions work
- [ ] Admin can manage all content
- [ ] Messaging system reliable
- [ ] Security rules enforced
- [ ] Database backup created
- [ ] Monitoring enabled

### Post-Launch Monitoring (First 24 Hours)
- [ ] Monitor error logs
- [ ] Check payment success rate
- [ ] Verify messaging delivery
- [ ] Watch for session issues
- [ ] Review user feedback
- [ ] Check analytics for issues

---

## 🐛 Known Issues to Watch

1. **Webhook Delays**: If users report "paid but no access", check webhook logs
2. **Session Expiry**: If users logged out unexpectedly, review session duration settings
3. **Real-Time Lag**: Message counts may lag up to 30 seconds (acceptable)
4. **Mobile Safari**: Test specifically on iOS Safari for any quirks

---

## 📞 Emergency Contacts

- **Technical Issues**: [Your email]
- **Payment Issues**: [Support email]
- **Database Issues**: Check Supabase dashboard

---

**Last Updated**: After Complete Audit & Refactoring
**Tested By**: [Your Name]
**Date**: [Testing Date]
**Status**: Ready for Production ✅
