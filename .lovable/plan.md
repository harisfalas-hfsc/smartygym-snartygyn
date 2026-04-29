Plan: place Smarty Coach next to the light/dark button

I will bring Smarty Coach back, but not as the old floating draggable button.

What will change:

1. Add a new header-style Smarty Coach button
- It will sit in the right-side header controls next to the light/dark mode button.
- It will use the same round structure as the theme button and avatar/login button.
- Same size: 44px by 44px.
- Same rounded shape.
- Same primary border style.
- Same hover behavior: primary background, primary-foreground icon/text behavior where appropriate.

2. Reuse the existing Smarty Coach modal/functionality
- I will not delete the existing Smarty Coach functionality.
- The button will simply open the existing Smarty Coach modal.
- The old floating button behavior stays removed/unused.

3. Keep desktop/tablet/mobile layout safe
- This change will add the new button inside the existing header control group, instead of using a fixed overlay.
- It will not float over page content anymore.
- It will not block scrolling or hide information.
- The button will appear consistently across desktop, tablet, and mobile unless you later decide mobile-only or desktop-only.

4. Visual design
- Use the Smarty Coach icon inside a circular bordered button.
- Match the ThemeToggle button style closely:

```text
[ Discovery ]        [ Logo ]        [ Coach ] [ Theme ] [ Avatar/Login ]
```

On mobile, it will be part of the top navigation row, not stuck on the page body.

Technical notes:

- Update `src/components/Navigation.tsx` to render a new Smarty Coach trigger button beside `<ThemeToggle />`.
- Import and render the existing `SmartyCoachModal` directly from `src/components/smarty-coach`.
- Add local state in `Navigation` to open/close the modal.
- Keep `src/App.tsx` without the floating `<SmartyCoachButton />`, so the old overlay does not return.
- Do not change desktop menu alignment, Discovery layout, page content, routes, backend, or the existing modal logic.

Verification after implementation:

- Check mobile header at the current mobile/tablet-sized viewport.
- Check desktop header alignment to make sure nothing shifts incorrectly.
- Confirm clicking the new Coach button opens the existing Smarty Coach modal.
- Confirm there is no floating button covering content anymore.