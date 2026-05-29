## Goal

Add the new **Rounds Tracker** to every user/AI-facing place that enumerates the Smarty Tools list, so it isn't missing from descriptions, comparisons, and SEO content.

---

## Sites to update

### 1. `src/pages/Tools.tsx` — "About Smarty Tools" desktop description card
- The desktop grid (`hidden md:grid md:grid-cols-2 lg:grid-cols-5`) currently has 5 description blocks (1RM, BMR, Macro, Workout Timer, Calorie Counter).
- Change `lg:grid-cols-5` → `lg:grid-cols-6` and append a sixth block for **Rounds Tracker**: "Big-button tap counter for rounds and optional reps — perfect for AMRAP, EMOM, and circuit training."

### 2. `src/pages/AboutSmartyGym.tsx` — "What's Inside" Smarty Tools block (lines 513–533)
- Grid currently shows 4 items in `md:grid-cols-2`. Add a 5th item with the `Hash` icon (matching Tools page) labeled **Rounds Tracker**. Keep the same styling pattern.

### 3. `src/components/seo/BackgroundSEO.tsx` (lines 113, 115)
- Append `{ name: "Rounds Tracker", url: "/tools/rounds-tracker" }` to the Smarty Tools `links` array.
- Update the FAQ answer to: "SmartyGym offers calculators and tools including 1RM, BMR, macro tracking, calorie counter, workout timer, and rounds tracker."

### 4. `src/utils/seoSchemas.ts` (line 477)
- Update the tool-collection description to mention Calorie Counter, Workout Timer, and **Rounds Tracker** alongside the existing three.

### 5. `src/data/bestFitnessPlatformData.ts` (multiple lines: 18, 34, 78, 102 context, 110, 138, 185–188, 524, 704)
- Bump every "4 free fitness tools" / "(1RM Calculator, BMR Calculator, Macro Calculator, Workout Timer)" enumeration to include **Rounds Tracker** (and Calorie Counter where missing). Update counts ("4 free fitness tools" → "6 free fitness tools").
- Append a Rounds Tracker entry to the tool detail list at lines 185–188 with description: "Free on smartygym.com — giant tap-anywhere counter for rounds and optional reps. Built for AMRAP, EMOM, and circuit workouts when you can't keep count. SmartyGym's Rounds Tracker." emoji: "🔢", color: "border-l-purple-500".

### 6. `src/pages/BestOnlineFitnessPlatform.tsx` (line 90)
- Update the HowToStep tool enumeration to include Calorie Counter and **Rounds Tracker**.

---

## Skipped (intentional)
- `src/pages/Index.tsx` services list — curated short list (already excludes Workout Timer and Calorie Counter). Not the canonical tools enumeration; leave alone.
- `src/utils/socialMediaContent.ts` — single-day social content calendar entry, not a tool list.
- Instagram/admin templates — internal generators, separate concern.

No logic, routing, or styling changes beyond the one column-count bump on the Tools page description card. Content-only edits.
