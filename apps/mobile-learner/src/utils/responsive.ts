/**
 * Responsive Design Utilities
 * 
 * Provides hooks and utilities for responsive layouts:
 * - Device detection (phone, tablet)
 * - Orientation detection
 * - Dynamic font scaling
 * - Breakpoint-based styling
 */

import {useState, useEffect} from 'react';
import {Dimensions, Platform, PixelRatio} from 'react-native';
import type {ScaledSize} from 'react-native';

/**
 * Device types
 */
export type DeviceType = 'phone' | 'tablet';
export type Orientation = 'portrait' | 'landscape';

/**
 * Breakpoints (in dp - density-independent pixels)
 */
export const breakpoints = {
  phonePortrait: {min: 320, max: 414},
  phoneLandscape: {min: 568, max: 896},
  tabletPortrait: {min: 768, max: 1024},
  tabletLandscape: {min: 1024, max: 1366},
} as const;

/**
 * Screen dimensions interface
 */
export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  isPhone: boolean;
  isTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  deviceType: DeviceType;
  orientation: Orientation;
}

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = (): ScreenDimensions => {
  const {width, height, scale, fontScale} = Dimensions.get('window');
  const isPortrait = height >= width;
  const deviceType: DeviceType = width < breakpoints.tabletPortrait.min ? 'phone' : 'tablet';

  return {
    width,
    height,
    scale,
    fontScale,
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet',
    isPortrait,
    isLandscape: !isPortrait,
    deviceType,
    orientation: isPortrait ? 'portrait' : 'landscape',
  };
};

/**
 * useResponsive Hook
 * 
 * Provides reactive screen dimensions that update on orientation change
 * 
 * @example
 * const {isPhone, isTablet, width, orientation} = useResponsive();
 */
export const useResponsive = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(
    getScreenDimensions(),
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window}: {window: ScaledSize}) => {
        setDimensions(getScreenDimensions());
      },
    );

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Responsive font size scaling
 * 
 * Scales font size based on screen width while respecting accessibility settings
 * Ensures minimum 200% scaling for WCAG compliance
 * 
 * @param size - Base font size in pixels
 * @param options - Scaling options
 */
export interface FontScaleOptions {
  minScale?: number;
  maxScale?: number;
  respectAccessibility?: boolean;
}

export const scaleFontSize = (
  size: number,
  options: FontScaleOptions = {},
): number => {
  const {
    minScale = 0.8,
    maxScale = 2.0, // Support 200% scaling
    respectAccessibility = true,
  } = options;

  const {width, fontScale} = Dimensions.get('window');
  const baseWidth = 375; // iPhone X width as base

  // Calculate scale based on screen width
  let scale = width / baseWidth;

  // Apply accessibility font scale if enabled
  if (respectAccessibility && fontScale > 1) {
    scale *= fontScale;
  }

  // Clamp scale to min/max
  scale = Math.max(minScale, Math.min(maxScale, scale));

  return Math.round(size * scale);
};

/**
 * Dynamic spacing based on screen size
 * 
 * @param baseSize - Base size in pixels
 */
export const scaleSize = (baseSize: number): number => {
  const {width} = Dimensions.get('window');
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(baseSize * scale);
};

/**
 * Convert dp (density-independent pixels) to pixels
 */
export const dpToPx = (dp: number): number => {
  return PixelRatio.getPixelSizeForLayoutSize(dp);
};

/**
 * Convert pixels to dp
 */
export const pxToDp = (px: number): number => {
  return px / PixelRatio.get();
};

/**
 * Responsive value selector
 * 
 * Returns different values based on device type
 * 
 * @example
 * const padding = responsive({phone: 16, tablet: 24});
 */
export const responsive = <T>(values: {
  phone?: T;
  tablet?: T;
  default?: T;
}): T | undefined => {
  const {isPhone, isTablet} = getScreenDimensions();

  if (isPhone && values.phone !== undefined) {
    return values.phone;
  }

  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }

  return values.default;
};

/**
 * Orientation-based value selector
 * 
 * @example
 * const columns = orientationValue({portrait: 1, landscape: 2});
 */
export const orientationValue = <T>(values: {
  portrait?: T;
  landscape?: T;
  default?: T;
}): T | undefined => {
  const {isPortrait, isLandscape} = getScreenDimensions();

  if (isPortrait && values.portrait !== undefined) {
    return values.portrait;
  }

  if (isLandscape && values.landscape !== undefined) {
    return values.landscape;
  }

  return values.default;
};

/**
 * Platform-specific value selector
 * 
 * @example
 * const height = platformValue({ios: 44, android: 56, default: 50});
 */
export const platformValue = <T>(values: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T | undefined => {
  const platform = Platform.OS;

  if (platform === 'ios' && values.ios !== undefined) {
    return values.ios;
  }

  if (platform === 'android' && values.android !== undefined) {
    return values.android;
  }

  if (platform === 'web' && values.web !== undefined) {
    return values.web;
  }

  return values.default;
};

/**
 * Touch target size utilities
 */
export const touchTargets = {
  minimum: 44, // iOS HIG minimum
  comfortable: 48, // Material Design recommended
  large: 56, // For accessibility
  extraLarge: 64, // For K5 learners
};

/**
 * Get recommended touch target size based on grade
 */
export const getTouchTargetSize = (grade?: string): number => {
  if (!grade) return touchTargets.comfortable;

  // K-5: Extra large targets
  if (['K', '1', '2', '3', '4', '5'].includes(grade)) {
    return touchTargets.extraLarge;
  }

  // 6-8: Large targets
  if (['6', '7', '8'].includes(grade)) {
    return touchTargets.large;
  }

  // 9-12: Comfortable targets
  return touchTargets.comfortable;
};

/**
 * Accessibility utilities
 */
export const accessibility = {
  /**
   * Checks if large text is enabled (accessibility setting)
   */
  isLargeText: (): boolean => {
    const {fontScale} = Dimensions.get('window');
    return fontScale > 1.2;
  },

  /**
   * Gets accessible text size
   */
  getAccessibleTextSize: (baseSize: number): number => {
    return scaleFontSize(baseSize, {
      minScale: 1.0,
      maxScale: 2.0,
      respectAccessibility: true,
    });
  },

  /**
   * Gets accessible spacing
   */
  getAccessibleSpacing: (baseSpacing: number): number => {
    const {fontScale} = Dimensions.get('window');
    return Math.round(baseSpacing * Math.min(fontScale, 1.5));
  },
};

/**
 * Responsive grid system
 */
export const grid = {
  /**
   * Gets number of columns based on screen size
   */
  getColumns: (options?: {phone?: number; tablet?: number}): number => {
    return responsive({
      phone: options?.phone ?? 1,
      tablet: options?.tablet ?? 2,
      default: 1,
    }) ?? 1;
  },

  /**
   * Gets gutter size based on screen size
   */
  getGutter: (): number => {
    return responsive({
      phone: 16,
      tablet: 24,
      default: 16,
    }) ?? 16;
  },
};

export default {
  breakpoints,
  getScreenDimensions,
  useResponsive,
  scaleFontSize,
  scaleSize,
  dpToPx,
  pxToDp,
  responsive,
  orientationValue,
  platformValue,
  touchTargets,
  getTouchTargetSize,
  accessibility,
  grid,
};
