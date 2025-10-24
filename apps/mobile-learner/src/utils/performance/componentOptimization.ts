/**
 * React Component Optimization Utilities
 * 
 * Provides utilities for optimizing React components with memoization
 */

import React, {memo, useMemo, useCallback} from 'react';

/**
 * Deep comparison for memo
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow comparison for memo
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Create a memoized component with shallow comparison
 */
export function createShallowMemo<P extends object>(
  Component: React.FC<P>,
  displayName?: string,
): React.FC<P> {
  const MemoComponent = memo(Component, shallowEqual);
  if (displayName) {
    MemoComponent.displayName = displayName;
  }
  return MemoComponent;
}

/**
 * Create a memoized component with deep comparison
 */
export function createDeepMemo<P extends object>(
  Component: React.FC<P>,
  displayName?: string,
): React.FC<P> {
  const MemoComponent = memo(Component, deepEqual);
  if (displayName) {
    MemoComponent.displayName = displayName;
  }
  return MemoComponent;
}

/**
 * Hook for memoizing expensive computations
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  return useMemo(() => {
    const start = performance.now();
    const result = factory();
    const end = performance.now();
    
    if (end - start > 16) {
      console.warn(
        `[Performance] Expensive computation took ${(end - start).toFixed(2)}ms`,
      );
    }
    
    return result;
  }, deps);
}

/**
 * Hook for creating stable callback references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = React.useRef(callback);
  
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook for comparing values
 */
export function useDeepCompare<T>(value: T): T {
  const ref = React.useRef<T>(value);
  
  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook for memoizing with deep comparison
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  const dependencies = useDeepCompare(deps);
  return useMemo(factory, [dependencies]);
}

/**
 * Hook for stable callbacks with deep deps comparison
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  const dependencies = useDeepCompare(deps);
  return useCallback(callback, [dependencies]);
}

/**
 * Pure component wrapper with automatic display name
 */
export function pure<P extends object>(
  Component: React.FC<P>,
  customCompare?: (prevProps: P, nextProps: P) => boolean,
): React.FC<P> {
  const PureComponent = memo(Component, customCompare);
  PureComponent.displayName = Component.displayName || Component.name || 'PureComponent';
  return PureComponent;
}

/**
 * Optimization utilities object
 */
export const OptimizationUtils = {
  /**
   * Check if component should update
   */
  shouldUpdate: <P extends object>(
    prevProps: P,
    nextProps: P,
    comparator: 'shallow' | 'deep' = 'shallow',
  ): boolean => {
    return comparator === 'shallow'
      ? !shallowEqual(prevProps, nextProps)
      : !deepEqual(prevProps, nextProps);
  },

  /**
   * Create a pure functional component
   */
  makePure: <P extends object>(
    Component: React.FC<P>,
    comparison: 'shallow' | 'deep' = 'shallow',
  ): React.FC<P> => {
    const compareFunc = comparison === 'shallow' ? shallowEqual : deepEqual;
    return memo(Component, compareFunc);
  },

  /**
   * Measure component render time
   */
  measureRender: <P extends object>(
    Component: React.FC<P>,
    name?: string,
  ): React.FC<P> => {
    return (props: P) => {
      const start = performance.now();
      const result = Component(props);
      const end = performance.now();
      
      const componentName = name || Component.displayName || Component.name || 'Component';
      const renderTime = end - start;
      
      if (renderTime > 16) {
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`,
        );
      }
      
      return result;
    };
  },
};

export default {
  deepEqual,
  shallowEqual,
  createShallowMemo,
  createDeepMemo,
  useExpensiveMemo,
  useStableCallback,
  usePrevious,
  useDeepCompare,
  useDeepMemo,
  useDeepCallback,
  pure,
  OptimizationUtils,
};
