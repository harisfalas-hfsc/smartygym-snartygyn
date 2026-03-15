

# Fix the Limited Access Icon - Make Check + Slash Actually Visible

## Problem

The current implementation produces an icon that looks like a tiny pencil/edit icon rather than a green checkmark with an amber slash through it. The check is barely visible because:
- The container is too small (w-6 h-6)
- The amber slash dominates and obscures the checkmark
- The overall result doesn't read as "check with slash"

## Solution

Make the green checkmark larger and bolder so it's clearly visible, then overlay a thinner but distinct amber diagonal line across it. The check should be the dominant visual element, with the slash as a clear modifier.

### Updated code for `renderFeatureValue` (limited case):

```tsx
<div className="relative inline-flex items-center justify-center w-8 h-8 mx-auto">
  <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="w-9 h-[2.5px] bg-amber-500 rotate-[-45deg] rounded-full" />
  </div>
</div>
```

Key changes:
- Container increased to `w-8 h-8` so the check has room to breathe
- Check icon increased to `w-6 h-6` with `strokeWidth={3}` so it's clearly a checkmark
- Slash line made longer (`w-9`) but slightly thinner (`h-[2.5px]`) so it crosses through without hiding the check
- Uses `mx-auto` for centering in all contexts (desktop table and mobile cards)

## Files to Update

1. **src/pages/SmartyPlans.tsx** -- line 150-157, update the limited case (uses `ml-auto`)
2. **src/pages/PremiumComparison.tsx** -- line 119-128, update the limited case (uses `mx-auto`)
3. **src/pages/PremiumBenefits.tsx** -- line 137-146, update the limited case (uses `mx-auto`)

Each file gets the same icon markup, with alignment matching the existing pattern (`ml-auto` for SmartyPlans, `mx-auto` for the other two).

