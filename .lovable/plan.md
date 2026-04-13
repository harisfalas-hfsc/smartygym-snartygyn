

## Three Custom Blog Articles

A script will generate each article using AI with detailed, specific prompts reflecting your exact requirements, generate unique images, and insert them as drafts into the database.

### Article 1 — Fitness
**Topic:** Comparative analysis of CrossFit, HYROX, F45, Orange Theory, and Calisthenics/street workout trends. Conclusion: structured, periodized strength training under a personalized plan is the only evidence-based method; everything else is a complementary tool.

### Article 2 — Nutrition
**Topic:** Comparative analysis of Keto, Carnivore, Intermittent Fasting, Mediterranean, and Paleo diets. Includes references to WHO and peer-reviewed sources. Conclusion: the best nutrition approach is individualized based on needs, lifestyle, health markers, and personal preferences.

### Article 3 — Wellness
**Topic:** Analysis of GLP-1 weight loss drugs — Ozempic (semaglutide), Mounjaro (tirzepatide), Wegovy, Saxenda, and Zepbound. Covers what they are, side effects, original medical purpose vs. weight loss use, and how to maintain results safely. Conclusion: these are medicines with real risks, not lifestyle shortcuts.

### How it works
1. A script sends three detailed prompts to the AI gateway, each with your specific angle and conclusion
2. Each prompt requires scientific references with real external links (PubMed, WHO, etc.) plus internal SmartyGym links
3. Author: Haris Falas, Sports Scientist | CSCS Certified | 20+ Years Experience
4. Images generated via the existing `generate-blog-image` edge function
5. All three inserted as **drafts** so you can review before publishing

### Technical details
- Uses the existing `blog_articles` table schema
- Calls `generate-blog-image` for each article's featured image
- Articles stored as drafts (`is_published: false`)
- Internal links validated against the whitelist
- One script execution via `code--exec`, inserting directly into the database

