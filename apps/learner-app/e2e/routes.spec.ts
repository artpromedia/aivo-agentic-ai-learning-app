import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/learner');
});

test('route registry exists', async ({ page }) => {
  const routes = await page.evaluate(() => (window as Window & { __ROUTES?: string[] }).__ROUTES || []);
  expect(routes.length).toBeGreaterThan(0);
});

test('every registered route renders', async ({ page }) => {
  const routes = await page.evaluate(() => (window as Window & { __ROUTES?: string[] }).__ROUTES || []);
  const withSamples = routes.map(r =>
    r.includes('/learner/hs/:course') ? r.replace(':course', 'precalculus') :
    r.includes('/learner/ms/:course') ? r.replace(':course', 'ela') :
    r.includes('/learner/k5/:course') ? r.replace(':course', 'math') : r
  );

  for (const path of withSamples) {
    await page.goto(`#${path}`);
    const ok = page.getByTestId('route-ok');
    const notFound = page.getByTestId('route-404');
    await expect(ok.or(notFound)).toBeVisible();
    if (!path.includes(':')) {
      await expect(ok, `Route failed: ${path}`).toBeVisible();
    }
  }
});

test('unknown route -> 404 -> route catalog', async ({ page }) => {
  await page.goto('#/totally/unknown/path');
  await expect(page.getByTestId('route-404')).toBeVisible();
  await page.getByTestId('nav-to-catalog').click();
  await expect(page.getByTestId('page-dev-routes')).toBeVisible();
});
