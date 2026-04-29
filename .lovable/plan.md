I’ll update only the mobile header layout in `src/components/Navigation.tsx` and leave the desktop (`lg` and above) layout untouched.

Planned mobile header arrangement:

```text
[Discovery] [Smarty Coach]        [Centered Logo]        [Theme] [Avatar]
```

What I will change:
1. Split the current header controls into mobile-specific left, center, and right groups.
2. Move the mobile Discovery button and Smarty Coach button into a left-side mobile-only group.
3. Keep the logo visually centered in the mobile header using absolute centering, so it stays in the true center of the screen instead of being pushed by the buttons.
4. Keep the Theme Toggle and user avatar on the right side on mobile.
5. Slightly increase the mobile logo size to visually match the circular buttons, without increasing the header height.
6. Preserve the existing desktop layout and desktop button behavior exactly as-is.

Technical details:
- The desktop social/menu area will remain `hidden lg:flex`.
- The mobile control groups will use `lg:hidden`, so the changes apply only below the desktop breakpoint.
- The logo container will use mobile-only absolute centering and desktop-only normal flex centering.
- Header padding/height will not be increased; only the logo image height classes will be adjusted for mobile.