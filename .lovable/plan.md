

# Fix Welcome Message 2 — Missing From Admin Panel & Database

## What Went Wrong

Three things were never completed in the previous implementation:

1. **Template row missing** — The migration only added the enum value `welcome_onboarding` to the database type. It never inserted the actual template content into the `automated_message_templates` table. So the edge function tries to fetch the template and gets nothing.

2. **Automation rule missing** — No row was inserted into the `automation_rules` table for `welcome_onboarding_5day`. That's why you don't see it in the Auto Messages tab.

3. **Hardcoded UI** — The Templates tab (`AutomatedMessagesManager.tsx`) has a hardcoded list of 9 message types on lines 40-50. `welcome_onboarding` is not in that list. Even if the database had the template, the UI would still hide it.

## Implementation Plan

### Step 1: Add `welcome_onboarding` to the Templates UI

Edit `src/components/admin/AutomatedMessagesManager.tsx` — add `welcome_onboarding` to the `MESSAGE_TYPES` object with label "Welcome Onboarding Guide", a relevant icon, and description "Sent 5 days after premium signup — full platform guide".

### Step 2: Insert the template into the database

Use the data insert tool to add the full onboarding template row into `automated_message_templates` with:
- `message_type`: `welcome_onboarding`
- `template_name`: "Welcome Onboarding Guide"
- `subject`: the motivational onboarding subject
- `content`: the full emoji-rich, section-by-section onboarding message (WOD philosophy, Calendar, Programs, Ritual, Tools, Blog, Logbook, what makes SmartyGym different)
- `dashboard_subject` / `dashboard_content` / `email_subject` / `email_content`: matching versions
- `is_active`: true, `is_default`: true

### Step 3: Insert the automation rule into the database

Insert into `automation_rules`:
- `automation_key`: `welcome_onboarding_5day`
- `name`: "Welcome Onboarding Guide (5-Day)"
- `description`: "Sends comprehensive platform guide 5 days after premium signup"
- `rule_type`: `scheduled`
- `trigger_type`: `cron`
- `trigger_config`: with `cron_job_name`, `edge_function_name`, schedule description
- `message_type`: `welcome_onboarding`
- `target_audience`: `premium_members`
- `sends_email`: true, `sends_dashboard_message`: true
- `is_active`: true

### Step 4: Verify the cron job exists

Check and ensure the cron job `send-welcome-onboarding-daily` is registered. If not, insert it via SQL.

## Files Changed

- `src/components/admin/AutomatedMessagesManager.tsx` — add `welcome_onboarding` to hardcoded MESSAGE_TYPES
- Database inserts (2): template row + automation rule row
- Possible cron job registration if missing

