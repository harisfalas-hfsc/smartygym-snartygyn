import { test, expect } from '@playwright/test';

test.describe('Complete User Journey Tests', () => {
  
  test.describe('Visitor Journey', () => {
    test('visitor can browse public pages', async ({ page }) => {
      // Visit home page
      await page.goto('/');
      await expect(page.locator('h1')).toContainText(/smarty/i);
      
      // Navigate to blog (public content)
      await page.click('text=Blog');
      await expect(page).toHaveURL(/\/blog/);
      await expect(page.locator('article, .grid')).toBeVisible();
      
      // Navigate to about page
      await page.goto('/about');
      await expect(page).toHaveURL('/about');
      
      // Navigate to FAQ
      await page.goto('/faq');
      await expect(page).toHaveURL('/faq');
    });

    test('visitor blocked from workouts, redirected to login', async ({ page }) => {
      // Try to access workout detail page
      await page.goto('/workout/strength/strength-049');
      
      // Should see access gate or redirect to auth
      const hasAccessGate = await page.locator('text=/sign in|login|upgrade/i').count() > 0;
      const isAuthPage = page.url().includes('/auth');
      
      expect(hasAccessGate || isAuthPage).toBeTruthy();
    });
  });

  test.describe('Free User Journey', () => {
    test.beforeEach(async ({ page }) => {
      // Login as free user
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'free@test.com');
      await page.fill('input[type="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/', { timeout: 10000 });
    });

    test('free user can access free workout', async ({ page }) => {
      await page.goto('/workout/strength/strength-049');
      
      // Should see workout content
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=/workout|exercise/i')).toBeVisible();
    });

    test('free user sees paywall on premium workout', async ({ page }) => {
      await page.goto('/workout/strength/ws001');
      
      // Should see upgrade or purchase option
      const hasPaywall = await page.locator('text=/upgrade|premium|purchase/i').count() > 0;
      expect(hasPaywall).toBeTruthy();
    });

    test('free user can purchase standalone workout', async ({ page }) => {
      await page.goto('/workout/strength/ws001');
      
      // Look for purchase button
      const purchaseButton = page.locator('text=/purchase for/i');
      if (await purchaseButton.count() > 0) {
        await purchaseButton.click();
        
        // Should redirect to Stripe checkout (in new tab/window)
        // or see checkout preparation
        await page.waitForTimeout(2000);
        
        // Verify we're attempting to start checkout
        const hasCheckout = page.url().includes('stripe') || 
                          await page.locator('text=/checkout|payment/i').count() > 0;
        expect(hasCheckout).toBeTruthy();
      }
    });

    test('free user can use calculators', async ({ page }) => {
      await page.goto('/tools/onerm-calculator');
      
      // Should be able to interact with calculator
      await expect(page.locator('input, select').first()).toBeVisible();
      await expect(page.locator('button[type="button"], button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Premium User Journey', () => {
    test.beforeEach(async ({ page }) => {
      // Login as premium user
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'premium-gold@test.com');
      await page.fill('input[type="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/', { timeout: 10000 });
    });

    test('premium user can access all workouts', async ({ page }) => {
      // Test free workout
      await page.goto('/workout/strength/strength-049');
      await expect(page.locator('h1')).toBeVisible();
      
      // Test premium workout
      await page.goto('/workout/strength/ws001');
      await expect(page.locator('h1')).toBeVisible();
      
      // Should NOT see purchase buttons
      const purchaseButton = await page.locator('text=/purchase for €/i').count();
      expect(purchaseButton).toBe(0);
    });

    test('premium user cannot see purchase buttons', async ({ page }) => {
      await page.goto('/workout/strength/ws001');
      
      // Should see "Included in Premium" or similar
      const hasIncluded = await page.locator('text=/included.*premium/i').count() > 0;
      expect(hasIncluded).toBeTruthy();
      
      // Should NOT have enabled purchase button
      const purchaseButton = page.locator('button:has-text("Purchase")').and(page.locator(':not([disabled])'));
      await expect(purchaseButton).toHaveCount(0);
    });

    test('premium user can access all programs', async ({ page }) => {
      await page.goto('/training-program/muscle-hypertrophy');
      
      // Should see programs
      await expect(page.locator('.grid, [class*="grid"]')).toBeVisible();
      
      // Click on a program
      const programCard = page.locator('article, .card, [class*="card"]').first();
      if (await programCard.count() > 0) {
        await programCard.click();
        
        // Should see program content
        await expect(page.locator('h1, h2')).toBeVisible();
      }
    });

    test('premium user can use all tools', async ({ page }) => {
      // Test calculator access
      await page.goto('/tools/onerm-calculator');
      await expect(page.locator('input, select').first()).toBeVisible();
      
      await page.goto('/tools/bmr-calculator');
      await expect(page.locator('input, select').first()).toBeVisible();
      
      await page.goto('/tools/macro-calculator');
      await expect(page.locator('input, select').first()).toBeVisible();
    });
  });

  test.describe('Admin Journey', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'admin@test.com');
      await page.fill('input[type="password"]', 'AdminTest123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/', { timeout: 10000 });
    });

    test('admin can access admin panel', async ({ page }) => {
      await page.goto('/admin');
      
      // Should see admin dashboard
      const isAdminPage = page.url().includes('/admin') && 
                         !page.url().includes('/auth');
      expect(isAdminPage).toBeTruthy();
      
      // Should see admin content
      await expect(page.locator('h1, h2, [role="heading"]')).toBeVisible();
    });

    test('admin can view workout management', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for workouts management section
      const workoutsLink = page.locator('text=/workout/i').first();
      if (await workoutsLink.count() > 0) {
        await workoutsLink.click();
        
        // Should see workout list or management interface
        await expect(page.locator('table, .grid, [class*="grid"]')).toBeVisible();
      }
    });

    test('admin can view user messages', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for messages/contact section
      const messagesLink = page.locator('text=/message|contact/i').first();
      if (await messagesLink.count() > 0) {
        await messagesLink.click();
        
        // Should see messages interface
        await expect(page.locator('table, .grid, [class*="list"]')).toBeVisible();
      }
    });
  });

  test.describe('Messaging Flow', () => {
    test('user can send contact message', async ({ page }) => {
      await page.goto('/contact');
      
      // Fill contact form
      await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test User');
      await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
      await page.fill('textarea[name="message"], textarea', 'This is a test message from E2E test');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should see success message
      await expect(page.locator('text=/success|sent|thank/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile: home page renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check key elements are visible on mobile
      await expect(page.locator('nav, header')).toBeVisible();
      await expect(page.locator('h1, [role="heading"]')).toBeVisible();
    });

    test('tablet: dashboard renders correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/auth');
      
      // Login
      await page.fill('input[type="email"]', 'free@test.com');
      await page.fill('input[type="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/', { timeout: 10000 });
      
      await page.goto('/dashboard');
      
      // Dashboard should be visible and functional
      await expect(page.locator('h1, h2')).toBeVisible();
    });
  });
});
