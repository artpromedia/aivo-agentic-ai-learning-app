/**
 * Home Screen
 * 
 * Main dashboard for learners with today's lessons and quick actions
 */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useAuthStore} from '../stores/authStore';
import {useSync} from '../hooks/useSync';
import {LessonCard} from '../components/LessonCard/LessonCard';
import {Button} from '../components/Button';
import {database} from '../database';
import {Lesson} from '../database/models/Lesson';
import {Q} from '@nozbe/watermelondb';

export const HomeScreen = ({navigation}: any) => {
  const {user} = useAuthStore();
  const {status: syncStatus, syncNow} = useSync();
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadTodayLessons = React.useCallback(async () => {
    try {
      // Get lessons for user's grade level
      const todayLessons = await database
        .get<Lesson>('lessons')
        .query(
          Q.where('grade_level', user?.grade_level || 'K'),
          Q.sortBy('created_at', Q.desc),
          Q.take(5)
        )
        .fetch();

      setLessons(todayLessons);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.grade_level]);

  React.useEffect(() => {
    loadTodayLessons();
  }, [loadTodayLessons]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncNow();
    await loadTodayLessons();
    setRefreshing(false);
  };

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate('LessonPlayer', {id: lessonId});
  };

  const handleHomeworkHelp = () => {
    navigation.navigate('HomeworkHelper');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.name}! 👋</Text>
        <Text style={styles.subtitle}>Ready to learn something new?</Text>

        {/* Sync Status Indicator */}
        {syncStatus === 'offline' && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              📡 You're offline. Changes will sync when online.
            </Text>
          </View>
        )}

        {syncStatus === 'syncing' && (
          <View style={styles.syncingBanner}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.syncingBannerText}>Syncing...</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleHomeworkHelp}
            fullWidth
          >
            📸 Homework Help
          </Button>
        </View>
      </View>

      {/* Today's Lessons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Lessons</Text>
        
        {lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No lessons available yet.
            </Text>
            <Button
              variant="outline"
              size="md"
              onPress={handleRefresh}
            >
              Refresh
            </Button>
          </View>
        ) : (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={{
                id: lesson.id,
                title: lesson.title,
                subject: lesson.subject,
                durationMinutes: lesson.durationMinutes,
                thumbnailUrl: lesson.thumbnailUrl,
                isDownloaded: lesson.isDownloaded,
                difficulty: lesson.difficulty,
              }}
              onPress={() => handleLessonPress(lesson.id)}
              gradeTheme={
                (user?.grade_level && user.grade_level <= 5)
                  ? 'K5'
                  : (user?.grade_level && user.grade_level <= 8)
                  ? 'MS'
                  : 'HS'
              }
            />
          ))
        )}
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#3B82F6',
    paddingTop: 60, // Account for status bar
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  offlineBannerText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  syncingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  syncingBannerText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  quickActions: {
    gap: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 32,
  },
});

export default HomeScreen;
