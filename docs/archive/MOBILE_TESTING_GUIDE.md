# Mobile Testing Guide

This guide documents the mobile testing procedures for the Smarty Gym website to ensure all pages remain mobile-optimized.

## Automated Mobile Screenshot Testing

### Test Coverage

All public pages are tested for mobile responsiveness:
- `/` - Homepage
- `/about` - About page
- `/workout` - Workouts flow
- `/trainingprogram` - Training programs flow
- `/tools` - Smart tools page
- `/community` - Community page
- `/blog` - Blog page
- `/personal-training` - Personal training page
- `/contact` - Contact page

### Test Execution

Screenshots are taken at mobile viewport width (375px - iPhone standard) to verify:
- Text readability
- No horizontal overflow
- Proper element stacking
- Button accessibility
- Touch target sizes (minimum 44px)
- Responsive typography
- Proper spacing

### Running Mobile Tests

To manually test mobile view:
1. Use browser DevTools mobile emulation (iPhone SE or similar)
2. Check all routes listed above
3. Verify no horizontal scrolling
4. Test all interactive elements
5. Check text legibility at 375px width

## Mobile Optimization Checklist

Before any major deployment, verify:

- [ ] All headings use responsive text sizing (`text-xl sm:text-2xl lg:text-3xl`)
- [ ] All cards use responsive padding (`p-3 sm:p-6`)
- [ ] All icons use responsive sizing (`h-3 w-3 sm:h-4 sm:w-4`)
- [ ] Buttons are full-width on mobile (`w-full sm:w-auto`)
- [ ] No element requires horizontal page scroll
- [ ] Tab navigation uses horizontal scroll when needed
- [ ] Forms are usable with mobile keyboard
- [ ] Touch targets are at least 44x44px
- [ ] Tables have horizontal scroll wrapper
- [ ] Images scale appropriately

## Testing Standards

All components must follow the standards defined in `MOBILE_OPTIMIZATION_STANDARD.md`:
1. Mobile-first responsive design
2. Progressive enhancement for larger screens
3. Minimum 375px width support (iPhone SE)
4. No horizontal overflow at any breakpoint
5. Accessible touch targets

## Regression Prevention

When making changes:
1. Always start with mobile-first classes
2. Add `sm:` breakpoint for tablet/desktop
3. Add `lg:` only when necessary
4. Test at 375px width before committing
5. Review changes in DevTools mobile mode

## Common Issues to Watch For

1. ❌ Fixed widths without responsive alternatives
2. ❌ Grid layouts without mobile column consideration
3. ❌ Text without truncation or wrapping
4. ❌ Icons without size scaling
5. ❌ Tabs without horizontal scroll
6. ❌ Buttons without full-width mobile option
7. ❌ Long labels/descriptions without shortening on mobile
8. ❌ Flex layouts forcing content on single line

## Manual Testing Protocol

For each page update:
1. Open in Chrome DevTools mobile view
2. Set viewport to 375x667 (iPhone SE)
3. Scroll through entire page
4. Tap all interactive elements
5. Verify no content is cut off
6. Check text legibility
7. Test form inputs if present
8. Verify images load and scale properly
9. Check navigation menu on mobile

## Future Enhancements

Planned improvements:
- Automated screenshot comparison testing
- Visual regression testing with Percy or similar
- Automated accessibility testing
- Performance testing on mobile networks
- Real device testing (iOS/Android)
