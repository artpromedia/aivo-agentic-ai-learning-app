# E2E Testing Quick Reference

## Run Tests

```bash
# From root
pnpm --filter @aivo/learner-app e2e

# From learner-app directory
cd apps/learner-app
pnpm e2e
```

## Development Commands

```bash
pnpm e2e                 # Run all tests (headless)
pnpm e2e:headed          # Run with visible browser
pnpm e2e:ui              # Open interactive test UI
pnpm e2e:report          # View HTML report
pnpm e2e:install         # Install Playwright browsers
```

## Run Specific Tests

```bash
# Single file
pnpm exec playwright test routes.spec.ts

# Single test
pnpm exec playwright test -g "route registry exists"

# With debugging
pnpm exec playwright test --debug

# Specific browser
pnpm exec playwright test --project=chromium
```

## Test Files

- `e2e/routes.spec.ts` - Route registry and rendering tests
- `e2e/nav-links.spec.ts` - Navigation link click-through tests
- `e2e/link-crawl.spec.ts` - Comprehensive link validation

## Required Test IDs

### Page Components
```tsx
// Valid route
<div data-testid="route-ok">...</div>

// 404 page
<div data-testid="route-404">...</div>

// Navigation links
<a data-testid="nav-dashboard" href="#/learner/dashboard">Dashboard</a>
<a data-testid="nav-subjects" href="#/learner/subjects">Subjects</a>

// 404 page catalog link
<a data-testid="nav-to-catalog" href="#/dev/routes">View All Routes</a>

// Route catalog page
<div data-testid="page-dev-routes">...</div>
```

## Route Registry Setup

```tsx
// In your main app file
useEffect(() => {
  (window as any).__ROUTES = [
    '/learner',
    '/learner/dashboard',
    '/learner/k5/:course',
    '/learner/ms/:course',
    '/learner/hs/:course',
    // ... all your routes
  ];
}, []);
```

## Environment Variables

```bash
# Custom base URL
E2E_BASE_URL=http://localhost:3003

# Custom dev server command
E2E_WEB_SERVER_CMD="pnpm dev"

# Custom port
E2E_PORT=3003
```

## Debugging

```bash
# Run one test with browser open
pnpm exec playwright test routes.spec.ts --headed --debug

# Run specific test
pnpm exec playwright test -g "route registry exists" --debug

# View trace file
pnpm exec playwright show-trace trace.zip
```

## CI/CD

GitHub Actions automatically runs tests on:
- Every push
- Every pull request

View results in Actions tab and download HTML reports as artifacts.

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3003
# Windows:
netstat -ano | findstr :3003
taskkill /PID <pid> /F

# Mac/Linux:
lsof -ti:3003 | xargs kill -9
```

### Timeout Errors
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60_000,  // 60 seconds
```

### Browser Not Found
```bash
pnpm e2e:install
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/learner');
});

test('my test', async ({ page }) => {
  // Navigate
  await page.goto('#/some/route');
  
  // Wait for element
  await page.waitForSelector('[data-testid="route-ok"]');
  
  // Assert
  await expect(page.getByTestId('route-ok')).toBeVisible();
  
  // Click
  await page.getByTestId('nav-button').click();
  
  // Fill form
  await page.fill('input[name="username"]', 'test');
  
  // Get text
  const text = await page.textContent('.title');
  expect(text).toBe('Dashboard');
});
```

## Playwright Selectors

```typescript
// By test ID (preferred)
page.getByTestId('route-ok')

// By role
page.getByRole('button', { name: 'Submit' })

// By text
page.getByText('Dashboard')

// By label
page.getByLabel('Username')

// By CSS
page.locator('.my-class')

// By XPath
page.locator('xpath=//div[@id="app"]')
```

## Auto-Waiting

Playwright automatically waits for:
- Element to be visible
- Element to be enabled
- Element to be stable (not animating)
- Element to receive events

No need for manual waits in most cases!

## Reports

### HTML Report
```bash
pnpm e2e:report
```

Opens browser with:
- Test results
- Screenshots
- Videos (on failure)
- Traces
- Error details

### Trace Viewer
Interactive debugging:
- DOM snapshots at each step
- Network activity
- Console logs
- Timeline view

## Best Practices

1. **Use testids** - Most reliable selector
2. **Test user flows** - Not implementation
3. **Avoid sleeps** - Use auto-waiting
4. **Keep tests independent** - No shared state
5. **Name tests clearly** - Describe what they verify

## Adding New Tests

```bash
# Create new test file
touch apps/learner-app/e2e/my-feature.spec.ts
```

```typescript
import { test, expect } from '@playwright/test';

test('feature description', async ({ page }) => {
  await page.goto('/#/learner/my-feature');
  await expect(page.getByTestId('route-ok')).toBeVisible();
  // Add more test logic
});
```

## Configuration

**File:** `apps/learner-app/playwright.config.ts`

Key settings:
- `testDir: 'e2e'` - Test location
- `timeout: 30_000` - Test timeout (30s)
- `baseURL` - Default URL
- `webServer` - Auto-start dev server
- `projects` - Browser configs
- `reporter` - Output format

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
