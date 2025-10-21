// AI Model Types
import type { DataPoint as _IEPDataPoint } from './common';

export interface AIModel {
  id: string;
  learnerId: string;
  modelVersion: string;
  status: 'initializing' | 'training' | 'active' | 'updating' | 'paused' | 'archived';
  baselineCompleted: boolean;
  trainingDataPoints: number;
  accuracy: number; // 0-100
  lastTrainedAt?: Date;
  parameters: ModelParameters;
  adaptations: ModelAdaptation[];
  performanceMetrics: ModelPerformanceMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelParameters {
  difficultyAdjustment: number; // -1 to 1
  paceModifier: number; // 0.5 to 2.0
  repetitionFrequency: number; // 1 to 10
  scaffoldingLevel: number; // 1 to 5
  motivationalStyle: 'encouraging' | 'neutral' | 'challenge-based';
  learningPathway: 'sequential' | 'spiral' | 'mastery-based' | 'mixed';
  errorTolerance: number; // 0-100
  adaptiveThreshold: number; // 0-100
}

export interface ModelAdaptation {
  timestamp: Date;
  type: 'difficulty' | 'pace' | 'content-type' | 'support-level' | 'motivation';
  previousValue: any;
  newValue: any;
  reason: string;
  triggeredBy: 'performance' | 'engagement' | 'teacher-override' | 'iep-goal';
  effectivenessRating?: number; // 0-100
}

export interface ModelPerformanceMetrics {
  accuracyTrend: 'improving' | 'declining' | 'stable';
  engagementScore: number; // 0-100
  frustrationIndex: number; // 0-100
  optimalDifficultyRange: [number, number]; // [min, max] grade levels
  recommendedPace: number;
  strengthAreas: string[];
  challengeAreas: string[];
  adaptationEffectiveness: number; // 0-100
  lastCalculatedAt: Date;
}

// Content Types
export interface LearningContent {
  id: string;
  type: ContentType;
  subject: string;
  title: string;
  description: string;
  gradeLevel: number[];
  difficulty: number; // 1.0-12.0
  duration: number; // estimated seconds
  contentUrl: string;
  thumbnailUrl?: string;
  prerequisites?: string[];
  learningObjectives: string[];
  standardsAligned: string[];
  iepGoalsSupported: string[];
  mediaType: 'text' | 'audio' | 'video' | 'interactive' | 'mixed';
  accessibility: AccessibilityFeatures;
  tags: string[];
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  averageRating?: number;
}

export type ContentType =
  | 'lesson'
  | 'activity'
  | 'assessment'
  | 'video'
  | 'audio'
  | 'interactive-game'
  | 'story'
  | 'worksheet'
  | 'flashcard'
  | 'quiz';

export interface AccessibilityFeatures {
  textToSpeech: boolean;
  closedCaptions: boolean;
  signLanguage: boolean;
  highContrast: boolean;
  simplifiedText: boolean;
  audioDescription: boolean;
  keyboardNavigable: boolean;
  screenReaderOptimized: boolean;
}

// Analytics Types
export interface AnalyticsDashboard {
  userId: string;
  userRole: 'parent' | 'teacher' | 'administrator';
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: Date;
  endDate: Date;
  metrics: DashboardMetric[];
  charts: ChartData[];
  insights: Insight[];
  generatedAt: Date;
}

export interface DashboardMetric {
  name: string;
  value: number;
  unit: string;
  change?: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
  target?: number;
  onTrack: boolean;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: DataSeries[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
}

export interface DataSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface ChartDataPoint {
  x: Date | string | number;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface AxisConfig {
  label: string;
  unit?: string;
  min?: number;
  max?: number;
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  dataPoints?: string[];
  generatedAt: Date;
}

// Report Types
export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  generatedBy: string;
  generatedFor?: string; // User ID
  learnerId?: string;
  iepId?: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  format: 'pdf' | 'html' | 'excel' | 'json';
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  sections: ReportSection[];
  metadata: Record<string, any>;
  isConfidential: boolean;
  sharedWith?: string[];
  generatedAt: Date;
  expiresAt?: Date;
}

export type ReportType =
  | 'progress-report'
  | 'iep-summary'
  | 'assessment-report'
  | 'attendance-report'
  | 'goal-progress'
  | 'activity-summary'
  | 'engagement-report'
  | 'custom';

export interface ReportPeriod {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semester' | 'annual' | 'custom';
  label: string;
}

export interface ReportSection {
  title: string;
  content: string | object;
  charts?: ChartData[];
  tables?: TableData[];
  order: number;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  footer?: string[];
}

// System Configuration
export interface SystemConfig {
  id: string;
  category: 'general' | 'security' | 'ai' | 'content' | 'billing' | 'notifications';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'date';
  description?: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: Date;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
