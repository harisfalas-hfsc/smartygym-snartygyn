# Testing Guide

## Overview

This guide covers all testing approaches for SmartyGym, including unit tests, integration tests, and end-to-end (E2E) tests.

## Test Structure

```
src/
├── lib/
│   └── __tests__/
│       └── access-control.test.ts    # Unit tests
├── components/
│   └── __tests__/
│       ├── PurchaseButton.test.tsx   # Integration tests
│       └── AccessGate.test.tsx
└── test/
    └── setup.ts                       # Test configuration

e2e/
├── tests/
│   ├── premium-purchase-prevention.spec.ts  # E2E tests
│   └── admin-content-sync.spec.ts
└── fixtures/
    └── test-database.ts                     # Test data helpers
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- access-control.test.ts

# Watch mode (re-run on changes)
npm run test:watch

# UI mode (interactive)
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- premium-purchase-prevention

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with UI (Playwright inspector)
npm run test:e2e -- --ui

# Debug mode
npm run test:e2e -- --debug
```

## Unit Tests

### Access Control Tests

**Location:** `src/lib/__tests__/access-control.test.ts`

Tests the core business logic for content access control.

**Key Scenarios:**
- ✅ Public content accessible to all
- ✅ Guests cannot access workouts/programs
- ✅ Free users can access free content
- ✅ Free users blocked from premium content
- ✅ Free users can purchase standalone content
- ✅ Premium users access all content
- ✅ **CRITICAL:** Premium users CANNOT purchase

**Run:**
```bash
npm run test -- access-control.test.ts
```

**Coverage Target:** 90%+

### Component Tests

Test React components in isolation with mocked dependencies.

**Example: PurchaseButton Tests**

```typescript
test('premium user sees "Included in Plan" button', () => {
  render(<PurchaseButton {...props} />);
  expect(screen.getByText(/Included in Your Premium Plan/i)).toBeInTheDocument();
});
```

## Integration Tests

Test interactions between multiple components and hooks.

**Example: Purchase Flow Integration**

```typescript
test('free user can initiate purchase', async () => {
  const { user } = setupTest({ userTier: 'subscriber' });
  render(<WorkoutPage />);
  
  await user.click(screen.getByText('Purchase for €29.99'));
  
  expect(mockSupabase.functions.invoke).toHaveBeenCalled();
});
```

## E2E Tests

Full application tests using Playwright.

### Premium Purchase Prevention

**Location:** `e2e/tests/premium-purchase-prevention.spec.ts`

**Critical Tests:**
- Premium user cannot see purchase button
- Premium user sees "Included in Premium" message
- Free user sees purchase button
- Purchase flow works for free users

**Run:**
```bash
npm run test:e2e -- premium-purchase-prevention
```

### Admin Content Sync

**Location:** `e2e/tests/admin-content-sync.spec.ts`

**Tests:**
- Admin edits reflect immediately
- Toggling premium flag works instantly
- Deleted content returns 404
- Real-time cache invalidation

**Run:**
```bash
npm run test:e2e -- admin-content-sync
```

## Test Data Setup

### Creating Test Users

```sql
-- Free user
INSERT INTO auth.users (email, encrypted_password)
VALUES ('free@test.smartygym.com', crypt('FreeTest123!', gen_salt('bf')));

-- Premium user
INSERT INTO user_subscriptions (user_id, plan_type, status)
VALUES ('user-id-here', 'gold', 'active');

-- Admin user
INSERT INTO user_roles (user_id, role)
VALUES ('user-id-here', 'admin');
```

### Creating Test Content

```sql
-- Free workout
INSERT INTO admin_workouts (
  id, name, type, category,
  is_premium, duration, equipment
)
VALUES (
  'test-free-workout-1',
  'Test Free Workout',
  'HIIT', 'Strength',
  false, '30 min', 'Bodyweight'
);

-- Premium workout (purchasable)
INSERT INTO admin_workouts (
  id, name, type, category,
  is_premium, is_standalone_purchase, price
)
VALUES (
  'test-premium-workout-1',
  'Test Premium Workout',
  'Strength', 'Strength',
  true, true, 29.99
);
```

## Mocking Strategies

### Mock Supabase Client

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { /* mock data */ },
            error: null,
          }),
        }),
      }),
    }),
  },
}));
```

### Mock useAccessControl Hook

```typescript
vi.mock('@/hooks/useAccessControl', () => ({
  useAccessControl: () => ({
    user: { id: 'test-user' },
    userTier: 'premium',
    hasPurchased: () => false,
    isLoading: false,
  }),
}));
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Thresholds

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

**Critical Files:**
- `access-control.ts`: 90%+ required
- `PurchaseButton.tsx`: 85%+
- `AccessGate.tsx`: 85%+

## Debugging Tests

### Unit Tests

```bash
# Run with debugger
node --inspect-brk node_modules/.bin/vitest

# Then open chrome://inspect in Chrome
```

### E2E Tests

```bash
# Run in debug mode (pauses on failure)
npm run test:e2e -- --debug

# Run with Playwright inspector
npm run test:e2e -- --ui

# Take screenshots on failure
npm run test:e2e -- --screenshot=on
```

## Best Practices

### Unit Tests

✅ **DO:**
- Test pure functions
- Mock external dependencies
- Test edge cases
- Use descriptive test names

❌ **DON'T:**
- Test implementation details
- Mock internal functions
- Write brittle selectors
- Test React internals

### E2E Tests

✅ **DO:**
- Test critical user flows
- Use data-testid for stable selectors
- Wait for network requests
- Clean up test data

❌ **DON'T:**
- Test every edge case
- Use brittle selectors (text content)
- Make tests dependent on each other
- Leave test data in database

## Troubleshooting

### Test Fails Locally But Passes in CI

- Check environment variables
- Ensure database state is clean
- Verify test data exists
- Check for race conditions

### Flaky E2E Tests

- Add explicit waits (`waitForLoadState`)
- Increase timeouts for slow operations
- Stabilize test data
- Use retry mechanism

### Low Coverage

- Identify untested branches
- Add tests for error cases
- Test edge conditions
- Mock external dependencies

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Accounts Setup](./test-accounts-setup.md)

## Support

For testing issues:

1. Check test logs for errors
2. Review relevant test file
3. Verify test data setup
4. Contact dev team with details
