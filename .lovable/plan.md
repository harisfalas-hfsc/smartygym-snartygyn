

# Create Blog Article: "Aging Isn't Optional: How You Age Is"

## Overview
Write and publish a professional Wellness blog article about aging, exercise as medicine, with sections for women (menopause) and men (testosterone decline). Generate an AI image and insert directly into the database.

## Steps

### 1. Generate the article image
Use the AI gateway script to generate a professional image of an active elderly couple (walking, exercising) — warm, aspirational, no text. Upload to Supabase storage bucket `blog-images`.

### 2. Write and insert the article
Insert into `blog_articles` table with:
- **Title**: "Aging Isn't Optional: How You Age Is"
- **Slug**: `aging-isnt-optional-how-you-age-is`
- **Category**: Wellness
- **Author**: Haris Falas, Sports Scientist | CSCS Certified | 20+ Years Experience
- **is_published**: true
- **is_ai_generated**: false (you requested it personally)

### 3. Article structure (HTML content)
- **Introduction**: Aging is inevitable, but HOW you age is largely within your control. Exercise is the only free, proven medicine.
- **What Happens As We Age** — overview of the 4 pillars: hormonal changes, muscle mass loss (sarcopenia), bone density decline (osteoporosis risk), and emotional/mental health shifts.
- **How Women Age: The Menopause Reality** — estrogen decline, accelerated bone loss, muscle loss, mood changes, and how strength training + cardio directly counteract every single one.
- **How Men Age: The Testosterone Decline** — gradual testosterone drop (~1% per year after 30), muscle/strength loss, increased body fat, mood/energy decline, and how resistance training is the most effective natural testosterone booster.
- **Exercise: The Only Free Medicine That Works** — evidence-based summary tying it all together: strength training preserves muscle & bone, cardio protects the heart, movement improves mood and hormonal balance.
- **Conclusion / Call to Action** — link to SmartyGym training programs and workout library.
- Internal links to: `/workout`, `/trainingprogram`, `/exerciselibrary`, `/daily-ritual`, `/disclaimer`

### 4. Execution method
- Use `code--exec` with the AI gateway script to generate the image
- Use `code--exec` with `psql` or the AI gateway to write the full article content
- Insert via database query

## No codebase changes needed
This is a data insertion task — no component or page code modifications required.

