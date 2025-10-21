// User Role Types
export type UserRole = 
  | 'learner'
  | 'parent'
  | 'teacher'
  | 'school-admin'
  | 'district-admin'
  | 'super-admin';

// Base User Interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Parent User
export interface Parent extends User {
  role: 'parent';
  children: string[]; // Learner IDs
  relationshipType?: 'mother' | 'father' | 'guardian' | 'other';
  emergencyContact?: EmergencyContact;
  preferences?: ParentPreferences;
}

// Teacher User
export interface Teacher extends User {
  role: 'teacher';
  students: string[]; // Learner IDs
  schoolId?: string;
  schoolName?: string;
  gradeLevel?: string;
  subjects?: string[];
  certifications?: string[];
  preferences?: TeacherPreferences;
}

// Administrator Users
export interface SchoolAdministrator extends User {
  role: 'school-admin';
  permissions: Permission[];
  schoolIds: string[];
}

export interface DistrictAdministrator extends User {
  role: 'district-admin';
  permissions: Permission[];
  districtId: string;
  schoolIds?: string[];
}

export interface SuperAdministrator extends User {
  role: 'super-admin';
  permissions: Permission[];
}

// Legacy alias for backward compatibility
export type Administrator = SchoolAdministrator | DistrictAdministrator | SuperAdministrator;

// Emergency Contact
export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

// Parent Preferences
export interface ParentPreferences {
  notificationSettings: NotificationSettings;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  language: string;
  receiveMarketingEmails: boolean;
}

// Teacher Preferences
export interface TeacherPreferences {
  notificationSettings: NotificationSettings;
  dashboardLayout: 'compact' | 'detailed' | 'visual';
  defaultView: 'roster' | 'ieps' | 'progress' | 'messages';
  language: string;
}

// Notification Settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  newMessages: boolean;
  progressReports: boolean;
  iepReminders: boolean;
  milestoneAlerts: boolean;
  weeklyDigest: boolean;
}

// Permission System
export type Permission = 
  | 'manage_users'
  | 'manage_learners'
  | 'manage_ieps'
  | 'view_reports'
  | 'manage_content'
  | 'manage_billing'
  | 'manage_settings'
  | 'view_analytics'
  | 'export_data'
  | 'manage_school';

// Authentication
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthResponse {
  user: User;
  tokens: AuthToken;
}

// Session
export interface Session {
  id: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}
