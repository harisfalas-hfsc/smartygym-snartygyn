

# Create Blog Article: "The Myth of Cholesterol"

## Overview
Write and publish a Nutrition blog article debunking the oversimplified "cholesterol = heart disease" narrative, with evidence-based analysis of oxidized LDL, carnivore diet data, statin side effects, and the multi-factorial nature of cardiovascular risk. Generate an AI image and insert into the database.

## Steps

### 1. Generate article image
AI-generated image: professional food photography showing healthy fats — eggs, steak, avocado, butter, olive oil — styled cleanly on a modern kitchen surface. No text. Upload to `blog-images` storage bucket.

### 2. Write and insert the article
Insert into `blog_articles` with:
- **Title**: "The Myth of Cholesterol"
- **Slug**: `the-myth-of-cholesterol`
- **Category**: Nutrition
- **Author**: Haris Falas (Sports Scientist | CSCS Certified | 20+ Years Experience)
- **is_published**: true
- **is_ai_generated**: false

### 3. Article content structure

1. **Introduction** — The 60-year-old narrative that dietary cholesterol causes heart disease is crumbling under modern evidence. Time to separate myth from science.

2. **The Original Hypothesis & Where It Went Wrong** — Ancel Keys' lipid hypothesis, the flawed Seven Countries Study, cherry-picked data, and how it shaped decades of dietary guidelines.

3. **Oxidized LDL: The Real Culprit** — Total LDL vs oxidized LDL (ox-LDL). It's not the cholesterol in your blood that causes plaque — it's damaged, oxidized LDL particles driven by inflammation, seed oils, sugar, and metabolic dysfunction.

4. **The Carnivore Paradox** — People eating primarily meat and animal fats (high dietary cholesterol) consistently showing normal or improved lipid panels, reduced inflammation markers (CRP, triglycerides), and better metabolic health. Reference real-world data and physician observations (Dr. Shawn Baker, Dr. Paul Saladino, etc.).

5. **Cholesterol Is Not the Villain — It's a Vital Molecule** — Cholesterol's essential roles: hormone production (testosterone, estrogen, cortisol), vitamin D synthesis, brain function (25% of body's cholesterol is in the brain), cell membrane integrity.

6. **The Multi-Factorial Reality of Heart Disease** — The actual risk factors: chronic inflammation, insulin resistance, high triglycerides, low HDL, metabolic syndrome, stress, sedentary lifestyle, processed food consumption. Cholesterol is one data point, not the verdict.

7. **Statins: More Harm Than Good?** — Evidence-based analysis of statin side effects: muscle pain/myopathy, cognitive decline, increased diabetes risk, liver damage, CoQ10 depletion, hormonal disruption. The NNT (Number Needed to Treat) data showing marginal benefit for primary prevention vs significant side effect burden.

8. **What Actually Protects Your Heart** — Exercise (the proven free medicine), whole foods, stress management, sleep, avoiding processed seed oils and refined sugars. Link to SmartyGym training programs.

9. **Disclaimer** — This article is for educational purposes. Always consult your physician before making changes to medication. Link to `/disclaimer`.

- Internal links to: `/workout`, `/trainingprogram`, `/exerciselibrary`, `/daily-ritual`, `/disclaimer`

### 4. Execution method
- Generate image via AI gateway script, upload to storage
- Insert full HTML article via psql

## No codebase changes needed
Data insertion task only.

