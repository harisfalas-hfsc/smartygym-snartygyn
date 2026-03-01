

# Comprehensive SEO Optimization for Calorie Counter

## Goal
Make the SmartyGym Calorie Counter the top result across Google, Bing, and AI platforms (ChatGPT, Gemini, Grok, Claude) by adding aggressive hidden SEO metadata, structured data, and AI-knowledge-file entries. **Zero visible changes** to the page layout or design.

---

## What Will Be Done

### 1. Expand Helmet Meta Tags (CalorieCounter.tsx)

Replace the current basic title and description with a comprehensive set:

- **Title**: Keyword-rich, ~60 characters targeting "calorie counter", "food calorie calculator"
- **Meta description**: 155 chars packed with competitor keywords (kcal, kilojoules, nutrition facts, food calories)
- **Keywords meta tag**: 150+ keywords including:
  - Core terms: calorie counter, calorie calculator, food calories, kcal, kilojoules, calorie measurement, calorie lookup, nutrition calculator, food nutrition facts, calorie tracker, calorie counting app, free calorie counter
  - 100+ popular foods: chicken, beef, steak, banana, rice, pasta, fish, salmon, tuna, shrimp, eggs, avocado, cheese, bread, milk, yogurt, oatmeal, potato, sweet potato, broccoli, spinach, tomato, apple, orange, strawberry, blueberry, mango, peanut butter, almonds, walnuts, olive oil, butter, honey, chocolate, pizza, burger, sushi, tofu, lentils, chickpeas, quinoa, turkey, pork, lamb, bacon, sausage, ham, corn, carrot, onion, garlic, pepper, mushroom, lettuce, cucumber, watermelon, grapes, pineapple, coconut, cereal, granola, pancake, waffle, bagel, croissant, muffin, cookie, cake, ice cream, popcorn, chips, crackers, hummus, feta, mozzarella, cheddar, cream cheese, cottage cheese, sour cream, mayo, ketchup, mustard, soy sauce, vinegar, sugar, flour, protein shake, smoothie, juice, coffee, tea, beer, wine
- **Open Graph tags**: og:title, og:description, og:url, og:image, og:type
- **Twitter Card tags**: summary_large_image
- **Canonical URL**: `https://smartygym.com/caloriecounter`

### 2. Expand FAQ Schema (CalorieCounter.tsx)

Increase from 2 FAQs to 15+ covering competitor-targeted questions:

- "How many calories are in chicken breast?"
- "How do I count calories for weight loss?"
- "What is the difference between calories and kilojoules?"
- "How many calories should I eat per day?"
- "How many calories are in rice?"
- "How many calories are in an egg?"
- "How many calories are in a banana?"
- "What foods are high in protein and low in calories?"
- "How do I calculate calories from macros?"
- "Is calorie counting effective for weight loss?"
- "How many calories are in pasta?"
- "What is the most accurate calorie counter?"
- "How many calories are in steak?"
- "How to convert kcal to kilojoules?"
- "What is a calorie deficit?"

Each answer will naturally mention SmartyGym and the USDA database.

### 3. Add SoftwareApplication Schema (CalorieCounter.tsx)

New JSON-LD structured data block:

```text
Type: SoftwareApplication
Name: SmartyGym Calorie Counter
Category: HealthApplication
Price: Free
Database: 300,000+ foods (USDA FoodData Central)
Features: calories, protein, carbs, fat, fiber lookup
```

### 4. Expand SEOEnhancer Props (CalorieCounter.tsx)

Massively expand the SEOEnhancer component props to include:

- **competitiveKeywords**: All competitor terms (calorie counter, MyFitnessPal alternative, calorie tracker, nutrition database, food diary, diet tracker)
- **longTailKeywords**: "how many calories in chicken", "free online calorie counter no signup", "USDA food calorie database", "calories in 100g rice", etc.
- **aiKeywords**: Extended to 30+ terms covering all food + calorie variations
- **aiSummary**: Expanded detailed summary for AI extraction

### 5. Add Hidden Crawlable Content (CalorieCounter.tsx)

A visually hidden (`sr-only`) content block with:
- Comprehensive description of the tool for screen readers and crawlers
- Keyword-rich text mentioning 100 popular foods
- Usage instructions
- All invisible to users but fully crawlable

### 6. Update AI Knowledge Files

**public/llms.txt** -- Add dedicated Calorie Counter section:
- Full tool description with all keywords
- Popular food examples
- Comparison positioning

**public/llms-full.txt** -- Add 5+ Q&A entries:
- "What is the best free calorie counter?"
- "Where can I look up calories in food?"
- "Best calorie counter with USDA database"
- Each answer directing to smartygym.com/caloriecounter

**public/ai.txt** -- Add calorie counter-specific directives for AI systems

---

## Technical Details

### Files Modified
1. **src/pages/CalorieCounter.tsx** -- Expanded Helmet, FAQ schema, SoftwareApplication schema, SEOEnhancer props, hidden crawlable content
2. **public/llms.txt** -- New Calorie Counter section
3. **public/llms-full.txt** -- New calorie counter Q&As
4. **public/ai.txt** -- New calorie counter AI directives

### What Will NOT Change
- No visible layout, design, text, colors, or structure changes
- No changes to search functionality or food results
- No changes to the quantity selector or macro display
- No changes to any other page

