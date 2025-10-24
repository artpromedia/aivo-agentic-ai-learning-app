/**
 * ProgressBar Component
 * 
 * Animated progress bar with haptic feedback and accessibility
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Platform} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  hapticOnComplete?: boolean;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  height = 8,
  animated = true,
  hapticOnComplete = true,
  gradeTheme = 'K5',
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const previousProgress = useRef(0);

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }

    // Haptic feedback on completion
    if (
      hapticOnComplete &&
      clampedProgress === 100 &&
      previousProgress.current < 100 &&
      Platform.OS !== 'web'
    ) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
      });
    }

    previousProgress.current = clampedProgress;
  }, [progress, animated, animatedWidth, hapticOnComplete]);

  const widthPercentage = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const borderRadius = gradeTheme === 'K5' ? 8 : gradeTheme === 'MS' ? 6 : 4;

  return (
    <View style={styles.container}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text
              style={styles.percentage}
              accessibilityLabel={`${Math.round(progress)} percent complete`}
            >
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <View
        style={[
          styles.track,
          {backgroundColor, height, borderRadius},
        ]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: progress,
        }}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthPercentage,
              backgroundColor: color,
              borderRadius,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;
