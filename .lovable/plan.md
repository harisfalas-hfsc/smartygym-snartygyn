

## Fix Broken Blog Links and Prevent Future Issues

### Problems Found

After auditing every link in all 13 blog articles and the automated generation system, two broken links were identified:

1. **`/dailyritual`** -- This path does not exist. The correct route is `/daily-ritual` (with a hyphen). Appears in the "Exercise After 50" article and in the edge function's link templates for Nutrition and Wellness categories.

2. **`/parq`** -- This path does not exist as a standalone page. The PAR-Q questionnaire is embedded inside the User Dashboard and the Disclaimer page. Appears in the "Exercise After 50" article and in the edge function's link templates for Fitness and Wellness categories.

All blog-to-blog cross-links (e.g., `/blog/science-of-sleep-why-rest-secret-weapon`) were verified and are correct.

---

### Fix 1: Update Existing Articles in the Database

Run SQL UPDATE statements to fix the two broken links across all articles that contain them:

- Replace `/dailyritual"` with `/daily-ritual"` in all article content
- Replace `/parq"` with `/disclaimer"` in all article content (the Disclaimer page contains the PAR-Q questionnaire and is publicly accessible, unlike the user dashboard)

This is a bulk find-and-replace on the `content` column of `blog_articles`.

---

### Fix 2: Update the Edge Function Link Templates

**File: `supabase/functions/generate-weekly-blog-articles/index.ts`**

Update the `INTERNAL_LINKS` object to use the correct paths:

- Change `href="/dailyritual"` to `href="/daily-ritual"` (in Nutrition and Wellness arrays)
- Change `href="/parq"` to `href="/disclaimer"` and update the label to "health disclaimer and PAR-Q screening" (in Fitness and Wellness arrays)

---

### Fix 3: Add a Valid Links Reference to the AI Prompt

Add a "VALID INTERNAL LINKS" section to the AI prompt inside the edge function so the AI model only uses verified, working links when writing articles. This acts as a safeguard: even if the AI tries to create a link on its own, the prompt explicitly lists the only paths it should use.

The valid links list:

```text
/workout - Workout library
/trainingprogram - Training programs
/1rmcalculator - One Rep Max Calculator
/bmrcalculator - BMR Calculator
/caloriecalculator - Calorie Calculator
/exerciselibrary - Exercise library
/daily-ritual - Daily Smarty Ritual
/disclaimer - Health disclaimer and PAR-Q
/blog - Blog articles
```

The prompt will include an instruction like: "ONLY use links from the provided list. Do NOT invent or guess any URLs."

---

### Fix 4: Add Link Validation After AI Generation

In the edge function, after the AI generates article content and before inserting into the database, add a validation step that:

1. Extracts all `href` values from the generated HTML
2. Checks each against a whitelist of valid internal paths (plus `/blog/` prefix for cross-article links)
3. Removes or corrects any links that do not match valid routes

This ensures that even if the AI model ignores the prompt instructions, broken links never make it into the database.

---

### Summary of Changes

| What | Action |
|------|--------|
| Existing articles in database | SQL UPDATE to fix `/dailyritual` and `/parq` |
| Edge function `INTERNAL_LINKS` | Fix `/dailyritual` to `/daily-ritual`, `/parq` to `/disclaimer` |
| Edge function AI prompt | Add explicit valid links list with "only use these" instruction |
| Edge function post-processing | Add link validation before database insert |

### Technical Details

**Database update (via insert tool, not migration):**
```sql
UPDATE blog_articles 
SET content = REPLACE(content, 'href="/dailyritual"', 'href="/daily-ritual"')
WHERE content LIKE '%href="/dailyritual"%';

UPDATE blog_articles 
SET content = REPLACE(content, 'href="/parq"', 'href="/disclaimer"')
WHERE content LIKE '%href="/parq"%';
```

**Edge function changes (`generate-weekly-blog-articles/index.ts`):**
- Lines 49-63: Update `INTERNAL_LINKS` paths
- Lines ~130-160: Add valid links reference to the AI prompt
- After JSON parsing (~line 190): Add `validateAndFixLinks()` function that strips or fixes invalid hrefs

**Link validation function logic:**
```text
VALID_PATHS = ["/workout", "/trainingprogram", "/1rmcalculator", "/bmrcalculator", 
               "/caloriecalculator", "/exerciselibrary", "/daily-ritual", 
               "/disclaimer", "/blog"]

For each <a href="..."> in content:
  - If href starts with "/blog/" -> allow (cross-article link)
  - If href is in VALID_PATHS -> allow
  - Otherwise -> remove the <a> tag but keep the text inside it
```

No other files or features are affected.
