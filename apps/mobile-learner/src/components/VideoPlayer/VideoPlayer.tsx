/**
 * Video Player Component
 * 
 * Video playback with controls, captions, speed control, and fullscreen mode
 */

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video, {type OnProgressData, type OnLoadData} from 'react-native-video';
import {useTheme} from '../../theme/enhancedTheme';
import type {VideoPlayerConfig} from '../../types/media';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

interface VideoPlayerProps {
  source: {uri: string} | number;
  config?: VideoPlayerConfig;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  lessonId?: string;
  activityId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  config = {},
  onEnd,
  onError,
  lessonId,
  activityId,
}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const videoRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(config.autoplay ?? false);
  const [currentTime, setCurrentTime] = useState(config.startTime ?? 0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `video_progress_${lessonId}_${activityId}`;

  /**
   * Load saved progress
   */
  useEffect(() => {
    const loadProgress = async () => {
      if (storageKey) {
        try {
          const saved = await AsyncStorage.getItem(storageKey);
          if (saved) {
            const progress = parseFloat(saved);
            setCurrentTime(progress);
            videoRef.current?.seek(progress);
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      }
    };

    loadProgress();
  }, [storageKey]);

  /**
   * Save progress periodically
   */
  useEffect(() => {
    const saveProgress = async () => {
      if (storageKey && currentTime > 0) {
        try {
          await AsyncStorage.setItem(storageKey, currentTime.toString());
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    };

    const interval = setInterval(saveProgress, 5000); // Save every 5 seconds
    return () => clearInterval(interval);
  }, [storageKey, currentTime]);

  /**
   * Hide controls after timeout
   */
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }

      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, isPlaying]);

  /**
   * Handle play/pause
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    ReactNativeHapticFeedback.trigger('impactLight');
  }, []);

  /**
   * Handle progress
   */
  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  }, []);

  /**
   * Handle load
   */
  const handleLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration);
  }, []);

  /**
   * Handle end
   */
  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnd?.();
  }, [onEnd]);

  /**
   * Handle error
   */
  const handleError = useCallback(
    (error: any) => {
      const err = new Error(error?.error?.localizedDescription || 'Video error');
      onError?.(err);
    },
    [onError]
  );

  /**
   * Seek to position
   */
  const seekTo = useCallback((time: number) => {
    videoRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  /**
   * Skip forward/backward
   */
  const skip = useCallback(
    (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seekTo(newTime);
    },
    [currentTime, duration, seekTo]
  );

  /**
   * Toggle playback rate
   */
  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
    ReactNativeHapticFeedback.trigger('impactLight');
  }, [playbackRate]);

  /**
   * Toggle captions
   */
  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled((prev) => !prev);
    ReactNativeHapticFeedback.trigger('impactLight');
  }, []);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    ReactNativeHapticFeedback.trigger('impactMedium');
  }, []);

  /**
   * Show controls on tap
   */
  const handleTap = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  /**
   * Format time
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.container,
        isFullscreen && styles.fullscreenContainer,
        {backgroundColor: '#000'},
      ]}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleTap}
        activeOpacity={1}
        accessibilityLabel="Video player"
        accessibilityRole="button"
        accessibilityHint="Tap to show or hide controls">
        <Video
          ref={videoRef}
          source={
            (typeof source === 'number' ? source : {uri: source.uri}) as any
          }
          style={styles.video}
          paused={!isPlaying}
          rate={playbackRate}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={handleEnd}
          onError={handleError}
          onBuffer={({isBuffering: buffering}) => setIsBuffering(buffering)}
          resizeMode="contain"
          repeat={config.loop}
        />

        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={[styles.topBar, {padding: spacing.md}]}>
              <TouchableOpacity
                onPress={toggleCaptions}
                style={[styles.controlButton, {padding: spacing.sm}]}
                accessibilityLabel={
                  captionsEnabled ? 'Disable captions' : 'Enable captions'
                }
                accessibilityRole="button">
                <Text style={styles.controlButtonText}>CC</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cyclePlaybackRate}
                style={[styles.controlButton, {padding: spacing.sm}]}
                accessibilityLabel={`Playback speed ${playbackRate}x`}
                accessibilityRole="button">
                <Text style={styles.controlButtonText}>{playbackRate}x</Text>
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={() => skip(-10)}
                style={[styles.skipButton, {padding: spacing.md}]}
                accessibilityLabel="Rewind 10 seconds"
                accessibilityRole="button">
                <Text style={styles.skipButtonText}>-10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={[
                  styles.playButton,
                  {backgroundColor: colors.primary, padding: spacing.lg},
                ]}
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                accessibilityRole="button">
                <Text style={styles.playButtonText}>
                  {isPlaying ? '❚❚' : '▶'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => skip(10)}
                style={[styles.skipButton, {padding: spacing.md}]}
                accessibilityLabel="Skip 10 seconds"
                accessibilityRole="button">
                <Text style={styles.skipButtonText}>+10</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, {padding: spacing.md}]}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(currentTime / duration) * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>

              <Text style={styles.timeText}>{formatTime(duration)}</Text>

              {config.allowFullscreen && (
                <TouchableOpacity
                  onPress={toggleFullscreen}
                  style={[styles.controlButton, {padding: spacing.sm}]}
                  accessibilityLabel={
                    isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                  }
                  accessibilityRole="button">
                  <Text style={styles.controlButtonText}>⛶</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VideoPlayer;
