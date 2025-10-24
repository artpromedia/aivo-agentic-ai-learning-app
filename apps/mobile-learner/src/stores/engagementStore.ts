/**
 * Engagement Store
 * 
 * Zustand store for managing engagement state (streaks, achievements, goals)
 */

import {create} from 'zustand';
import type {
  StreakData,
  Achievement,
  DailyGoal,
} from '../types/notifications';
import {engagementService} from '../services/engagement/engagementService';

interface EngagementState {
  streak: StreakData | null;
  achievements: Achievement[];
  dailyGoals: DailyGoal[];
  totalPoints: number;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  recordActivity: (activityType?: string) => Promise<void>;
  recordLessonCompletion: () => Promise<void>;
  recordQuizScore: (score: number, maxScore: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  streak: null,
  achievements: [],
  dailyGoals: [],
  totalPoints: 0,
  isLoading: false,

  initialize: async () => {
    set({isLoading: true});
    try {
      await engagementService.initialize();
      await get().refreshData();
    } catch (error) {
      console.error('Failed to initialize engagement:', error);
    } finally {
      set({isLoading: false});
    }
  },

  recordActivity: async (activityType?: string) => {
    try {
      await engagementService.recordActivity(activityType);
      await get().refreshData();
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  },

  recordLessonCompletion: async () => {
    try {
      await engagementService.recordLessonCompletion();
      await get().refreshData();
    } catch (error) {
      console.error('Failed to record lesson:', error);
    }
  },

  recordQuizScore: async (score: number, maxScore: number) => {
    try {
      await engagementService.recordQuizScore(score, maxScore);
      await get().refreshData();
    } catch (error) {
      console.error('Failed to record quiz score:', error);
    }
  },

  refreshData: async () => {
    const streak = engagementService.getStreak();
    const achievements = engagementService.getAchievements();
    const dailyGoals = engagementService.getTodayGoals();
    const totalPoints = engagementService.getTotalPoints();

    set({
      streak,
      achievements,
      dailyGoals,
      totalPoints,
    });
  },
}));

export default useEngagementStore;
