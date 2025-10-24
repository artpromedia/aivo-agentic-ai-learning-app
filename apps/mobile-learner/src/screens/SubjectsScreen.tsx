/**
 * SubjectsScreen
 * 
 * Grid of subject cards with filters and download options
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {Card} from '../components/Card/Card';
import {Button} from '../components/Button';
import {LoadingState} from '../components/LoadingState/LoadingState';
import {EmptyState} from '../components/EmptyState/EmptyState';
import {useSync} from '../hooks/useSync';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  lessonCount: number;
  downloadedCount: number;
}

const SUBJECTS: Subject[] = [
  {id: '1', name: 'Math', icon: '🔢', color: '#3B82F6', lessonCount: 12, downloadedCount: 5},
  {id: '2', name: 'Reading', icon: '📖', color: '#10B981', lessonCount: 15, downloadedCount: 8},
  {id: '3', name: 'Science', icon: '🔬', color: '#8B5CF6', lessonCount: 10, downloadedCount: 3},
  {id: '4', name: 'Writing', icon: '✍️', color: '#F59E0B', lessonCount: 8, downloadedCount: 2},
  {id: '5', name: 'Social Studies', icon: '🌍', color: '#EF4444', lessonCount: 6, downloadedCount: 1},
  {id: '6', name: 'Art', icon: '🎨', color: '#EC4899', lessonCount: 5, downloadedCount: 0},
];

export const SubjectsScreen = ({navigation}: any) => {
  const [isLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {syncNow} = useSync();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncNow();
    setRefreshing(false);
  }, [syncNow]);

  const handleSubjectPress = (subject: Subject) => {
    navigation.navigate('SubjectLessons', {subjectId: subject.id, subject: subject.name});
  };

  const handleDownloadAll = () => {
    // TODO: Implement download all lessons
    console.log('Download all lessons');
  };

  if (isLoading) {
    return <LoadingState type="card" count={6} />;
  }

  if (SUBJECTS.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No Subjects Available"
        message="Check back later for new subjects and lessons"
        actionLabel="Refresh"
        onAction={handleRefresh}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Subjects</Text>
        <Text style={styles.subtitle}>Choose a subject to start learning</Text>
      </View>

      {/* Download All Button */}
      <View style={styles.downloadSection}>
        <Button
          variant="outline"
          size="md"
          onPress={handleDownloadAll}
          fullWidth
        >
          📥 Download All Lessons
        </Button>
      </View>

      {/* Subjects Grid */}
      <View style={styles.grid}>
        {SUBJECTS.map((subject) => (
          <View key={subject.id} style={styles.gridItem}>
            <Card
              onPress={() => handleSubjectPress(subject)}
              variant="elevated"
            >
              <View style={styles.subjectCard}>
                <View
                  style={[
                    styles.iconContainer,
                    {backgroundColor: `${subject.color}20`},
                  ]}
                >
                  <Text style={styles.subjectIcon}>{subject.icon}</Text>
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.lessonCount}>
                  {subject.lessonCount} lessons
                </Text>
                {subject.downloadedCount > 0 && (
                  <View style={styles.downloadBadge}>
                    <Text style={styles.downloadText}>
                      📥 {subject.downloadedCount} downloaded
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  downloadSection: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -6,
  },
  gridItem: {
    width: '48%',
    marginHorizontal: '1%',
  },
  subjectCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectIcon: {
    fontSize: 32,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  lessonCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  downloadBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  downloadText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1E40AF',
  },
});

export default SubjectsScreen;
