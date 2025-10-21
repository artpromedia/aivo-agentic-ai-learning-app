import React, { useState, useEffect } from 'react';
import { useRBAC } from '@aivo/auth';
import { Role } from '@aivo/types';

export interface RouteDefinition {
  path: string;
  screen: string;
  title: string;
  description?: string;
  roles?: Role[];
  category?: 'learner' | 'parent' | 'teacher' | 'admin' | 'settings' | 'developer';
  params?: Record<string, string>;
  testId?: string;
}

// Export routes globally for Playwright
declare global {
  interface Window {
    __ROUTES: RouteDefinition[];
    __CURRENT_ROUTE: string;
    __NAVIGATE: (path: string) => void;
  }
}

export const RouteCatalogPage: React.FC = () => {
  const { currentUser, hasAnyRole } = useRBAC();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<'all' | 'accessible' | 'restricted'>('all');

  // Get routes from global registry
  const routes: RouteDefinition[] = window.__ROUTES || [];

  const filteredRoutes = routes.filter(route => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        route.path.toLowerCase().includes(query) ||
        route.title.toLowerCase().includes(query) ||
        route.description?.toLowerCase().includes(query) ||
        route.screen.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filterCategory !== 'all' && route.category !== filterCategory) {
      return false;
    }

    // Access filter
    if (filterAccess !== 'all') {
      const hasAccess = hasAnyRole(route.roles);
      if (filterAccess === 'accessible' && !hasAccess) return false;
      if (filterAccess === 'restricted' && hasAccess) return false;
    }

    return true;
  });

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const category = route.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(route);
    return acc;
  }, {} as Record<string, RouteDefinition[]>);

  const copyAsPlaywrightTest = () => {
    const test = generatePlaywrightTest(filteredRoutes);
    navigator.clipboard.writeText(test);
    alert('Playwright test copied to clipboard!');
  };

  const copyAsJestTest = () => {
    const test = generateJestTest(filteredRoutes);
    navigator.clipboard.writeText(test);
    alert('Jest test copied to clipboard!');
  };

  useEffect(() => {
    // Expose current route for testing
    window.__CURRENT_ROUTE = window.location.hash;
  }, []);

  return (
    <div className="space-y-6" data-testid="route-catalog-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Route Catalog</h1>
          <p className="text-neutral-600 mt-1">
            {routes.length} registered routes • {filteredRoutes.length} matching filters
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyAsPlaywrightTest}
            className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm font-medium"
            data-testid="copy-playwright"
          >
            📋 Copy Playwright Test
          </button>
          <button
            onClick={copyAsJestTest}
            className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm font-medium"
            data-testid="copy-jest"
          >
            📋 Copy Jest Test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white rounded-xl border-2 border-neutral-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500"
              data-testid="route-search"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500"
            data-testid="category-filter"
          >
            <option value="all">All Categories</option>
            <option value="learner">Learner</option>
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="settings">Settings</option>
            <option value="developer">Developer</option>
          </select>

          <select
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value as any)}
            className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500"
            data-testid="access-filter"
          >
            <option value="all">All Routes</option>
            <option value="accessible">Accessible to Me</option>
            <option value="restricted">Restricted from Me</option>
          </select>
        </div>
      </div>

      {/* Current User Context */}
      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <div>
            <p className="font-semibold">Testing as: {currentUser.name}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {currentUser.roles.length === 0 ? (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                  No roles
                </span>
              ) : (
                currentUser.roles.map(role => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                  >
                    {role}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Routes by Category */}
      {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
        <div key={category} className="p-6 bg-white rounded-xl border-2 border-neutral-200">
          <h2 className="text-xl font-bold mb-4 capitalize">
            {category} Routes ({categoryRoutes.length})
          </h2>

          <div className="space-y-2">
            {categoryRoutes.map(route => (
              <RouteCard
                key={route.path}
                route={route}
                hasAccess={hasAnyRole(route.roles)}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredRoutes.length === 0 && (
        <div className="p-12 bg-white rounded-xl border-2 border-neutral-200 text-center text-neutral-500">
          No routes found matching your filters
        </div>
      )}

      {/* Testing Info */}
      <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
        <h3 className="font-semibold mb-2">For QA & Testing</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>All routes are accessible via <code className="bg-purple-100 px-1 rounded">window.__ROUTES</code></li>
          <li>Current route: <code className="bg-purple-100 px-1 rounded">window.__CURRENT_ROUTE</code></li>
          <li>Navigate programmatically: <code className="bg-purple-100 px-1 rounded">window.__NAVIGATE(path)</code></li>
          <li>Each route has a unique <code className="bg-purple-100 px-1 rounded">data-testid</code> attribute</li>
          <li>Use "Copy Test" buttons to generate automated test scaffolding</li>
        </ul>
      </div>
    </div>
  );
};

const RouteCard: React.FC<{
  route: RouteDefinition;
  hasAccess: boolean;
}> = ({ route, hasAccess }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(route.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div
      className={`
        flex items-start justify-between p-4 rounded-lg border-2 transition
        ${hasAccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
      `}
      data-testid={`route-${route.path.replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <a
            href={`#${route.path}`}
            className="font-mono text-sm font-semibold text-blue-600 hover:underline"
            data-testid={`route-link-${route.screen}`}
          >
            {route.path}
          </a>
          <button
            onClick={handleCopy}
            className="text-xs text-neutral-500 hover:text-neutral-700"
            title="Copy path"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>

        <p className="text-sm font-medium mb-1">{route.title}</p>

        {route.description && (
          <p className="text-xs text-neutral-600 mb-2">{route.description}</p>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {route.category && (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded capitalize">
              {route.category}
            </span>
          )}

          {route.roles && route.roles.length > 0 ? (
            route.roles.map(role => (
              <span
                key={role}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Public
            </span>
          )}

          {route.testId && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-mono">
              {route.testId}
            </span>
          )}
        </div>
      </div>

      <div className="ml-4">
        <span
          className={`
            inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium
            ${hasAccess ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}
          `}
        >
          {hasAccess ? '✓ Accessible' : '✗ Restricted'}
        </span>
      </div>
    </div>
  );
};

function generatePlaywrightTest(routes: RouteDefinition[]): string {
  return `
import { test, expect } from '@playwright/test';

test.describe('Route Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

${routes.map(route => `
  test('should navigate to ${route.title}', async ({ page }) => {
    await page.goto('#${route.path}');
    await expect(page.locator('[data-testid="${route.testId || `page-${route.screen}`}"]')).toBeVisible();
    expect(page.url()).toContain('${route.path}');
  });
`).join('\n')}
});
  `.trim();
}

function generateJestTest(routes: RouteDefinition[]): string {
  return `
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('Route Tests', () => {
${routes.map(route => `
  test('renders ${route.title}', () => {
    window.location.hash = '${route.path}';
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByTestId('${route.testId || `page-${route.screen}`}')).toBeInTheDocument();
  });
`).join('\n')}
});
  `.trim();
}
