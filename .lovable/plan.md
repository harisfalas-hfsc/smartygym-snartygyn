

# Community Page Carousel Enhancements

## Overview
Two improvements for the Community page carousel:
1. **Mobile**: Add swipe arrow indicators below the "About Community" description to hint users can swipe
2. **Desktop**: Convert the stacked card layout to a carousel with peek effect and navigation arrows (matching the homepage pattern)

---

## Part 1: Mobile Swipe Indicator

### Current State
- The mobile carousel has dot indicators at the bottom, but users may not notice them
- No visual hint above the carousel that swiping is possible

### Solution
Add a small centered indicator with left/right chevron icons and "Swipe to explore" text directly below the "About Community" card, before the carousel starts.

### Visual Preview
```text
+---------------------------+
|      About Community      |
|   Welcome to SmartyGym... |
+---------------------------+

    <  Swipe to explore  >     <- New indicator

+---------------------------+
|    [Leaderboard Card]     |
+---------------------------+
         o  o  o  o
```

### Implementation
- Add a `div` visible only on mobile (`md:hidden`) containing:
  - Left chevron icon
  - "Swipe to explore" text
  - Right chevron icon
- Apply subtle styling with `text-muted-foreground` and small animation

---

## Part 2: Desktop Carousel with Peek Effect

### Current State
- Desktop displays all 4 cards stacked vertically (full-width cards)
- No carousel behavior on desktop

### Solution
Replace the stacked layout with a horizontal carousel featuring:
- One centered card at ~70% width
- Partial visibility of adjacent cards on left/right edges
- Navigation arrows (similar to homepage hero carousel)
- Dot indicators for direct navigation
- Loop enabled for continuous browsing

### Visual Preview
```text
                 Desktop View
+--------------------------------------------+
|                                            |
|  [<]  |  [Ratings]  |  [LEADERBOARD]  |  [Comments]  |  [>]  |
|       |   (peek)    |    (centered)   |    (peek)    |       |
|                                            |
+--------------------------------------------+
               o  o  o  o
```

### Implementation

**Step 1: Add desktop carousel state**
- New state: `desktopCarouselApi` and `desktopSelectedSlide`
- Track current slide for dot navigation

**Step 2: Update imports**
- Add `CarouselPrevious` and `CarouselNext` to the carousel import

**Step 3: Replace desktop stacked layout**
Convert the `<div className="hidden md:block">` section from 4 stacked cards to a carousel structure:

```tsx
<div className="hidden md:block mb-6">
  <Carousel 
    setApi={setDesktopCarouselApi} 
    opts={{ align: "center", loop: true }}
    className="w-full"
  >
    <CarouselContent className="-ml-4">
      <CarouselItem className="pl-4 basis-[70%]">
        {/* Leaderboard Card */}
      </CarouselItem>
      <CarouselItem className="pl-4 basis-[70%]">
        {/* Ratings Card */}
      </CarouselItem>
      <CarouselItem className="pl-4 basis-[70%]">
        {/* Comments Card */}
      </CarouselItem>
      <CarouselItem className="pl-4 basis-[70%]">
        {/* Testimonials Card */}
      </CarouselItem>
    </CarouselContent>
    
    <CarouselPrevious className="-left-6 w-12 h-12" />
    <CarouselNext className="-right-6 w-12 h-12" />
  </Carousel>
  
  {/* Dot navigation */}
  <div className="flex justify-center gap-2 mt-4">
    {[0, 1, 2, 3].map((index) => (
      <button
        key={index}
        onClick={() => desktopCarouselApi?.scrollTo(index)}
        className={`h-2.5 w-2.5 rounded-full transition-all ${
          desktopSelectedSlide === index 
            ? "bg-primary scale-110" 
            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
        }`}
      />
    ))}
  </div>
</div>
```

**Step 4: Card height standardization**
- Apply consistent height to all 4 desktop cards so they match when scrolling
- Use `h-[600px]` or similar fixed height to ensure equal sizing
- Internal content uses `flex-1 overflow-auto` for scrolling if needed

---

## Technical Details

### Files to Modify
- `src/pages/Community.tsx`

### New State Variables
```tsx
const [desktopCarouselApi, setDesktopCarouselApi] = useState<CarouselApi>();
const [desktopSelectedSlide, setDesktopSelectedSlide] = useState(0);
```

### New useEffect for Desktop Carousel
```tsx
useEffect(() => {
  if (!desktopCarouselApi) return;
  
  const onSelect = () => {
    setDesktopSelectedSlide(desktopCarouselApi.selectedScrollSnap());
  };
  
  desktopCarouselApi.on("select", onSelect);
  onSelect();
  
  return () => {
    desktopCarouselApi.off("select", onSelect);
  };
}, [desktopCarouselApi]);
```

### Import Update
```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,  // Add
  CarouselNext,      // Add
  type CarouselApi,
} from "@/components/ui/carousel";
```

### ChevronLeft/ChevronRight Import
```tsx
import { ChevronLeft, ChevronRight } from "lucide-react"; // For mobile swipe hint
```

---

## Mobile Optimization Verification
All changes will maintain mobile-first design:
- Swipe indicator only visible on mobile (`md:hidden`)
- Desktop carousel only visible on desktop (`hidden md:block`)
- Cards remain touch-friendly with adequate tap targets
- Content readable across all viewport widths (320px to 414px)

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Mobile swipe hint | New component below "About Community" card |
| Desktop layout | Convert stacked cards to carousel with peek effect |
| Navigation | Add arrow buttons + dot indicators for desktop |
| Card sizing | Standardize height across all 4 cards |
| Imports | Add `CarouselPrevious`, `CarouselNext`, `ChevronLeft`, `ChevronRight` |

