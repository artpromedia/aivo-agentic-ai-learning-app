import { type ReactNode, useState, useEffect } from 'react';
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
  const [testId, setTestId] = useState<'route-ok' | 'route-404'>('route-ok');
  
  // Check if this is a 404 by looking for the route in the registry
  useEffect(() => {
    const routes = (window as Window & { __ROUTES?: unknown[] }).__ROUTES || [];
    const currentPath = location.pathname;
    
    // Public routes that should always be ok
    const publicRoutes = ['/login', '/unauthorized'];
    if (publicRoutes.includes(currentPath)) {
      setTestId('route-ok');
      return;
    }
    
    const routeExists = routes.some((r: { path?: string }) => {
      if (!r.path) return false;
      
      // Exact match
      if (r.path === currentPath) return true;
      
      // Dynamic route matching (e.g., /path/:id)
      if (r.path.includes(':')) {
        const pathParts = r.path.split('/');
        const currentParts = currentPath.split('/');
        
        if (pathParts.length !== currentParts.length) return false;
        
        return pathParts.every((part, i) => {
          return part.startsWith(':') || part === currentParts[i];
        });
      }
      
      return false;
    });
    
    setTestId(routeExists ? 'route-ok' : 'route-404');
  }, [location]);
  
  // Return wrapper with test ID - invisible but queryable
  return (
    <div data-testid={testId} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
