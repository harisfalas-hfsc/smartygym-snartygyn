# SmartyGym Development Standards

> **Last Updated:** 2025-12-15  
> **Purpose:** Prevent recurring bugs and ensure consistent, reliable development

---

## 1. Notification System Rules

### 1.1 Message Type Registry (CRITICAL)

**All edge functions MUST import message types from the central registry:**

```typescript
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";
```

**NEVER use hardcoded message_type strings:**

```typescript
// ❌ WRONG - Hardcoded string
message_type: 'wod_notification'

// ✅ CORRECT - Central registry
message_type: MESSAGE_TYPES.WOD_NOTIFICATION
```

### 1.2 Adding New Message Types

When adding a new notification type:

1. Add the type to `supabase/functions/_shared/notification-types.ts`
2. Add source mapping in `MESSAGE_TYPE_SOURCES`
3. Import and use the constant in your edge function
4. Update this documentation

### 1.3 Dual-Channel Delivery

**ALL notifications must be sent through BOTH channels:**

1. Dashboard notification (`user_system_messages` table)
2. Email (via Resend)

**No exceptions.** If a notification exists, it must appear in both places.

### 1.4 Resend Rate Limiting

**600ms delay between individual email sends:**

```typescript
for (const user of users) {
  await sendEmail(user);
  await new Promise(resolve => setTimeout(resolve, 600));
}
```

This prevents 429 rate limit errors from Resend (2 requests/second limit).

---

## 2. Content Creation Standards

### 2.1 Workout Structure

All workouts MUST follow this structure:

```html
<p class="tiptap-paragraph"><strong><u>Warm-Up (X min):</u></strong></p>
<!-- warm-up content -->

<p></p>

<p class="tiptap-paragraph"><strong><u>Main Workout (X min):</u></strong></p>
<!-- main workout content -->

<p></p>

<p class="tiptap-paragraph"><strong><u>Cool-Down (X min):</u></strong></p>
<!-- cool-down content -->
```

### 2.2 HTML Formatting

- **Double quotes only** for all HTML attributes
- **No leading empty paragraphs**
- All list items include `class="tiptap-list-item"`
- Blank line (empty `<p></p>`) between major sections

### 2.3 Image Generation

When creating workouts/programs:

1. **MUST** use `generate-workout-image` or `generate-program-image` edge function
2. **MUST** verify image uploads to Supabase Storage succeed
3. **MUST** update Stripe products with working image URLs
4. **NEVER** use placeholder or local file paths

---

## 3. Access Control Rules

### 3.1 Premium Content

- Premium users have full access to all content
- Standalone purchasers ONLY access their purchased items
- Corporate members inherit Platinum access from their organization

### 3.2 Standalone Purchasers Restrictions

Standalone purchasers **CANNOT** access:
- LogBook
- Smarty Rituals
- Smarty Check-ins
- Any premium feature not explicitly purchased

---

## 4. Edge Function Standards

### 4.1 Logging

All edge functions must include descriptive logging:

```typescript
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FUNCTION-NAME] ${step}${detailsStr}`);
};
```

### 4.2 Error Handling

Always wrap main logic in try-catch and return proper error responses:

```typescript
try {
  // function logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logStep("ERROR", { message: errorMessage });
  return new Response(JSON.stringify({ error: errorMessage }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
}
```

### 4.3 CORS Headers

All edge functions must include:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle OPTIONS preflight
if (req.method === "OPTIONS") {
  return new Response(null, { headers: corsHeaders });
}
```

---

## 5. Database Standards

### 5.1 RLS Policies

- All tables with user data MUST have RLS enabled
- Premium content tables require subscription verification
- Corporate users checked via `corporate_members` table join

### 5.2 Unique Constraints

- Workout interactions: `(user_id, workout_id)` - NOT including workout_type
- Prevents duplicate records causing sync issues

---

## 6. Quality Assurance Checklist

Before deploying any changes:

- [ ] All URLs and links verified against router structure
- [ ] Responsive design tested on desktop, tablet, mobile
- [ ] Access control verified for all user types
- [ ] No hardcoded message_type strings
- [ ] Dual-channel delivery implemented for notifications
- [ ] 600ms rate limiting applied for batch emails
- [ ] Error handling implemented
- [ ] Logging added for debugging
- [ ] Images generated and verified (not placeholders)

---

## 7. Brand Standards

### 7.1 Smarty Prefix

All features use "Smarty" prefix:
- Smarty Workouts
- Smarty Programs
- Smarty Ritual
- Smarty Tools
- Smarty Corporate

### 7.2 Color Scheme

- Primary: Light Blue (HSL: 195 82% 55%)
- Use CSS variables from design system
- Never use colors directly in components

---

## 8. Cron Job Configuration

All scheduled functions must be registered in pg_cron:

| Function | Schedule | Description |
|----------|----------|-------------|
| generate-workout-of-day | 30 0 * * * | Daily WOD at 00:30 UTC (02:30 Cyprus winter) |
| verify-wod-generation | 0 1 * * * | WOD verification at 01:00 UTC |
| generate-daily-ritual | 5 22 * * * | Daily Ritual at 22:05 UTC (00:05 Cyprus winter) |
| send-checkin-reminders | 0 6,18 * * * | Check-ins at 06:00 & 18:00 UTC |
| send-weekly-motivation | 0 8 * * 1 | Mondays at 08:00 UTC |
| send-weekly-activity-report | 0 7 * * 1 | Mondays at 07:00 UTC |
| send-renewal-reminders | 0 7 * * * | Daily at 07:00 UTC |
| send-new-content-notifications | */5 * * * * | Every 5 minutes |
| send-scheduled-notifications | */5 * * * * | Every 5 minutes |
| send-scheduled-emails | */5 * * * * | Every 5 minutes |
| send-subscription-expired-notifications | 0 8 * * * | Daily at 08:00 UTC |
| run-system-health-audit | 0 20 * * * | Daily at 20:00 UTC |

---

## 9. Emergency Contacts

For critical issues:
- Admin Email: admin@smartygym.com
- Support Email: harisfalas@gmail.com

---

*This document must be updated when new patterns are established.*