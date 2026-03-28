

# Create "Welcome Message 2" — Onboarding Guide + Automated 5-Day Delivery

## Finding: Manos Never Got the Welcome Message
Manos Christofi (`welcome_sent: false`) has **zero** welcome messages in his inbox. This is a separate issue but worth noting — the welcome trigger may have a bug. We'll send him Welcome Message 2 manually after setup, and I'll also investigate the welcome message gap.

## What This Plan Delivers

1. **A rich, interactive onboarding message** covering all platform features in an engaging, emoji-driven, easy-to-read format
2. **A new message type** (`welcome_onboarding`) added to the database enum and notification registry
3. **An automated template** stored in `automated_message_templates` as "Welcome Message 2"
4. **A new edge function** (`send-welcome-onboarding`) that runs daily via cron, finds premium members who signed up exactly 5 days ago and haven't received this message yet, and sends it via both dashboard + email
5. **A cron job** scheduled to run daily

## Message Content Structure

The message will be visually structured with numbered sections, emojis, bold headers, and short punchy paragraphs — not a wall of text. Sections:

1. 🏆 **Workout of the Day** — philosophy, science-based daily programming, how it's built
2. 📅 **Smarty Workouts Calendar** — browse alternatives if the WOD isn't your mood today
3. 🎯 **Training Programs** — long-term periodized programs for serious goal achievement
4. 🧘 **Smarty Ritual** — daily wellness ritual, why consistency matters
5. 🛠️ **Smarty Tools** — use anywhere, anytime (gym, home, on the go)
6. 📚 **Blog & Knowledge** — fitness, nutrition, wellness articles
7. 📊 **Logbook & Progress** — track goals, see progress, stay motivated
8. 💡 **What Makes SmartyGym Different** — human-designed, science-based, not random workouts

Closing: motivational push — "You have something powerful in your hands."

No name placeholder — it's a generic template.

## Technical Steps

### Step 1: Database migration
- Add `welcome_onboarding` to the `message_type` enum
- Insert the template row into `automated_message_templates` with full HTML content (dashboard + email versions)

### Step 2: Update notification registry
- Add `WELCOME_ONBOARDING` to `supabase/functions/_shared/notification-types.ts`

### Step 3: Create edge function `send-welcome-onboarding`
- Query `user_subscriptions` for active premium members whose subscription `created_at` is exactly 5 days ago
- Check they haven't already received a `welcome_onboarding` message
- Send via `send-system-message` (which handles both dashboard + email delivery)
- Pattern follows `send-renewal-reminders` — checks automation rule, uses template, sends to qualifying users

### Step 4: Create cron job
- Schedule daily at 10:00 UTC (12:00 Cyprus) — a good mid-morning time for an onboarding email
- Uses existing `cron.schedule` + `net.http_post` pattern

### Step 5: Add to admin UI
- The template will appear automatically in the Templates tab since it uses the standard `automated_message_templates` table
- Add automation rule entry so it can be toggled on/off from the Auto Messages tab

### Step 6: Send Welcome Message 1 to Manos
- Manos never received his welcome message — trigger it manually for him

## Files Changed
- Database migration (enum + template + automation rule)
- `supabase/functions/_shared/notification-types.ts` — add WELCOME_ONBOARDING
- `supabase/functions/send-welcome-onboarding/index.ts` — new edge function
- `supabase/config.toml` — function config
- Cron job via SQL insert

