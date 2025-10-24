/**
 * ActivityCard Component
 * 
 * Card displaying activity information with completion status
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from '../Card/Card';

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    type: 'quiz' | 'reading' | 'video' | 'audio' | 'interactive';
    points: number;
    timeEstimate?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isCompleted: boolean;
    score?: number;
  };
  onPress: () => void;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  gradeTheme = 'K5',
}) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'quiz':
        return '📝';
      case 'reading':
        return '📖';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎧';
      case 'interactive':
        return '🎮';
      default:
        return '📚';
    }
  };

  const getDifficultyColor = () => {
    switch (activity.difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <Card
      onPress={onPress}
      gradeTheme={gradeTheme}
      variant="default"
    >
      <View style={styles.container}>
        {/* Icon and Title */}
        <View style={styles.header}>
          <Text style={styles.icon}>{getActivityIcon()}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {activity.title}
            </Text>
            <Text style={styles.type}>{activity.type.toUpperCase()}</Text>
          </View>
          {/* Completion Checkmark */}
          {activity.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✓</Text>
            </View>
          )}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          {/* Points */}
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>⭐ {activity.points} pts</Text>
          </View>

          {/* Time Estimate */}
          {activity.timeEstimate && (
            <Text style={styles.timeText}>⏱️ {activity.timeEstimate} min</Text>
          )}

          {/* Difficulty */}
          <View
            style={[
              styles.difficultyBadge,
              {backgroundColor: getDifficultyColor()},
            ]}
          >
            <Text style={styles.difficultyText}>
              {activity.difficulty.toUpperCase()}
            </Text>
          </View>

          {/* Score */}
          {activity.isCompleted && activity.score !== undefined && (
            <Text style={styles.scoreText}>
              Score: {activity.score}%
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default ActivityCard;
