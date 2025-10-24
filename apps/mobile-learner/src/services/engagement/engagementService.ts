/**
 * Engagement Service
 * 
 * Handles streaks, achievements, badges, and daily goals
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {database} from '../../database';
import {Q} from '@nozbe/watermelondb';
import type {
  StreakData,
  Achievement,
  AchievementType,
  DailyGoal,
} from '../../types/notifications';
import {notificationService} from '../notifications/notificationService';

const STORAGE_KEYS = {
  STREAK: '@streak_data',
  ACHIEVEMENTS: '@achievements',
  BADGES: '@badges',
  DAILY_GOALS: '@daily_goals',
};

const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>
> = {
  streak_3: {
    type: 'streak_3',
    title: '3 Day Streak! 🔥',
    description: 'Complete lessons 3 days in a row',
    icon: '🔥',
    points: 50,
    maxProgress: 3,
  },
  streak_7: {
    type: 'streak_7',
    title: '7 Day Streak! 🔥🔥',
    description: 'Complete lessons 7 days in a row',
    icon: '🔥🔥',
    points: 100,
    maxProgress: 7,
  },
  streak_30: {
    type: 'streak_30',
    title: '30 Day Streak! 🔥🔥🔥',
    description: 'Complete lessons 30 days in a row',
    icon: '🔥🔥🔥',
    points: 500,
    maxProgress: 30,
  },
  streak_100: {
    type: 'streak_100',
    title: '100 Day Streak! 💯',
    description: 'Complete lessons 100 days in a row',
    icon: '💯',
    points: 2000,
    maxProgress: 100,
  },
  lessons_10: {
    type: 'lessons_10',
    title: 'First 10 Lessons! 📚',
    description: 'Complete 10 lessons',
    icon: '📚',
    points: 100,
    maxProgress: 10,
  },
  lessons_50: {
    type: 'lessons_50',
    title: '50 Lessons Complete! 📖',
    description: 'Complete 50 lessons',
    icon: '📖',
    points: 500,
    maxProgress: 50,
  },
  lessons_100: {
    type: 'lessons_100',
    title: '100 Lessons Master! 🎓',
    description: 'Complete 100 lessons',
    icon: '🎓',
    points: 1000,
    maxProgress: 100,
  },
  quiz_perfect: {
    type: 'quiz_perfect',
    title: 'Perfect Score! ⭐',
    description: 'Get 100% on a quiz',
    icon: '⭐',
    points: 50,
    maxProgress: 1,
  },
  quiz_5_perfect: {
    type: 'quiz_5_perfect',
    title: '5 Perfect Scores! 🌟',
    description: 'Get 100% on 5 quizzes',
    icon: '🌟',
    points: 250,
    maxProgress: 5,
  },
  early_bird: {
    type: 'early_bird',
    title: 'Early Bird! 🌅',
    description: 'Complete a lesson before 8 AM',
    icon: '🌅',
    points: 75,
    maxProgress: 1,
  },
  night_owl: {
    type: 'night_owl',
    title: 'Night Owl! 🦉',
    description: 'Complete a lesson after 10 PM',
    icon: '🦉',
    points: 75,
    maxProgress: 1,
  },
  speed_reader: {
    type: 'speed_reader',
    title: 'Speed Reader! ⚡',
    description: 'Complete a reading activity in under 5 minutes',
    icon: '⚡',
    points: 100,
    maxProgress: 1,
  },
  math_master: {
    type: 'math_master',
    title: 'Math Master! 🔢',
    description: 'Complete 20 math activities',
    icon: '🔢',
    points: 300,
    maxProgress: 20,
  },
  science_star: {
    type: 'science_star',
    title: 'Science Star! 🔬',
    description: 'Complete 20 science activities',
    icon: '🔬',
    points: 300,
    maxProgress: 20,
  },
};

class EngagementService {
  private streakData: StreakData | null = null;
  private achievements: Achievement[] = [];
  private dailyGoals: DailyGoal[] = [];

  /**
   * Initialize engagement service
   */
  async initialize(): Promise<void> {
    await this.loadStreak();
    await this.loadAchievements();
    await this.loadDailyGoals();
  }

  /**
   * Record activity completion
   */
  async recordActivity(activityType?: string): Promise<void> {
    await this.updateStreak();
    await this.updateDailyGoals('activities', 1);
    await this.checkAchievements();

    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour < 8) {
      await this.checkAndUnlockAchievement('early_bird');
    } else if (hour >= 22) {
      await this.checkAndUnlockAchievement('night_owl');
    }

    // Check subject-specific achievements
    if (activityType === 'math') {
      await this.updateAchievementProgress('math_master', 1);
    } else if (activityType === 'science') {
      await this.updateAchievementProgress('science_star', 1);
    }
  }

  /**
   * Record lesson completion
   */
  async recordLessonCompletion(): Promise<void> {
    await this.updateDailyGoals('lessons', 1);
    await this.updateAchievementProgress('lessons_10', 1);
    await this.updateAchievementProgress('lessons_50', 1);
    await this.updateAchievementProgress('lessons_100', 1);
  }

  /**
   * Record quiz score
   */
  async recordQuizScore(score: number, maxScore: number): Promise<void> {
    if (score === maxScore) {
      await this.updateAchievementProgress('quiz_perfect', 1);
      await this.updateAchievementProgress('quiz_5_perfect', 1);
    }
  }

  /**
   * Update streak
   */
  async updateStreak(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (!this.streakData) {
      // First activity ever
      this.streakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      };
    } else {
      const lastDate = new Date(this.streakData.lastActivityDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, no change
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        this.streakData.currentStreak += 1;
        this.streakData.lastActivityDate = today;

        if (this.streakData.currentStreak > this.streakData.longestStreak) {
          this.streakData.longestStreak = this.streakData.currentStreak;
        }

        // Check streak achievements
        await this.checkStreakAchievements(this.streakData.currentStreak);
      } else {
        // Streak broken
        this.streakData.currentStreak = 1;
        this.streakData.lastActivityDate = today;
        this.streakData.streakStartDate = today;
      }
    }

    await this.saveStreak();
  }

  /**
   * Check streak achievements
   */
  async checkStreakAchievements(streak: number): Promise<void> {
    if (streak === 3) {
      await this.checkAndUnlockAchievement('streak_3');
    } else if (streak === 7) {
      await this.checkAndUnlockAchievement('streak_7');
    } else if (streak === 30) {
      await this.checkAndUnlockAchievement('streak_30');
    } else if (streak === 100) {
      await this.checkAndUnlockAchievement('streak_100');
    }
  }

  /**
   * Check and unlock achievement
   */
  async checkAndUnlockAchievement(
    type: AchievementType
  ): Promise<Achievement | null> {
    const existing = this.achievements.find((a) => a.type === type);

    if (existing?.unlockedAt) {
      // Already unlocked
      return null;
    }

    const definition = ACHIEVEMENT_DEFINITIONS[type];
    const achievement: Achievement = {
      id: type,
      ...definition,
      unlockedAt: new Date(),
      progress: definition.maxProgress,
    };

    // Add or update achievement
    const index = this.achievements.findIndex((a) => a.type === type);
    if (index >= 0) {
      this.achievements[index] = achievement;
    } else {
      this.achievements.push(achievement);
    }

    await this.saveAchievements();

    // Send notification
    await notificationService.sendAchievementNotification({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
    });

    return achievement;
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(
    type: AchievementType,
    increment: number
  ): Promise<void> {
    const definition = ACHIEVEMENT_DEFINITIONS[type];
    let achievement = this.achievements.find((a) => a.type === type);

    if (!achievement) {
      // Create new achievement with initial progress
      achievement = {
        id: type,
        ...definition,
        progress: 0,
      };
      this.achievements.push(achievement);
    }

    if (achievement.unlockedAt) {
      // Already unlocked
      return;
    }

    achievement.progress = (achievement.progress || 0) + increment;

    // Check if unlocked
    if (
      achievement.progress !== undefined &&
      achievement.maxProgress !== undefined &&
      achievement.progress >= achievement.maxProgress
    ) {
      await this.checkAndUnlockAchievement(type);
    } else {
      await this.saveAchievements();
    }
  }

  /**
   * Check all achievements
   */
  async checkAchievements(): Promise<void> {
    // Check lesson count achievements
    const lessonCount = await database
      .get('activities')
      .query(Q.where('is_completed', true), Q.where('type', 'lesson'))
      .fetchCount();

    if (lessonCount >= 10) {
      await this.checkAndUnlockAchievement('lessons_10');
    }
    if (lessonCount >= 50) {
      await this.checkAndUnlockAchievement('lessons_50');
    }
    if (lessonCount >= 100) {
      await this.checkAndUnlockAchievement('lessons_100');
    }
  }

  /**
   * Get current streak data
   */
  getStreak(): StreakData | null {
    return this.streakData;
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlockedAt);
  }

  /**
   * Get achievement progress percentage
   */
  getAchievementProgress(type: AchievementType): number {
    const achievement = this.achievements.find((a) => a.type === type);
    if (!achievement || !achievement.maxProgress) return 0;
    return ((achievement.progress || 0) / achievement.maxProgress) * 100;
  }

  /**
   * Update daily goals
   */
  async updateDailyGoals(
    type: 'lessons' | 'activities' | 'time' | 'points',
    increment: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Find or create today's goal
    let goal = this.dailyGoals.find((g) => g.type === type && g.date === today);

    if (!goal) {
      // Create new goal for today
      goal = {
        id: `${type}_${today}`,
        type,
        target: this.getDefaultGoalTarget(type),
        current: 0,
        completed: false,
        date: today,
      };
      this.dailyGoals.push(goal);
    }

    goal.current += increment;
    goal.completed = goal.current >= goal.target;

    if (goal.completed && goal.current === goal.target) {
      // Just completed, send motivational message
      await notificationService.sendMotivationalMessage(
        `🎯 Daily goal completed! You finished ${goal.target} ${type} today!`
      );
    }

    await this.saveDailyGoals();
  }

  /**
   * Get default goal target
   */
  getDefaultGoalTarget(type: 'lessons' | 'activities' | 'time' | 'points'): number {
    switch (type) {
      case 'lessons':
        return 3;
      case 'activities':
        return 5;
      case 'time':
        return 30; // 30 minutes
      case 'points':
        return 100;
      default:
        return 5;
    }
  }

  /**
   * Get today's goals
   */
  getTodayGoals(): DailyGoal[] {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyGoals.filter((g) => g.date === today);
  }

  /**
   * Load streak from storage
   */
  async loadStreak(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      if (stored) {
        this.streakData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  }

  /**
   * Save streak to storage
   */
  async saveStreak(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK,
        JSON.stringify(this.streakData)
      );
    } catch (error) {
      console.error('Failed to save streak:', error);
    }
  }

  /**
   * Load achievements from storage
   */
  async loadAchievements(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (stored) {
        this.achievements = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  /**
   * Save achievements to storage
   */
  async saveAchievements(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(this.achievements)
      );
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  /**
   * Load daily goals from storage
   */
  async loadDailyGoals(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOALS);
      if (stored) {
        this.dailyGoals = JSON.parse(stored);
        // Clean up old goals (older than 7 days)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const cutoffDate = cutoff.toISOString().split('T')[0];
        this.dailyGoals = this.dailyGoals.filter((g) => g.date >= cutoffDate);
      }
    } catch (error) {
      console.error('Failed to load daily goals:', error);
    }
  }

  /**
   * Save daily goals to storage
   */
  async saveDailyGoals(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_GOALS,
        JSON.stringify(this.dailyGoals)
      );
    } catch (error) {
      console.error('Failed to save daily goals:', error);
    }
  }

  /**
   * Get total points earned
   */
  getTotalPoints(): number {
    return this.achievements
      .filter((a) => a.unlockedAt)
      .reduce((sum, a) => sum + a.points, 0);
  }

  /**
   * Get achievement count
   */
  getAchievementCount(): {unlocked: number; total: number} {
    return {
      unlocked: this.achievements.filter((a) => a.unlockedAt).length,
      total: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
    };
  }
}

export const engagementService = new EngagementService();
export default engagementService;
