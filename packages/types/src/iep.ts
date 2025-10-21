// Core IEP Interface
import type { DataPoint } from './common';

export interface IEP {
  id: string;
  learnerId: string;
  schoolYear: string;
  startDate: Date;
  endDate: Date;
  reviewDates: Date[];
  nextReviewDate: Date;
  status: IEPStatus;
  goals: IEPGoal[];
  accommodations: Accommodation[];
  modifications: Modification[];
  services: Service[];
  team: IEPTeamMember[];
  meetingNotes: MeetingNote[];
  documents: IEPDocument[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
}

export type IEPStatus = 'draft' | 'active' | 'review-due' | 'under-review' | 'expired' | 'archived';

// IEP Goal
export interface IEPGoal {
  id: string;
  iepId: string;
  domain: 'reading' | 'math' | 'speech' | 'writing' | 'social-emotional' | 'motor-skills' | 'life-skills' | 'behavioral' | 'other';
  title: string;
  description: string;
  measurableObjective: string;
  baselineLevel: string;
  targetLevel: string;
  targetDate: Date;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'mastered' | 'discontinued' | 'modified';
  strategies: string[];
  assessmentMethod: string;
  dataCollectionFrequency: string;
  progressReports: GoalProgressReport[];
  standardsAligned?: string[]; // Educational standards
  createdAt: Date;
  updatedAt: Date;
}

// Goal Progress Report
export interface GoalProgressReport {
  id: string;
  goalId: string;
  reportedBy: string;
  date: Date;
  progressPercentage: number;
  observations: string;
  dataPoints?: DataPoint[];
  nextSteps?: string;
}

// Accommodation
export interface Accommodation {
  id: string;
  iepId: string;
  category: 'instructional' | 'assessment' | 'environmental' | 'behavioral';
  type: 'presentation' | 'response' | 'setting' | 'timing' | 'scheduling';
  description: string;
  frequency: 'always' | 'as-needed' | 'specific-subjects' | 'specific-activities';
  subjects?: string[];
  implementationNotes?: string;
  isActive: boolean;
}

// Modification
export interface Modification {
  id: string;
  iepId: string;
  subject: string;
  description: string;
  type: 'curriculum' | 'assignment' | 'grading' | 'other';
  implementationDetails: string;
  isActive: boolean;
}

// Service
export interface Service {
  id: string;
  iepId: string;
  type: ServiceType;
  description: string;
  provider: string;
  providerId?: string;
  frequency: string; // e.g., "2x per week"
  duration: number; // minutes per session
  location: string;
  schedule?: string; // e.g., "Monday & Wednesday, 10:00 AM"
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  sessionLogs?: ServiceLog[];
}

export type ServiceType = 
  | 'speech-language-therapy'
  | 'occupational-therapy'
  | 'physical-therapy'
  | 'counseling'
  | 'behavioral-support'
  | 'tutoring'
  | 'adapted-pe'
  | 'assistive-technology'
  | 'vision-support'
  | 'hearing-support'
  | 'nursing'
  | 'transportation'
  | 'other';

// Service Log
export interface ServiceLog {
  id: string;
  serviceId: string;
  date: Date;
  duration: number; // actual minutes
  attendance: 'present' | 'absent' | 'partial';
  activitiesConducted: string;
  progressNotes: string;
  providerId: string;
  createdAt: Date;
}

// IEP Team Member
export interface IEPTeamMember {
  userId: string;
  role: 'parent' | 'teacher' | 'special-ed-teacher' | 'speech-therapist' | 'psychologist' | 'administrator' | 'counselor' | 'other';
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimaryContact: boolean;
}

// Meeting Note
export interface MeetingNote {
  id: string;
  iepId: string;
  meetingType: 'initial' | 'annual' | 'quarterly' | 'amendment' | 'reevaluation' | 'other';
  date: Date;
  attendees: IEPTeamMember[];
  agenda?: string;
  notes: string;
  decisions: string[];
  actionItems: ActionItem[];
  nextMeetingDate?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: Date;
}

// IEP Document
export interface IEPDocument {
  id: string;
  iepId: string;
  type: 'iep-form' | 'progress-report' | 'assessment' | 'consent-form' | 'meeting-notice' | 'evaluation' | 'other';
  title: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  isConfidential: boolean;
}

// IEP Timeline Event
export interface IEPTimelineEvent {
  id: string;
  iepId: string;
  eventType: 'created' | 'modified' | 'reviewed' | 'goal-added' | 'goal-completed' | 'service-added' | 'meeting-held' | 'document-uploaded';
  description: string;
  performedBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// IEP Analytics
export interface IEPAnalytics {
  iepId: string;
  learnerId: string;
  totalGoals: number;
  completedGoals: number;
  goalsInProgress: number;
  averageGoalProgress: number; // 0-100
  goalsOnTrack: number;
  goalsBehindSchedule: number;
  daysUntilNextReview: number;
  complianceStatus: 'compliant' | 'needs-attention' | 'overdue';
  lastUpdated: Date;
}
