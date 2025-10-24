/**
 * Memory Management Utilities
 * 
 * Handles memory cleanup and optimization when app goes to background
 */

import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {ImageCache} from './imageOptimization';

/**
 * Hook to handle memory cleanup when app goes to background
 */
export const useMemoryCleanup = (options?: {
  clearImageCache?: boolean;
  clearQueryCache?: boolean;
  onBackground?: () => void;
  onForeground?: () => void;
}) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        // App transitioning to background
        if (
          appState.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          handleBackgroundCleanup();
          options?.onBackground?.();
        }

        // App transitioning to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          options?.onForeground?.();
        }

        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [options]);

  const handleBackgroundCleanup = async () => {
    try {
      // Clear image memory cache (keep disk cache)
      if (options?.clearImageCache !== false) {
        ImageCache.clearMemory();
      }

      // Additional cleanup can be added here
      // e.g., cancel pending requests, pause timers, etc.
    } catch (error) {
      console.error('Error during background cleanup:', error);
    }
  };
};

/**
 * Hook to monitor memory warnings
 */
export const useMemoryWarning = (callback?: () => void) => {
  useEffect(() => {
    // Note: React Native doesn't have built-in memory warning events
    // This is a placeholder for custom implementation
    const handleMemoryWarning = () => {
      console.warn('Memory warning detected');
      callback?.();
    };

    // You would subscribe to native memory warning events here
    // For now, this is a no-op placeholder

    return () => {
      // Cleanup subscription
    };
  }, [callback]);
};

/**
 * Debounce utility for optimizing frequent function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for rate-limiting function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Hook for debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const throttledCallback = React.useRef(throttle(callback, delay));

  React.useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);

  return throttledCallback.current;
}

/**
 * Memory monitoring utilities
 */
export const MemoryMonitor = {
  /**
   * Get current memory usage (if available)
   */
  getCurrentUsage: (): number | null => {
    // This would need native module implementation
    // Placeholder for now
    return null;
  },

  /**
   * Check if app is using excessive memory
   */
  isHighMemoryUsage: (threshold: number = 200): boolean => {
    const usage = MemoryMonitor.getCurrentUsage();
    if (usage === null) return false;
    return usage > threshold;
  },

  /**
   * Trigger garbage collection (if possible)
   */
  forceGarbageCollection: (): void => {
    // This would trigger native GC
    // Not directly available in React Native
    console.log('GC triggered');
  },
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  /**
   * Measure function execution time
   */
  measureExecutionTime: async <T,>(
    name: string,
    fn: () => Promise<T> | T,
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  /**
   * Delay execution (for preventing blocking)
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Run task in next event loop cycle
   */
  runInNextCycle: (callback: () => void): void => {
    setImmediate(callback);
  },
};

// Fix React import
import React from 'react';

export default {
  useMemoryCleanup,
  useMemoryWarning,
  debounce,
  throttle,
  useDebouncedValue,
  useThrottle,
  MemoryMonitor,
  PerformanceUtils,
};
