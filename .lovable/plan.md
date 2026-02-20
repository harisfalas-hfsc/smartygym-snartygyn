
# Fix: WOD Dashboard Notification - Too Much Whitespace and Bloated Content

## The Problem

The WOD dashboard notification has excessive vertical spacing caused by:
- 6+ empty `<p class="tiptap-paragraph"></p>` tags creating blank lines
- Heavy ASCII separator bars (`━━━━━━━━━━━━`) that look good in email but are overkill for a small dashboard card
- Redundant intro text ("Your daily fitness content is ready!")
- The overall content is designed for email layout, not for a compact dashboard card

## The Fix (Two Parts)

### Part 1: Compact the Default Dashboard Template

Update `buildDefaultDashboardContent()` in `supabase/functions/send-wod-notifications/index.ts` to produce a cleaner, more compact dashboard message:

**Before (current - 15+ lines with empty paragraphs):**
```
[empty line]
Your daily fitness content is ready!
[empty line]
━━━━━━━━━━━━━━━━━━━
TODAY'S WORKOUTS OF THE DAY
━━━━━━━━━━━━━━━━━━━
[empty line]
Today is CHALLENGE day with TWO workout options:
[empty line]
No Equipment: Summit Gauntlet
With Equipment: Summit Complex
[empty line]
CIRCUIT | Advanced (5 stars)
[empty line]
View Today's Workouts
```

**After (compact - clean and tight):**
```
Today is CHALLENGE day with TWO workout options:

No Equipment: Summit Gauntlet
With Equipment: Summit Complex

CIRCUIT | Advanced (5 stars) | Available for 3.99 each or included with Premium.

View Today's Workouts
```

Changes:
- Remove the empty leading `<p>` tag
- Remove "Your daily fitness content is ready!" (redundant -- the subject already says it)
- Remove the heavy ASCII separator lines
- Remove the repeated title "TODAY'S WORKOUTS OF THE DAY" (already in the subject)
- Keep only essential info: category, workout names, format/difficulty, link
- Reduce empty `<p>` tags from 6 to just 2 (between logical sections)

### Part 2: Fix Today's Existing Notification in Database

Run a SQL update to compact today's already-sent WOD notifications. Replace the bloated content with the compact version so users who haven't read it yet see the clean format.

### Part 3: Collapse Empty Paragraphs in HTMLContent (Safety Net)

Add a CSS rule in the `HTMLContent` component to collapse consecutive empty tiptap paragraphs. This protects against any future templates that still have excessive spacing:

```css
.tiptap-paragraph:empty {
  margin: 0;
  padding: 0;
  line-height: 0.5;
}
```

This is a lightweight safety net -- the primary fix is the template itself.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-wod-notifications/index.ts` | Rewrite `buildDefaultDashboardContent()` to be compact |
| `src/components/ui/html-content.tsx` | Add CSS to collapse empty tiptap paragraphs |
| Database (SQL) | Update today's existing `wod_notification` messages with compact content |
