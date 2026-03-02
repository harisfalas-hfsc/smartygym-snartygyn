

# Replace Limited Access Icon with Slashed Checkmark

## What Changes

Replace the current sky-blue circle-minus icon (`CircleMinus`) with a **green checkmark overlaid with a diagonal slash line**, creating a "partially available" visual that sits naturally between the green check (full access) and red X (no access).

## Implementation

Create a small inline element using relative positioning: a green `Check` icon with an absolutely-positioned diagonal line across it (using a rotated `Minus` or a CSS pseudo-element). The slash will be in a muted/amber color to contrast with the green check.

The approach:
```tsx
// Replace CircleMinus with:
<div className="relative inline-flex items-center justify-center w-5 h-5 ml-auto">
  <Check className="w-5 h-5 text-green-600" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-6 h-0.5 bg-amber-500 rotate-[-45deg] rounded-full" />
  </div>
</div>
```

This renders a green checkmark with an amber diagonal line crossing through it.

## Files to Update

1. **src/pages/SmartyPlans.tsx** (line 150) -- update `renderFeatureValue` limited case
2. **src/pages/PremiumComparison.tsx** (line ~120) -- update `renderFeatureValue` limited case  
3. **src/pages/PremiumBenefits.tsx** (line ~137) -- update `renderFeatureValue` limited case

All three files contain the same `renderFeatureValue` function with the limited access icon rendering. Each will get the identical replacement.

## Result

- The "Limited access" indicator becomes a green check with a diagonal amber slash -- clearly distinct from both full access (plain green check) and no access (red X)
- Works on both mobile card view and desktop table view
- Consistent across all three pages that show the comparison table
