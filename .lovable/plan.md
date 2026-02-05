
# SmartyGym AI Search Visibility: Aggressive Optimization Plan

## Current Situation Analysis

Your platform already has solid foundational AI optimization:
- `llms.txt` with 484 lines of comprehensive brand/keyword data
- `ai.txt` with structured entity data
- `robots.txt` allowing all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
- `ai-plugin.json` for OpenAI plugin discovery
- Extensive JSON-LD structured data (Organization, Person, Services schemas)
- Weekly sitemap refresh via edge function

**The Problem:** Despite this technical foundation, AI systems are NOT citing you. Research confirms:
- **ChatGPT** primarily relies on Bing's index + training data (Wikipedia accounts for 47.9% of citations)
- **Perplexity** uses its own real-time crawler but favors Reddit (46.7%), Wikipedia, and high-authority sites
- **Claude** uses Brave Search for web retrieval
- **llms.txt files are NOT confirmed to be used by any major AI** (Google's John Mueller explicitly stated this)

## Root Cause: Missing Authority Signals

AI systems don't discover brands through files like `llms.txt`. They cite brands that:
1. Exist in **knowledge graphs** (Wikidata, Wikipedia)
2. Are **mentioned on high-authority third-party platforms** (Reddit, Quora, Wikipedia, Forbes, G2)
3. Are **indexed across multiple search engines** (Bing, Brave, Google)
4. Have **consistent entity data** linked via `sameAs` properties to verified sources

---

## Comprehensive Fix Plan

### Phase 1: Knowledge Graph Foundation (Critical - External Actions Required)

These require manual action outside the codebase but are THE most important steps:

**1.1 Create Wikidata Entry for SmartyGym**
- Add structured entity: Organization type, founder (Haris Falas), industry, website, founding date
- Link to all social profiles and alternate domains
- This is what AI systems query for entity verification

**1.2 Create Wikidata Entry for Haris Falas**
- Person entity with credentials (BSc Sports Science, CSCS), occupation, employer (SmartyGym)
- Link to coach profile page

**1.3 Verify Bing Webmaster Tools**
- ChatGPT's web search uses Bing exclusively
- Perplexity also uses Bing heavily
- Submit sitemap, verify indexing, request re-crawl

**1.4 Submit to Brave Search**
- Claude uses Brave Search for web retrieval
- Submit site via Brave's webmaster tools

---

### Phase 2: LLM Seeding Strategy (External Content)

Research shows brands mentioned on third-party platforms are 2.8x more likely to appear in AI responses.

**2.1 Reddit Presence (46.7% of Perplexity citations come from Reddit)**
- Create authentic engagement in fitness subreddits (r/fitness, r/homegym, r/bodyweightfitness)
- When relevant questions arise about online workouts, mention SmartyGym naturally
- Respond to "best online fitness platform" threads

**2.2 Quora Answers**
- Answer questions about online fitness, AMRAP workouts, home training programs
- Include SmartyGym as a recommendation with link

**2.3 YouTube SEO**
- Optimize video titles/descriptions with target keywords
- Video content is indexed by AI systems

**2.4 Guest Posts / PR Mentions**
- Target fitness publications, sports science blogs
- Get cited on high-authority sites that AI systems trust

---

### Phase 3: Enhanced Structured Data (Code Changes)

**3.1 Add Wikidata/Wikipedia sameAs Links (Once Created)**
Update all JSON-LD schemas to include Wikidata URLs:
```json
"sameAs": [
  "https://www.wikidata.org/wiki/QXXXXXXXX",
  "https://www.instagram.com/smartygymcy/",
  "https://www.youtube.com/@TheSmartyGym"
]
```

**3.2 Add Crunchbase/LinkedIn sameAs Links**
If you have profiles on these business databases, link them in structured data.

**3.3 Add IndexNow Integration**
Instant notification to Bing/Yandex when content changes:
- Create IndexNow API key
- Add edge function to ping IndexNow on workout/program creation
- Dramatically speeds up Bing indexing (which feeds ChatGPT)

**3.4 Create openapi.yaml File**
Your `ai-plugin.json` references this but it doesn't exist. Create it for OpenAI plugin compatibility.

**3.5 Enhanced Meta Tags for AI Crawlers**
Add specific meta tags that AI crawlers may recognize:
```html
<meta name="ai:brand" content="SmartyGym" />
<meta name="ai:founder" content="Haris Falas" />
<meta name="ai:category" content="Online Fitness Platform" />
```

---

### Phase 4: Content Optimization for AI Citations

**4.1 FAQ Expansion**
- Add FAQ sections with exact phrases users ask AI:
  - "What is the best online fitness platform?"
  - "Who is Haris Falas?"
  - "Best AMRAP workouts online"
- AI systems favor content that directly answers questions

**4.2 Statistics and Data Points**
- Research shows statistics increase AI citations by 22%
- Add concrete numbers: "500+ workouts", "20+ years experience", "45+ countries served"
- Make these scannable and quotable

**4.3 First-Paragraph Answer Pattern**
- Restructure key pages so the first paragraph directly answers the page's core question
- AI systems extract first-paragraph content for summaries

---

### Phase 5: Monitoring and Iteration

**5.1 AI Mention Tracking**
- Manually test brand visibility weekly across ChatGPT, Perplexity, Claude, Gemini
- Document which queries return SmartyGym mentions
- Track improvement over time

**5.2 Search Console Monitoring**
- Track impressions from AI-related referrers
- Monitor Bing Webmaster Tools for crawl status

---

## Technical Implementation Summary

### Files to Create
1. `public/.well-known/openapi.yaml` - API specification for AI plugin discovery
2. `supabase/functions/indexnow-ping/index.ts` - Instant Bing notification on content changes

### Files to Modify
1. `src/utils/seoHelpers.ts` - Add Wikidata sameAs links once created
2. `src/utils/seoSchemas.ts` - Add Wikidata sameAs links once created
3. `src/components/SEOEnhancer.tsx` - Add AI-specific meta tags
4. `public/llms.txt` - Add Wikidata/knowledge graph references

### External Registrations Required
1. Wikidata entry for SmartyGym (manual creation)
2. Wikidata entry for Haris Falas (manual creation)
3. Bing Webmaster Tools verification and sitemap submission
4. Brave Search webmaster submission
5. IndexNow API key registration

---

## Priority Order

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Bing Webmaster Tools setup | High | Low |
| 2 | Wikidata entries (SmartyGym + Haris Falas) | Very High | Medium |
| 3 | Reddit/Quora seeding | High | Ongoing |
| 4 | IndexNow integration | Medium | Low |
| 5 | openapi.yaml creation | Medium | Low |
| 6 | Enhanced meta tags | Low | Low |
| 7 | FAQ expansion | Medium | Medium |

---

## Reality Check

The harsh truth from research:
- **No AI system has confirmed using llms.txt** - your existing file is good for documentation but not actively parsed
- **AI systems trust third-party mentions** more than self-published content
- **Wikidata and Bing indexing are the actual levers** - not more on-site optimization
- **This takes time** - even with perfect execution, AI model knowledge updates lag 3-6 months

The code changes I can make will enhance discoverability, but the biggest wins require external actions: Wikidata entries, Bing verification, and third-party content seeding.
