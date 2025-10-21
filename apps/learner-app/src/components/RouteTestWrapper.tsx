import { type ReactNode } from 'react';

interface RouteTestWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component for the entire Routes tree
 * Individual pages handle their own test IDs via PageWrapper
 */
export function RouteTestWrapper({ children }: RouteTestWrapperProps) {
  // Just pass through children without adding duplicate test IDs
  // PageWrapper in each page component handles the test ID
  return <>{children}</>;
}
