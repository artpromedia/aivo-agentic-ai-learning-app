/**
 * ProgressScreen
 * 
 * View learning progress with charts, achievements, and streaks
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Card} from '../components/Card/Card';
import {ProgressBar} from '../components/ProgressBar/ProgressBar';
import {Button} from '../components/Button';
import {useAuthStore} from '../stores/authStore';

export const ProgressScreen = () => {
  const {user} = useAuthStore();

  const progressData = {
    weeklyGoal: 75,
    weeklyProgress: 55,
    streak: 7,
    totalPoints: 1250,
    lessonsCompleted: 23,
    averageScore: 87,
    subjects: [
      {name: 'Math', progress: 80, color: '#3B82F6'},
      {name: 'Reading', progress: 90, color: '#10B981'},
      {name: 'Science', progress: 65, color: '#8B5CF6'},
      {name: 'Writing', progress: 75, color: '#F59E0B'},
    ],
    achievements: [
      {id: '1', name: 'Week Warrior', icon: '🔥', earned: true},
      {id: '2', name: 'Perfect Score', icon: '💯', earned: true},
      {id: '3', name: 'Early Bird', icon: '🌅', earned: false},
      {id: '4', name: 'Night Owl', icon: '🦉', earned: false},
    ],
  };

  const handleShareProgress = () => {
    // TODO: Implement share with parent
    console.log('Share progress with parent');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Keep up the great work, {user?.name}!</Text>
      </View>

      {/* Weekly Goal Card */}
      <Card variant="elevated">
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalPercentage}>
              {progressData.weeklyProgress}%
            </Text>
          </View>
          <ProgressBar
            progress={progressData.weeklyProgress}
            color="#10B981"
            height={12}
            showPercentage={false}
          />
          <Text style={styles.goalText}>
            {progressData.weeklyProgress} of {progressData.weeklyGoal} lessons completed
          </Text>
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card variant="elevated">
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progressData.streak} 🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progressData.totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progressData.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </Card>

        <Card variant="elevated">
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progressData.averageScore}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </Card>
      </View>

      {/* Subject Progress */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Subject Progress</Text>
        {progressData.subjects.map((subject) => (
          <View key={subject.name} style={styles.subjectProgress}>
            <ProgressBar
              progress={subject.progress}
              label={subject.name}
              color={subject.color}
              height={8}
            />
          </View>
        ))}
      </Card>

      {/* Achievements */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {progressData.achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementBadge,
                !achievement.earned && styles.achievementLocked,
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementName}>{achievement.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Share Button */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleShareProgress}
        fullWidth
      >
        📤 Share with Parent
      </Button>

      <View style={styles.bottomPadding} />
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
  goalCard: {
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  goalPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  goalText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: '47%',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  subjectProgress: {
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  achievementLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});

export default ProgressScreen;
