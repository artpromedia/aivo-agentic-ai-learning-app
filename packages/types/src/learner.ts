// Learner Theme Types
export type LearnerTheme = 'K5' | 'MS' | 'HS';

// Core Learner Interface
export interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth: Date;
  gradeLevel: number;
  parentIds: string[];
  teacherIds: string[];
  iepId?: string;
  modelId: string; // AI model instance ID
  pin: string; // Hashed PIN for learner login
  preferences: LearnerPreferences;
  learningProfile: LearningProfile;
  progress: LearnerProgressSummary;
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

// Learner Preferences
export interface LearnerPreferences {
  learningStyle: ('visual' | 'auditory' | 'kinesthetic')[];
  textSize: 'normal' | 'large' | 'extra-large';
  colorScheme: 'default' | 'high-contrast' | 'pastel' | 'dark';
  soundEffects: boolean;
  musicBackground: boolean;
  voiceGender?: 'male' | 'female' | 'neutral';
  voiceSpeed: number; // 0.5 to 2.0
  animationSpeed: 'slow' | 'normal' | 'fast';
  readAloud: boolean;
}

// Learning Profile
export interface LearningProfile {
  strengths: string[];
  challenges: string[];
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredPaceAdjustment: number; // -1 to 1, where 0 is standard pace
  attentionSpan: number; // minutes
  peakLearningTimes?: string[]; // e.g., ['morning', 'afternoon']
  needsSupport: SupportNeeds;
  motivators: string[]; // What motivates this learner
}

// Support Needs
export interface SupportNeeds {
  audioSupport: boolean;
  visualSupport: boolean;
  simplifiedLanguage: boolean;
  extendedTime: boolean;
  breakReminders: boolean;
  positiveReinforcement: boolean;
  sequentialInstructions: boolean;
  reducedDistraction: boolean;
  movementBreaks: boolean;
  socialStoriesSupport: boolean;
}

// Learning Progress Summary
export interface LearnerProgressSummary {
  learnerId: string;
  overallLevel: number; // Grade level equivalent
  totalLearningTime: number; // minutes
  currentStreak: number; // days
  longestStreak: number; // days
  activitiesCompleted: number;
  averageAccuracy: number; // 0-100
  averageEngagement: number; // 0-100
  subjects: SubjectProgress[];
  lastUpdatedAt: Date;
}

// Subject Progress
export interface SubjectProgress {
  subject: 'reading' | 'math' | 'speech' | 'writing' | 'science' | 'social-studies';
  currentLevel: number; // Grade level equivalent
  completedLessons: number;
  totalLessons: number;
  averageScore: number; // 0-100
  timeSpent: number; // minutes
  lastActivityDate?: Date;
  mastery: number; // 0-100
  trending: 'up' | 'down' | 'steady';
}

// Achievement/Badge System
export interface Achievement {
  id: string;
  learnerId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'engagement' | 'streak' | 'milestone' | 'social';
  earnedAt: Date;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export type AchievementType = 
  | 'first_lesson'
  | 'streak_3_days'
  | 'streak_7_days'
  | 'streak_30_days'
  | 'perfect_score'
  | 'fast_learner'
  | 'persistent'
  | 'reading_master'
  | 'math_wizard'
  | 'speech_champion'
  | 'goal_achiever'
  | 'time_spent_10hrs'
  | 'time_spent_50hrs'
  | 'time_spent_100hrs'
  | 'helper'
  | 'explorer';

// Learner Session
export interface LearnerSession {
  id: string;
  learnerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  activitiesCompleted: number;
  totalAccuracy: number;
  engagementScore: number;
  emotionalState?: EmotionalState[];
  deviceInfo?: string;
}

// Emotional State Tracking
export interface EmotionalState {
  timestamp: Date;
  emotion: 'happy' | 'frustrated' | 'confused' | 'excited' | 'neutral' | 'tired';
  confidence: number; // 0-100
  source: 'self-reported' | 'ai-detected' | 'activity-performance';
}

// Learner Device
export interface LearnerDevice {
  id: string;
  learnerId: string;
  deviceName: string;
  deviceType: 'ipad' | 'tablet' | 'computer' | 'phone';
  platform: 'ios' | 'android' | 'web';
  lastUsedAt: Date;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
}
