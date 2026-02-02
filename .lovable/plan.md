

# Background Video for "100% Human. 0% AI." Card

## Summary

Add a looping 10-second background video to the "100% Human. 0% AI." card showing a fit couple working out in different locations (office, park, gym) while using a mobile/tablet device. The video will play behind a semi-transparent overlay so the card content remains readable.

---

## Video Requirements

You'll need to provide a 10-second video file showing:
- A fit couple working out
- Three different locations: office, park, and gym
- People holding/watching a mobile or tablet device
- Recommended format: MP4 (H.264 codec for best browser compatibility)
- Suggested dimensions: 1920x1080 or 1280x720
- File size: Keep under 5MB for fast loading

**Note**: The video file needs to be added to `public/videos/` folder (which I'll create). You can either:
1. Upload the video file directly
2. Provide a URL to a royalty-free stock video
3. Let me know if you'd like suggestions for stock video sources

---

## Technical Implementation

### File Changes

**1. Create video folder and add video file**
- Create `public/videos/` directory
- Add video file (e.g., `human-not-ai-background.mp4`)

**2. Update `src/pages/Index.tsx`**

Modify the "100% Human. 0% AI." card (lines 721-792):

```text
Current structure:
┌─────────────────────────────────────────┐
│ Card with gradient background           │
│   ├── Decorative circles (absolute)     │
│   └── CardContent with all text/icons   │
└─────────────────────────────────────────┘

New structure:
┌─────────────────────────────────────────┐
│ Card (relative, overflow-hidden)        │
│   ├── <video> element (absolute, z-0)   │
│   ├── Dark overlay (absolute, z-10)     │
│   └── CardContent (relative, z-20)      │
└─────────────────────────────────────────┘
```

### Video Element Properties

```html
<video
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
>
  <source src="/videos/human-not-ai-background.mp4" type="video/mp4" />
</video>
```

Key attributes:
- `autoPlay`: Starts playing immediately
- `muted`: Required for autoplay to work in browsers
- `loop`: Continuous playback
- `playsInline`: Prevents fullscreen on mobile
- `object-cover`: Ensures video covers entire card without distortion

### Overlay for Readability

Add a semi-transparent overlay between video and content:

```html
<div className="absolute inset-0 bg-background/75 backdrop-blur-sm z-10" />
```

This creates:
- 75% opacity background color overlay
- Slight blur effect for better text readability
- Dark/light mode compatibility (uses theme background color)

---

## Visual Layout

```text
┌──────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Video (z-0)
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Overlay (z-10)
│                                                          │
│              [Transform Your Fitness]                    │
│                                                          │
│              👤  🚫  🧠                                   │
│                                                          │
│            100% Human. 0% AI.                            │  ← Content (z-20)
│                                                          │
│      SmartyGym workouts are built to fit YOUR life       │
│                                                          │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│   │Real Expertise│ │Personal Touch│ │Not a Robot │        │
│   └─────────────┘ └─────────────┘ └─────────────┘        │
└──────────────────────────────────────────────────────────┘
```

---

## Code Changes Summary

| File | Change |
|------|--------|
| `public/videos/human-not-ai-background.mp4` | New video file (you provide) |
| `src/pages/Index.tsx` | Add video element, overlay, and adjust z-index layers |

---

## Styling Adjustments

1. **Remove existing gradient background** from the card (will be replaced by video)
2. **Keep decorative circles** but increase their z-index
3. **Add backdrop-blur** to feature boxes for extra readability
4. **Ensure all text has sufficient contrast** against the video background

---

## Browser Compatibility

- Video autoplay with muted works in all modern browsers
- MP4 with H.264 codec has 98%+ browser support
- `playsInline` ensures proper behavior on iOS Safari
- Fallback: If video fails to load, the overlay shows solid background color

---

## Performance Considerations

- Video will be lazy-loaded (below the fold)
- Keep file size under 5MB for fast loading
- Video is muted (no audio bandwidth)
- Consider adding `poster` attribute for initial frame while loading

---

## Next Step

Please provide the 10-second video file, and I'll implement the background video with the semi-transparent overlay. If you need help finding stock footage, I can suggest sources like:
- Pexels (free)
- Unsplash (free)
- Coverr (free)
- Envato Elements (paid)

