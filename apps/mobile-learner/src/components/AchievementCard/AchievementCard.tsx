/**
 * Achievement Card Component
 * 
 * Displays individual achievement with progress and unlock status
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../theme/enhancedTheme';
import type {Achievement} from '../../types/notifications';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  compact = false,
}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;

  const isUnlocked = !!achievement.unlockedAt;
  const progress =
    achievement.progress !== undefined && achievement.maxProgress !== undefined
      ? (achievement.progress / achievement.maxProgress) * 100
      : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isUnlocked ? colors.surface : colors.disabled,
          padding: compact ? spacing.sm : spacing.md,
          borderRadius: theme.borderRadius.lg,
          opacity: isUnlocked ? 1 : 0.6,
        },
      ]}
      accessibilityLabel={`${achievement.title}${
        isUnlocked ? ', unlocked' : ', locked'
      }`}
      accessibilityRole="text">
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            marginRight: spacing.sm,
            width: compact ? 40 : 56,
            height: compact ? 40 : 56,
          },
        ]}>
        <Text style={[styles.icon, {fontSize: compact ? 28 : 36}]}>
          {isUnlocked ? achievement.icon : '🔒'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: isUnlocked ? colors.text : colors.textSecondary,
              fontSize: compact ? 14 : 16,
            },
          ]}
          numberOfLines={1}>
          {achievement.title}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
              fontSize: compact ? 12 : 14,
            },
          ]}
          numberOfLines={compact ? 1 : 2}>
          {achievement.description}
        </Text>

        {/* Progress bar for locked achievements */}
        {!isUnlocked &&
          achievement.progress !== undefined &&
          achievement.maxProgress !== undefined && (
            <View style={[styles.progressContainer, {marginTop: spacing.xs}]}>
              <View
                style={[
                  styles.progressBar,
                  {backgroundColor: colors.border, height: compact ? 4 : 6},
                ]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, {color: colors.textSecondary}]}>
                {achievement.progress} / {achievement.maxProgress}
              </Text>
            </View>
          )}

        {/* Points */}
        {!compact && (
          <View
            style={[
              styles.pointsContainer,
              {marginTop: spacing.xs, gap: spacing.xs},
            ]}>
            <Text style={[styles.pointsText, {color: colors.primary}]}>
              {achievement.points} pts
            </Text>
            {isUnlocked && achievement.unlockedAt && (
              <Text style={[styles.dateText, {color: colors.textSecondary}]}>
                •{' '}
                {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
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
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 40,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default AchievementCard;
