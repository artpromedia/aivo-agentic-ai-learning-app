import { test, expect } from '@playwright/test';

interface RouteDefinition {
  path: string;
  screen: string;
  title: string;
  description?: string;
  roles?: string[];
  category?: string;
  params?: Record<string, string>;
  testId?: string;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#/learner');
});

test('route registry exists', async ({ page }) => {
  const routes = await page.evaluate(() => 
    (window as Window & { __ROUTES?: RouteDefinition[] }).__ROUTES || []
  );
  expect(routes.length).toBeGreaterThan(0);
});

test('every registered route renders', async ({ page }) => {
  const routes = await page.evaluate(() => 
    (window as Window & { __ROUTES?: RouteDefinition[] }).__ROUTES || []
  );
  const withSamples = routes.map(r =>
    r.path.includes('/learner/hs/:course') ? { ...r, path: r.path.replace(':course', 'precalculus') } :
    r.path.includes('/learner/ms/:course') ? { ...r, path: r.path.replace(':course', 'ela') } :
    r.path.includes('/learner/k5/:course') ? { ...r, path: r.path.replace(':course', 'math') } : r
  );

  for (const route of withSamples) {
    await page.goto(`#${route.path}`);
    const ok = page.getByTestId('route-ok');
    const notFound = page.getByTestId('route-404');
    await expect(ok.or(notFound)).toBeVisible();
    if (!route.path.includes(':')) {
      await expect(ok, `Route failed: ${route.path}`).toBeVisible();
    }
  }
});

test('unknown route -> 404 -> route catalog', async ({ page }) => {
  await page.goto('#/totally/unknown/path');
  await expect(page.getByTestId('route-404')).toBeVisible();
  await page.getByTestId('nav-to-catalog').click();
  await expect(page.getByTestId('page-dev-routes')).toBeVisible();
});
