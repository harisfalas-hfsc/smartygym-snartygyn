
# Fix Carousel Autoplay Resume on Mouse Leave

## Current Behavior

The carousel currently:
- Auto-advances every 3 seconds
- Pauses when you hover over it
- **Does NOT resume** when you move the mouse away (this is the issue!)

## Why This Happens

The `embla-carousel-autoplay` plugin's `stopOnMouseEnter` option only **pauses** the autoplay but doesn't have built-in logic to **resume** when the mouse leaves. Once stopped, it stays stopped.

---

## Solution

Add mouse event handlers to manually control play/pause behavior:

### Changes to `src/components/HeroThreeColumns.tsx`

1. **Update Autoplay configuration** - Remove `stopOnMouseEnter` (we'll handle it manually)

2. **Add mouse event handlers** to the Carousel container:
   - `onMouseEnter` → Call `autoplayRef.current.stop()`
   - `onMouseLeave` → Call `autoplayRef.current.play()`

---

## Code Changes

```typescript
// Line 120-122: Update Autoplay config
const autoplayRef = useRef(
  Autoplay({ delay: 3000, stopOnInteraction: false })
);
```

```tsx
// Line 172-179: Add mouse handlers to Carousel
<Carousel
  setApi={setApi}
  opts={{
    align: "center",
    loop: true,
  }}
  plugins={[autoplayRef.current]}
  className="flex-1 overflow-hidden"
  onMouseEnter={() => autoplayRef.current.stop()}
  onMouseLeave={() => autoplayRef.current.play()}
>
```

---

## Behavior After Fix

| Action | Result |
|--------|--------|
| Page loads | Carousel auto-advances every 3 seconds |
| Hover on carousel | Autoplay pauses |
| Move mouse away | Autoplay resumes |
| Click navigation arrows | Carousel moves, autoplay continues |
| Click navigation dots | Carousel moves, autoplay continues |

---

## File to Modify

| File | Change |
|------|--------|
| `src/components/HeroThreeColumns.tsx` | Update Autoplay config + add mouse handlers |
