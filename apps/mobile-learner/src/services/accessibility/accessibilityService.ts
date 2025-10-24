/**
 * Accessibility Service
 * 
 * Provides comprehensive accessibility features:
 * - Screen reader support (TalkBack/VoiceOver)
 * - Text-to-speech
 * - Haptic feedback
 * - Focus management
 * - Accessibility announcements
 */

import {AccessibilityInfo, Platform} from 'react-native';
import Tts from 'react-native-tts';
// @ts-ignore - Package exists but may not have types
import Haptics from 'react-native-haptic-feedback';
import {analyticsService} from '../analytics/analyticsService';

export type HapticType = 'selection' | 'success' | 'warning' | 'error';

interface AccessibilityConfig {
  enableTts?: boolean;
  enableHaptics?: boolean;
  ttsRate?: number; // 0.5 to 2.0
  ttsPitch?: number; // 0.5 to 2.0
  ttsLanguage?: string;
}

class AccessibilityService {
  private screenReaderEnabled = false;
  private textScale = 1.0;
  private config: AccessibilityConfig = {
    enableTts: false,
    enableHaptics: true,
    ttsRate: 1.0,
    ttsPitch: 1.0,
    ttsLanguage: 'en-US',
  };
  private isInitialized = false;
  private listeners: Array<(enabled: boolean) => void> = [];

  /**
   * Initialize accessibility service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[Accessibility] Already initialized');
      return;
    }

    try {
      // Check if screen reader is enabled
      this.screenReaderEnabled =
        await AccessibilityInfo.isScreenReaderEnabled();

      console.log(
        '[Accessibility] Screen reader enabled:',
        this.screenReaderEnabled
      );

      // Listen to screen reader changes
      AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        this.handleScreenReaderChange
      );

      // Get text scale (Android only)
      if (Platform.OS === 'android') {
        try {
          // Android provides recommended timeout based on accessibility settings
          const timeoutMs =
            await AccessibilityInfo.getRecommendedTimeoutMillis(1000);
          this.textScale = Math.min(timeoutMs / 1000, 2.0);
        } catch (error) {
          console.warn(
            '[Accessibility] Could not get text scale:',
            error
          );
        }
      }

      // Initialize TTS
      await this.initializeTts();

      this.isInitialized = true;
      console.log('[Accessibility] Initialized successfully');
    } catch (error) {
      console.error('[Accessibility] Initialization error:', error);
    }
  }

  /**
   * Initialize Text-to-Speech
   */
  private async initializeTts(): Promise<void> {
    try {
      // Set default TTS settings
      await Tts.setDefaultLanguage(this.config.ttsLanguage || 'en-US');
      await Tts.setDefaultRate(this.config.ttsRate || 1.0);
      await Tts.setDefaultPitch(this.config.ttsPitch || 1.0);

      // Get available voices
      const voices = await Tts.voices();
      console.log('[Accessibility] Available TTS voices:', voices.length);

      // Set up TTS event listeners
      Tts.addEventListener('tts-start', () => {
        console.log('[Accessibility] TTS started');
      });

      Tts.addEventListener('tts-finish', () => {
        console.log('[Accessibility] TTS finished');
      });

      Tts.addEventListener('tts-cancel', () => {
        console.log('[Accessibility] TTS cancelled');
      });
    } catch (error) {
      console.error('[Accessibility] TTS initialization error:', error);
    }
  }

  /**
   * Configure accessibility settings
   */
  configure(config: Partial<AccessibilityConfig>): void {
    this.config = {...this.config, ...config};

    // Apply TTS settings
    if (config.ttsRate !== undefined) {
      Tts.setDefaultRate(config.ttsRate);
    }
    if (config.ttsPitch !== undefined) {
      Tts.setDefaultPitch(config.ttsPitch);
    }
    if (config.ttsLanguage !== undefined) {
      Tts.setDefaultLanguage(config.ttsLanguage);
    }

    console.log('[Accessibility] Configuration updated:', this.config);
  }

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.screenReaderEnabled;
  }

  /**
   * Get current text scale
   */
  getTextScale(): number {
    return this.textScale;
  }

  /**
   * Handle screen reader state change
   */
  private handleScreenReaderChange = (enabled: boolean): void => {
    this.screenReaderEnabled = enabled;
    console.log('[Accessibility] Screen reader changed:', enabled);

    if (enabled) {
      // Disable TTS when screen reader is on (to avoid double reading)
      this.config.enableTts = false;
      console.log('[Accessibility] TTS disabled (screen reader active)');
    }

    // Track analytics
    analyticsService.logAccessibilityFeatureUsed('screen_reader', {
      enabled,
    });

    // Notify listeners
    this.listeners.forEach((listener) => listener(enabled));
  };

  /**
   * Add screen reader change listener
   */
  addScreenReaderListener(listener: (enabled: boolean) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Announce message to screen reader
   */
  announce(message: string, options?: {queue?: boolean}): void {
    if (!message) return;

    // Announce to screen reader (TalkBack/VoiceOver)
    AccessibilityInfo.announceForAccessibility(message);

    // Also use TTS if enabled and screen reader is off
    if (this.shouldUseTts()) {
      this.speak(message, options?.queue);
    }
  }

  /**
   * Announce message with delay (useful for async content)
   */
  announceDelayed(message: string, delay: number = 500): void {
    setTimeout(() => {
      this.announce(message);
    }, delay);
  }

  /**
   * Check if TTS should be used
   */
  private shouldUseTts(): boolean {
    return (
      this.config.enableTts === true && !this.screenReaderEnabled
    );
  }

  /**
   * Speak text using TTS
   */
  speak(text: string, queue: boolean = false): void {
    if (!text || !this.shouldUseTts()) return;

    try {
      if (queue) {
        Tts.speak(text);
      } else {
        // Stop current speech and speak new text
        Tts.stop();
        Tts.speak(text);
      }

      // Track analytics
      analyticsService.logTextToSpeechUsed({
        textLength: text.length,
        queue,
      });
    } catch (error) {
      console.error('[Accessibility] TTS speak error:', error);
    }
  }

  /**
   * Stop TTS playback
   */
  stopSpeaking(): void {
    try {
      Tts.stop();
    } catch (error) {
      console.error('[Accessibility] TTS stop error:', error);
    }
  }

  /**
   * Check if TTS is currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Tts.isSpeaking();
    } catch (error) {
      console.error('[Accessibility] TTS isSpeaking error:', error);
      return false;
    }
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(type: HapticType = 'selection'): void {
    if (!this.config.enableHaptics) return;

    try {
      const hapticType = {
        selection: 'impactLight',
        success: 'notificationSuccess',
        warning: 'notificationWarning',
        error: 'notificationError',
      }[type];

      Haptics.trigger(hapticType, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.error('[Accessibility] Haptic feedback error:', error);
    }
  }

  /**
   * Set accessibility focus to a component
   */
  setAccessibilityFocus(ref: any): void {
    if (!ref || !ref.current) {
      console.warn('[Accessibility] Invalid ref for focus');
      return;
    }

    try {
      // Delay to ensure component is rendered
      setTimeout(() => {
        AccessibilityInfo.setAccessibilityFocus(ref.current);
      }, 100);
    } catch (error) {
      console.error('[Accessibility] Set focus error:', error);
    }
  }

  /**
   * Check if bold text is enabled (iOS)
   */
  async isBoldTextEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AccessibilityInfo.isBoldTextEnabled();
      }
      return false;
    } catch (error) {
      console.error('[Accessibility] Bold text check error:', error);
      return false;
    }
  }

  /**
   * Check if grayscale is enabled (iOS)
   */
  async isGrayscaleEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AccessibilityInfo.isGrayscaleEnabled();
      }
      return false;
    } catch (error) {
      console.error('[Accessibility] Grayscale check error:', error);
      return false;
    }
  }

  /**
   * Check if invert colors is enabled (iOS)
   */
  async isInvertColorsEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AccessibilityInfo.isInvertColorsEnabled();
      }
      return false;
    } catch (error) {
      console.error('[Accessibility] Invert colors check error:', error);
      return false;
    }
  }

  /**
   * Check if reduce motion is enabled
   */
  async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.error('[Accessibility] Reduce motion check error:', error);
      return false;
    }
  }

  /**
   * Check if reduce transparency is enabled (iOS)
   */
  async isReduceTransparencyEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AccessibilityInfo.isReduceTransparencyEnabled();
      }
      return false;
    } catch (error) {
      console.error(
        '[Accessibility] Reduce transparency check error:',
        error
      );
      return false;
    }
  }

  /**
   * Get all accessibility settings
   */
  async getAccessibilitySettings(): Promise<{
    screenReader: boolean;
    boldText: boolean;
    grayscale: boolean;
    invertColors: boolean;
    reduceMotion: boolean;
    reduceTransparency: boolean;
    textScale: number;
  }> {
    const [
      boldText,
      grayscale,
      invertColors,
      reduceMotion,
      reduceTransparency,
    ] = await Promise.all([
      this.isBoldTextEnabled(),
      this.isGrayscaleEnabled(),
      this.isInvertColorsEnabled(),
      this.isReduceMotionEnabled(),
      this.isReduceTransparencyEnabled(),
    ]);

    return {
      screenReader: this.screenReaderEnabled,
      boldText,
      grayscale,
      invertColors,
      reduceMotion,
      reduceTransparency,
      textScale: this.textScale,
    };
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    try {
      // Remove event listeners
      AccessibilityInfo.removeEventListener(
        'screenReaderChanged',
        this.handleScreenReaderChange
      );

      // Stop TTS
      Tts.stop();

      // Clear listeners
      this.listeners = [];

      this.isInitialized = false;
      console.log('[Accessibility] Cleaned up');
    } catch (error) {
      console.error('[Accessibility] Cleanup error:', error);
    }
  }
}

export const accessibilityService = new AccessibilityService();
