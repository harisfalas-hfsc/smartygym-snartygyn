## Goal

Two changes to the page currently at `/human-performance`:

1. Add the missing **Smarty Tools** and **Exercise Library** entries to the "Your Complete Fitness Ecosystem" card.
2. Rename the page (file, component, route, URL) from "Human Performance" to **"Why SmartyGym"** so the URL matches the visible page title and the "Why SmartyGym" button in the footer/home.

---

## 1. Add Smarty Tools + Exercise Library to the ecosystem grid

File: `src/pages/HumanPerformance.tsx` (becomes `WhySmartyGym.tsx` — see step 2).

Current grid order inside the "Your Complete Fitness Ecosystem" card:
1. 100% Human. 0% AI. (full width)
2. Daily Fresh Workouts
3. Structured Training Programs
4. Daily Smarty Rituals
5. Smarty Check-ins
6. Expert Blog Articles
7. Supportive Community
8. Personal LogBook (full width)

Currently missing: **Smarty Tools** and **Exercise Library**.

New order, inserting both right after the workout/program/ritual cluster and before community/blog so neither ends up last:
1. 100% Human. 0% AI. (full width)
2. Daily Fresh Workouts
3. Structured Training Programs
4. Daily Smarty Rituals
5. Smarty Check-ins
6. **Smarty Tools** (new)
7. **Exercise Library** (new — placed immediately after Smarty Tools, per the user's instruction)
8. Expert Blog Articles
9. Supportive Community
10. Personal LogBook (full width)

New cards (same visual pattern as the existing items):

- **Smarty Tools** — icon `Wrench` (lucide-react). Description: "Evidence-based calculators — 1RM, BMR, macro tracking and calorie counter — for data-driven training and nutrition."
- **Exercise Library** — icon `Video` (lucide-react). Description: "A searchable library of every exercise used in our workouts and programs, with clear demos and step-by-step instructions."

Both use `bg-primary/20` icon chip + `text-primary` icon, matching the rest. Add `Wrench` and `Video` to the lucide-react import block.

(No copy change to other sections; the rest of the page is untouched.)

---

## 2. Rename page from `/human-performance` to `/why-smartygym`

The visible button and page title are already "Why SmartyGym", but the URL slug and component file still say "human-performance" / `HumanPerformance`. Bring everything in line.

### File rename
- `src/pages/HumanPerformance.tsx` → `src/pages/WhySmartyGym.tsx`
- Default export `HumanPerformance` → `WhySmartyGym`

### Route change in `src/App.tsx`
- Update import: `import WhySmartyGym from "./pages/WhySmartyGym";`
- New route: `<Route path="/why-smartygym" element={<WhySmartyGym />} />`
- **Backwards-compatibility redirect** (preserves any external links, llms.txt, social shares, search-indexed URLs):
  ```tsx
  <Route path="/human-performance" element={<Navigate to="/why-smartygym" replace />} />
  ```
  Reuses the existing `Navigate` import (already used in App.tsx for other redirects).

### Update all internal references found in the codebase
| File | Change |
|---|---|
| `src/components/Footer.tsx:34` | `navigate("/human-performance")` → `navigate("/why-smartygym")` |
| `src/pages/Index.tsx:693` | `navigate('/human-performance')` → `navigate('/why-smartygym')` |
| `src/pages/WhyInvestInSmartyGym.tsx:199` | breadcrumb href `/human-performance` → `/why-smartygym` |
| `src/pages/WhySmartyGym.tsx` (the renamed file) | `<meta property="og:url">` and `<link rel="canonical">` → `https://smartygym.com/why-smartygym` |
| `public/llms.txt:35` | Update label + URL to `[Why SmartyGym](/why-smartygym): ...` |

### Conflict / breakage check
- Verified via grep across `src/`, `supabase/`, `public/`, `index.html`. The only references to `human-performance` / `HumanPerformance` are the 7 listed above. None in supabase functions, sitemaps, or other configs.
- No existing route uses `/why-smartygym` (verified against `src/App.tsx`).
- The 301-style client redirect (`<Navigate replace>`) ensures any old external/email/SEO link still lands on the new page.

---

## Out of scope
- No copy or layout changes outside the ecosystem grid card.
- No SEO meta-text rewrite beyond updating the URL fields above.
- No backend/edge-function changes — none reference this page.
