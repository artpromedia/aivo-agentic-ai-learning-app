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

class RouteRegistry {
  private routes: Map<string, RouteDefinition> = new Map();

  /**
   * Register a route definition
   */
  register(route: RouteDefinition): void {
    this.routes.set(route.path, route);
    this.updateGlobalWindow();
  }

  /**
   * Register multiple routes at once
   */
  registerMany(routes: RouteDefinition[]): void {
    routes.forEach(route => this.routes.set(route.path, route));
    this.updateGlobalWindow();
  }

  /**
   * Get all registered routes
   */
  getAll(): RouteDefinition[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get a specific route by path
   */
  getRoute(path: string): RouteDefinition | undefined {
    return this.routes.get(path);
  }

  /**
   * Get routes by category
   */
  getByCategory(category: RouteDefinition['category']): RouteDefinition[] {
    return this.getAll().filter(route => route.category === category);
  }

  /**
   * Get routes accessible to specific roles
   */
  getAccessibleRoutes(userRoles: Role[]): RouteDefinition[] {
    return this.getAll().filter(route => {
      // Public routes (no roles specified) are accessible to everyone
      if (!route.roles || route.roles.length === 0) {
        return true;
      }
      // Check if user has any of the required roles
      return route.roles.some(role => userRoles.includes(role));
    });
  }

  /**
   * Search routes by query string
   */
  search(query: string): RouteDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(route => {
      return (
        route.path.toLowerCase().includes(lowerQuery) ||
        route.title.toLowerCase().includes(lowerQuery) ||
        route.description?.toLowerCase().includes(lowerQuery) ||
        route.screen.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Clear all routes
   */
  clear(): void {
    this.routes.clear();
    this.updateGlobalWindow();
  }

  /**
   * Update window object for testing tools
   */
  private updateGlobalWindow(): void {
    if (typeof window !== 'undefined') {
      window.__ROUTES = this.getAll();
    }
  }

  /**
   * Setup navigation helper for testing
   */
  setupNavigationHelper(navigate: (path: string) => void): void {
    if (typeof window !== 'undefined') {
      window.__NAVIGATE = navigate;
    }
  }

  /**
   * Generate a test ID for a route
   */
  generateTestId(screen: string): string {
    return `page-${screen.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }
}

// Singleton instance
export const routeRegistry = new RouteRegistry();

// Extend window type
declare global {
  interface Window {
    __ROUTES: RouteDefinition[];
    __CURRENT_ROUTE: string;
    __NAVIGATE: (path: string) => void;
  }
}
