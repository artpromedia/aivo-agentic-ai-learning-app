import { test, expect } from '@playwright/test';

test('all #/ links on page render', async ({ page }) => {
  await page.goto('/#/learner');
  const hrefs = await page.$$eval('a[href^="#/"]', as => as.map(a => (a as HTMLAnchorElement).getAttribute('href')));
  for (const h of hrefs) {
    if (!h) continue;
    await page.goto(h);
    await expect(page.getByTestId('route-ok').or(page.getByTestId('route-404'))).toBeVisible();
  }
});
