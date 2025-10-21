import { type ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  is404?: boolean;
}

/**
 * PageWrapper component that adds test IDs for e2e testing
 * Every page should be wrapped with this component
 */
export function PageWrapper({ children, is404 = false }: PageWrapperProps) {
  return (
    <div data-testid={is404 ? 'route-404' : 'route-ok'}>
      {children}
    </div>
  );
}
