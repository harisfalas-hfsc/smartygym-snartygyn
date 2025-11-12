# Mobile Optimization Standard

## Core Principles

Every component and page MUST follow these mobile-first design principles to ensure optimal display on all devices, especially mobile phones.

## 1. Responsive Typography

```tsx
// ✅ CORRECT
<h1 className="text-xl sm:text-2xl lg:text-3xl">Title</h1>
<p className="text-xs sm:text-sm">Description</p>
<Label className="text-xs sm:text-sm">Field Label</Label>

// ❌ WRONG
<h1 className="text-3xl">Title</h1>
<p className="text-sm">Description</p>
```

## 2. Responsive Icons

```tsx
// ✅ CORRECT
<Icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />

// ❌ WRONG
<Icon className="h-4 w-4" />
```

## 3. Horizontal Scrolling Tabs

```tsx
// ✅ CORRECT
<div className="w-full overflow-x-auto -mx-2 px-2">
  <TabsList className="inline-flex w-auto min-w-full h-auto p-1">
    <TabsTrigger value="tab1" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2">
      <Icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
      <span>Tab</span>
    </TabsTrigger>
  </TabsList>
</div>

// ❌ WRONG - Causes overflow/hiding
<TabsList className="grid grid-cols-5">
  <TabsTrigger>Tab</TabsTrigger>
</TabsList>
```

## 4. Flexible Layouts

```tsx
// ✅ CORRECT - Stacks on mobile, side-by-side on desktop
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div className="flex-1 min-w-0">Content</div>
  <Button className="w-full sm:w-auto shrink-0">Action</Button>
</div>

// ❌ WRONG - Forces single row
<div className="flex items-center justify-between">
  <div>Content</div>
  <Button>Action</Button>
</div>
```

## 5. Grid Layouts

```tsx
// ✅ CORRECT
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  <Card />
</div>

// ❌ WRONG
<div className="grid grid-cols-3 gap-4">
  <Card />
</div>
```

## 6. Responsive Spacing

```tsx
// ✅ CORRECT
<div className="p-3 sm:p-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">

// ❌ WRONG
<div className="p-4 gap-4 space-y-4">
```

## 7. Text Overflow Handling

```tsx
// ✅ CORRECT
<div className="space-y-0.5 flex-1 min-w-0">
  <Label className="text-xs sm:text-sm">Title</Label>
  <p className="text-xs text-muted-foreground truncate">Long description</p>
</div>

// ❌ WRONG - Text can overflow
<div>
  <Label>Title</Label>
  <p className="text-sm text-muted-foreground">Long description</p>
</div>
```

## 8. Form Fields

```tsx
// ✅ CORRECT
<Input className="text-sm" type="text" />
<Select>
  <SelectTrigger className="text-sm">
    <SelectValue />
  </SelectTrigger>
</Select>

// ❌ WRONG
<Input type="text" />
```

## 9. Switch/Toggle Controls

```tsx
// ✅ CORRECT
<div className="flex items-start sm:items-center justify-between gap-3">
  <div className="space-y-0.5 flex-1 min-w-0">
    <Label className="text-xs sm:text-sm">Setting</Label>
    <p className="text-xs text-muted-foreground">Description</p>
  </div>
  <Switch className="shrink-0" />
</div>

// ❌ WRONG - Text overlaps switch on mobile
<div className="flex items-center justify-between">
  <div>
    <Label>Setting</Label>
    <p>Description</p>
  </div>
  <Switch />
</div>
```

## 10. Buttons

```tsx
// ✅ CORRECT
<Button className="w-full sm:w-auto text-sm">
  <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
  Action
</Button>

// ❌ WRONG
<Button>
  <Icon className="h-4 w-4 mr-2" />
  Action
</Button>
```

## 11. Cards and Containers

```tsx
// ✅ CORRECT
<Card>
  <CardHeader className="p-3 sm:p-6">
    <CardTitle className="text-base sm:text-lg">Title</CardTitle>
    <CardDescription className="text-xs sm:text-sm">Description</CardDescription>
  </CardHeader>
  <CardContent className="p-3 sm:p-6">
    Content
  </CardContent>
</Card>

// ❌ WRONG
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

## 12. Tables (Critical for Back Office)

```tsx
// ✅ CORRECT - Add horizontal scroll wrapper
<div className="overflow-x-auto -mx-2 sm:-mx-0">
  <Table className="min-w-[600px]">
    <TableHeader>
      <TableRow>
        <TableHead className="text-xs sm:text-sm">Column</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="text-xs sm:text-sm">Data</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>

// ❌ WRONG - Table overflows
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

## Testing Checklist

Before considering any component/page complete, verify:

- [ ] Text is readable at smallest mobile size (320px width)
- [ ] No horizontal overflow or hidden content
- [ ] Buttons are tappable (minimum 44px touch target)
- [ ] All tabs are accessible via horizontal scroll
- [ ] Form fields are usable with mobile keyboard
- [ ] Images scale appropriately
- [ ] No overlapping text or elements
- [ ] Spacing feels comfortable on small screens
- [ ] Tables scroll horizontally if needed
- [ ] Cards and modals fit viewport

## Implementation Rule

**EVERY NEW COMPONENT OR UPDATE MUST:**
1. Start with mobile-first classes
2. Add `sm:` breakpoint for tablet/desktop
3. Add `lg:` only when necessary
4. Test at 375px width (iPhone standard)
5. Ensure no element requires horizontal page scroll

## Common Mistakes to Avoid

1. ❌ Using fixed widths without responsive alternatives
2. ❌ Grid layouts without mobile columns consideration
3. ❌ Text without truncation or wrapping
4. ❌ Icons without size scaling
5. ❌ Tabs without horizontal scroll
6. ❌ Buttons without full-width mobile option
7. ❌ Long labels/descriptions without shortening on mobile
8. ❌ Flex layouts forcing content on single line
