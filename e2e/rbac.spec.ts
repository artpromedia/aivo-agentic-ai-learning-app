import { test, expect } from '@playwright/test';

/**
 * RBAC Testing Suite
 * Tests role-based access control across different user types
 * 
 * Users:
 * - u_global: Global Admin (full access)
 * - u_finance: Finance Admin (billing, subscriptions)
 * - u_tech: Tech Support (API keys, webhooks, integrations)
 * - u_legal: Legal & Compliance (audit log, compliance reports)
 * - u_district: District Admin (schools, teachers)
 * - u_school: School Admin (teachers, students within school)
 * - u_teacher: Teacher (classroom, students, IEPs)
 * - u_parent: Parent (child progress, settings)
 */

/**
 * Helper function to impersonate a user
 * Sets the user ID in localStorage and reloads the page
 */
async function viewAs(page: any, userId: string) {
  // Navigate to ensure app is loaded
  await page.goto('/#/');
  
  // Set impersonation in localStorage
  await page.evaluate((id: string) => {
    localStorage.setItem('rbac_current_user_id', JSON.stringify(id));
  }, userId);
  
  // Reload to apply impersonation
  await page.reload();
  
  // Wait for app to be ready
  await page.waitForLoadState('networkidle');
}

test.describe('RBAC: Role-Based Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Start at home page
    await page.goto('/#/');
  });

  test.describe('Finance Admin', () => {
    test('can access billing pages', async ({ page }) => {
      await viewAs(page, 'u_finance');
      
      // Should access billing
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('page-billing')).toBeVisible();
      
      // Should access subscriptions
      await page.goto('/#/billing/subscriptions');
      await expect(page.locator('h1:has-text("Subscriptions")')).toBeVisible();
    });

    test('cannot access admin user management', async ({ page }) => {
      await viewAs(page, 'u_finance');
      
      // Should be blocked from admin users
      await page.goto('/#/admin/users');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access API keys', async ({ page }) => {
      await viewAs(page, 'u_finance');
      
      // Should be blocked from API keys
      await page.goto('/#/settings/api-keys');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('Tech Support', () => {
    test('can access API keys and webhooks', async ({ page }) => {
      await viewAs(page, 'u_tech');
      
      // Should access API keys
      await page.goto('/#/settings/api-keys');
      await expect(page.getByTestId('page-api-keys')).toBeVisible();
      
      // Should access integrations
      await page.goto('/#/integrations');
      await expect(page.locator('h1:has-text("Integrations")')).toBeVisible();
    });

    test('can access device fleet management', async ({ page }) => {
      await viewAs(page, 'u_tech');
      
      // Should access MDM/Device Fleet
      await page.goto('/#/devices');
      await expect(page.getByTestId('page-device-fleet')).toBeVisible();
    });

    test('cannot access billing', async ({ page }) => {
      await viewAs(page, 'u_tech');
      
      // Should be blocked from billing
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access audit log', async ({ page }) => {
      await viewAs(page, 'u_tech');
      
      // Should be blocked from audit log
      await page.goto('/#/settings/audit-log');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('Legal & Compliance', () => {
    test('can access audit log', async ({ page }) => {
      await viewAs(page, 'u_legal');
      
      // Should access audit log
      await page.goto('/#/settings/audit-log');
      await expect(page.getByTestId('page-audit-log')).toBeVisible();
    });

    test('can access compliance reports', async ({ page }) => {
      await viewAs(page, 'u_legal');
      
      // Should access legal/compliance page
      await page.goto('/#/legal/compliance');
      await expect(page.getByTestId('page-legal')).toBeVisible();
    });

    test('cannot access API keys', async ({ page }) => {
      await viewAs(page, 'u_legal');
      
      // Should be blocked from API keys
      await page.goto('/#/settings/api-keys');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access billing', async ({ page }) => {
      await viewAs(page, 'u_legal');
      
      // Should be blocked from billing
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('Global Admin', () => {
    test('can access all admin pages', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      const adminPaths = [
        { path: '/#/admin', testId: 'page-dashboard' },
        { path: '/#/admin/users', testId: 'page-users' },
        { path: '/#/schools', testId: 'page-schools' },
        { path: '/#/devices', testId: 'page-device-fleet' },
      ];
      
      for (const { path, testId } of adminPaths) {
        await page.goto(path);
        const element = page.getByTestId(testId);
        await expect(element).toBeVisible({ timeout: 5000 });
      }
    });

    test('can access all financial pages', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      const financePaths = [
        '/#/settings/billing',
        '/#/billing/subscriptions',
      ];
      
      for (const path of financePaths) {
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
      }
    });

    test('can access all technical pages', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      const techPaths = [
        { path: '/#/settings/api-keys', testId: 'page-api-keys' },
        { path: '/#/integrations', heading: 'Integrations' },
      ];
      
      for (const { path, testId, heading } of techPaths) {
        await page.goto(path);
        if (testId) {
          await expect(page.getByTestId(testId)).toBeVisible();
        } else if (heading) {
          await expect(page.locator(`h1:has-text("${heading}")`)).toBeVisible();
        }
      }
    });

    test('can access all legal/compliance pages', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      await page.goto('/#/settings/audit-log');
      await expect(page.getByTestId('page-audit-log')).toBeVisible();
      
      await page.goto('/#/legal/compliance');
      await expect(page.getByTestId('page-legal')).toBeVisible();
    });

    test('has no 403 errors on any route', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      const allPaths = [
        '/#/admin',
        '/#/admin/users',
        '/#/settings/billing',
        '/#/settings/api-keys',
        '/#/settings/audit-log',
        '/#/legal/compliance',
        '/#/schools',
        '/#/devices',
      ];
      
      for (const path of allPaths) {
        await page.goto(path);
        
        // Should NOT see 403 error
        const forbiddenError = page.getByTestId('route-403');
        await expect(forbiddenError).not.toBeVisible();
      }
    });
  });

  test.describe('District Admin', () => {
    test('can access school management', async ({ page }) => {
      await viewAs(page, 'u_district');
      
      await page.goto('/#/schools');
      await expect(page.getByTestId('page-schools')).toBeVisible();
    });

    test('can access user management', async ({ page }) => {
      await viewAs(page, 'u_district');
      
      await page.goto('/#/admin/users');
      await expect(page.getByTestId('page-users')).toBeVisible();
    });

    test('cannot access billing', async ({ page }) => {
      await viewAs(page, 'u_district');
      
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access API keys', async ({ page }) => {
      await viewAs(page, 'u_district');
      
      await page.goto('/#/settings/api-keys');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('School Admin', () => {
    test('can access school details', async ({ page }) => {
      await viewAs(page, 'u_school');
      
      await page.goto('/#/schools/school-123');
      await expect(page.getByTestId('page-school-detail')).toBeVisible();
    });

    test('cannot access all schools list', async ({ page }) => {
      await viewAs(page, 'u_school');
      
      await page.goto('/#/schools');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access billing', async ({ page }) => {
      await viewAs(page, 'u_school');
      
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('Teacher', () => {
    test('can access classroom management', async ({ page }) => {
      await viewAs(page, 'u_teacher');
      
      await page.goto('/#/classroom');
      await expect(page.locator('h1:has-text("Classroom")')).toBeVisible();
    });

    test('can access student progress', async ({ page }) => {
      await viewAs(page, 'u_teacher');
      
      await page.goto('/#/students');
      await expect(page.locator('h1:has-text("Students")')).toBeVisible();
    });

    test('cannot access school management', async ({ page }) => {
      await viewAs(page, 'u_teacher');
      
      await page.goto('/#/schools');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });

    test('cannot access admin users', async ({ page }) => {
      await viewAs(page, 'u_teacher');
      
      await page.goto('/#/admin/users');
      await expect(page.getByTestId('route-403')).toBeVisible();
    });
  });

  test.describe('Parent', () => {
    test('can access child progress', async ({ page }) => {
      await viewAs(page, 'u_parent');
      
      await page.goto('/#/child/progress');
      await expect(page.locator('h1:has-text("Progress")')).toBeVisible();
    });

    test('can access child settings', async ({ page }) => {
      await viewAs(page, 'u_parent');
      
      await page.goto('/#/child/settings');
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    });

    test('cannot access any admin pages', async ({ page }) => {
      await viewAs(page, 'u_parent');
      
      const adminPaths = [
        '/#/admin',
        '/#/admin/users',
        '/#/schools',
        '/#/devices',
      ];
      
      for (const path of adminPaths) {
        await page.goto(path);
        await expect(page.getByTestId('route-403')).toBeVisible();
      }
    });
  });

  test.describe('Route Catalog Integration', () => {
    test('route catalog shows accessible routes only', async ({ page }) => {
      await viewAs(page, 'u_tech');
      
      await page.goto('/#/routes');
      await expect(page.getByTestId('route-catalog-page')).toBeVisible();
      
      // Filter to accessible routes
      await page.getByTestId('access-filter').selectOption('accessible');
      
      // Should see API keys route
      await expect(page.getByTestId('route-link-APIKeys')).toBeVisible();
      
      // Should NOT see billing route
      await expect(page.getByTestId('route-link-Billing')).not.toBeVisible();
    });

    test('global admin sees all routes as accessible', async ({ page }) => {
      await viewAs(page, 'u_global');
      
      await page.goto('/#/routes');
      await expect(page.getByTestId('route-catalog-page')).toBeVisible();
      
      // Filter to accessible routes
      await page.getByTestId('access-filter').selectOption('accessible');
      
      // Count accessible routes
      const accessibleRoutes = await page.locator('[data-testid^="route-"]').count();
      
      // Global admin should have access to many routes
      expect(accessibleRoutes).toBeGreaterThan(10);
    });

    test('route cards show correct access status', async ({ page }) => {
      await viewAs(page, 'u_finance');
      
      await page.goto('/#/routes');
      
      // Billing route should show accessible (green)
      const billingRoute = page.getByTestId('route--settings-billing');
      await expect(billingRoute).toHaveClass(/border-green/);
      
      // API keys route should show restricted (red)
      const apiRoute = page.getByTestId('route--settings-api-keys');
      await expect(apiRoute).toHaveClass(/border-red/);
    });
  });

  test.describe('Role Switching', () => {
    test('can switch between roles and see different access', async ({ page }) => {
      // Start as finance admin
      await viewAs(page, 'u_finance');
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('page-billing')).toBeVisible();
      
      // Switch to tech support
      await viewAs(page, 'u_tech');
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('route-403')).toBeVisible();
      
      // Switch to global admin
      await viewAs(page, 'u_global');
      await page.goto('/#/settings/billing');
      await expect(page.getByTestId('page-billing')).toBeVisible();
    });

    test('role changes persist across page reloads', async ({ page }) => {
      await viewAs(page, 'u_legal');
      
      // Access allowed page
      await page.goto('/#/settings/audit-log');
      await expect(page.getByTestId('page-audit-log')).toBeVisible();
      
      // Reload page
      await page.reload();
      
      // Should still be impersonating legal user
      await expect(page.getByTestId('page-audit-log')).toBeVisible();
    });
  });

  test.describe('Navigation Guards', () => {
    test('redirects to 403 when accessing forbidden route', async ({ page }) => {
      await viewAs(page, 'u_teacher');
      
      // Try to access admin page
      await page.goto('/#/admin/users');
      
      // Should show 403 error
      await expect(page.getByTestId('route-403')).toBeVisible();
      
      // Should show error message
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });

    test('shows appropriate error message on 403', async ({ page }) => {
      await viewAs(page, 'u_parent');
      
      await page.goto('/#/admin');
      
      // Should show 403 page
      await expect(page.getByTestId('route-403')).toBeVisible();
      
      // Should suggest contacting admin
      await expect(page.locator('text=/contact.*administrator/i')).toBeVisible();
    });
  });
});
