/**
 * Audio Player Component
 * 
 * Audio playback with controls, seek bar, and speed controls
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
import type {AudioPlayerConfig} from '../../types/media';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 2.0];

interface AudioPlayerProps {
  source: {uri: string} | number;
  title?: string;
  artist?: string;
  config?: AudioPlayerConfig;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  lessonId?: string;
  activityId?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  source,
  title,
  artist,
  config = {},
  onEnd,
  onError,
  lessonId,
  activityId,
}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const audioRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(config.autoplay ?? false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const storageKey = `audio_progress_${lessonId}_${activityId}`;

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
            audioRef.current?.seek(progress);
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
      const err = new Error(error?.error?.localizedDescription || 'Audio error');
      onError?.(err);
    },
    [onError]
  );

  /**
   * Seek to position
   */
  const seekTo = useCallback((time: number) => {
    audioRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  /**
   * Skip forward/backward
   */
  const skip = useCallback(
    (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seekTo(newTime);
      ReactNativeHapticFeedback.trigger('impactLight');
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
   * Handle seek bar press
   */
  const handleSeekBarPress = useCallback(
    (event: any) => {
      const {locationX} = event.nativeEvent;
      const seekBarWidth = SCREEN_WIDTH - spacing.xl * 2;
      const percentage = locationX / seekBarWidth;
      const newTime = percentage * duration;
      seekTo(newTime);
    },
    [duration, seekTo, spacing.xl]
  );

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
        {backgroundColor: colors.surface, padding: spacing.lg},
      ]}>
      {/* Hidden Video component for audio playback */}
      <Video
        ref={audioRef}
        source={
          (typeof source === 'number' ? source : {uri: source.uri}) as any
        }
        paused={!isPlaying}
        rate={playbackRate}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
        onError={handleError}
        onBuffer={({isBuffering: buffering}) => setIsBuffering(buffering)}
        repeat={config.loop}
        playInBackground={config.allowBackground}
        playWhenInactive={config.allowBackground}
      />

      {/* Title */}
      {(title || artist) && (
        <View style={[styles.titleContainer, {marginBottom: spacing.md}]}>
          {title && (
            <Text
              style={[styles.title, {color: colors.text}]}
              numberOfLines={1}
              accessibilityRole="header">
              {title}
            </Text>
          )}
          {artist && (
            <Text
              style={[styles.artist, {color: colors.textSecondary}]}
              numberOfLines={1}>
              {artist}
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <TouchableOpacity
        style={[styles.seekBarContainer, {marginBottom: spacing.md}]}
        onPress={handleSeekBarPress}
        activeOpacity={0.8}
        accessibilityLabel="Seek bar"
        accessibilityRole="adjustable"
        accessibilityHint="Tap to seek to position">
        <View style={[styles.seekBar, {backgroundColor: colors.border}]}>
          <View
            style={[
              styles.seekBarFill,
              {
                width: `${(currentTime / duration) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
          <View
            style={[
              styles.seekBarThumb,
              {
                left: `${(currentTime / duration) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Time */}
      <View
        style={[
          styles.timeContainer,
          {marginBottom: spacing.md, gap: spacing.sm},
        ]}>
        <Text style={[styles.timeText, {color: colors.textSecondary}]}>
          {formatTime(currentTime)}
        </Text>
        <Text style={[styles.timeText, {color: colors.textSecondary}]}>
          {formatTime(duration)}
        </Text>
      </View>

      {/* Controls */}
      <View style={[styles.controls, {gap: spacing.lg}]}>
        <TouchableOpacity
          onPress={() => skip(-15)}
          style={[styles.controlButton, {padding: spacing.md}]}
          disabled={isBuffering}
          accessibilityLabel="Rewind 15 seconds"
          accessibilityRole="button">
          <Text style={[styles.controlButtonText, {color: colors.text}]}>
            -15
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          style={[
            styles.playButton,
            {
              backgroundColor: colors.primary,
              padding: spacing.lg,
              opacity: isBuffering ? 0.5 : 1,
            },
          ]}
          disabled={isBuffering}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          accessibilityRole="button">
          {isBuffering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.playButtonText}>
              {isPlaying ? '❚❚' : '▶'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => skip(15)}
          style={[styles.controlButton, {padding: spacing.md}]}
          disabled={isBuffering}
          accessibilityLabel="Skip 15 seconds"
          accessibilityRole="button">
          <Text style={[styles.controlButtonText, {color: colors.text}]}>
            +15
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed Control */}
      <TouchableOpacity
        onPress={cyclePlaybackRate}
        style={[
          styles.speedButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            marginTop: spacing.md,
            padding: spacing.sm,
          },
        ]}
        accessibilityLabel={`Playback speed ${playbackRate}x`}
        accessibilityRole="button"
        accessibilityHint="Tap to change playback speed">
        <Text style={[styles.speedButtonText, {color: colors.text}]}>
          Speed: {playbackRate}x
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    fontWeight: '500',
  },
  seekBarContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  seekBar: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  seekBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  seekBarThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  speedButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AudioPlayer;
