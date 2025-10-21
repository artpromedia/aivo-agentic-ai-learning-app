/**
 * Super Admin Portal Type Definitions
 * Enhanced with PROMPT 16 enterprise features
 */

// ========================================
// Tenant Management (Enhanced)
// ========================================

export interface TenantSSO {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  lastSync: Date;
  userCount: number;
  errorCount: number;
}

export interface Tenant {
  id: string;
  name: string;
  type: 'district' | 'school' | 'enterprise' | 'trial';
  domain: string; // custom domain: district.aivo.ai
  status: 'active' | 'trial' | 'suspended' | 'churned';
  createdAt: Date;
  contractEnd?: Date;
  tier: 'trial' | 'basic' | 'premium' | 'enterprise';

  // Usage
  totalUsers: number;
  monthlyActiveUsers: number;
  storageUsed: number; // GB
  apiCallsThisMonth: number;

  // Financial
  monthlyRecurringRevenue: number;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;

  // Health
  errorRate: number;
  uptime: number;
  supportTicketsOpen: number;

  // SSO Configuration
  ssoEnabled: boolean;
  ssoProvider?: 'google' | 'microsoft' | 'okta' | 'custom-saml';
  ssoMetadata?: TenantSSO;

  // Features
  customBranding: boolean;
  apiAccessEnabled: boolean;
  featureFlags: Record<string, boolean>;
}

// ========================================
// Service Level Objectives (SLO)
// ========================================

export interface SLO {
  id: string;
  name: string;
  description: string;
  target: number; // e.g., 99.95 for 99.95%
  current: number;
  unit: 'percentage' | 'milliseconds' | 'count';
  errorBudget: number; // percentage remaining
  status: 'healthy' | 'warning' | 'critical';
  period: '7-day' | '30-day' | '90-day';
  lastUpdated: Date;
}

export interface ErrorBudgetData {
  date: Date;
  budget: number;
  burnRate: number;
  incidents: number;
}

export interface SLOComplianceHistory {
  month: string;
  availability: number;
  latency: number;
  errorRate: number;
  compliance: 'met' | 'missed';
  incident?: string;
}

export interface AlertRule {
  id: string;
  rule: string;
  description: string;
  enabled: boolean;
  lastTriggered?: Date;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
}

// ========================================
// Financial Operations (FinOps)
// ========================================

export interface FinOpsMetrics {
  totalMonthlySpend: number;
  costPerStudent: number;
  budget: number;
  trend: number; // percentage change
}

export interface CostBreakdown {
  service: string;
  cost: number;
  percentage: number;
  trend: number;
  category: 'compute' | 'storage' | 'ai' | 'database' | 'network' | 'monitoring';
}

export interface CostOptimization {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  status: 'identified' | 'in-progress' | 'completed' | 'dismissed';
}

export interface MonthlyCost {
  month: string;
  total: number;
  compute: number;
  storage: number;
  ai: number;
  database: number;
  other: number;
}

// ========================================
// Human-in-the-Loop Operations (HITL)
// ========================================

export interface HITLQueueItem {
  id: string;
  type: 'assessment' | 'content-moderation' | 'iep-mapping' | 'escalation';
  studentId?: string;
  studentName?: string;
  tenantId: string;
  tenantName: string;
  subject?: string;
  aiConfidence: number;
  flagReason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-review' | 'completed' | 'escalated';
  createdAt: Date;
  assignedTo?: string;
  reviewedAt?: Date;
  waitTime: number; // hours
  metadata: Record<string, unknown>;
}

export interface ReviewerPerformance {
  id: string;
  name: string;
  email: string;
  reviewed: number;
  accuracy: number; // percentage
  avgReviewTime: number; // minutes
  status: 'active' | 'break' | 'offline';
  specializations: string[];
}

export interface QualityMetrics {
  aiAccuracy: number;
  humanAgreement: number;
  overrideRate: number;
  escalationRate: number;
  avgReviewTime: number;
}

// ========================================
// Mobile Device Management (MDM)
// ========================================

export interface Device {
  id: string;
  type: 'ipad' | 'chromebook' | 'android-tablet' | 'windows';
  manufacturer: string;
  model: string;
  serialNumber: string;
  studentId?: string;
  studentName?: string;
  tenantId: string;
  tenantName: string;
  osVersion: string;
  appVersion: string;
  lastSeen: Date;
  status: 'active' | 'offline' | 'non-compliant' | 'decommissioned' | 'lost';
  batteryHealth: number; // percentage
  storageAvailable: number; // GB
  storageTotal: number; // GB
  mdmEnrolled: boolean;
  mdmProfile: string;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
}

export interface MDMPolicy {
  id: string;
  name: string;
  description: string;
  type: 'app-restrictions' | 'screen-time' | 'content-filter' | 'security' | 'network';
  appliedTo: number; // device count
  status: 'active' | 'draft' | 'archived';
  configuration: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceHealth {
  batteryHealth: number;
  storageAvailable: number;
  networkConnectivity: number;
  appCrashRate: number;
}

// ========================================
// Data Governance & DSRs
// ========================================

export interface DSR {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  requester: string;
  requesterEmail: string;
  requesterType: 'student' | 'parent' | 'teacher' | 'admin';
  tenantId: string;
  tenantName: string;
  submittedAt: Date;
  deadline: Date;
  status: 'pending-review' | 'in-progress' | 'completed' | 'rejected' | 'overdue';
  assignee?: string;
  notes: string;
  attachments: string[];
  completedAt?: Date;
  daysOverdue?: number;
}

export interface ComplianceStatus {
  regulation: 'COPPA' | 'FERPA' | 'SOC 2' | 'CCPA' | 'GDPR' | 'HIPAA';
  status: 'compliant' | 'action-required' | 'non-compliant';
  lastAudit: Date;
  nextAudit: Date;
  findings: number;
  openIssues: number;
  auditor?: string;
}

export interface RetentionPolicy {
  id: string;
  dataType: string;
  description: string;
  retention: string; // e.g., "7 years after graduation"
  autoDelete: boolean;
  recordsStored: number;
  storageSize: number; // GB
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface GovernanceAuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  resourceType: 'dsr' | 'policy' | 'data-deletion' | 'access-grant' | 'export';
  resourceId: string;
  severity: 'info' | 'warning' | 'critical';
}

// ========================================
// Pilot Program Management
// ========================================

export interface PilotProgram {
  id: string;
  name: string;
  description: string;
  feature: string;
  participants: number;
  targetParticipants: number;
  startDate: Date;
  endDate: Date;
  status: 'recruiting' | 'active' | 'ending-soon' | 'completed' | 'cancelled';
  feedbackScore: number; // 1-5
  feedbackCount: number;
  enrollmentRate: number; // percentage
  activeParticipation: number; // percentage
  completionRate: number; // percentage
  reportedIssues: number;
  resolvedIssues: number;
  owner: string;
  tenantsParticipating: string[];
}

export interface PilotParticipant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: 'student' | 'teacher' | 'parent' | 'admin';
  tenantId: string;
  tenantName: string;
  pilotId: string;
  pilotName: string;
  enrolledAt: Date;
  lastActiveAt: Date;
  usageCount: number;
  feedbackProvided: boolean;
  feedbackScore?: number;
  feedbackComment?: string;
  status: 'enrolled' | 'active' | 'inactive' | 'withdrawn' | 'completed';
}

export interface PilotMetrics {
  enrollmentRate: number;
  activeParticipation: number;
  completionRate: number;
  satisfactionScore: number;
  reportedIssues: number;
  resolvedIssues: number;
  avgUsagePerWeek: number;
  retentionRate: number;
}

// ========================================
// Licensing Management (Enhanced)
// ========================================

export interface LicensePool {
  id: string;
  name: string;
  type: 'student' | 'teacher' | 'parent' | 'admin';
  total: number;
  assigned: number;
  available: number;
  price: number;
  currency: string;
  tenantId?: string; // if tenant-specific
  createdAt: Date;
  expiresAt?: Date;
}

export interface LicenseActivity {
  id: string;
  tenantId: string;
  tenantName: string;
  action: 'purchased' | 'assigned' | 'revoked' | 'expired' | 'transferred' | 'renewed';
  licenseType: string;
  quantity: number;
  value?: number;
  performedBy: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed' | 'attention';
}

// ========================================
// SSO & Sync Management
// ========================================

export interface SSOProvider {
  id: string;
  provider: 'google' | 'microsoft' | 'okta' | 'custom-saml';
  displayName: string;
  status: 'operational' | 'degraded' | 'down';
  connectedTenants: number;
  dailyLogins: number;
  monthlyLogins: number;
  errorRate: number;
  lastHealthCheck: Date;
  alert?: string;
}

export interface TenantSSOConfig {
  tenantId: string;
  tenantName: string;
  ssoProvider: string;
  status: 'active' | 'configuring' | 'error' | 'disabled';
  lastSync: Date;
  ssoUsers: number;
  failedAuthAttempts: number;
  configuration: Record<string, unknown>;
}

export interface DataSync {
  id: string;
  source: string;
  destination: string;
  type: 'roster' | 'grades' | 'assignments' | 'users' | 'full';
  status: 'idle' | 'syncing' | 'complete' | 'error' | 'paused';
  lastSync: Date;
  nextSync?: Date;
  recordsSynced: number;
  errors: number;
  errorMessage?: string;
  duration?: number; // seconds
  tenantId?: string;
}

// ========================================
// Environment & Shell
// ========================================

export interface EnvironmentStatus {
  environment: 'production' | 'staging' | 'development';
  errorBudget: number; // percentage remaining
  deployStatus: 'open' | 'guarded' | 'frozen';
  uptime: number;
  apiLatency: number;
  errorRate: number;
  activeIncidents: number;
  lastDeploy?: {
    version: string;
    timestamp: Date;
    deployedBy: string;
  };
}

export interface PlatformActivity {
  id: string;
  type: 'deploy' | 'alert' | 'feature' | 'incident' | 'maintenance' | 'security';
  user: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface SystemMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  target?: string | number;
  status: 'healthy' | 'warning' | 'critical';
  unit?: string;
}
