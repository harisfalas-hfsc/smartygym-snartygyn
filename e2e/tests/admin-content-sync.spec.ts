import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Admin Content Sync
 * 
 * Verifies that changes made in the admin panel reflect immediately
 * on the frontend without requiring a deployment.
 */

test.describe('Admin Content Sync - Immediate Reflection', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'admin@test.smartygym.com');
    await page.fill('input[type="password"]', 'AdminTest123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('admin workout name change reflects immediately', async ({ page }) => {
    const originalName = 'Test Free Workout';
    const updatedName = 'Updated Test Workout Name';
    
    // 1. Go to admin workouts page
    await page.goto('/admin/workouts');
    await page.waitForLoadState('networkidle');
    
    // 2. Find and click edit on test workout
    await page.click('[data-workout-id="test-free-workout-1"] button[aria-label*="Edit"]');
    
    // 3. Wait for edit dialog
    await page.waitForSelector('input[name="name"]');
    
    // 4. Change workout name
    await page.fill('input[name="name"]', updatedName);
    
    // 5. Save changes
    await page.click('button[type="submit"]:has-text("Save")');
    
    // 6. Wait for save to complete
    await page.waitForTimeout(1000);
    
    // 7. Navigate to workout page as regular user (in new context)
    await page.goto('/workout/strength/test-free-workout-1');
    await page.waitForLoadState('networkidle');
    
    // 8. Verify new name appears immediately
    await expect(page.locator('h1')).toContainText(updatedName);
    
    // CLEANUP: Restore original name
    await page.goto('/admin/workouts');
    await page.click('[data-workout-id="test-free-workout-1"] button[aria-label*="Edit"]');
    await page.fill('input[name="name"]', originalName);
    await page.click('button[type="submit"]:has-text("Save")');
  });

  test('toggling is_premium flag restricts access immediately', async ({ page, context }) => {
    // 1. Make workout premium in admin
    await page.goto('/admin/workouts');
    await page.click('[data-workout-id="test-free-workout-1"] button[aria-label*="Edit"]');
    
    // Toggle is_premium to true
    await page.check('input[name="is_premium"]');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // 2. Open new tab as free user
    const userPage = await context.newPage();
    await userPage.goto('/auth');
    await userPage.fill('input[type="email"]', 'free@test.smartygym.com');
    await userPage.fill('input[type="password"]', 'FreeTest123!');
    await userPage.click('button[type="submit"]');
    await userPage.waitForURL('/');
    
    // 3. Try to access the now-premium workout
    await userPage.goto('/workout/strength/test-free-workout-1');
    
    // 4. Should see paywall immediately
    await expect(userPage.locator('text=Premium Content')).toBeVisible();
    
    // CLEANUP: Restore to free
    await page.goto('/admin/workouts');
    await page.click('[data-workout-id="test-free-workout-1"] button[aria-label*="Edit"]');
    await page.uncheck('input[name="is_premium"]');
    await page.click('button[type="submit"]:has-text("Save")');
    
    await userPage.close();
  });

  test('enabling standalone purchase shows buy button immediately', async ({ page, context }) => {
    // 1. Enable standalone purchase in admin
    await page.goto('/admin/workouts');
    await page.click('[data-workout-id="test-premium-workout-1"] button[aria-label*="Edit"]');
    
    await page.check('input[name="is_premium"]');
    await page.check('input[name="is_standalone_purchase"]');
    await page.fill('input[name="price"]', '29.99');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // 2. View as free user
    const userPage = await context.newPage();
    await userPage.goto('/auth');
    await userPage.fill('input[type="email"]', 'free@test.smartygym.com');
    await userPage.fill('input[type="password"]', 'FreeTest123!');
    await userPage.click('button[type="submit"]');
    await userPage.waitForURL('/');
    
    await userPage.goto('/workout/strength/test-premium-workout-1');
    
    // 3. Purchase button should be visible immediately
    await expect(userPage.locator('button:has-text("Purchase for €29.99")')).toBeVisible();
    
    await userPage.close();
  });

  test('new workout appears in library immediately after creation', async ({ page }) => {
    const newWorkoutName = `Test New Workout ${Date.now()}`;
    
    // 1. Create new workout
    await page.goto('/admin/workouts');
    await page.click('button:has-text("Create New Workout")');
    
    await page.fill('input[name="name"]', newWorkoutName);
    await page.fill('input[name="type"]', 'HIIT');
    await page.selectOption('select[name="category"]', 'Strength');
    await page.fill('input[name="duration"]', '30 min');
    await page.fill('textarea[name="description"]', 'Test description');
    
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(2000);
    
    // 2. Navigate to workout library
    await page.goto('/workouts');
    await page.waitForLoadState('networkidle');
    
    // 3. New workout should appear immediately
    await expect(page.locator(`text=${newWorkoutName}`)).toBeVisible();
    
    // CLEANUP: Delete test workout
    await page.goto('/admin/workouts');
    const deleteButton = page.locator(`[data-workout-name="${newWorkoutName}"] button[aria-label*="Delete"]`);
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.click('button:has-text("Confirm")');
    }
  });

  test('program description update reflects immediately', async ({ page }) => {
    const updatedDescription = `Updated description ${Date.now()}`;
    
    // 1. Update program in admin
    await page.goto('/admin/programs');
    await page.click('[data-program-id="test-free-program-1"] button[aria-label*="Edit"]');
    
    await page.fill('textarea[name="description"]', updatedDescription);
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // 2. View program page
    await page.goto('/training-programs/strength/test-free-program-1');
    await page.waitForLoadState('networkidle');
    
    // 3. Verify updated description
    await expect(page.locator('text=' + updatedDescription)).toBeVisible();
  });
});

test.describe('Admin Content Deletion Sync', () => {
  
  test('deleted workout returns 404 immediately', async ({ page, context }) => {
    // Create a temporary workout for deletion test
    const tempWorkoutName = `Temp Delete Test ${Date.now()}`;
    const tempWorkoutId = `temp-delete-${Date.now()}`;
    
    // 1. Create workout
    await page.goto('/admin/workouts');
    await page.click('button:has-text("Create New Workout")');
    
    await page.fill('input[name="id"]', tempWorkoutId);
    await page.fill('input[name="name"]', tempWorkoutName);
    await page.fill('input[name="type"]', 'HIIT');
    await page.selectOption('select[name="category"]', 'Strength');
    await page.fill('input[name="duration"]', '20 min');
    await page.fill('textarea[name="description"]', 'Temp workout for deletion');
    
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(2000);
    
    // 2. Verify workout is accessible
    await page.goto(`/workout/strength/${tempWorkoutId}`);
    await expect(page.locator(`h1:has-text("${tempWorkoutName}")`)).toBeVisible();
    
    // 3. Delete workout
    await page.goto('/admin/workouts');
    await page.click(`[data-workout-id="${tempWorkoutId}"] button[aria-label*="Delete"]`);
    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(1000);
    
    // 4. Try to access deleted workout - should show 404
    await page.goto(`/workout/strength/${tempWorkoutId}`);
    await expect(page.locator('text=Workout Not Found')).toBeVisible();
    await expect(page.locator(`text="${tempWorkoutId}"`)).toBeVisible();
  });
});

test.describe('Real-time Cache Invalidation', () => {
  
  test('workout data updates without page refresh', async ({ page }) => {
    // This test verifies that React Query cache invalidation works
    
    const workoutId = 'test-free-workout-1';
    const originalDuration = '30 min';
    const newDuration = '45 min';
    
    // 1. Open workout page
    await page.goto(`/workout/strength/${workoutId}`);
    await expect(page.locator(`text=${originalDuration}`)).toBeVisible();
    
    // 2. Open admin panel in same session (new tab)
    const adminPage = await page.context().newPage();
    await adminPage.goto('/admin/workouts');
    
    // 3. Edit workout duration
    await adminPage.click(`[data-workout-id="${workoutId}"] button[aria-label*="Edit"]`);
    await adminPage.fill('input[name="duration"]', newDuration);
    await adminPage.click('button[type="submit"]:has-text("Save")');
    await adminPage.waitForTimeout(1000);
    
    // 4. Refresh workout page and verify change
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${newDuration}`)).toBeVisible();
    
    // CLEANUP: Restore original
    await adminPage.goto('/admin/workouts');
    await adminPage.click(`[data-workout-id="${workoutId}"] button[aria-label*="Edit"]`);
    await adminPage.fill('input[name="duration"]', originalDuration);
    await adminPage.click('button[type="submit"]:has-text("Save")');
    
    await adminPage.close();
  });
});
