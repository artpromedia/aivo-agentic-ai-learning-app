import { test, expect } from '@playwright/test';

test('all feature nav links click through', async ({ page }) => {
  await page.goto('/#/learner');
  const navs = await page.$$('[data-testid^="nav-"]');
  for (const el of navs) {
    const href = await el.getAttribute('href');
    if (!href) continue; // buttons that open panels, not routes
    await el.click();
    await expect(page.getByTestId('route-ok')).toBeVisible();
    await page.goto('/#/learner');
  }
});
