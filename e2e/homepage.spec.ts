import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
  test('should load and display the hero section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Check for navigation
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('should have functional navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Get all navigation links
    const links = page.getByRole('link');
    const count = await links.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify links are accessible
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      await expect(link).toBeVisible();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should pass accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    // Run axe accessibility test
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check responsive design
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });
});

test.describe('Accessibility Features', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    // Tab to skip link (should be first focusable element)
    await page.keyboard.press('Tab');
    
    const skipLink = page.getByText(/skip to main content/i);
    await expect(skipLink).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Run axe to check heading order
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const headingViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'heading-order'
    );
    expect(headingViolations).toHaveLength(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Run axe for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Check that animations are disabled
    const animatedElement = page.locator('.animate-float').first();
    if (await animatedElement.count() > 0) {
      const animationDuration = await animatedElement.evaluate(
        el => getComputedStyle(el).animationDuration
      );
      expect(animationDuration).toBe('0.01ms');
    }
  });
});
