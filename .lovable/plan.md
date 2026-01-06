# Plan: Convert User Dashboard to Colorful Card Grid Navigation

## Overview
Transform the User Dashboard from horizontal scrolling tabs to a colorful, clickable card grid layout matching the Admin Backoffice pattern. This improves mobile usability and creates visual consistency across all dashboards.

## Current State
- UserDashboard uses `<Tabs>` with `<TabsList>` containing 5 horizontal tabs
- Tabs: Workouts, Programs, My Purchases, Messages, My LogBook
- On mobile, tabs are horizontally scrollable (poor UX)
- No visual distinction between sections

## Target State
- Grid of colorful clickable cards (2 columns on mobile, 3 columns on desktop)
- Each card has: icon, label, description, unique color scheme
- Clicking a card shows that section's content
- "Back to sections" button to return to grid view
- Consistent with Admin Backoffice design pattern

---

## Phase 1: Define Dashboard Sections Configuration

Create a `dashboardSections` array in UserDashboard.tsx with colorful styling:

```typescript
const dashboardSections = [
  { 
    id: "workouts", 
    label: "Workouts", 
    description: "Favorites, completed & rated",
    icon: Dumbbell, 
    color: "text-orange-500", 
    bgColor: "bg-orange-500/10" 
  },
  { 
    id: "programs", 
    label: "Programs", 
    description: "Training programs progress",
    icon: Calendar, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10" 
  },
  { 
    id: "purchases", 
    label: "My Purchases", 
    description: "Bought content & orders",
    icon: ShoppingBag, 
    color: "text-emerald-500", 
    bgColor: "bg-emerald-500/10" 
  },
  { 
    id: "messages", 
    label: "Messages", 
    description: "Inbox & notifications",
    icon: MessageSquare, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    badge: unreadCount  // Dynamic badge for unread messages
  },
  { 
    id: "logbook", 
    label: "My LogBook", 
    description: "Activity history & stats",
    icon: BookOpen, 
    color: "text-amber-500", 
    bgColor: "bg-amber-500/10" 
  },
];
```

---

## Phase 2: Change State Management

Update the `activeTab` state to support null (grid view):

**Current:**
```typescript
const [activeTab, setActiveTab] = useState(tabParam || 'workouts');
```

**New:**
```typescript
const [activeTab, setActiveTab] = useState<string | null>(tabParam || null);
```

- When `activeTab` is `null`, show the card grid
- When `activeTab` has a value, show that section's content

---

## Phase 3: Replace Tabs with Card Grid + Section Content

Replace the `<Tabs>` component structure with:

1. **Conditional Grid View** (when `activeTab === null`):
```tsx
{activeTab === null ? (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {dashboardSections.map((section) => {
      const IconComponent = section.icon;
      return (
        <Card 
          key={section.id}
          onClick={() => setActiveTab(section.id)}
          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group relative"
        >
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className={`p-3 sm:p-4 rounded-full ${section.bgColor} group-hover:scale-110 transition-transform duration-200`}>
              <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${section.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">{section.label}</h3>
              <p className="text-xs text-muted-foreground hidden sm:block mt-1">
                {section.description}
              </p>
            </div>
            {section.badge && section.badge > 0 && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                {section.badge}
              </Badge>
            )}
          </CardContent>
        </Card>
      );
    })}
  </div>
) : (
  /* Section Content View */
  <div>
    <Button 
      variant="ghost" 
      onClick={() => setActiveTab(null)}
      className="mb-4 gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to sections
    </Button>
    
    {/* Render active section content */}
    {activeTab === "workouts" && <WorkoutsContent />}
    {activeTab === "programs" && <ProgramsContent />}
    {activeTab === "purchases" && <PurchasesContent />}
    {activeTab === "messages" && <MessagesContent />}
    {activeTab === "logbook" && <LogBookContent />}
  </div>
)}
```

---

## Phase 4: Extract Tab Content into Sections

Move the existing `<TabsContent>` JSX into standalone section renders:
- Keep all existing content and functionality intact
- Just wrap each section's content without the `<TabsContent>` wrapper
- Maintain premium checks, loading states, and all interactivity

---

## Phase 5: Handle URL Parameters

Update URL parameter handling:
- If `?tab=workouts` is in URL, set `activeTab` to that value (not null)
- This preserves deep linking and navigation behavior

---

## Files to Modify

1. **`src/pages/UserDashboard.tsx`** - Main changes:
   - Add `dashboardSections` configuration array
   - Change `activeTab` state to allow `null`
   - Replace `<Tabs>` with conditional grid/content rendering
   - Add "Back to sections" button in content view
   - Keep all existing section content logic

---

## Design Specifications

### Card Grid Layout
- Mobile: 2 columns with 3px gap
- Desktop (lg+): 3 columns with 4px gap
- Cards have hover effects: scale and shadow

### Color Scheme (matching Admin Backoffice style)
| Section | Icon Color | Background |
|---------|------------|------------|
| Workouts | orange-500 | orange-500/10 |
| Programs | blue-500 | blue-500/10 |
| My Purchases | emerald-500 | emerald-500/10 |
| Messages | purple-500 | purple-500/10 |
| My LogBook | amber-500 | amber-500/10 |

### Badge Support
- Messages card shows unread count badge (red, top-right)
- Reuses existing `unreadCount` state

---

## Result After Implementation

1. User Dashboard loads with a 2x3 (mobile) or 3x2 (desktop) grid of colorful cards
2. Each card is tappable/clickable and visually distinct
3. Clicking a card reveals that section's full content
4. "Back to sections" button returns to grid view
5. Deep links via URL params still work
6. All existing functionality preserved (premium checks, data loading, etc.)
7. Consistent visual language with Admin Backoffice

---

## Critical Files for Implementation

- `src/pages/UserDashboard.tsx` - Main component to refactor (tabs to cards)
- `src/pages/AdminBackoffice.tsx` - Reference pattern for card grid implementation
- `src/components/ui/card.tsx` - Card component already in use
