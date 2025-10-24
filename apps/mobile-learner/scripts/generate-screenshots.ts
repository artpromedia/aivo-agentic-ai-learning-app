/**
 * Screenshot Generator for App Store
 * 
 * Automatically generates screenshots for:
 * - iOS App Store (multiple device sizes)
 * - Google Play Store
 * - Marketing materials
 * 
 * Usage:
 * 1. Run the app on device/simulator
 * 2. Navigate to the screen you want to capture
 * 3. Call generateScreenshot() from the app
 * 4. Screenshots saved to Documents/screenshots/
 */

// @ts-ignore - May not have complete types
import {captureScreen} from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import {Platform, Dimensions} from 'react-native';

export interface ScreenshotConfig {
  name: string;
  route: string;
  delay?: number; // Wait time before capture (ms)
}

export interface DeviceSize {
  name: string;
  width: number;
  height: number;
  scale: number;
}

// iOS device sizes (App Store requirements)
const IOS_DEVICES: DeviceSize[] = [
  // iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
  {name: 'iPhone-6.7', width: 1290, height: 2796, scale: 3},
  // iPhone 6.5" (iPhone 11 Pro Max, XS Max)
  {name: 'iPhone-6.5', width: 1242, height: 2688, scale: 3},
  // iPhone 5.5" (iPhone 8 Plus)
  {name: 'iPhone-5.5', width: 1242, height: 2208, scale: 3},
  // iPad Pro 12.9"
  {name: 'iPad-12.9', width: 2048, height: 2732, scale: 2},
];

// Android device sizes (Play Store requirements)
const ANDROID_DEVICES: DeviceSize[] = [
  // Phone
  {name: 'Android-Phone', width: 1080, height: 1920, scale: 3},
  // 7" Tablet
  {name: 'Android-7inch', width: 1200, height: 1920, scale: 2},
  // 10" Tablet
  {name: 'Android-10inch', width: 1920, height: 1200, scale: 2},
];

// Default screens to capture
const DEFAULT_SCREENS: ScreenshotConfig[] = [
  {name: '01-Welcome', route: 'Welcome', delay: 1000},
  {name: '02-Home', route: 'Home', delay: 2000},
  {name: '03-Lessons', route: 'Subjects', delay: 2000},
  {name: '04-Activity', route: 'Activity', delay: 2000},
  {name: '05-Progress', route: 'Progress', delay: 2000},
  {name: '06-Homework', route: 'HomeworkHelper', delay: 2000},
];

class ScreenshotGenerator {
  private screenshotsDir: string;

  constructor() {
    this.screenshotsDir = `${RNFS.DocumentDirectoryPath}/screenshots`;
  }

  /**
   * Initialize screenshots directory
   */
  async initialize(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.screenshotsDir);
      if (!exists) {
        await RNFS.mkdir(this.screenshotsDir);
        console.log('[Screenshots] Directory created:', this.screenshotsDir);
      }

      // Create subdirectories for platforms
      const iosDir = `${this.screenshotsDir}/ios`;
      const androidDir = `${this.screenshotsDir}/android`;

      if (!(await RNFS.exists(iosDir))) {
        await RNFS.mkdir(iosDir);
      }
      if (!(await RNFS.exists(androidDir))) {
        await RNFS.mkdir(androidDir);
      }

      console.log('[Screenshots] Initialized successfully');
    } catch (error) {
      console.error('[Screenshots] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Capture single screenshot
   */
  async captureScreen(filename: string): Promise<string> {
    try {
      const uri = await captureScreen({
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      const {width, height} = Dimensions.get('window');
      const platform = Platform.OS;
      const destPath = `${this.screenshotsDir}/${platform}/${filename}_${width}x${height}.png`;

      // Copy file to destination
      await RNFS.copyFile(uri, destPath);

      console.log('[Screenshots] Saved:', destPath);
      return destPath;
    } catch (error) {
      console.error('[Screenshots] Capture error:', error);
      throw error;
    }
  }

  /**
   * Generate screenshot with delay
   */
  async generateWithDelay(
    filename: string,
    delay: number = 1000
  ): Promise<string> {
    // Wait for screen to render
    await new Promise((resolve) => setTimeout(resolve, delay));

    return this.captureScreen(filename);
  }

  /**
   * Generate all screenshots for current platform
   */
  async generateAllScreenshots(
    screens: ScreenshotConfig[] = DEFAULT_SCREENS,
    onProgress?: (current: number, total: number, name: string) => void
  ): Promise<string[]> {
    const results: string[] = [];

    console.log(`[Screenshots] Generating ${screens.length} screenshots...`);

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];

      try {
        onProgress?.(i + 1, screens.length, screen.name);

        // Note: Navigation must be handled by the caller
        // This just captures the current screen
        const path = await this.generateWithDelay(
          screen.name,
          screen.delay || 1000
        );

        results.push(path);
      } catch (error) {
        console.error(
          `[Screenshots] Failed to capture ${screen.name}:`,
          error
        );
      }
    }

    console.log('[Screenshots] Complete!', results.length, 'screenshots saved');
    return results;
  }

  /**
   * Get current device info
   */
  getCurrentDeviceInfo(): DeviceSize {
    const {width, height} = Dimensions.get('window');
    const scale = Dimensions.get('window').scale;

    return {
      name: `${Platform.OS}-${width}x${height}`,
      width,
      height,
      scale,
    };
  }

  /**
   * Get required device sizes for platform
   */
  getRequiredSizes(): DeviceSize[] {
    return Platform.OS === 'ios' ? IOS_DEVICES : ANDROID_DEVICES;
  }

  /**
   * List all generated screenshots
   */
  async listScreenshots(): Promise<string[]> {
    try {
      const platform = Platform.OS;
      const dir = `${this.screenshotsDir}/${platform}`;
      const exists = await RNFS.exists(dir);

      if (!exists) {
        return [];
      }

      const files = await RNFS.readDir(dir);
      return files
        .filter((file) => file.name.endsWith('.png'))
        .map((file) => file.path);
    } catch (error) {
      console.error('[Screenshots] List error:', error);
      return [];
    }
  }

  /**
   * Clear all screenshots
   */
  async clearScreenshots(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.screenshotsDir);
      if (exists) {
        await RNFS.unlink(this.screenshotsDir);
        await RNFS.mkdir(this.screenshotsDir);
        console.log('[Screenshots] Cleared all screenshots');
      }
    } catch (error) {
      console.error('[Screenshots] Clear error:', error);
    }
  }

  /**
   * Get screenshots directory path
   */
  getScreenshotsDirectory(): string {
    return this.screenshotsDir;
  }

  /**
   * Share screenshot (open in system share dialog)
   */
  async shareScreenshot(filePath: string): Promise<void> {
    try {
      // Note: Implement with react-native-share if needed
      console.log('[Screenshots] Share:', filePath);
    } catch (error) {
      console.error('[Screenshots] Share error:', error);
    }
  }
}

export const screenshotGenerator = new ScreenshotGenerator();

/**
 * Helper hook for React components
 */
export function useScreenshotGenerator() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState({
    current: 0,
    total: 0,
    name: '',
  });

  const generateScreenshot = async (name: string, delay?: number) => {
    setIsGenerating(true);
    try {
      await screenshotGenerator.initialize();
      const path = await screenshotGenerator.generateWithDelay(name, delay);
      return path;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAll = async (screens?: ScreenshotConfig[]) => {
    setIsGenerating(true);
    try {
      await screenshotGenerator.initialize();
      const paths = await screenshotGenerator.generateAllScreenshots(
        screens,
        (current, total, name) => {
          setProgress({current, total, name});
        }
      );
      return paths;
    } finally {
      setIsGenerating(false);
      setProgress({current: 0, total: 0, name: ''});
    }
  };

  return {
    isGenerating,
    progress,
    generateScreenshot,
    generateAll,
  };
}

// React import for hook
import React from 'react';
