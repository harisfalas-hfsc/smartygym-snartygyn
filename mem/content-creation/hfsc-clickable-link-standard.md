---
name: HFSC Clickable Link Standard
description: All visible "HFSC" mentions in body content must be clickable links to https://hfsc.eu/
type: preference
---
Whenever the text "HFSC" appears in any visible body content (page text, card titles, FAQ answers, blog articles, etc.), it MUST be wrapped in a link to https://hfsc.eu/ opening in a new tab.

Format:
`<a href="https://hfsc.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">HFSC</a>`

Why: HFSC (Haris Falas Strength & Conditioning) is the founder's parent brand; every mention is an authority/cross-link opportunity.

How to apply:
- Apply to ALL visible occurrences across the site (Coach CV, Coach Profile, FAQ, About, blog, etc.).
- Do NOT linkify HFSC inside `<title>`, `<meta>`, JSON-LD, or other non-visible SEO content — those stay as plain text.
- For card titles, drop the `text-primary` class (title already styled) but keep the anchor + hover:underline.
