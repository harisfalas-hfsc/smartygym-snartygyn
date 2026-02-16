

## Upgrade Macro Calculator: Smart Deficit/Surplus with Aggressiveness Control

### What changes

Add an **"Intensity"** selector that appears after the Goal field (only when goal is "lose" or "gain"). This lets each user choose how aggressive their calorie adjustment should be.

### New "Intensity" field

Three options:
- **Conservative** -- gentle approach, easier to sustain long-term
- **Moderate** -- balanced approach, standard recommendation
- **Aggressive** -- faster results, harder to maintain

### Deficit/Surplus percentages

| Intensity | Weight Loss (deficit from TDEE) | Weight Gain (surplus to TDEE) |
|-----------|-------------------------------|-------------------------------|
| Conservative | 10% | 10% |
| Moderate | 20% | 15% |
| Aggressive | 30% | 20% |

### Safety floors

Regardless of aggressiveness, the calculator will never go below:
- **1,200 kcal** for women
- **1,500 kcal** for men

If the safety floor is hit, the note will warn the user.

### Updated results note

Replace the current generic note with a full breakdown showing:
- Protocol name: Mifflin-St Jeor Equation
- User's BMR value (calories at rest)
- User's TDEE value (BMR x activity multiplier)
- The percentage adjustment applied and why
- Whether a safety floor was applied
- Standard disclaimer to consult a professional

### Example with your numbers (Male, 50y, 95kg, 177cm, Very Active, Lose Weight)

| Intensity | BMR | TDEE | Deficit | Target |
|-----------|-----|------|---------|--------|
| Conservative (10%) | 1,811 | 3,124 | -312 | 2,812 kcal |
| Moderate (20%) | 1,811 | 3,124 | -625 | 2,499 kcal |
| Aggressive (30%) | 1,811 | 3,124 | -937 | 2,187 kcal |

### Technical details

**File**: `src/pages/MacroTrackingCalculator.tsx`

1. **New state variable**: `intensity` with values `"conservative"`, `"moderate"`, `"aggressive"` (default: `"moderate"`)
2. **New UI element**: A `Select` dropdown after the Goal field, conditionally rendered only when goal is `"lose"` or `"gain"`. Hidden for "maintain".
3. **Updated result state**: Add `bmr`, `tdee`, `deficitPercent`, and `safetyFloorApplied` fields
4. **Updated calculation logic** (lines 75-83): Replace fixed `tdee - 500` with percentage-based logic using the intensity mapping, plus safety floor check
5. **Updated note card** (lines 397-402): Show full BMR -> TDEE -> percentage adjustment -> target breakdown with the user's actual numbers

