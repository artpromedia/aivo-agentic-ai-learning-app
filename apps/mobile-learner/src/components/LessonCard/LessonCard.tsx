/**
 * LessonCard Component
 * 
 * Card displaying lesson information with offline indicator
 */

import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Card} from '../Card/Card';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    thumbnailUrl?: string;
    isDownloaded: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  onPress: () => void;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onPress,
  gradeTheme = 'K5',
}) => {
  const getDifficultyColor = () => {
    switch (lesson.difficulty) {
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
    <Card onPress={onPress} gradeTheme={gradeTheme} variant="elevated">
      <View style={styles.container}>
        {/* Thumbnail */}
        {lesson.thumbnailUrl && (
          <Image
            source={{uri: lesson.thumbnailUrl}}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {lesson.title}
          </Text>
          
          <Text style={styles.subject}>{lesson.subject}</Text>

          <View style={styles.footer}>
            {/* Duration */}
            <Text style={styles.duration}>{lesson.durationMinutes} min</Text>

            {/* Difficulty */}
            <View
              style={[
                styles.difficultyBadge,
                {backgroundColor: getDifficultyColor()},
              ]}
            >
              <Text style={styles.difficultyText}>
                {lesson.difficulty.toUpperCase()}
              </Text>
            </View>

            {/* Offline indicator */}
            {lesson.isDownloaded && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>📥 Downloaded</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1E40AF',
  },
});

export default LessonCard;
