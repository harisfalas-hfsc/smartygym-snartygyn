# Messaging System End-to-End Test Protocol

## Overview
This document provides a comprehensive testing protocol for validating the SmartyGym messaging system after Phase 1 (Cron Cleanup) and Phase 2 (Monitoring Dashboard) implementation.

## ✅ Prerequisites Completed

### Phase 1: Cron Job Cleanup ✓
- [x] Removed duplicate `send-scheduled-notifications-job` (*/5 min version)
- [x] Removed old `send-renewal-reminders-job` (9 AM version)
- [x] Enabled "Personal Training Purchase Confirmation" automation
- [x] Verified 5 clean active cron jobs remain

### Phase 2: Monitoring Dashboard ✓
- [x] Created `MessagingMonitoringDashboard.tsx` component
- [x] Integrated into CommunicationsManager as "Monitoring" tab
- [x] Live metrics display (24h, 7d, 30d)
- [x] Automation execution tracking
- [x] Recent activity log (last 50 messages)
- [x] System health monitoring
- [x] Auto-refresh every 30 seconds

---

## 📋 Phase 3: End-to-End Testing

### Test Environment Setup

**Create 3 Test User Accounts:**
```
1. test-free@smartygym.test (Free user, no subscription)
2. test-gold@smartygym.test (Gold subscriber)
3. test-platinum@smartygym.test (Platinum subscriber)
```

**Setup Instructions:**
1. Go to `/auth` and create each account
2. For Gold/Platinum users: Upgrade via Stripe (use test card: `4242 4242 4242 4242`)
3. Note down user IDs from Supabase Dashboard → Authentication → Users

---

## 🧪 Test Scenarios

### Category 1: Event-Triggered Automations

#### Test 1.1: Welcome Message (Signup Trigger)
**Action:** Create new account `welcome-test@smartygym.test`

**Expected Results:**
- ✅ Welcome email sent to inbox within 5 minutes
- ✅ Dashboard notification appears immediately in user messages panel
- ✅ `automation_rules` table: `total_executions` increments for "Welcome Message"
- ✅ `notification_audit_log` has 2 entries (email + dashboard)

**Verification Steps:**
```sql
-- Check automation execution
SELECT name, total_executions, last_triggered_at 
FROM automation_rules 
WHERE automation_key = 'welcome_message';

-- Check audit log
SELECT * FROM notification_audit_log 
WHERE notification_type = 'email' 
AND subject LIKE '%Welcome%'
ORDER BY sent_at DESC LIMIT 5;
```

**Pass Criteria:**
- [ ] Email received within 5 minutes
- [ ] Dashboard message visible in panel
- [ ] Both channels logged in audit
- [ ] Execution count increased

---

#### Test 1.2: Workout Purchase Confirmation
**Action:** Free user purchases standalone workout via Stripe

**Expected Results:**
- ✅ Purchase confirmation email (immediate)
- ✅ Dashboard notification (immediate)
- ✅ Both channels logged

**Verification Steps:**
```sql
SELECT * FROM automation_rules 
WHERE automation_key = 'purchase_confirmation_workout';

SELECT * FROM notification_audit_log 
WHERE message_type = 'purchase_workout'
ORDER BY sent_at DESC LIMIT 3;
```

**Pass Criteria:**
- [ ] Immediate email delivery
- [ ] Dashboard message appears
- [ ] Audit log shows dual delivery
- [ ] Execution count updated

---

#### Test 1.3: Program Purchase Confirmation
**Action:** Free user purchases standalone training program

**Expected Results:**
- ✅ Confirmation email + dashboard notification (immediate)
- ✅ Automation execution tracked

**Pass Criteria:**
- [ ] Both channels deliver immediately
- [ ] Content references purchased program
- [ ] Audit log complete

---

#### Test 1.4: Subscription Purchase Confirmation
**Action:** Free user upgrades to Gold/Platinum via Stripe

**Expected Results:**
- ✅ Subscription confirmation email (immediate)
- ✅ Dashboard notification (immediate)
- ✅ Stripe webhook triggers automation

**Verification:**
Check Stripe Dashboard → Webhooks → View events for `checkout.session.completed`

**Pass Criteria:**
- [ ] Webhook received successfully
- [ ] Both messages sent
- [ ] Correct plan mentioned in content

---

#### Test 1.5: Personal Training Purchase Confirmation
**Action:** User purchases personal training session

**Expected Results:**
- ✅ Confirmation email + dashboard message (immediate)
- ✅ Now works after enabling in Phase 1

**Pass Criteria:**
- [ ] Both channels active
- [ ] No errors in edge function logs
- [ ] Audit log shows success

---

#### Test 1.6: Renewal Confirmation
**⚠️ Manual Simulation Required**

**Action:** Admin manually calls `send-renewal-reminders` edge function

**Expected Results:**
- ✅ Renewal thank you email (5 min delay)
- ✅ Dashboard notification (5 min delay)

**Manual Test:**
```bash
# Call edge function directly
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/send-renewal-reminders \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

**Pass Criteria:**
- [ ] 5-minute delay before delivery
- [ ] Both channels deliver
- [ ] Content mentions renewal/thank you

---

### Category 2: Scheduled/Cron Automations

#### Test 2.1: Weekly Motivation (Monday 10 AM UTC)
**⚠️ Time-Dependent Test**

**Action:** Wait for next Monday 10:00 AM UTC OR manually invoke edge function

**Expected Results:**
- ✅ All users receive motivational email
- ✅ All users see dashboard notification
- ✅ Audit log shows bulk send

**Manual Trigger:**
```bash
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/send-weekly-motivation \
  -H "Authorization: Bearer [ANON_KEY]"
```

**Verification:**
```sql
SELECT * FROM notification_audit_log 
WHERE notification_type = 'email'
AND message_type = 'motivational_weekly'
ORDER BY sent_at DESC LIMIT 1;
```

**Pass Criteria:**
- [ ] All registered users targeted
- [ ] Template content correct
- [ ] Both channels deliver
- [ ] Cron executes on schedule

---

#### Test 2.2: Renewal Reminder (Daily 10 AM UTC)
**⚠️ Time-Dependent Test**

**Setup:** Create test subscription expiring in 3 days

**Expected Results:**
- ✅ Reminder email + dashboard notification
- ✅ Only targets users expiring in 3 days
- ✅ Correct audience filtering

**Manual Setup:**
```sql
-- Create test subscription expiring in 3 days
INSERT INTO user_subscriptions (
  user_id, 
  plan_type, 
  status, 
  current_period_end
)
VALUES (
  '[TEST_USER_ID]',
  'gold',
  'active',
  NOW() + INTERVAL '3 days'
);
```

**Pass Criteria:**
- [ ] Only expiring users receive reminder
- [ ] 3-day timing accurate
- [ ] Both channels active

---

#### Test 2.3: Automated Messages Cron (Every 10 minutes)
**Action:** Monitor edge function logs for 10-minute execution

**Expected Results:**
- ✅ Cron runs every 10 minutes
- ✅ No errors even if no templates scheduled
- ✅ Logs show "Found templates to process: X"

**Check Logs:**
Go to Admin → Monitoring → Recent Activity

**Pass Criteria:**
- [ ] Regular 10-minute execution
- [ ] Clean logs (no errors)
- [ ] Processes scheduled templates correctly

---

#### Test 2.4: Scheduled Notifications Cron (Every 10 minutes)
**Action:** Create manual `scheduled_notifications` entry for 2 minutes from now

**Setup:**
```sql
INSERT INTO scheduled_notifications (
  title,
  body,
  target_audience,
  scheduled_time,
  status
)
VALUES (
  'Test Notification',
  'This is a test scheduled notification',
  'all',
  NOW() + INTERVAL '2 minutes',
  'pending'
);
```

**Expected Results:**
- ✅ Cron picks it up within 10 minutes
- ✅ Notification appears in user panels
- ✅ Entry marked as 'sent' in database

**Pass Criteria:**
- [ ] Delivery within scheduled window
- [ ] All targeted users receive
- [ ] Status updated correctly

---

#### Test 2.5: Scheduled Emails Cron (Every 5 minutes)
**Action:** Create manual `scheduled_emails` entry for 1 minute from now

**Setup:**
```sql
INSERT INTO scheduled_emails (
  subject,
  body,
  target_audience,
  scheduled_time,
  status
)
VALUES (
  'Test Scheduled Email',
  'This is a test email scheduled for immediate delivery',
  'all',
  NOW() + INTERVAL '1 minute',
  'pending'
);
```

**Expected Results:**
- ✅ Email sent within 5-minute window
- ✅ Entry marked as 'sent'

**Pass Criteria:**
- [ ] Fast delivery (within 5 min)
- [ ] Recipients receive email
- [ ] Database updated

---

### Category 3: User Experience Validation

#### Test 3.1: Dashboard Message Panel
**Action:** Login as test user with multiple notifications

**Expected Results:**
- ✅ All notifications appear in "System" tab
- ✅ Mark as read/unread toggle works
- ✅ Badge count updates correctly
- ✅ Real-time updates when new message arrives

**Test Steps:**
1. Login as test user
2. Navigate to dashboard
3. Open messages panel
4. Toggle read/unread on messages
5. Send new message while panel is open

**Pass Criteria:**
- [ ] All system messages visible
- [ ] Toggle functionality works
- [ ] Badge reflects unread count
- [ ] Real-time subscription updates UI

---

#### Test 3.2: Email Deliverability
**Action:** Check inbox for all test emails

**Expected Results:**
- ✅ All emails land in inbox (not spam)
- ✅ HTML formatting correct
- ✅ No broken images or links

**Test Checklist:**
- [ ] Gmail inbox (not spam/promotions)
- [ ] Outlook inbox
- [ ] Apple Mail inbox
- [ ] HTML renders correctly
- [ ] Images load properly
- [ ] Links are clickable

---

### Category 4: Admin Manual Messaging Tests

#### Test 4.1: Send Bulk Email
**Action:** Admin selects "All Users" filter, composes email, sends

**Expected Results:**
- ✅ All users receive email
- ✅ Audit log records bulk send
- ✅ Success/failure counts accurate

**Verification:**
Go to Admin → Auto-Messages → Monitoring → Recent Activity

**Pass Criteria:**
- [ ] All users targeted
- [ ] Email delivered
- [ ] Audit log complete
- [ ] No failures

---

#### Test 4.2: Send Mass Notification
**Action:** Admin sends dashboard notification to specific users

**Expected Results:**
- ✅ Selected users see notification
- ✅ Non-selected users don't see it
- ✅ Correct targeting

**Pass Criteria:**
- [ ] Precise user targeting
- [ ] Only selected receive
- [ ] Notification content correct

---

#### Test 4.3: Unified Announcement
**Action:** Admin sends announcement (new workout) via email + dashboard

**Expected Results:**
- ✅ Both channels deliver to filtered audience
- ✅ Content consistent across channels

**Pass Criteria:**
- [ ] Dual delivery confirmed
- [ ] Audience filter applied correctly
- [ ] Content matches across channels

---

## 📊 Success Metrics

After completing all tests, verify:

### ✅ Final Checklist

**Automation Rules:**
- [ ] 8/8 automation rules have `total_executions > 0`
- [ ] All automations deliver via both email + dashboard
- [ ] Personal Training confirmation now active

**Infrastructure:**
- [ ] 5/5 cron jobs running clean (no duplicates)
- [ ] pg_cron enabled and healthy
- [ ] Edge functions deployed

**Delivery Performance:**
- [ ] 100% success rate for event-triggered messages
- [ ] < 5% failure rate overall (if any)
- [ ] Scheduled messages deliver on time

**User Experience:**
- [ ] Dashboard panel shows all messages
- [ ] Read/unread toggle works
- [ ] Real-time updates functional
- [ ] Email deliverability 100% inbox

**Admin Tools:**
- [ ] Monitoring dashboard shows live data
- [ ] Recent activity log populates
- [ ] Manual messaging tools work
- [ ] Automation rules editable

---

## 🚀 Post-Testing Actions

Once all tests pass:

1. **Document Results:**
   - Create test report with pass/fail for each scenario
   - Screenshot monitoring dashboard metrics
   - Export audit log for verification

2. **Update Documentation:**
   - Mark system as "Production Ready"
   - Update user guides with messaging features
   - Document cron job schedules

3. **Enable Monitoring:**
   - Set up alerts for failed deliveries
   - Schedule weekly admin review of metrics
   - Monitor audit log regularly

4. **Production Launch:**
   - Announce messaging features to users
   - Monitor first week closely
   - Gather user feedback

---

## 📝 Test Report Template

```markdown
# Messaging System Test Report
Date: [DATE]
Tester: [NAME]

## Event-Triggered Automations
- [ ] Test 1.1: Welcome Message - PASS/FAIL
- [ ] Test 1.2: Workout Purchase - PASS/FAIL
- [ ] Test 1.3: Program Purchase - PASS/FAIL
- [ ] Test 1.4: Subscription Purchase - PASS/FAIL
- [ ] Test 1.5: Personal Training - PASS/FAIL
- [ ] Test 1.6: Renewal Confirmation - PASS/FAIL

## Scheduled/Cron Automations
- [ ] Test 2.1: Weekly Motivation - PASS/FAIL
- [ ] Test 2.2: Renewal Reminder - PASS/FAIL
- [ ] Test 2.3: Automated Messages Cron - PASS/FAIL
- [ ] Test 2.4: Scheduled Notifications - PASS/FAIL
- [ ] Test 2.5: Scheduled Emails - PASS/FAIL

## User Experience
- [ ] Test 3.1: Dashboard Panel - PASS/FAIL
- [ ] Test 3.2: Email Deliverability - PASS/FAIL

## Admin Tools
- [ ] Test 4.1: Bulk Email - PASS/FAIL
- [ ] Test 4.2: Mass Notification - PASS/FAIL
- [ ] Test 4.3: Unified Announcement - PASS/FAIL

## Overall Status
- Total Tests: 17
- Passed: X/17
- Failed: X/17
- Success Rate: X%

## Production Ready: YES/NO

## Notes:
[Any additional observations or issues]
```

---

## 🔧 Troubleshooting

**If automations aren't executing:**
1. Check `automation_rules.is_active = true`
2. Verify edge functions deployed
3. Check cron jobs active: `SELECT * FROM cron.job;`
4. Review edge function logs for errors

**If emails not delivering:**
1. Verify RESEND_API_KEY configured
2. Check domain verification in Resend
3. Review email sending limits
4. Check spam folder

**If dashboard messages not appearing:**
1. Verify RLS policies on `user_system_messages`
2. Check real-time subscription enabled
3. Review edge function insert logic
4. Clear browser cache and reload

---

## 📞 Support

For issues during testing:
- Review edge function logs in Lovable Cloud
- Check Supabase logs for database errors
- Consult `docs/AUDIT_REPORT_MESSAGING_SYSTEM.md`
- Contact admin for production debugging

---

**System Status:** Production Ready (pending Phase 3 testing)
**Last Updated:** [DATE]
**Next Review:** After Phase 3 completion
