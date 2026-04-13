

## SEO Optimization for All 27 Blog Articles

### Problem
1. The three new articles (Trendy Fitness, Diet Showdown, GLP-1s) have **no entries** in the `seo_metadata` table
2. Existing article SEO metadata uses inconsistent `content_type` values (`blog`, `blog_article`, `blog-article`) — should be standardized
3. Current keywords are basic and generic — missing article-specific terms that would drive search traffic
4. `ArticleDetail.tsx` doesn't read from `seo_metadata` at all — it uses only the basic `article.category` for keywords
5. The `SEOEnhancer` component uses generic topics instead of article-specific keywords

### What will be done

**1. Generate rich SEO metadata for all 27 articles via script**

A script will analyze each article's content and generate:
- **meta_title**: Keyword-optimized title including "Haris Falas" and "SmartyGym"
- **meta_description**: Under 160 chars, keyword-dense excerpt
- **keywords**: 15-25 article-specific keywords per article (extracted from content + strategic additions)
- **image_alt_text**: Branded alt text for each article image
- **json_ld**: Enhanced Article schema with author, publisher, keywords

For the three new articles specifically:
- **Trendy Fitness**: CrossFit, HYROX, F45, Orangetheory Fitness, OTF, calisthenics, periodization, structured training, strength training, functional fitness, injury risk, evidence-based training, Haris Falas
- **Diet Showdown**: keto diet, carnivore diet, intermittent fasting, Mediterranean diet, paleo diet, individualized nutrition, macronutrients, weight loss diet, WHO nutrition, metabolic health, Haris Falas
- **GLP-1s**: Ozempic, Mounjaro, semaglutide, tirzepatide, Wegovy, Saxenda, Zepbound, GLP-1 receptor agonist, weight loss drugs, side effects, muscle loss, obesity medication, Haris Falas

All articles will include: Haris Falas, SmartyGym, smartygym.com, Sports Scientist, CSCS, plus article-specific terms.

**2. Standardize content_type to `article` and upsert all 27 records**

Clean up existing inconsistent keys (`blog`, `blog_article`, `blog-article`) → all become `article` with `content_id` = article UUID.

**3. Update `ArticleDetail.tsx` to use `seo_metadata`**

- Fetch SEO metadata alongside the article query
- Use `seo_metadata.keywords` array in the `<meta name="keywords">` tag (falling back to current basic keywords)
- Use `seo_metadata.meta_title` for the page title
- Use `seo_metadata.meta_description` for the description meta tag
- Pass article-specific keywords to `SEOEnhancer` component's `aiKeywords` prop
- Add the `json_ld` from seo_metadata as an additional structured data script

**4. Ensure the `refresh-seo-metadata` weekly cron covers articles**

Verify that future auto-generated articles also get SEO metadata entries automatically.

### Technical details

- **Script execution**: One `code--exec` script using the AI gateway to analyze each article's content and generate optimized keywords, then upsert into `seo_metadata` via the Supabase API
- **Database**: Upsert 27 rows into `seo_metadata` with `content_type = 'article'`, delete old inconsistent rows (`blog`, `blog_article`, `blog-article`)
- **Code change**: `src/pages/ArticleDetail.tsx` — add a secondary query for `seo_metadata` and wire it into Helmet/SEOEnhancer
- **Edge function**: Check `generate-weekly-blog-articles` to ensure it creates `seo_metadata` entries for new articles going forward
- **No destructive changes**: All existing SEO data is preserved or upgraded, never deleted without replacement

### Deliverable

A report listing all 27 articles with their optimized keywords, confirming coverage for Google, Bing, and AI crawlers (ChatGPT, Gemini, Claude, Grok, Copilot).

