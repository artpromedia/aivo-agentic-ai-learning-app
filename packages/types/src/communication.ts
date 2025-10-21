// Message Types
import type { Address } from './common';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'administrator';
  recipientId: string;
  recipientRole: 'parent' | 'teacher' | 'administrator';
  subject: string;
  body: string;
  htmlBody?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'archived';
  attachments?: Attachment[];
  isStarred: boolean;
  tags?: string[];
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  subject: string;
  lastMessageAt: Date;
  messageCount: number;
  unreadCount: number;
  learnerId?: string; // If conversation is about a specific learner
  iepId?: string; // If conversation is about an IEP
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  userId: string;
  role: 'parent' | 'teacher' | 'administrator';
  name: string;
  email: string;
  lastReadAt?: Date;
  isActive: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: 'message' | 'iep' | 'progress' | 'activity' | 'milestone' | 'system' | 'reminder';
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'learner' | 'iep' | 'activity' | 'message' | 'assessment';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | 'new-message'
  | 'message-reply'
  | 'iep-review-due'
  | 'iep-goal-achieved'
  | 'progress-report-available'
  | 'activity-completed'
  | 'activity-assigned'
  | 'milestone-reached'
  | 'streak-achievement'
  | 'parent-invitation'
  | 'teacher-invitation'
  | 'assessment-scheduled'
  | 'assessment-completed'
  | 'device-approved'
  | 'subscription-expiring'
  | 'payment-successful'
  | 'payment-failed'
  | 'system-maintenance';

// Calendar & Scheduling
export interface CalendarEvent {
  id: string;
  userId: string;
  learnerId?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  attendees?: EventAttendee[];
  reminders?: EventReminder[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  meetingLink?: string;
  iepId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarEventType =
  | 'iep-meeting'
  | 'parent-teacher-conference'
  | 'assessment'
  | 'therapy-session'
  | 'tutoring-session'
  | 'review-meeting'
  | 'observation'
  | 'other';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

export interface EventAttendee {
  userId: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  isRequired: boolean;
}

export interface EventReminder {
  method: 'email' | 'push' | 'sms';
  minutesBefore: number;
}

// Subscription & Billing
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  learnerCount: number;
  maxLearners: number;
  features: string[];
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingTransaction {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  type: 'payment' | 'refund' | 'adjustment';
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  paymentMethodId?: string;
  failureReason?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'paypal';
  isDefault: boolean;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  billingEmail?: string;
  billingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

// School & Organization
export interface School {
  id: string;
  name: string;
  districtId?: string;
  type: 'elementary' | 'middle' | 'high' | 'k-12' | 'special-education' | 'other';
  address: Address;
  phone: string;
  email: string;
  website?: string;
  principalId?: string;
  adminIds: string[];
  teacherIds: string[];
  studentCount: number;
  settings: SchoolSettings;
  subscriptionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolSettings {
  allowParentAccess: boolean;
  requireTeacherApproval: boolean;
  dataRetentionDays: number;
  privacyLevel: 'standard' | 'enhanced' | 'maximum';
  features: string[];
}

export interface District {
  id: string;
  name: string;
  schoolIds: string[];
  adminIds: string[];
  address: Address;
  phone: string;
  email: string;
  website?: string;
  superintendentId?: string;
  settings: DistrictSettings;
  subscriptionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistrictSettings {
  centralizedBilling: boolean;
  sharedResources: boolean;
  unifiedReporting: boolean;
  dataGovernance: string[];
}
