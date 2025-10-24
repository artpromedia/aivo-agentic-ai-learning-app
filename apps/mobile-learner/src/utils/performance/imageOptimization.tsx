/**
 * Image Optimization Utilities
 * 
 * Provides optimized image components for better performance and caching
 */

import React from 'react';
import {Image, StyleSheet, ImageStyle, StyleProp, View} from 'react-native';
import FastImage, {
  FastImageProps,
  Source,
  ResizeMode,
  Priority,
} from 'react-native-fast-image';

interface OptimizedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ResizeMode;
  priority?: Priority;
  fallbackSource?: number; // Local image resource
  onLoad?: () => void;
  onError?: () => void;
  testID?: string;
}

/**
 * OptimizedImage component using FastImage for better caching
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  fallbackSource,
  onLoad,
  onError,
  testID,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const source: Source = {
    uri,
    priority,
    cache: FastImage.cacheControl.immutable,
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError && fallbackSource) {
    return (
      <Image
        source={fallbackSource}
        style={style}
        resizeMode={resizeMode as any}
        testID={testID}
      />
    );
  }

  return (
    <FastImage
      source={source}
      style={style}
      resizeMode={resizeMode}
      onLoad={onLoad}
      onError={handleError}
      testID={testID}
    />
  );
};

/**
 * Preload images for better UX
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const sources: Source[] = urls.map(uri => ({
    uri,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  }));

  await FastImage.preload(sources);
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  await FastImage.clearMemoryCache();
  await FastImage.clearDiskCache();
};

/**
 * Avatar Image with circular style
 */
export const AvatarImage: React.FC<{
  uri: string;
  size: number;
  fallbackSource?: number;
}> = ({uri, size, fallbackSource}) => {
  return (
    <OptimizedImage
      uri={uri}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      resizeMode={FastImage.resizeMode.cover}
      fallbackSource={fallbackSource}
    />
  );
};

/**
 * Thumbnail Image with aspect ratio preservation
 */
export const ThumbnailImage: React.FC<{
  uri: string;
  width: number;
  aspectRatio?: number;
  style?: StyleProp<ImageStyle>;
}> = ({uri, width, aspectRatio = 16 / 9, style}) => {
  return (
    <OptimizedImage
      uri={uri}
      style={[
        {
          width,
          height: width / aspectRatio,
        },
        style,
      ]}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};

/**
 * Background Image with overlay
 */
export const BackgroundImage: React.FC<{
  uri: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
}> = ({uri, children, overlayOpacity = 0.5}) => {
  return (
    <View style={styles.backgroundContainer}>
      <OptimizedImage
        uri={uri}
        style={StyleSheet.absoluteFillObject}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`},
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    position: 'relative',
  },
});

/**
 * Image cache utilities
 */
export const ImageCache = {
  /**
   * Preload multiple images
   */
  preloadMultiple: async (urls: string[]): Promise<void> => {
    await preloadImages(urls);
  },

  /**
   * Clear all cached images
   */
  clearAll: async (): Promise<void> => {
    await clearImageCache();
  },

  /**
   * Clear memory cache only (keep disk cache)
   */
  clearMemory: (): void => {
    FastImage.clearMemoryCache();
  },

  /**
   * Clear disk cache only (keep memory cache)
   */
  clearDisk: async (): Promise<void> => {
    await FastImage.clearDiskCache();
  },
};

export default OptimizedImage;
