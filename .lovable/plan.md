

# Revamp "The Smarty Method" Page

## Overview
Significantly rework the page to differentiate it from the "Why We Are The Best" page. The new focus: **what is the Smarty Method and WHY does it exist** -- rooted in the modern need for online fitness (busy lives, travel, kids, stress, lack of time, the future of fitness going digital).

---

## Key Changes

### 1. Highlight "SmartyGym" everywhere
Every mention of "SmartyGym" throughout the page will be wrapped in `<span className="text-primary">SmartyGym</span>` so it stands out visually.

### 2. Rename "Smart Periodization" to "Workout of the Day: Smart Periodization"
Rewrite this section to focus specifically on the WOD system:
- Each day targets a different energy system
- The weekly plan covers all fitness parameters a human needs (strength, cardio, mobility, metabolic conditioning, recovery, etc.)
- Whether you're a parent, a traveler, a busy professional -- the WOD handles the planning for you
- Present as attractive cards (keep the card grid format but with WOD-specific content like "Different Energy System Daily", "All Fitness Parameters Covered", "Designed for Real Life", etc.)

### 3. Enhance "The Logbook & Tracking System" section
- Add focus on **goal setting** and **why** a logbook matters
- Include decorative SVG/CSS graph visuals (a simple progress line chart and a bar chart illustration using Recharts or pure CSS) to make the section visually richer
- Sub-cards for: Goal Setting, Workout Logging, Progress Tracking, Session Rating

### 4. Rename "Two Smart Plans" to "Two Smarty Plans"
- Rename "Monthly Plan" to **"Gold Plan"** (EUR 9.99/month)
- Rename "Yearly Plan" to **"Platinum Plan"** (EUR 89.89/year)
- Use actual pricing from `src/config/pricing.ts`

### 5. Rework "Built to Win. Built to Last." closing section
Shift the narrative from generic "we're great" to **WHY this platform needs to exist**:
- The world is going digital -- fitness must follow
- Lives are busier than ever: work, kids, travel, stress
- Even gym-goers need structured programming in their pocket
- The future of fitness is hybrid: online + offline
- **Why having a professional platform on your phone is no longer optional -- it's essential**
- Keep the "Who is SmartyGym For?" audience grid but reframe descriptions around the "why" (e.g., "Parents juggling schedules need fitness that adapts to them, not the other way around")

---

## Technical Details

**File:** `src/pages/TheSmartyMethod.tsx` (full rewrite of content, same component structure)

| Section | Change |
|---------|--------|
| All text | Wrap every "SmartyGym" in `<span className="text-primary">` |
| Periodization | Rename title, rewrite to focus on WOD weekly periodization and energy systems |
| Logbook | Add goal-setting focus, add simple Recharts mini-charts (BarChart, LineChart) for visual enhancement |
| Plans | "Gold Plan" and "Platinum Plan" with real prices from pricing config |
| Closing | Rewrite to focus on WHY online fitness is essential now and in the future |

**New import:** `recharts` (already installed) for the logbook section visuals.
**Import:** `SUBSCRIPTION_PRICES` from `@/config/pricing` for plan prices.

No new files or dependencies needed.

