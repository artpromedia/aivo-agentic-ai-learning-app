/**
 * Performance Monitoring and Metrics
 * 
 * Provides utilities for tracking and monitoring app performance
 */

import {Platform} from 'react-native';
import React from 'react';

/**
 * Performance metric types
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface NavigationMetric {
  screen: string;
  duration: number;
  timestamp: number;
}

export interface MemoryMetric {
  used: number;
  total: number;
  timestamp: number;
}

/**
 * Performance metrics store
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private navigationMetrics: NavigationMetric[] = [];
  private startTimes: Map<string, number> = new Map();
  private maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start timing an operation
   */
  startTiming(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  /**
   * End timing and record metric
   */
  endTiming(name: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`[Performance] No start time found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.addMetric(metric);

    // Log slow operations
    if (duration > 100) {
      console.warn(
        `[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`,
      );
    }

    return duration;
  }

  /**
   * Record a metric directly
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.addMetric(metric);
  }

  /**
   * Record navigation timing
   */
  recordNavigation(screen: string, duration: number): void {
    const metric: NavigationMetric = {
      screen,
      duration,
      timestamp: Date.now(),
    };

    this.navigationMetrics.push(metric);

    // Keep only last maxMetrics
    if (this.navigationMetrics.length > this.maxMetrics) {
      this.navigationMetrics = this.navigationMetrics.slice(-this.maxMetrics);
    }

    // Log slow navigations
    if (duration > 100) {
      console.warn(
        `[Performance] Slow navigation to ${screen}: ${duration.toFixed(2)}ms`,
      );
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get navigation metrics
   */
  getNavigationMetrics(): NavigationMetric[] {
    return [...this.navigationMetrics];
  }

  /**
   * Get summary report
   */
  getSummary(): {
    totalMetrics: number;
    slowOperations: number;
    averageNavigationTime: number;
    slowestOperation: PerformanceMetric | null;
  } {
    const slowOperations = this.metrics.filter(m => m.duration > 100).length;
    const averageNavigationTime =
      this.navigationMetrics.length > 0
        ? this.navigationMetrics.reduce((sum, m) => sum + m.duration, 0) /
          this.navigationMetrics.length
        : 0;

    const slowestOperation =
      this.metrics.length > 0
        ? this.metrics.reduce((prev, current) =>
            prev.duration > current.duration ? prev : current,
          )
        : null;

    return {
      totalMetrics: this.metrics.length,
      slowOperations,
      averageNavigationTime,
      slowestOperation,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.navigationMetrics = [];
    this.startTimes.clear();
  }

  /**
   * Add metric to store
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to measure component mount/unmount time
 */
export function useComponentPerformance(componentName: string): void {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(`${componentName}_mount`, duration);
    };
  }, [componentName]);
}

/**
 * Hook to measure render time
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
  });

  React.useEffect(() => {
    const startTime = performance.now();

    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        `${componentName}_render`,
        duration,
        {renderCount: renderCount.current},
      );
    });
  });
}

/**
 * HOC to measure component performance
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
): React.FC<P> {
  const name = componentName || Component.displayName || Component.name || 'Component';

  return (props: P) => {
    useComponentPerformance(name);
    useRenderPerformance(name);

    return <Component {...props} />;
  };
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> {
  performanceMonitor.startTiming(name);
  try {
    const result = await fn();
    performanceMonitor.endTiming(name, metadata);
    return result;
  } catch (error) {
    performanceMonitor.endTiming(name, {...metadata, error: true});
    throw error;
  }
}

/**
 * Measure sync function performance
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>,
): T {
  performanceMonitor.startTiming(name);
  try {
    const result = fn();
    performanceMonitor.endTiming(name, metadata);
    return result;
  } catch (error) {
    performanceMonitor.endTiming(name, {...metadata, error: true});
    throw error;
  }
}

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // App launch
  COLD_START: 2000, // 2s
  WARM_START: 1000, // 1s

  // Screen transitions
  NAVIGATION: 100, // 100ms

  // List scrolling
  SCROLL_FPS: 60,
  FRAME_TIME: 16.67, // 60fps = 16.67ms per frame

  // Memory
  MEMORY_WARNING: 200, // 200MB

  // Bundle size
  BUNDLE_SIZE: 40 * 1024 * 1024, // 40MB
};

/**
 * Performance budget checker
 */
export const PerformanceBudget = {
  /**
   * Check if operation is within budget
   */
  isWithinBudget: (duration: number, threshold: number): boolean => {
    return duration <= threshold;
  },

  /**
   * Log budget violation
   */
  logViolation: (name: string, duration: number, budget: number): void => {
    const overBudget = duration - budget;
    const percentage = ((overBudget / budget) * 100).toFixed(1);
    console.warn(
      `[Performance Budget] ${name} exceeded budget by ${overBudget.toFixed(
        2,
      )}ms (${percentage}%)`,
    );
  },

  /**
   * Check navigation budget
   */
  checkNavigation: (duration: number): boolean => {
    const withinBudget = PerformanceBudget.isWithinBudget(
      duration,
      PERFORMANCE_THRESHOLDS.NAVIGATION,
    );

    if (!withinBudget) {
      PerformanceBudget.logViolation(
        'Navigation',
        duration,
        PERFORMANCE_THRESHOLDS.NAVIGATION,
      );
    }

    return withinBudget;
  },
};

/**
 * Platform-specific performance utilities
 */
export const PlatformPerformance = {
  /**
   * Check if running on low-end device
   */
  isLowEndDevice: (): boolean => {
    // This would need native implementation
    // Placeholder for now
    return false;
  },

  /**
   * Get device tier
   */
  getDeviceTier: (): 'high' | 'medium' | 'low' => {
    // This would need native implementation
    // Placeholder for now
    return 'medium';
  },

  /**
   * Optimize for platform
   */
  shouldOptimize: (): boolean => {
    return Platform.OS === 'android' || PlatformPerformance.isLowEndDevice();
  },
};

export default {
  performanceMonitor,
  useComponentPerformance,
  useRenderPerformance,
  withPerformanceTracking,
  measureAsync,
  measureSync,
  PERFORMANCE_THRESHOLDS,
  PerformanceBudget,
  PlatformPerformance,
};
