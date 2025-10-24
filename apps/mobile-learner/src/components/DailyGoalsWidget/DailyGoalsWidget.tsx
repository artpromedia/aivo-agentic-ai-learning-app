/**
 * Daily Goals Widget Component
 * 
 * Displays today's learning goals with progress
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from '../../theme/enhancedTheme';
import {useEngagementStore} from '../../stores/engagementStore';
import type {DailyGoal} from '../../types/notifications';

interface DailyGoalsWidgetProps {
  compact?: boolean;
}

export const DailyGoalsWidget: React.FC<DailyGoalsWidgetProps> = ({
  compact = false,
}) => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const dailyGoals = useEngagementStore((state) => state.dailyGoals);

  if (dailyGoals.length === 0) {
    return null;
  }

  const getGoalIcon = (type: DailyGoal['type']): string => {
    switch (type) {
      case 'lessons':
        return '📚';
      case 'activities':
        return '✏️';
      case 'time':
        return '⏰';
      case 'points':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getGoalLabel = (type: DailyGoal['type']): string => {
    switch (type) {
      case 'lessons':
        return 'Lessons';
      case 'activities':
        return 'Activities';
      case 'time':
        return 'Minutes';
      case 'points':
        return 'Points';
      default:
        return 'Goal';
    }
  };

  const renderGoal = (goal: DailyGoal) => {
    const progress = (goal.current / goal.target) * 100;
    const isComplete = goal.completed;

    return (
      <View
        key={goal.id}
        style={[
          styles.goalCard,
          {
            backgroundColor: isComplete ? colors.success : colors.surface,
            padding: compact ? spacing.sm : spacing.md,
            borderRadius: theme.borderRadius.md,
            marginRight: spacing.sm,
            minWidth: compact ? 100 : 120,
          },
        ]}
        accessibilityLabel={`${getGoalLabel(goal.type)}: ${goal.current} of ${
          goal.target
        }${isComplete ? ', completed' : ''}`}
        accessibilityRole="text">
        <View style={[styles.goalHeader, {marginBottom: spacing.xs}]}>
          <Text style={styles.goalIcon}>{getGoalIcon(goal.type)}</Text>
          {isComplete && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.goalValue,
            {
              color: isComplete ? '#fff' : colors.text,
              fontSize: compact ? 16 : 20,
            },
          ]}>
          {goal.current}
          <Text style={[styles.goalTarget, {fontSize: compact ? 12 : 14}]}>
            {' '}
            / {goal.target}
          </Text>
        </Text>

        <Text
          style={[
            styles.goalLabel,
            {
              color: isComplete ? 'rgba(255,255,255,0.9)' : colors.textSecondary,
              fontSize: compact ? 11 : 12,
            },
          ]}>
          {getGoalLabel(goal.type)}
        </Text>

        {!compact && (
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: isComplete
                  ? 'rgba(255,255,255,0.3)'
                  : colors.border,
                marginTop: spacing.xs,
              },
            ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isComplete ? '#fff' : colors.primary,
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            marginBottom: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
        accessibilityRole="header">
        Today's Goals 🎯
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: spacing.md}}>
        {dailyGoals.map(renderGoal)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalCard: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalIcon: {
    fontSize: 24,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  goalValue: {
    fontWeight: '700',
    marginBottom: 2,
  },
  goalTarget: {
    fontWeight: '500',
    opacity: 0.7,
  },
  goalLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default DailyGoalsWidget;
