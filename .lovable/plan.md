

## Add "What We Offer" Introduction to the Hero Card

### What Changes

Inside the hero card on the homepage (`src/pages/Index.tsx`, lines 812-820), a new introductory paragraph will be inserted between the "Your Gym Re-imagined Anywhere, Anytime" title and the existing "We are not here to replace your gym..." paragraph.

### Current Structure

```
"Your Gym Re-imagined Anywhere, Anytime" (title)
   |
   v
"We are not here to replace your gym..." (paragraph)
```

### New Structure

```
"Your Gym Re-imagined Anywhere, Anytime" (title)
   |
   v
NEW: 2-line "what we offer" paragraph (workouts, programs, blog, 
     exercise library, logbook -- everything a perfect gym must offer, 
     all in your pocket)
   |
   v
"We are not here to replace your gym..." (existing paragraph, unchanged)
```

### The New Paragraph

A concise, professional 2-line introduction like:

> Expert-crafted workouts, structured training programs, a comprehensive exercise library, science-based articles, and a personal logbook -- everything a complete gym must offer, built by real professionals, all in your pocket at smartygym.com.

This gives first-time visitors an immediate understanding of what SmartyGym is before they read the "backup plan" philosophy below it.

### Technical Details

**File:** `src/pages/Index.tsx` (1 file only)

**Location:** Between line 814 (the title) and line 816 (the existing paragraph)

**What gets added:** A single `<p>` element with `text-sm text-muted-foreground leading-relaxed` styling (matching the card's existing text style), with a small bottom margin (`mb-3`) to visually separate it from the "We are not here to replace your gym" paragraph below.

**What stays unchanged:**
- The "Your Gym Re-imagined Anywhere, Anytime" title
- The "We are not here to replace your gym..." paragraph (word for word)
- The card's border, background, padding, and layout
- Everything else on the homepage
