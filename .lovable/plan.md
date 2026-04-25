Plan to fix the landing page behavior

What will change
1. Remove the current `sessionStorage` redirect logic from the landing page.
   - This is the part causing “sometimes yes, sometimes no.”
   - It remembers that the landing page was already seen inside the current tab, then sends `/` to `/home`.

2. Make `/` always render the landing page.
   - Every fresh opening of `smartygym.com` or `www.smartygym.com` will show the landing page.
   - This applies to everyone: visitors, logged-in users, free users, premium users, and admins.

3. Keep the homepage available at `/home`.
   - If someone clicks “go to the homepage” from the landing page, they go to `/home`.
   - If they refresh while already on `/home`, they stay on `/home`.
   - If they close the tab and later open the website root again, they see the landing page again.

4. Keep internal navigation stable.
   - I will not force the landing page to appear when someone opens a deep link like `/workout`, `/blog`, or `/trainingprogram`.
   - The landing page will appear when they open the main website root: `/`.

Technical details
- Edit `src/pages/LandingRouter.tsx`.
- Remove this behavior:

```text
if landing page was already seen in this tab:
  redirect to /home
else:
  mark landing page as seen
```

- New behavior:

```text
route / always shows LandingRouter
route /home always shows the homepage
```

Expected result
- Type `smartygym.com` in a new tab: landing page shows.
- Close the tab, open again, type `smartygym.com`: landing page shows again.
- Open another new tab and type `smartygym.com`: landing page shows again.
- Click “go to the homepage”: goes to `/home`.
- Refresh `/home`: stays on `/home`.
- Refresh `/`: landing page still shows.