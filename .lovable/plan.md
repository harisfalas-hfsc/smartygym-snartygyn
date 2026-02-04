
# Implementation Plan

## Overview
This plan addresses 4 distinct updates to the SmartyGym platform:
1. Match the WOD icon in the homepage carousel with the Workouts page
2. Replace the Pilates category background image with a more realistic one
3. Enhance the admin Pictures section with dynamic workout/program images
4. Add auto-rotation to the desktop hero carousel

---

## 1. WOD Icon Consistency

**Current State**: The homepage desktop carousel uses the `Flame` icon for "Workout of the Day", while the Workouts page (`WorkoutFlow.tsx`) uses the `CalendarCheck` icon.

**Change**: Update `Index.tsx` to use the `CalendarCheck` icon for the WOD card (line 180), ensuring visual consistency across the platform.

**Files to modify**:
- `src/pages/Index.tsx` - Change the WOD card icon from `Flame` to `CalendarCheck`
- Import `CalendarCheck` from lucide-react (already imported: Calendar, but not CalendarCheck)

---

## 2. Pilates Category Background Image

**Current State**: The current image shows a woman on a reformer in an extended/aerial pose that appears unrealistic.

**Change**: Generate a new, more realistic Pilates image showing a woman performing a grounded exercise on a reformer machine in a professional studio setting.

**Files to modify**:
- `public/images/workouts/pilates-category-bg.jpg` - Replace with a realistic reformer image

---

## 3. Admin Marketing Pictures Section Enhancement

**Current State**: The "Pictures" tab in Marketing contains only marketing/Instagram templates. It does not include:
- Workout images from the database
- Program images from the database
- Hero card background images

**New Features**:
- Create a new tabbed interface within Pictures: "Templates" (existing), "Workouts", "Programs", "Hero Cards"
- Fetch workout images dynamically from `admin_workouts` table
- Fetch program images from `admin_training_programs` table
- Include hero background images (gym group, home couple, park couple)
- All images downloadable in Instagram sizes (1080x1080 Square, 1080x1350 Portrait, 1080x608 Landscape)
- Images auto-update as new content is added to the database

**Database tables used**:
- `admin_workouts` - columns: id, name, category, image_url
- `admin_training_programs` - columns: id, name, category, image_url

**Files to create/modify**:
- `src/components/admin/marketing/PicturesGallery.tsx` - Restructure with tabs
- `src/components/admin/marketing/WorkoutImagesGallery.tsx` - New component for workout images
- `src/components/admin/marketing/ProgramImagesGallery.tsx` - New component for program images
- `src/components/admin/marketing/HeroImagesGallery.tsx` - New component for hero images
- `src/components/admin/marketing/TemplatesGallery.tsx` - Refactor existing templates

---

## 4. Desktop Carousel Auto-Rotation

**Current State**: The desktop hero navigation carousel (6 cards: WOD, Workouts, Programs, Tools, Library, Blog) requires manual navigation - no auto-rotation.

**Change**: Add auto-rotation every 2.5 seconds with pause-on-hover functionality.

**Implementation**:
- Add state to track if user is hovering
- Use `useEffect` with `setInterval` to auto-advance carousel
- Pause the interval when hovering
- Resume when hover ends

**Files to modify**:
- `src/pages/Index.tsx` - Add auto-rotation logic to the desktop carousel section (around lines 828-901)

---

## Technical Details

### Icon Change (Item 1)
```text
Line 180 in Index.tsx:
Before: icon: Flame,
After:  icon: CalendarCheck,
```

### Auto-Rotation Logic (Item 4)
```text
New state variables:
- isHoveringDesktopCarousel: boolean

New useEffect:
- Auto-advance desktopNavApi every 2500ms
- Clear interval on hover
- Resume on mouse leave

Carousel wrapper:
- onMouseEnter: set isHoveringDesktopCarousel = true
- onMouseLeave: set isHoveringDesktopCarousel = false
```

### Pictures Gallery Structure (Item 3)
```text
PicturesGallery (restructured)
├── Tabs
│   ├── "Templates" - Existing Instagram templates
│   ├── "Workouts" - Database workout images
│   ├── "Programs" - Database program images
│   └── "Hero Cards" - Hero background images
└── Each tab has:
    - Grid of image cards
    - Size selector (Square/Portrait/Landscape)
    - Individual download button
    - Download All button
```

---

## Summary of No-Change Areas

- No visual changes to the public website layout or styling
- No changes to SEO configuration
- No changes to user-facing functionality
- Only the Pilates category card background will be updated (still a reformer image, just more realistic)
- Admin panel changes are internal-only

---

## Files Changed Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/pages/Index.tsx` | Modify | WOD icon + desktop carousel auto-rotation |
| `public/images/workouts/pilates-category-bg.jpg` | Replace | More realistic Pilates image |
| `src/components/admin/marketing/PicturesGallery.tsx` | Restructure | Add tabs for different image sources |
| `src/components/admin/marketing/WorkoutImagesGallery.tsx` | Create | Workout images from database |
| `src/components/admin/marketing/ProgramImagesGallery.tsx` | Create | Program images from database |
| `src/components/admin/marketing/HeroImagesGallery.tsx` | Create | Hero background images |
| `src/components/admin/marketing/TemplatesGallery.tsx` | Create | Move existing templates here |
