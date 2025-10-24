/**
 * Code Splitting and Lazy Loading Utilities
 * 
 * Provides utilities for lazy loading screens and components
 */

import React, {lazy, Suspense, ComponentType} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

/**
 * Default loading component
 */
export const DefaultLoader: React.FC = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color="#6366F1" />
  </View>
);

/**
 * Lazy load a component with custom loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{default: T}>,
  fallback?: React.ReactElement,
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent(
  importFunc: () => Promise<{default: ComponentType<any>}>,
): void {
  importFunc().catch(err => {
    console.error('Failed to preload component:', err);
  });
}

/**
 * Higher-order component for lazy loading with error boundary
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{default: ComponentType<P>}>,
  fallback?: React.ReactElement,
): React.FC<P> {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <LazyLoadingErrorBoundary>
      <Suspense fallback={fallback || <DefaultLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadingErrorBoundary>
  );
}

/**
 * Error boundary for lazy loading
 */
class LazyLoadingErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; error: Error | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load component</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Lazy load screen with retry mechanism
 */
export function lazyLoadScreen<T extends ComponentType<any>>(
  importFunc: () => Promise<{default: T}>,
  maxRetries: number = 3,
): React.FC<React.ComponentProps<T>> {
  let retryCount = 0;

  const loadWithRetry = async (): Promise<{default: T}> => {
    try {
      return await importFunc();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retry loading component (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return loadWithRetry();
      }
      throw error;
    }
  };

  return lazyLoad(loadWithRetry);
}

/**
 * Batch preload multiple components
 */
export async function preloadComponents(
  importFuncs: Array<() => Promise<{default: ComponentType<any>}>>,
): Promise<void> {
  const promises = importFuncs.map(fn =>
    fn().catch(err => {
      console.error('Failed to preload component:', err);
      return null;
    }),
  );

  await Promise.all(promises);
}

/**
 * Lazy load with timeout
 */
export function lazyLoadWithTimeout<T extends ComponentType<any>>(
  importFunc: () => Promise<{default: T}>,
  timeout: number = 10000,
): React.FC<React.ComponentProps<T>> {
  const loadWithTimeout = (): Promise<{default: T}> => {
    return Promise.race([
      importFunc(),
      new Promise<{default: T}>((_, reject) =>
        setTimeout(() => reject(new Error('Load timeout')), timeout),
      ),
    ]);
  };

  return lazyLoad(loadWithTimeout);
}

/**
 * Conditional lazy loading (load based on condition)
 */
export function conditionalLazyLoad<T extends ComponentType<any>>(
  condition: boolean,
  importFunc: () => Promise<{default: T}>,
  fallbackComponent: ComponentType<any>,
): React.FC<React.ComponentProps<T>> {
  if (!condition) {
    return fallbackComponent as React.FC<React.ComponentProps<T>>;
  }

  return lazyLoad(importFunc);
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

// Fix Text import
import {Text} from 'react-native';

export default {
  lazyLoad,
  preloadComponent,
  withLazyLoading,
  lazyLoadScreen,
  preloadComponents,
  lazyLoadWithTimeout,
  conditionalLazyLoad,
  DefaultLoader,
};
