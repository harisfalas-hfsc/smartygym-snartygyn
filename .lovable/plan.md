

# Fix: Avatar Showing "Mundefined" Due to Trailing Space in Name

## Root Cause
The profile name for `you@example.com` is stored as "Maria " (with a trailing space). When `getUserInitials()` splits this by space, it gets `["Maria", ""]`. It then tries `""[0]` which is `undefined`, producing the string "Mundefined" as the avatar initials.

## Two-Part Fix

### 1. Fix `getUserInitials()` in Navigation.tsx
Trim the name and filter out empty parts from the split result before extracting initials:

```typescript
const getUserInitials = () => {
  const name = (profileName || user?.user_metadata?.full_name || "").trim();
  if (name) {
    const parts = name.split(" ").filter(p => p.length > 0);
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  }
  return user?.email?.[0].toUpperCase() || "U";
};
```

### 2. Fix the stored data
Run a database migration to trim trailing spaces from all profile names so this edge case doesn't recur:

```sql
UPDATE profiles SET full_name = TRIM(full_name) WHERE full_name != TRIM(full_name);
```

This fixes the immediate visual bug and prevents it from happening with any other users who might have trailing spaces in their names.
