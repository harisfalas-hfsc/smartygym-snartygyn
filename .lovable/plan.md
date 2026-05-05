# Hide App Store badges inside the native app only

## Your situation

Your iOS/Android app is a Capacitor wrapper that displays the **mobile view** of the website. So today, the "Download on App Store" and "Get it on Google Play" badges in the Footer show up:

- On the website (desktop browser) — correct
- On the website (mobile browser) — correct
- **Inside the native app** — wrong (user is already in the app)

You need them visible in the mobile **browser** but hidden inside the **app**. Removing them from "mobile view" via CSS would break the browser too, because the app shows the same mobile view.

## Why this works

The trick is: we don't detect by **screen size** (mobile vs desktop). We detect by **runtime environment** (browser vs Capacitor native shell). Those are two completely different signals:

- A phone in Safari/Chrome → mobile size, **browser** runtime → show badges
- The same phone inside your installed app → mobile size, **native** runtime → hide badges
- A laptop → desktop size, browser runtime → show badges

You already have the helper for this: `src/utils/native.ts` exports `isNativePlatform()`, which uses `Capacitor.isNativePlatform()`. It returns `true` **only** when the page is loaded inside the iOS/Android Capacitor shell, regardless of viewport size.

## Change (one file, ~3 lines)

**`src/components/Footer.tsx`**

1. Add: `import { isNativePlatform } from "@/utils/native";`
2. Inside the component: `const isNative = isNativePlatform();`
3. Wrap the existing "App Store Download Buttons" block (the section with both the Apple App Store and Google Play links, around lines 14–40) so it only renders when `!isNative`:

```tsx
{!isNative && (
  <div>
    {/* App Store Download Buttons */}
    {/* ...existing Apple + Google Play badges unchanged... */}
  </div>
)}
```

That's it. Nothing else changes. Layout, styling, links, all preserved.

## Result

| Where | Badges visible? |
|---|---|
| Desktop browser (smartygym.com) | Yes |
| Mobile browser (Safari/Chrome on phone) | Yes |
| Installed iOS app (Capacitor) | **No** |
| Installed Android app (Capacitor) | **No** |
| PWA installed to home screen via browser | Yes (it's still a browser runtime, not Capacitor) |

Note on the last row: a PWA installed from the browser is technically not the Capacitor native app, so badges would still show there. If you also want to hide them in the installed PWA, we'd add a `display-mode: standalone` check — tell me if you want that included; otherwise we leave it (most users will install the real native app from the stores, not the PWA).

## Future-proof

- Works automatically for every future build of the app — no per-release config.
- Works for any other "install the app" prompts you add later: just guard them with the same `!isNative` check.
- No risk to the website: in any browser, `isNativePlatform()` returns `false` and the badges render exactly as today.
