

## SEO Optimization for All Workouts and Programs + Automated Future Coverage

### Current State

- **318 visible workouts** across 9 categories — **288 already have SEO metadata**, **33 are missing** (mostly recent WOD-converted gallery workouts)
- **28 visible programs** across 6 categories — **all 28 already have SEO metadata**
- The `refresh-seo-metadata` weekly cron already handles new content automatically, but it only processes items that have **no existing SEO entry** — it never upgrades existing ones

### What Will Be Done

**1. Generate rich SEO metadata for the 33 missing workouts**

A script will use the AI gateway to generate optimized `meta_title`, `meta_description`, 15-20 keywords (including "Haris Falas", "SmartyGym", brand variants, priority "online fitness/workout" keywords, category-specific terms, and each workout's unique name), `image_alt_text`, and `json_ld` (ExercisePlan schema) for each. These will be inserted into `seo_metadata` with `content_type = 'workout'`.

**2. Upgrade existing 288 workout SEO entries with richer keywords**

The current entries have only 5-8 keywords each. The script will **merge** additional keywords into each existing record without removing any current keywords. Added keywords will include:
- Priority online keywords (online fitness, online workout, online training programs, etc.)
- Brand variants (SmartGym, Smart Gym, Smart-Gym)
- Domain keywords (smartygym.com, i-training.net, smartywod.com, etc.)
- Category-specific terms (e.g., "HIIT calorie burn" for CALORIE BURNING, "pilates core control" for PILATES)
- "Haris Falas" if not already present

Existing `meta_title`, `meta_description`, and `image_alt_text` will be preserved — only the `keywords` array will be enriched.

**3. Upgrade existing 28 program SEO entries with richer keywords**

Same enrichment approach as workouts — merge additional branded, priority, and category-specific keywords into each program's existing keyword array without touching titles or descriptions.

**4. Automate SEO generation for future workouts and programs**

The existing `refresh-seo-metadata` edge function already handles this — it runs weekly (Sunday 02:00 UTC) and processes any content item that doesn't yet have an `seo_metadata` row. This already covers new workouts and programs automatically.

Additionally, I will verify that the database triggers (`queue_workout_notification`, `queue_program_notification`) do not interfere with the SEO pipeline.

**No existing SEO data will be deleted or overwritten** — only keywords arrays will be extended, and missing entries will be created.

### Technical Details

- **Script**: One `code--exec` Python script using the AI gateway to generate SEO for the 33 missing workouts, then a second pass to enrich keywords on all 316 existing entries (288 workouts + 28 programs)
- **Database**: `UPDATE` existing `seo_metadata` rows to append keywords; `INSERT` new rows for the 33 missing workouts
- **No code changes needed**: The `refresh-seo-metadata` edge function already auto-generates SEO for any new workout/program added in the future
- **No edge function changes needed**: The existing weekly cron covers future automation
- **Deliverable**: A report listing all workouts and programs with their keyword counts, confirming full coverage

