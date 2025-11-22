import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Premium User Purchase Prevention
 * 
 * CRITICAL BUSINESS RULE: Premium users CANNOT purchase standalone content
 * because all content is included in their subscription.
 */

test.describe('Premium User Purchase Prevention', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('premium user CANNOT see purchase button on premium workout', async ({ page }) => {
    // Login as premium user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'premium-gold@test.smartygym.com');
    await page.fill('input[type="password"]', 'GoldTest123!');
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to premium workout that has standalone purchase enabled
    await page.goto('/workout/strength/test-premium-workout-1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should NOT see purchase button
    const purchaseButton = page.locator('button:has-text("Purchase for")');
    await expect(purchaseButton).not.toBeVisible();
    
    // Should see "Included in Your Premium Plan" message
    const includedMessage = page.locator('button:has-text("Included in Your Premium Plan")');
    await expect(includedMessage).toBeVisible();
    await expect(includedMessage).toBeDisabled();
    
    // Verify workout content IS visible (no paywall)
    await expect(page.locator('h1:has-text("Test Premium Workout")')).toBeVisible();
  });

  test('premium user sees all content without purchase prompts', async ({ page }) => {
    // Login as premium user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'premium-platinum@test.smartygym.com');
    await page.fill('input[type="password"]', 'PlatinumTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Check premium-only workout
    await page.goto('/workout/cardio/test-premium-workout-2');
    
    // No paywall, content is visible
    await expect(page.locator('text=Premium Content')).not.toBeVisible();
    await expect(page.locator('text=Upgrade to Premium')).not.toBeVisible();
    
    // Workout details are accessible
    await expect(page.locator('text=Instructions')).toBeVisible();
  });

  test('free user SEES purchase button on premium workout', async ({ page }) => {
    // Login as free user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'free@test.smartygym.com');
    await page.fill('input[type="password"]', 'FreeTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to premium workout
    await page.goto('/workout/strength/test-premium-workout-1');
    
    // Should see purchase button with price
    const purchaseButton = page.locator('button:has-text("Purchase for €29.99")');
    await expect(purchaseButton).toBeVisible();
    await expect(purchaseButton).not.toBeDisabled();
    
    // Should see paywall (content hidden behind AccessGate)
    await expect(page.locator('text=Premium Content')).toBeVisible();
  });

  test('free user can initiate purchase flow', async ({ page }) => {
    // Login as free user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'free@test.smartygym.com');
    await page.fill('input[type="password"]', 'FreeTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to purchasable premium workout
    await page.goto('/workout/strength/test-premium-workout-1');
    
    // Click purchase button
    await page.click('button:has-text("Purchase for")');
    
    // Should see loading state or redirect to Stripe
    // In test mode, we'd be redirected to Stripe checkout
    // We're just verifying the button works and doesn't throw errors
    await page.waitForTimeout(1000);
  });

  test('premium user cannot see purchase UI in workout library', async ({ page }) => {
    // Login as premium user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'premium-gold@test.smartygym.com');
    await page.fill('input[type="password"]', 'GoldTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Go to workout library
    await page.goto('/workouts');
    
    // All workouts should be accessible, no purchase prompts
    const workoutCards = page.locator('[data-workout-card]');
    const count = await workoutCards.count();
    
    // Verify no "Purchase" text appears on any cards
    for (let i = 0; i < count; i++) {
      const card = workoutCards.nth(i);
      await expect(card.locator('text=Purchase')).not.toBeVisible();
    }
  });

  test('guest user sees login prompt, not purchase options', async ({ page }) => {
    // Don't login, stay as guest
    
    // Try to access premium workout directly
    await page.goto('/workout/strength/test-premium-workout-1');
    
    // Should see login/signup prompt, not purchase button
    await expect(page.locator('text=Login Required')).toBeVisible();
    await expect(page.locator('button:has-text("Log In / Sign Up")')).toBeVisible();
    
    // Should NOT see purchase button (auth required first)
    await expect(page.locator('button:has-text("Purchase for")')).not.toBeVisible();
  });

  test('premium user can access members-only content', async ({ page }) => {
    // Login as premium user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'premium-gold@test.smartygym.com');
    await page.fill('input[type="password"]', 'GoldTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to members-only workout (not available for standalone purchase)
    await page.goto('/workout/cardio/test-premium-workout-2');
    
    // Content should be fully accessible
    await expect(page.locator('h1:has-text("Test Premium Members Only")')).toBeVisible();
    
    // No purchase button (not purchasable)
    await expect(page.locator('button:has-text("Purchase")')).not.toBeVisible();
    
    // No "Upgrade" prompt (already premium)
    await expect(page.locator('text=View Premium Plans')).not.toBeVisible();
  });
});

test.describe('Training Program Purchase Prevention', () => {
  
  test('premium user cannot purchase training programs', async ({ page }) => {
    // Login as premium user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'premium-platinum@test.smartygym.com');
    await page.fill('input[type="password"]', 'PlatinumTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to purchasable premium program
    await page.goto('/training-programs/hypertrophy/test-premium-program-1');
    
    // Should NOT see purchase button
    await expect(page.locator('button:has-text("Purchase for")')).not.toBeVisible();
    
    // Should see "Included" message
    await expect(page.locator('text=Included in')).toBeVisible();
    
    // Program content is accessible
    await expect(page.locator('h1')).toContainText('Test Premium 8-Week Program');
  });

  test('free user can purchase training programs', async ({ page }) => {
    // Login as free user
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'free@test.smartygym.com');
    await page.fill('input[type="password"]', 'FreeTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Navigate to purchasable premium program
    await page.goto('/training-programs/hypertrophy/test-premium-program-1');
    
    // Should see purchase option with correct price
    await expect(page.locator('text=€79.99')).toBeVisible();
    await expect(page.locator('button:has-text("Purchase")')).toBeVisible();
  });
});

test.describe('Edge Cases', () => {
  
  test('premium subscription expires - user loses access', async ({ page }) => {
    // This would require a test user with expired subscription
    // Simulated by updating user_subscriptions status to 'canceled' or past_due
    
    // For now, skip or implement with database manipulation
    test.skip();
  });

  test('user purchases content then upgrades to premium', async ({ page }) => {
    // User already purchased workout individually
    // Then upgrades to premium
    // Should still have access (purchase doesn't get refunded)
    
    test.skip();
  });

  test('admin user can view all content', async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@test.smartygym.com');
    await page.fill('input[type="password"]', 'AdminTest123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Admin can access any workout
    await page.goto('/workout/strength/test-premium-workout-1');
    await expect(page.locator('h1')).toContainText('Test Premium Workout');
    
    // Admin panel accessible
    await page.goto('/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });
});
