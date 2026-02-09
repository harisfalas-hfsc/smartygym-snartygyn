

## Blog Article + Automated Weekly Blog Generation

This plan covers two parts: (1) writing and publishing a blog article about exercise benefits for adults over 50, and (2) creating a backend function that automatically generates 3 blog articles every Monday at 6:00 AM Cyprus time, with full cron job integration in your back office.

---

### Part 1: Write the "Exercise Benefits for Adults Over 50" Article

A new blog article will be inserted into the `blog_articles` table with:

- **Title:** "Exercise After 50: How Fitness Prevents Decline and Transforms Your Health"
- **Category:** Fitness
- **Author:** Haris Falas (Sports Scientist | CSCS Certified | 20+ Years Experience)
- **Topics covered:**
  - Preventing age-related muscle loss (sarcopenia) and bone density decline
  - Injury prevention through strength and mobility training
  - Hormonal benefits (testosterone, growth hormone, insulin sensitivity)
  - Cardiovascular and metabolic health improvements
  - Mental health, cognitive function, and quality of life
  - Practical guidance for men and women over 50
- **SEO optimized:** Title, slug, excerpt, meta-friendly content with internal links to workouts, programs, calculators, and related blog articles
- **Image:** AI-generated via the existing `generate-blog-image` function
- **HTML format:** Matches existing articles (h2 headings, internal links with proper classes, structured content)
- **Published immediately** as a live article

---

### Part 2: Automated Weekly Blog Generation

**New Edge Function: `generate-weekly-blog-articles`**

This function will:
1. Use Lovable AI (google/gemini-3-flash-preview) to generate one full article for each category: Fitness, Nutrition, and Wellness
2. Each article gets:
   - A unique, SEO-optimized title and slug
   - A well-structured HTML body (~800-1200 words) with internal links to relevant platform pages
   - An AI-generated featured image via the existing `generate-blog-image` function
   - Proper author attribution (Haris Falas with credentials)
   - Estimated read time
   - The `is_ai_generated` flag set to `true`
3. Articles are saved as **drafts** (`is_published = false`) so you can review, edit, and publish them from the Blog section of your back office
4. Built-in topic variety -- the function will check recent article titles to avoid repeating subjects

**Scheduling:**
- Every Monday at 06:00 AM Cyprus time
- February is winter, so Cyprus = UTC+2, meaning the cron runs at 04:00 UTC -> cron expression: `0 4 * * 1` (adjusted for winter; DST handled by the existing timezone logic)

**Cron Job Registration:**
- Added to the `cron_job_metadata` table under the `content_generation` category
- Job name: `generate-weekly-blog-articles`
- Fully editable from the Cron Jobs section in your Admin Backoffice (schedule, enable/disable, test)

**CronJobsManager Update:**
- Add `generate-weekly-blog-articles` to the `AVAILABLE_FUNCTIONS` list so it appears in the dropdown when creating/editing cron jobs

**CronJobsDocumentation Update:**
- Add the new "Weekly Blog Generation" entry to the scheduled notifications table

---

### What stays untouched

- Existing blog articles -- no changes
- BlogManager component -- articles will appear in your content management as usual
- Blog page -- new articles show up automatically once published
- All other cron jobs -- no modifications
- Article edit/duplicate/publish workflow -- fully preserved

---

### Technical Details

**Files to create:**
- `supabase/functions/generate-weekly-blog-articles/index.ts` -- the new edge function

**Files to modify:**
- `supabase/config.toml` -- add `[functions.generate-weekly-blog-articles]` with `verify_jwt = false`
- `src/components/admin/CronJobsManager.tsx` -- add `'generate-weekly-blog-articles'` to `AVAILABLE_FUNCTIONS` array
- `src/components/admin/CronJobsDocumentation.tsx` -- add new row for Weekly Blog Generation

**Database operations:**
- Insert the initial article into `blog_articles`
- Register the cron job in `cron_job_metadata` (via the manage-cron-jobs edge function)

**Edge function flow:**

```text
generate-weekly-blog-articles
  |
  |-- For each category (Fitness, Nutrition, Wellness):
  |     |-- Fetch recent titles to avoid duplicates
  |     |-- Call Lovable AI to generate article content
  |     |-- Call generate-blog-image to create featured image
  |     |-- Insert into blog_articles as draft
  |
  |-- Return summary of created articles
```

**Cyprus time handling:**
- Uses the same DST logic as other cron jobs (UTC+2 winter, UTC+3 summer)
- Monday 06:00 Cyprus = `0 4 * * 1` (winter) or `0 3 * * 1` (summer)
- The cron expression is set in UTC; the CronJobsManager displays it in Cyprus time automatically

