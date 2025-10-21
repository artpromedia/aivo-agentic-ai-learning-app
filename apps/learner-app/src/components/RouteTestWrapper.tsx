import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteTestWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper that automatically adds test IDs for e2e testing
 * Detects if route exists or is a 404
 */
export function RouteTestWrapper({ children }: RouteTestWrapperProps) {
  const location = useLocation();
  
  // Check if this is a 404 by looking for the route in the registry
  useEffect(() => {
    const routes = (window as Window & { __ROUTES?: unknown[] }).__ROUTES || [];
    const currentPath = location.pathname;
    const routeExists = routes.some((r: { path?: string }) => {
      if (!r.path) return false;
      // Simple path matching - more sophisticated matching could be added
      if (r.path === currentPath) return true;
      const pathBase = r.path.split(':')[0];
      if (r.path.includes(':') && pathBase && currentPath.startsWith(pathBase)) return true;
      return false;
    });
    
    // Add test ID to body for e2e tests
    const testId = routeExists || currentPath === '/login' || currentPath === '/unauthorized' ? 'route-ok' : 'route-404';
    document.body.setAttribute('data-testid', testId);
  }, [location]);
  
  return <>{children}</>;
}
