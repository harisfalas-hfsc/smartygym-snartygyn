

## Fix: Admin Cannot See Draft Blog Articles

### Root Cause

The `blog_articles` table has a **missing RLS policy**. The current SELECT policies are:

- "Anyone can view published articles" -- only returns rows where `is_published = true`

There is NO admin SELECT policy. Admins can insert, update, and delete articles but **cannot read unpublished/draft articles**. This is why the three draft articles created by the Play button are invisible in your Blog Manager.

---

### Fix

Add a new RLS policy that allows admins to see ALL articles (published and drafts):

```sql
CREATE POLICY "Admins can view all articles"
  ON public.blog_articles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

This single database change fixes the problem. No code changes needed -- the BlogManager already handles drafts correctly (reduced opacity, red "Draft" badge). The drafts were always there in the database; they were just blocked by RLS from appearing in your admin panel.

---

### What Will Happen After the Fix

- The three draft articles (Periodization, Fiber Layering, Functional Aging) will immediately appear in your Blog Manager with reduced opacity and a red "Draft" badge
- You can publish, edit, or delete them from the admin panel
- The public blog page will continue to show only published articles (the existing public SELECT policy remains unchanged)
- No other files or components need to change

---

### Optional Enhancement: Add a "Status" Filter

Currently the Blog Manager has filters for Category, Source, and Sort but no filter for Published vs Draft status. A small addition to `BlogManager.tsx` would add a Status filter dropdown with options: All, Published, Drafts.

This is a minor UI improvement and not required for the fix, but would make managing drafts easier going forward.

