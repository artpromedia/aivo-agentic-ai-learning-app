/**
 * Streak Widget Component
 * 
 * Displays current streak with fire emoji and motivational text
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../theme/enhancedTheme';
import {useEngagementStore} from '../../stores/engagementStore';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface StreakWidgetProps {
  onPress?: () => void;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({onPress}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const streak = useEngagementStore((state) => state.streak);

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    onPress?.();
  };

  if (!streak) return null;

  const getMotivationalText = (streakCount: number): string => {
    if (streakCount === 0) return 'Start your streak today!';
    if (streakCount === 1) return 'Great start!';
    if (streakCount < 7) return 'Keep it going!';
    if (streakCount < 30) return 'Amazing streak!';
    if (streakCount < 100) return 'Unstoppable!';
    return 'Legendary streak!';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`Current streak: ${streak.currentStreak} days`}
      accessibilityRole="button"
      accessibilityHint="Tap to view streak details">
      <View style={[styles.iconContainer, {marginRight: spacing.md}]}>
        <Text style={styles.fireEmoji}>🔥</Text>
        {streak.currentStreak > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primary,
                minWidth: spacing.lg,
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xs / 2,
              },
            ]}>
            <Text style={styles.badgeText}>{streak.currentStreak}</Text>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[styles.streakText, {color: colors.text}]}
          numberOfLines={1}>
          {streak.currentStreak > 0
            ? `${streak.currentStreak} Day Streak!`
            : 'Start Your Streak'}
        </Text>
        <Text
          style={[styles.motivationalText, {color: colors.textSecondary}]}
          numberOfLines={1}>
          {getMotivationalText(streak.currentStreak)}
        </Text>
      </View>

      {streak.longestStreak > streak.currentStreak && (
        <View style={[styles.recordContainer, {marginLeft: spacing.sm}]}>
          <Text style={[styles.recordLabel, {color: colors.textSecondary}]}>
            Best
          </Text>
          <Text style={[styles.recordValue, {color: colors.primary}]}>
            {streak.longestStreak}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 40,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recordContainer: {
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default StreakWidget;
