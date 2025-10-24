/**
 * Notification Types
 * 
 * Type definitions for push notifications, local notifications, and achievements
 */

export type NotificationType =
  | 'daily_reminder'
  | 'activity_reminder'
  | 'achievement'
  | 'parent_message'
  | 'new_lesson'
  | 'streak_milestone'
  | 'motivational'
  | 'progress_report';

export type NotificationPriority = 'high' | 'default' | 'low';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
}

export interface RemoteMessage {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
    android?: {
      channelId?: string;
      imageUrl?: string;
    };
    ios?: {
      badge?: number;
      sound?: string;
    };
  };
  data?: Record<string, any>;
}

export interface LocalNotificationConfig {
  id: string;
  title: string;
  body: string;
  trigger: Date;
  data?: Record<string, any>;
  repeating?: boolean;
  interval?: 'daily' | 'weekly';
}

export interface NotificationSettings {
  enabled: boolean;
  dailyRemindersEnabled: boolean;
  dailyReminderTime: {hour: number; minute: number};
  achievementsEnabled: boolean;
  parentMessagesEnabled: boolean;
  motivationalEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: {hour: number; minute: number};
  quietHoursEnd: {hour: number; minute: number};
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export type AchievementType =
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'lessons_10'
  | 'lessons_50'
  | 'lessons_100'
  | 'quiz_perfect'
  | 'quiz_5_perfect'
  | 'early_bird'
  | 'night_owl'
  | 'speed_reader'
  | 'math_master'
  | 'science_star';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date
  streakStartDate: string; // ISO date
}

export interface DailyGoal {
  id: string;
  type: 'lessons' | 'activities' | 'time' | 'points';
  target: number;
  current: number;
  completed: boolean;
  date: string; // ISO date
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'high' | 'default' | 'low' | 'min';
  sound?: string;
  vibration?: boolean;
  badge?: boolean;
}
