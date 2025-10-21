// API Response Wrappers
import type { PaginationParams, PaginationMetadata, DateRangeParams } from './common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
  error?: ApiError;
  timestamp: Date;
}

export interface ResponseMetadata {
  requestId: string;
  duration: number; // milliseconds
  version: string;
  [key: string]: any;
}

// User API
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'teacher' | 'administrator';
  phoneNumber?: string;
  timezone?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Keys & Webhooks
export interface APIKey {
  id: string;
  name: string;
  key: string; // Only shown once during creation
  keyPrefix: string; // e.g., "ak_live_abc123..."
  environment: 'production' | 'sandbox';
  createdAt: Date;
  createdBy: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  status: 'active' | 'revoked' | 'expired';
  permissions: APIPermission[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastDayRequests: number;
    lastMonthRequests: number;
  };
}

export type APIPermission =
  | 'learners.read'
  | 'learners.write'
  | 'progress.read'
  | 'iep.read'
  | 'iep.write'
  | 'activities.read'
  | 'activities.write'
  | 'analytics.read'
  | 'webhooks.manage';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'disabled' | 'failed';
  secret: string; // For signature verification
  createdAt: Date;
  createdBy: string;
  lastTriggeredAt?: Date;
  lastStatus?: {
    timestamp: Date;
    statusCode: number;
    success: boolean;
    error?: string;
  };
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // seconds
  };
  headers?: Record<string, string>;
  statistics: {
    totalTriggers: number;
    successfulTriggers: number;
    failedTriggers: number;
    averageResponseTime: number; // ms
  };
}

export type WebhookEvent =
  | 'learner.created'
  | 'learner.updated'
  | 'progress.updated'
  | 'iep.goal.completed'
  | 'activity.completed'
  | 'assessment.completed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'payment.succeeded'
  | 'payment.failed';

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: any; // User type
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Learner API
export interface CreateLearnerRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  grade: string;
  diagnosis?: string[];
  parentIds: string[];
  teacherIds?: string[];
  preferences?: any; // LearnerPreferences
  learningProfile?: any; // LearningProfile
  supportNeeds?: any; // SupportNeeds
}

export interface UpdateLearnerRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  grade?: string;
  diagnosis?: string[];
  parentIds?: string[];
  teacherIds?: string[];
  preferences?: any;
  learningProfile?: any;
  supportNeeds?: any;
}

export interface UpdateLearnerPinRequest {
  pin: string;
}

export interface GetLearnerProgressRequest extends DateRangeParams {
  learnerId: string;
  subjects?: string[];
}

// IEP API
export interface CreateIEPRequest {
  learnerId: string;
  startDate: Date | string;
  endDate: Date | string;
  goals: any[]; // IEPGoal[]
  accommodations?: any[]; // Accommodation[]
  modifications?: any[]; // Modification[]
  services?: any[]; // Service[]
  team?: any[]; // IEPTeamMember[]
}

export interface UpdateIEPRequest {
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  reviewDates?: Date[] | string[];
  nextReviewDate?: Date | string;
}

export interface CreateIEPGoalRequest {
  iepId: string;
  domain: string;
  description: string;
  targetDate: Date | string;
  baselineLevel?: string;
  targetLevel?: string;
  strategies?: string[];
  assessmentMethod?: string;
}

export interface UpdateIEPGoalProgressRequest {
  goalId: string;
  progressPercentage: number;
  observations: string;
  dataPoints?: any[]; // DataPoint[]
  nextSteps?: string;
}

export interface AddIEPMeetingNoteRequest {
  iepId: string;
  meetingType: string;
  attendees: any[]; // IEPTeamMember[]
  agenda: string;
  notes: string;
  decisions: string[];
  actionItems: any[]; // ActionItem[]
}

// Activity API
export interface CreateActivityRequest {
  learnerId: string;
  subject: string;
  type: string;
  difficulty: number;
  duration: number;
  contentId?: string;
  iepGoalsAddressed?: string[];
}

export interface AssignActivityRequest {
  activityId?: string;
  templateId?: string;
  learnerIds: string[];
  assignedBy: string;
  dueDate?: Date | string;
  priority?: 'low' | 'normal' | 'high';
  instructions?: string;
}

export interface StartActivityRequest {
  activityId: string;
  learnerId: string;
}

export interface SubmitActivityResponseRequest {
  activityId: string;
  questionId: string;
  userAnswer: any;
  timeSpent: number;
  hintsUsed: number;
}

export interface CompleteActivityRequest {
  activityId: string;
  responses: any[]; // ActivityResponse[]
  score: number;
  accuracy: number;
  engagementScore: number;
  metadata: any; // ActivityMetadata
}

// Assessment API
export interface CreateBaselineAssessmentRequest {
  learnerId: string;
  subjects: any[]; // SubjectAssessment[]
  assessorId: string;
  overallRecommendations?: string[];
  assessorNotes?: string;
}

export interface RecordProgressAssessmentRequest {
  learnerId: string;
  assessmentPeriod: string;
  skillsAssessed: any[]; // SkillProgress[]
  iepId?: string;
}

export interface ScheduleAssessmentRequest {
  learnerId: string;
  assessmentType: string;
  scheduledDate: Date | string;
  assessorId: string;
  notes?: string;
}

export interface CreateInterventionRequest {
  learnerId: string;
  type: string;
  tier: 1 | 2 | 3;
  targetSkills: string[];
  strategy: string;
  frequency: string;
  duration: number;
  providerId: string;
}

// Message API
export interface SendMessageRequest {
  recipientId: string;
  subject: string;
  body: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: any[]; // Attachment[]
  learnerId?: string;
  iepId?: string;
}

export interface ReplyToMessageRequest {
  messageId: string;
  body: string;
  attachments?: any[];
}

export interface MarkMessageReadRequest {
  messageId: string;
}

// Notification API
export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  category: string;
  priority?: 'low' | 'normal' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface UpdateNotificationPreferencesRequest {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  messages?: boolean;
  reports?: boolean;
  iepUpdates?: boolean;
  milestones?: boolean;
  digest?: 'realtime' | 'daily' | 'weekly' | 'never';
}

// Calendar API
export interface CreateCalendarEventRequest {
  eventType: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: any; // RecurrenceRule
  attendees?: any[]; // EventAttendee[]
  reminders?: any[]; // EventReminder[]
  learnerId?: string;
  iepId?: string;
  meetingLink?: string;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  location?: string;
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  attendees?: any[];
  reminders?: any[];
}

export interface GetCalendarEventsRequest extends DateRangeParams {
  userId?: string;
  learnerId?: string;
  eventType?: string;
}

// Report API
export interface GenerateReportRequest {
  type: string;
  learnerId?: string;
  iepId?: string;
  period: any; // ReportPeriod
  startDate: Date | string;
  endDate: Date | string;
  format?: 'pdf' | 'html' | 'excel' | 'json';
  sections?: string[];
  sharedWith?: string[];
}

export interface GetReportsRequest extends PaginationParams {
  type?: string;
  learnerId?: string;
  status?: string;
}

// Analytics API
export interface GetAnalyticsRequest extends DateRangeParams {
  userId: string;
  metrics?: string[];
  learnerId?: string;
}

// Content API
export interface CreateContentRequest {
  type: string;
  subject: string;
  title: string;
  description: string;
  gradeLevel: number[];
  difficulty: number;
  duration: number;
  contentUrl: string;
  thumbnailUrl?: string;
  learningObjectives: string[];
  standardsAligned?: string[];
  iepGoalsSupported?: string[];
  accessibility: any; // AccessibilityFeatures
  tags?: string[];
}

export interface SearchContentRequest extends PaginationParams {
  query?: string;
  subject?: string;
  type?: string;
  gradeLevel?: number;
  difficulty?: [number, number];
  tags?: string[];
}

// AI Model API
export interface UpdateModelParametersRequest {
  modelId: string;
  parameters: any; // Partial<ModelParameters>
  reason: string;
}

export interface GetModelRecommendationsRequest {
  learnerId: string;
  subject?: string;
  activityType?: string;
}

// School/District API
export interface CreateSchoolRequest {
  name: string;
  districtId?: string;
  type: string;
  address: any; // Address
  phone: string;
  email: string;
  website?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  address?: any;
  phone?: string;
  email?: string;
  website?: string;
  settings?: any; // Partial<SchoolSettings>
}

export interface AddTeacherToSchoolRequest {
  schoolId: string;
  teacherId: string;
}

export interface RemoveTeacherFromSchoolRequest {
  schoolId: string;
  teacherId: string;
}

// API Error Interface
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
  stack?: string;
}
