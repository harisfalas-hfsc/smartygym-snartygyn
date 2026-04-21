
# Smarty Coach UI Fix Plan

## What will be fixed

1. Reposition the floating Smarty Coach button higher on the screen across mobile, tablet, and desktop.
   - Move it above the homepage hero/carousel card area so it no longer overlaps card actions, cart-like controls, or busy image backgrounds.
   - Keep one consistent vertical placement strategy across breakpoints instead of the current `top-[33vh]`, which is too low on the homepage and visually collides with card content.

2. Fix unreadable Smarty Coach cards/buttons in both dark mode and light mode.
   - The current issue comes from `variant="outline"` plus custom hover classes such as `hover:bg-primary hover:text-primary-foreground` while nested texts/icons still keep `text-foreground`, `text-muted-foreground`, or `text-primary`.
   - On hover, backgrounds change, but child text/icon colors do not consistently switch, so labels become hard or impossible to read.
   - This affects:
     - the 4 main menu cards in `SmartyCoachModal.tsx`
     - workout step option buttons
     - program flow option buttons
     - any related nested icon/description content that still uses fixed muted/foreground colors

3. Add a friendlier intro under the “Smarty Coach” title.
   - Replace the current minimal description with clearer helper copy on the main menu.
   - Example tone: “I’m your Smarty Coach. I’m here to help you find the right next step. Choose what you want to do.”
   - Keep contextual subcopy for workout/program/knowledge flows, but make the first screen more welcoming and self-explanatory.

## Files to update

- `src/components/smarty-coach/SmartyCoachButton.tsx`
- `src/components/smarty-coach/SmartyCoachModal.tsx`
- `src/components/smarty-coach/ProgramSuggestionFlow.tsx`
- `src/components/smarty-coach/KnowledgeSuggestionFlow.tsx` if needed for consistency
- `src/components/ui/button.tsx` if a safer reusable outline/coach variant is the cleanest fix

## Implementation approach

### 1) Button position
- Update the floating button’s fixed position in `SmartyCoachButton.tsx`.
- Move it upward from the current viewport-third placement to a safer “above hero cards” zone that works on home/mobile/tablet/desktop.
- Preserve right-side alignment and safe-area support.
- Keep the attention animation intact.

### 2) Hover/readability fix
- Refactor Smarty Coach interactive cards so hover states control both background and all nested text/icon colors together.
- Best approach:
  - use parent `group`
  - apply `group-hover:text-*` to title, subtitle, chevron, and icon wrappers
  - avoid relying only on the base `outline` variant, because it currently carries green-specific styling that clashes with Smarty Coach’s blue theme and theme modes
- Normalize widths/wrapping for long option labels so buttons do not become visually broken on hover.
- Ensure dark-mode and light-mode contrast remain readable before hover, on hover, and on focus.

### 3) Friendlier modal copy
- Update the `DialogDescription` logic in `SmartyCoachModal.tsx`.
- On menu screen, show a short welcoming sentence under the title.
- On subflows, keep brief directional copy like:
  - workout: helping find the best workout now
  - program: helping choose the right plan
  - knowledge: helping find what to read

## Technical details

- Current root cause for unreadable text:
  - `Button` outline variant in `src/components/ui/button.tsx` is globally green-based:
    - `border-green-500 text-primary bg-background hover:bg-green-500 hover:text-white`
  - Smarty Coach buttons then add extra blue hover classes on top.
  - Nested children inside menu cards still use fixed classes like `text-foreground`, `text-muted-foreground`, and `text-primary`, so they do not inherit the right hover contrast.
- Safer fix:
  - either add a dedicated Smarty Coach visual variant, or
  - override Smarty Coach buttons locally with explicit non-conflicting classes and `group-hover` child styling
- No backend changes are needed.
- No database migration is needed.

## Expected result

- Smarty Coach button sits higher and no longer interferes with homepage cards or touch targets.
- All Smarty Coach button/card text stays readable in dark mode and light mode, including on hover/focus.
- The modal feels clearer and more welcoming with friendly intro text under the title.
