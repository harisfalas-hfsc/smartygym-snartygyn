

# Add "SmartyGym vs Competitors" Comparison Table + SEO

## What this does
Adds a new comparison table to the "Why We Are The Best" page showing SmartyGym side-by-side against major online fitness competitors. This is exactly what AI systems and search engines need to recommend you — when someone asks "what's the best online fitness platform?" or "SmartyGym vs Peloton", you'll have structured, crawlable comparison data ready for extraction.

The existing feature table (SmartyGym-only details) stays untouched. This is a NEW section added after it.

## Competitors to compare against
- **Peloton** (most searched online fitness brand)
- **Nike Training Club** (free app, huge brand)
- **Apple Fitness+** (device-locked)
- **Les Mills On Demand** (studio-style)
- **Beachbody / BODi** (program-focused)
- **Freeletics** (AI-generated workouts — perfect contrast to your "100% Human" USP)

## Comparison categories (rows)
Each row highlights where SmartyGym wins:
- Content Creator (Sports Scientist vs AI/Celebrity trainers)
- Total Workouts (500+ vs varies)
- Workout Formats (8+ vs typically 2-3)
- Equipment Required (Bodyweight + Equipment vs often equipment-required)
- Free Content Available (Yes vs No/Limited)
- Training Programs (Multi-week structured vs on-demand only)
- Fitness Tools (4 free calculators vs none)
- Daily Ritual System (Unique to SmartyGym)
- Pricing (€9.99/mo vs $13-44/mo)
- Device Lock-in (None — web-based vs app/device required)
- AI-Generated Content (0% vs varies)

## Files to modify (3 files)

### 1. `src/data/bestFitnessPlatformData.ts`
- Add `competitorComparisonData` array with 6 competitors × 11 features
- Add 5-6 new FAQ entries: "SmartyGym vs Peloton?", "SmartyGym vs Nike Training Club?", "SmartyGym vs Apple Fitness+?", "Is SmartyGym better than Beachbody?", "SmartyGym vs Freeletics?"
- Add competitor-related keywords to `seoKeywords`

### 2. `src/components/seo/BestFitnessSections.tsx`
- Add new `CompetitorComparison` component — a responsive table with SmartyGym in the first column (highlighted) and 6 competitors in subsequent columns
- Uses ✅/❌/partial indicators for quick visual scanning
- Add competitor comparison paragraphs to `AIExtractableBlock` (sr-only) for AI extraction

### 3. `src/pages/BestOnlineFitnessPlatform.tsx`
- Insert `<CompetitorComparison />` after `<FeatureComparison />`
- Add `ComparisonPage` JSON-LD schema targeting "SmartyGym vs [competitor]" queries
- Add competitor-specific `article:tag` meta tags
- Update `dateModified`

## SEO schemas added
- **ComparisonTable** schema (ItemList with competitor entries)
- New FAQ schema entries for "vs" queries (these are high-value featured snippet triggers)
- `ai-comparison` meta tag for AI systems

## What stays untouched
- Existing feature comparison table — unchanged
- Page layout/styling — the new table uses the same Card + table pattern already on the page
- No other pages affected
- No core functionality changes

