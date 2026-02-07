

## Update WOD Generation: RPE-Based Finisher Logic + Remove Section Sub-Names

### Change 1: RPE-Based Intensity Balancing

**Where:** `supabase/functions/generate-workout-of-day/index.ts`, lines 763-788 (Finisher section in 5-SECTION WORKOUT STRUCTURE)

**Current text (lines 763-767):**
```
4. ⚡ FINISHER (10-25 min)
   Purpose: Complement the category with DIFFERENT format/structure/intensity
   • Must be RELATED to the category theme
   • Must have DIFFERENT format than main workout
   • Must have DIFFERENT intensity level than main workout
```

**Replace with:**
```
4. ⚡ FINISHER (10-25 min)
   Purpose: Complement the main workout with a DIFFERENT format/structure
   • Must be RELATED to the category theme
   • Must have DIFFERENT format than main workout
   • Intensity is governed by the RPE BALANCING RULE below
```

Then **add** a new RPE block directly after the FINISHER MINIMUM VOLUME section (after line 788), before section 5 (Cool Down):

```
RPE INTENSITY BALANCING RULE (MANDATORY):

The main workout and finisher form ONE training session. Their combined intensity 
must be balanced and humanly achievable, with a recovery break between them.

Use the RPE (Rate of Perceived Exertion) scale to govern this balance:

  RPE 1-3: Very light (walking, gentle movement)
  RPE 4-5: Light to moderate (can hold a full conversation)
  RPE 6-7: Moderate to hard (short sentences only)
  RPE 8-9: Very hard (few words between breaths)
  RPE 10:  Maximum effort (cannot speak)

COMBINED RPE TARGETS BY DIFFICULTY:
  Beginner (1-2 stars):       Combined Main + Finisher RPE = 8 to 11
  Intermediate (3-4 stars):   Combined Main + Finisher RPE = 11 to 14
  Advanced (5-6 stars):       Combined Main + Finisher RPE = 13 to 17

KEY PRINCIPLE: There is a rest period between the main workout and finisher.
The athlete recovers some energy. This means the finisher RPE does NOT need 
to be the simple remainder (10 minus main). The athlete has more capacity 
after resting.

EXAMPLES:
  Main RPE 7 (hard) --> Finisher RPE 5-7 (NOT 3 — rest gives recovery)
  Main RPE 5 (moderate) --> Finisher RPE 7-8 (finisher can push harder)
  Main RPE 9 (very hard) --> Finisher RPE 5-6 (NOT 1 — still meaningful work)
  Main RPE 6 (moderate) --> Finisher RPE 6-7 (balanced session)

WHAT THIS MEANS IN PRACTICE:
  - If the main workout destroys the athlete (RPE 8-9), the finisher should 
    allow quality movement at RPE 4-6, not push them to failure again
  - If the main workout is moderate (RPE 5-6), the finisher can be the 
    intense part of the session at RPE 7-8
  - Never make both main workout AND finisher RPE 9+ (that is overtraining)
  - Never make both main workout AND finisher RPE 3-4 (that wastes the session)
  - The session should feel COMPLETE — the athlete finishes feeling worked 
    but not destroyed
```

---

### Change 2: Remove Creative Sub-Names from Section Headers

The creative workout name belongs ONLY in the `name` JSON field. Section headers should be plain labels with format and duration.

**Where:** Same file, multiple locations in the prompt string.

**a) Add a new SECTION NAMING RULE** after the SECTION ICON RULES block (after line 1578):

```
SECTION NAMING RULE (MANDATORY):
- Soft Tissue Preparation, Activation, Cool Down: Keep simple names with duration
    Example: "Soft Tissue Preparation 5'", "Activation 15'", "Cool Down 10'"
- Main Workout: Label as "Main Workout (FORMAT DURATION')" — NO creative sub-name
    CORRECT: "Main Workout (TABATA 24')" or "Main Workout (CIRCUIT 30')"
    WRONG: "Main Workout: Iron Forge (TABATA 24')" — no sub-names allowed
- Finisher: Label as "Finisher (FORMAT DURATION')" or "Finisher (For Time)" — NO creative sub-name
    CORRECT: "Finisher (8-minute AMRAP)" or "Finisher (For Time)"
    WRONG: "Finisher: Burn Out (8-minute AMRAP)" — no sub-names allowed
- The creative workout name belongs ONLY in the "name" field of the JSON response
- The ENTIRE workout shares ONE name. Sections do not get their own names.
```

**b) Update Gold Standard Template** (lines 1537 and 1546):

```
Old line 1537: 💪 Main Workout: The Grind (20-minute EMOM)
New line 1537: 💪 Main Workout (20-minute EMOM)

Old line 1546: ⚡ Finisher: Metabolic Surge (For Time)
New line 1546: ⚡ Finisher (For Time)
```

**c) Update Bad Finisher Example** (lines 1555-1561):

```
Old line 1556: ⚡ Finisher: Metabolic Melt (8') ← WRONG: "For Time" with fixed 8-minute duration
New line 1556: ⚡ Finisher (8') ← WRONG: "For Time" with fixed 8-minute duration is contradictory
```

**d) Update Finisher Duration Rules** (line 777):

```
Old line 777: CORRECT: "Finisher: Power Burn (For Time)" — no minutes in title.
New line 777: CORRECT: "Finisher (For Time)" — no minutes in title, no sub-name.
```

---

### Files to Modify

**1 file only:** `supabase/functions/generate-workout-of-day/index.ts`

| Location | What Changes |
|---|---|
| Lines 763-767 | Update finisher purpose, remove "DIFFERENT intensity" (replaced by RPE rule) |
| After line 788 | Add RPE INTENSITY BALANCING RULE block |
| Line 777 | Update finisher duration rule example to remove sub-name |
| Lines 1537, 1546 | Gold standard template: remove "The Grind" and "Metabolic Surge" sub-names |
| Lines 1555-1556 | Bad example: update to match new naming convention |
| After line 1578 | Add SECTION NAMING RULE block |

### What Will NOT Change

- The 5-section structure (Soft Tissue, Activation, Main, Finisher, Cool Down)
- Category-specific exercise rules and forbidden exercises
- Format rules (which formats allowed per category)
- Finisher format rules by category (Strength = Reps and Sets only, etc.)
- Finisher minimum volume requirements
- Finisher duration rules (For Time = no fixed time, AMRAP = time cap, etc.)
- HTML formatting, icons, spacing rules
- Equipment governance
- The `name` field behavior (still the creative workout name)
- Duration calculation logic
- Any frontend code
