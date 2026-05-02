# 📧 Automated Messaging System - Comprehensive Report
**Generated:** 2025-11-12  
**Status:** ⚠️ PARTIALLY OPERATIONAL - SCHEDULING REQUIRED

---

## 🎯 Executive Summary

Your automated messaging system has **8 message types** with **customizable templates**, but **scheduled execution is NOT currently active**. The infrastructure is complete, but cron jobs need to be manually configured to enable automatic sending.

**Quick Status:**
- ✅ Templates System: **OPERATIONAL**
- ✅ Manual Sending: **OPERATIONAL**  
- ⚠️ Scheduled Sending: **REQUIRES SETUP**
- ✅ Dashboard Delivery: **OPERATIONAL**

---

## 📋 Message Types Overview

### 1. **Welcome Message** 🎉
- **Type:** `welcome`
- **Trigger:** Automatic on user signup
- **Timing:** Instant (via database trigger)
- **Delivery:** Email (via Resend API)
- **Status:** ✅ **ACTIVE & AUTOMATED**
- **Template:** Uses `email_templates` table (category: 'welcome')
- **Respects:** `notification_preferences.newsletter`
- **Edge Function:** `send-welcome-email`

**How It Works:**
1. User creates account
2. Database trigger fires on `profiles` table insert
3. Edge function invoked automatically
4. Fetches welcome template from database
5. Sends email via Resend
6. Respects user's newsletter preferences

---

### 2. **Workout Purchase** 🏋️
- **Type:** `purchase_workout`
- **Trigger:** Manual (after Stripe checkout)
- **Timing:** On payment success
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Content]` - Workout name
- `[Amount]` - Purchase price

---

### 3. **Program Purchase** 📅
- **Type:** `purchase_program`
- **Trigger:** Manual (after Stripe checkout)
- **Timing:** On payment success
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Content]` - Program name
- `[Amount]` - Purchase price

---

### 4. **Personal Training Purchase** 🤝
- **Type:** `purchase_personal_training`
- **Trigger:** Manual (after Stripe checkout)
- **Timing:** On payment success
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Amount]` - Purchase price
- `[Date]` - Purchase date

---

### 5. **Subscription Purchase** 👑
- **Type:** `purchase_subscription`
- **Trigger:** Manual (after Stripe checkout)
- **Timing:** On subscription activation
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Plan]` - Plan name (Gold/Platinum)
- `[Date]` - Subscription start date

---

### 6. **Renewal Reminder** 🔔
- **Type:** `renewal_reminder`
- **Trigger:** ⚠️ **SCHEDULED** (cron job required)
- **Timing:** 3 days before subscription expiration
- **Schedule:** `0 9 * * *` (Daily at 9:00 AM)
- **Delivery:** Dashboard message (in-app)
- **Status:** ⚠️ **REQUIRES CRON SETUP**
- **Template:** Uses `automated_message_templates` table
- **Respects:** `notification_preferences.renewal_reminders`
- **Edge Function:** `send-renewal-reminders`

**How It SHOULD Work:**
1. Cron job runs daily at 9:00 AM
2. Queries `user_subscriptions` for subscriptions expiring in exactly 3 days
3. Checks user notification preferences
4. Sends dashboard message via `send-system-message`
5. Logs all sent reminders

**Placeholders:**
- `[Plan]` - Plan name
- `[Date]` - Renewal date

**Current Status:** ❌ Not running (no cron job configured)

---

### 7. **Renewal Thank You** 🙏
- **Type:** `renewal_thank_you`
- **Trigger:** Manual (after successful renewal)
- **Timing:** On subscription renewal
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Plan]` - Plan name
- `[Date]` - Next renewal date

---

### 8. **Cancellation Message** 😢
- **Type:** `cancellation`
- **Trigger:** Manual (after subscription cancellation)
- **Timing:** On subscription cancellation
- **Delivery:** Dashboard message (in-app)
- **Status:** ✅ **OPERATIONAL** (requires integration)
- **Template:** Uses `automated_message_templates` table
- **Edge Function:** `send-system-message`

**Placeholders:**
- `[Plan]` - Cancelled plan name
- `[Date]` - Access until date

---

## ⏰ Scheduled Jobs Configuration

### Current Scheduled Jobs

| Job Name | Schedule | Description | Status | Respects Preferences |
|----------|----------|-------------|--------|---------------------|
| **Renewal Reminders** | `0 9 * * *` (Daily 9 AM) | Sends reminders 3 days before subscription expiry | ❌ **NOT CONFIGURED** | ✅ `renewal_reminders` |
| **Re-engagement** | `0 10 * * 1` (Mon 10 AM) | Targets inactive users with expired subscriptions | ❌ **NOT CONFIGURED** | ✅ `promotional_emails` |

### Cron Schedule Format

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌──── month (1-12)
│ │ │ │ ┌─── day of week (0-7, both 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

**Common Examples:**
- `0 9 * * *` = Every day at 9:00 AM
- `0 10 * * 1` = Every Monday at 10:00 AM
- `*/30 * * * *` = Every 30 minutes
- `0 0 * * 0` = Every Sunday at midnight
- `0 8 1 * *` = First day of every month at 8:00 AM

---

## 🔧 Technical Architecture

### Database Tables

#### `automated_message_templates`
- **Purpose:** Store message templates for all automated messages
- **Key Fields:**
  - `message_type` - Type of message (welcome, purchase, etc.)
  - `template_name` - Human-readable name
  - `subject` - Message subject line
  - `content` - Message body (supports placeholders)
  - `is_active` - Whether template is active
  - `is_default` - Primary template for this type

#### `user_system_messages`
- **Purpose:** Store dashboard messages sent to users
- **Key Fields:**
  - `user_id` - Recipient
  - `message_type` - Type of message
  - `subject` - Message subject
  - `content` - Message body
  - `is_read` - Read status
  - `created_at` - Sent time

#### `notification_preferences`
- **Purpose:** User notification preferences
- **Key Fields:**
  - `workout_reminders` - Enable workout reminders
  - `newsletter` - Enable newsletter emails
  - `promotional_emails` - Enable promotional emails
  - `renewal_reminders` - Enable renewal reminders
  - `community_updates` - Enable community updates

### Edge Functions

| Function | Purpose | Authentication | Trigger Type |
|----------|---------|----------------|--------------|
| `send-welcome-email` | Welcome email on signup | Service Role | Database Trigger |
| `send-system-message` | Send dashboard messages | Service Role | Function Call |
| `send-renewal-reminders` | Renewal reminder job | Service Role | Cron Job (Not Set) |
| `send-reengagement-emails` | Re-engagement job | Service Role | Cron Job (Not Set) |

---

## ⚠️ Action Required: Enable Scheduled Jobs

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query

### Step 2: Run Setup SQL

Copy and run the following SQL to enable scheduled messaging:

```sql
-- Enable extensions (if not already enabled)
-- Note: These are usually already enabled in Supabase projects

-- Schedule renewal reminders (Daily at 9:00 AM)
SELECT cron.schedule(
  'send-renewal-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='YOUR_SUPABASE_URL/functions/v1/send-renewal-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule re-engagement emails (Weekly on Monday at 10:00 AM)
SELECT cron.schedule(
  'send-reengagement-emails-weekly',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url:='YOUR_SUPABASE_URL/functions/v1/send-reengagement-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Note:** Replace `YOUR_SUPABASE_URL` and `YOUR_ANON_KEY` with your actual values. These are available in the **Scheduling** tab of the Admin Backoffice.

### Step 3: Verify Scheduled Jobs

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- View job execution history
SELECT * FROM cron.job_run_details ORDER BY end_time DESC LIMIT 10;
```

---

## 📊 Message Template Management

### In Admin Backoffice

Navigate to **Admin Backoffice > Automated Messages** tab to:

✅ **View all templates** organized by message type  
✅ **Create new templates** for any message type  
✅ **Edit existing templates** - change content, subject, placeholders  
✅ **Set default template** - mark which template is used automatically  
✅ **Activate/Deactivate** - toggle templates on/off  
✅ **Duplicate templates** - create variations quickly  
✅ **Delete templates** - remove unused templates  

### Template Placeholders

Use these placeholders in your templates - they'll be automatically replaced:

- `[Plan]` - Subscription plan name (Gold, Platinum)
- `[Date]` - Relevant date (renewal, expiration, purchase)
- `[Amount]` - Purchase amount
- `[Content]` - Workout or program name

**Example Template:**
```
Subject: Your [Plan] Subscription Renewal Reminder

Hi there!

This is a friendly reminder that your [Plan] subscription will renew on [Date].

Thank you for being a valued member!
```

---

## 🔐 Privacy & Preferences

All automated messages respect user notification preferences:

| Message Type | Preference Field | Description |
|--------------|------------------|-------------|
| Welcome Email | `newsletter` | User must opt-in for newsletter |
| Renewal Reminders | `renewal_reminders` | User can disable renewal reminders |
| Re-engagement | `promotional_emails` | User can disable promotional emails |
| Community Updates | `community_updates` | User can disable community notifications |

Users can manage preferences in: **Dashboard > Profile Settings > Notification Preferences**

---

## 🎯 Integration Points

### Where to Call `send-system-message`

#### After Purchase (Stripe Checkout Success)
```typescript
// In your payment success handler
await supabase.functions.invoke('send-system-message', {
  body: {
    userId: user.id,
    messageType: 'purchase_workout', // or 'purchase_program', 'purchase_personal_training'
    customData: {
      contentName: 'Beast Mode Workout',
      amount: '€29.99'
    }
  }
});
```

#### After Subscription Activation
```typescript
// In your subscription activation handler
await supabase.functions.invoke('send-system-message', {
  body: {
    userId: user.id,
    messageType: 'purchase_subscription',
    customData: {
      planName: 'Gold',
      date: new Date().toLocaleDateString()
    }
  }
});
```

#### After Subscription Renewal
```typescript
// In your subscription renewal webhook handler
await supabase.functions.invoke('send-system-message', {
  body: {
    userId: user.id,
    messageType: 'renewal_thank_you',
    customData: {
      planName: subscription.plan_type,
      date: nextRenewalDate.toLocaleDateString()
    }
  }
});
```

#### After Cancellation
```typescript
// In your cancellation handler
await supabase.functions.invoke('send-system-message', {
  body: {
    userId: user.id,
    messageType: 'cancellation',
    customData: {
      planName: subscription.plan_type,
      date: accessUntilDate.toLocaleDateString()
    }
  }
});
```

---

## 📈 Monitoring & Testing

### Test Individual Functions

In **Admin Backoffice > Scheduling** tab:
- Click **"Test Now"** button for any scheduled job
- View execution results in browser console
- Check dashboard for sent messages

### View Execution History

```sql
-- View recent cron job runs
SELECT 
  jobid,
  jobname,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobname IN ('send-renewal-reminders-daily', 'send-reengagement-emails-weekly')
ORDER BY start_time DESC 
LIMIT 20;
```

### Check Sent Messages

```sql
-- View recent automated messages
SELECT 
  message_type,
  subject,
  is_read,
  created_at
FROM user_system_messages
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🚀 Next Steps

1. ✅ **Review Templates** - Go to Admin Backoffice > Automated Messages
2. ⚠️ **Set Up Cron Jobs** - Follow the SQL setup instructions above
3. ✅ **Test Functions** - Use the "Test Now" buttons in Scheduling tab
4. ✅ **Integrate Purchase Handlers** - Add `send-system-message` calls after purchases
5. ✅ **Monitor Execution** - Check cron job history regularly

---

## 📞 Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review `user_system_messages` table for delivery confirmation
- Test functions manually using "Test Now" buttons
- Verify user notification preferences if messages aren't being sent

---

## 🔄 Re-engagement Job Details

**Additional Feature:** The re-engagement job has smart logic:

- Targets users with **expired subscriptions** (status != 'active', plan != 'free')
- Only sends if user has been **inactive for 30+ days** (no workout interactions)
- Respects user's `promotional_emails` preference
- Prevents spam by checking recent activity

**SQL Query Used:**
```sql
-- Find expired subscriptions
SELECT user_id, plan_type 
FROM user_subscriptions 
WHERE status != 'active' AND plan_type != 'free';

-- Check if user was recently active (last 30 days)
SELECT * FROM workout_interactions 
WHERE user_id = ? AND updated_at >= (NOW() - INTERVAL '30 days');
```

---

**End of Report**  
*Access the new Scheduling Manager in Admin Backoffice to set up cron jobs and enable automated messaging.*