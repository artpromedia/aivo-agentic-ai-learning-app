// ============================================================================
// AIVO SUPER ADMIN PORTAL - MOCK DATA SYSTEM
// ============================================================================
// Comprehensive mock data for all Super Admin Portal features
// This file contains interfaces and data generators for platform-wide management

// ============================================================================
// INTERFACES
// ============================================================================

export interface District {
  id: string;
  name: string;
  state: string;
  contractStart: Date;
  contractEnd: Date;
  tier: 'trial' | 'basic' | 'premium' | 'enterprise';
  totalLicenses: number;
  usedLicenses: number;
  totalSchools: number;
  totalStudents: number;
  monthlyActiveUsers: number;
  accountStatus: 'active' | 'trial' | 'suspended' | 'churned';
  monthlyRecurringRevenue: number;
  supportPriority: 'standard' | 'priority' | 'premium';
  contactEmail: string;
  contactPhone: string;
  primaryContact: string;
}

export interface PlatformMetrics {
  totalDistricts: number;
  activeSchools: number;
  totalStudentsEnrolled: number;
  totalTeachersActive: number;
  totalAIModels: number;
  platformUptime: number;
  averageApiResponseTime: number;
  storageUsageGB: number;
  computeResourcesUsed: number;
  activeUserSessions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  apiStatus: 'operational' | 'slow' | 'error';
  databaseStatus: 'operational' | 'slow' | 'error';
  aiServiceStatus: 'operational' | 'slow' | 'error';
  storageStatus: 'operational' | 'slow' | 'error';
  errorRate: number;
  databasePerformance: number;
  concurrentSessions: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface AIModelMetrics {
  modelId: string;
  studentId: string;
  studentName: string;
  districtName: string;
  version: string;
  createdAt: Date;
  lastInference: Date;
  totalInferences: number;
  averageAccuracy: number;
  adaptationCount: number;
  storageSize: number;
  inferenceLatency: number;
  errorRate: number;
}

export interface SupportTicket {
  id: string;
  submittedBy: string;
  userType: 'district-admin' | 'teacher' | 'parent';
  districtId: string;
  districtName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'billing' | 'training' | 'feature-request' | 'bug';
  status: 'open' | 'in-progress' | 'waiting-user' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments: string[];
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  responseTime?: number;
  resolutionTime?: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: 'all' | 'districts' | 'schools' | 'specific-users';
  environment: 'production' | 'staging' | 'development';
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export interface PricingTier {
  name: 'trial' | 'families' | 'schools' | 'districts' | 'enterprise';
  pricePerStudent: number;
  minimumSeats: number;
  features: string[];
  supportLevel: string;
  contractTerm: 'monthly' | 'annual';
  discount: number;
}

export interface UsageAnalytics {
  date: string;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsers: number;
  activitiesCompleted: number;
  averageSessionDuration: number;
  retentionRate: number;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'activity' | 'assessment' | 'reading' | 'math' | 'speech' | 'science' | 'writing';
  subject: string;
  gradeLevel: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  standards: string[];
  accessibilityFeatures: string[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  usageCount: number;
  rating: number;
}

export interface SecurityLog {
  id: string;
  timestamp: Date;
  eventType: 'login-success' | 'login-failed' | 'suspicious-activity' | 'data-access' | 'api-key-used';
  userId: string;
  userName: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DatabaseMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  activeConnections: number;
  databaseSize: number;
  indexEfficiency: number;
  cacheHitRate: number;
  replicationLag: number;
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

class MockDataService {
  private static instance: MockDataService;
  private districts: District[];
  private platformMetrics: PlatformMetrics;
  private systemHealth: SystemHealth;
  private aiModels: AIModelMetrics[];
  private supportTickets: SupportTicket[];
  private featureFlags: FeatureFlag[];
  private pricingTiers: PricingTier[];
  private usageAnalytics: UsageAnalytics[];
  private contentItems: ContentItem[];
  private securityLogs: SecurityLog[];
  private databaseMetrics: DatabaseMetrics;

  private constructor() {
    this.districts = this.generateDistricts();
    this.platformMetrics = this.generatePlatformMetrics();
    this.systemHealth = this.generateSystemHealth();
    this.aiModels = this.generateAIModels();
    this.supportTickets = this.generateSupportTickets();
    this.featureFlags = this.generateFeatureFlags();
    this.pricingTiers = this.generatePricingTiers();
    this.usageAnalytics = this.generateUsageAnalytics();
    this.contentItems = this.generateContentItems();
    this.securityLogs = this.generateSecurityLogs();
    this.databaseMetrics = this.generateDatabaseMetrics();
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private generateDistricts(): District[] {
    const states = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    const tiers: District['tier'][] = ['trial', 'basic', 'premium', 'enterprise'];
    const statuses: District['accountStatus'][] = ['active', 'trial', 'suspended', 'churned'];

    const districtNames = [
      'Los Angeles Unified', 'Chicago Public Schools', 'Miami-Dade County',
      'Houston ISD', 'New York City DOE', 'Philadelphia School District',
      'Dallas ISD', 'San Diego Unified', 'Phoenix Union', 'Austin ISD',
      'Denver Public Schools', 'Seattle Public Schools', 'Boston Public Schools',
      'Atlanta Public Schools', 'Portland Public Schools', 'San Francisco Unified',
      'Minneapolis Public Schools', 'Charlotte-Mecklenburg', 'Nashville Metro',
      'Columbus City Schools'
    ];

    return districtNames.map((name, index) => {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const totalLicenses = tier === 'enterprise' ? 10000 : tier === 'premium' ? 5000 : tier === 'basic' ? 1000 : 100;
      const usedLicenses = Math.floor(totalLicenses * (0.6 + Math.random() * 0.35));
      const totalSchools = Math.floor(Math.random() * 50) + 10;
      const totalStudents = Math.floor(Math.random() * 50000) + 5000;
      const pricePerStudent = tier === 'enterprise' ? 15 : tier === 'premium' ? 12 : tier === 'basic' ? 8 : 0;

      return {
        id: `district-${index + 1}`,
        name,
        state: states[index % states.length],
        contractStart: new Date(2024, Math.floor(Math.random() * 12), 1),
        contractEnd: new Date(2026, Math.floor(Math.random() * 12), 1),
        tier,
        totalLicenses,
        usedLicenses,
        totalSchools,
        totalStudents,
        monthlyActiveUsers: Math.floor(usedLicenses * 0.75),
        accountStatus: index < 17 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)],
        monthlyRecurringRevenue: usedLicenses * pricePerStudent,
        supportPriority: tier === 'enterprise' ? 'premium' : tier === 'premium' ? 'priority' : 'standard',
        contactEmail: `admin@${name.toLowerCase().replace(/\s+/g, '')}.edu`,
        contactPhone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        primaryContact: `${['John', 'Sarah', 'Michael', 'Emily', 'David'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][Math.floor(Math.random() * 5)]}`
      };
    });
  }

  private generatePlatformMetrics(): PlatformMetrics {
    const districts = this.districts.filter(d => d.accountStatus === 'active' || d.accountStatus === 'trial');
    return {
      totalDistricts: districts.length,
      activeSchools: districts.reduce((sum, d) => sum + d.totalSchools, 0),
      totalStudentsEnrolled: districts.reduce((sum, d) => sum + d.totalStudents, 0),
      totalTeachersActive: Math.floor(districts.reduce((sum, d) => sum + d.totalStudents, 0) / 20),
      totalAIModels: Math.floor(districts.reduce((sum, d) => sum + d.totalStudents, 0) * 0.7),
      platformUptime: 99.97,
      averageApiResponseTime: 145,
      storageUsageGB: 2847,
      computeResourcesUsed: 78,
      activeUserSessions: 3456,
      totalRevenue: districts.reduce((sum, d) => sum + (d.monthlyRecurringRevenue * 12), 0),
      monthlyRecurringRevenue: districts.reduce((sum, d) => sum + d.monthlyRecurringRevenue, 0)
    };
  }

  private generateSystemHealth(): SystemHealth {
    return {
      status: 'healthy',
      apiStatus: 'operational',
      databaseStatus: 'operational',
      aiServiceStatus: 'operational',
      storageStatus: 'operational',
      errorRate: 0.03,
      databasePerformance: 98.5,
      concurrentSessions: 3456,
      cpuUsage: 45.2,
      memoryUsage: 62.8,
      diskUsage: 73.4
    };
  }

  private generateAIModels(): AIModelMetrics[] {
    const models: AIModelMetrics[] = [];
    const sampleStudents = [
      'Emma Thompson', 'Liam Chen', 'Olivia Rodriguez', 'Noah Patel', 'Ava Johnson',
      'Ethan Williams', 'Sophia Lee', 'Mason Brown', 'Isabella Davis', 'Lucas Martinez'
    ];

    for (let i = 0; i < 50; i++) {
      const createdDate = new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1);
      const lastInference = new Date(2025, 0, Math.floor(Math.random() * 19) + 1);
      
      models.push({
        modelId: `model-${String(i + 1).padStart(6, '0')}`,
        studentId: `student-${i + 1}`,
        studentName: sampleStudents[i % sampleStudents.length],
        districtName: this.districts[i % this.districts.length].name,
        version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 5)}`,
        createdAt: createdDate,
        lastInference,
        totalInferences: Math.floor(Math.random() * 10000) + 1000,
        averageAccuracy: 85 + Math.random() * 12,
        adaptationCount: Math.floor(Math.random() * 100) + 10,
        storageSize: Math.random() * 500 + 50,
        inferenceLatency: Math.random() * 200 + 50,
        errorRate: Math.random() * 2
      });
    }

    return models;
  }

  private generateSupportTickets(): SupportTicket[] {
    const tickets: SupportTicket[] = [];
    const categories: SupportTicket['category'][] = ['technical', 'billing', 'training', 'feature-request', 'bug'];
    const priorities: SupportTicket['priority'][] = ['low', 'medium', 'high', 'critical'];
    const statuses: SupportTicket['status'][] = ['open', 'in-progress', 'waiting-user', 'resolved', 'closed'];
    const userTypes: SupportTicket['userType'][] = ['district-admin', 'teacher', 'parent'];

    const subjects = [
      'Login issues on mobile app',
      'Billing discrepancy for Q4',
      'Request for advanced analytics training',
      'Student progress not syncing',
      'Feature request: Bulk student import',
      'API rate limit too restrictive',
      'Need help with IEP compliance reports',
      'Payment failed - need assistance',
      'Bug: Dashboard not loading',
      'Request demo for new district',
      'Integration with Google Classroom',
      'Password reset not working',
      'Missing data from last week',
      'Upgrade to Enterprise tier',
      'Performance issues during peak hours'
    ];

    for (let i = 0; i < 30; i++) {
      const createdDate = new Date(2025, 0, Math.floor(Math.random() * 19) + 1);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const slaHours = priority === 'critical' ? 4 : priority === 'high' ? 24 : priority === 'medium' ? 48 : 72;
      const district = this.districts[i % this.districts.length];

      tickets.push({
        id: `ticket-${String(i + 1).padStart(6, '0')}`,
        submittedBy: district.primaryContact,
        userType: userTypes[Math.floor(Math.random() * userTypes.length)],
        districtId: district.id,
        districtName: district.name,
        priority,
        category,
        status,
        subject: subjects[i % subjects.length],
        description: `Detailed description of the issue related to ${subjects[i % subjects.length].toLowerCase()}.`,
        attachments: Math.random() > 0.7 ? ['screenshot.png', 'error-log.txt'] : [],
        assignedTo: status !== 'open' ? `Agent ${Math.floor(Math.random() * 10) + 1}` : undefined,
        createdAt: createdDate,
        resolvedAt: status === 'resolved' || status === 'closed' ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        slaDeadline: new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000),
        responseTime: status !== 'open' ? Math.floor(Math.random() * 120) + 10 : undefined,
        resolutionTime: status === 'resolved' || status === 'closed' ? Math.floor(Math.random() * 48) + 1 : undefined
      });
    }

    return tickets;
  }

  private generateFeatureFlags(): FeatureFlag[] {
    return [
      {
        id: 'feature-1',
        name: 'advanced-analytics-dashboard',
        description: 'New advanced analytics dashboard with ML predictions',
        enabled: true,
        rolloutPercentage: 100,
        targetAudience: 'all',
        environment: 'production',
        createdAt: new Date(2024, 10, 15),
        createdBy: 'admin@aivo.com',
        modifiedAt: new Date(2025, 0, 5),
        modifiedBy: 'admin@aivo.com'
      },
      {
        id: 'feature-2',
        name: 'ai-speech-therapy-2.0',
        description: 'Enhanced AI-powered speech therapy with real-time feedback',
        enabled: true,
        rolloutPercentage: 75,
        targetAudience: 'districts',
        environment: 'production',
        createdAt: new Date(2024, 11, 1),
        createdBy: 'product@aivo.com',
        modifiedAt: new Date(2025, 0, 10),
        modifiedBy: 'product@aivo.com'
      },
      {
        id: 'feature-3',
        name: 'bulk-student-import',
        description: 'Import students via CSV upload',
        enabled: false,
        rolloutPercentage: 0,
        targetAudience: 'specific-users',
        environment: 'staging',
        createdAt: new Date(2025, 0, 5),
        createdBy: 'dev@aivo.com',
        modifiedAt: new Date(2025, 0, 15),
        modifiedBy: 'dev@aivo.com'
      },
      {
        id: 'feature-4',
        name: 'mobile-app-offline-mode',
        description: 'Allow app to work offline and sync when connected',
        enabled: true,
        rolloutPercentage: 50,
        targetAudience: 'all',
        environment: 'production',
        createdAt: new Date(2024, 9, 20),
        createdBy: 'mobile@aivo.com',
        modifiedAt: new Date(2025, 0, 8),
        modifiedBy: 'mobile@aivo.com'
      },
      {
        id: 'feature-5',
        name: 'real-time-collaboration',
        description: 'Real-time collaboration between teachers and parents',
        enabled: false,
        rolloutPercentage: 10,
        targetAudience: 'schools',
        environment: 'development',
        createdAt: new Date(2025, 0, 1),
        createdBy: 'product@aivo.com',
        modifiedAt: new Date(2025, 0, 18),
        modifiedBy: 'product@aivo.com'
      },
      {
        id: 'feature-6',
        name: 'gamification-rewards',
        description: 'Gamification system with badges and rewards for students',
        enabled: true,
        rolloutPercentage: 100,
        targetAudience: 'all',
        environment: 'production',
        createdAt: new Date(2024, 8, 10),
        createdBy: 'product@aivo.com',
        modifiedAt: new Date(2024, 11, 20),
        modifiedBy: 'product@aivo.com'
      }
    ];
  }

  private generatePricingTiers(): PricingTier[] {
    return [
      {
        name: 'trial',
        pricePerStudent: 0,
        minimumSeats: 1,
        features: ['Basic activities', 'Standard support', 'Email notifications', '14-day trial'],
        supportLevel: 'Email only',
        contractTerm: 'monthly',
        discount: 0
      },
      {
        name: 'families',
        pricePerStudent: 9.99,
        minimumSeats: 1,
        features: ['All activities', 'Priority support', 'Progress reports', 'Mobile app access', 'Unlimited sessions'],
        supportLevel: 'Email & Chat',
        contractTerm: 'monthly',
        discount: 20
      },
      {
        name: 'schools',
        pricePerStudent: 8,
        minimumSeats: 50,
        features: ['All family features', 'IEP management', 'Teacher dashboard', 'Parent portal', 'Analytics', 'API access'],
        supportLevel: 'Priority support',
        contractTerm: 'annual',
        discount: 25
      },
      {
        name: 'districts',
        pricePerStudent: 12,
        minimumSeats: 500,
        features: ['All school features', 'District dashboard', 'Compliance tracking', 'Custom branding', 'SSO', 'Training'],
        supportLevel: 'Dedicated support',
        contractTerm: 'annual',
        discount: 30
      },
      {
        name: 'enterprise',
        pricePerStudent: 15,
        minimumSeats: 5000,
        features: ['All district features', 'Custom development', 'SLA guarantee', '24/7 support', 'On-premise option', 'White-label'],
        supportLevel: '24/7 Premium',
        contractTerm: 'annual',
        discount: 40
      }
    ];
  }

  private generateUsageAnalytics(): UsageAnalytics[] {
    const analytics: UsageAnalytics[] = [];
    const baseUsers = 15000;

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variance = Math.random() * 0.2 - 0.1;
      const dailyActive = Math.floor(baseUsers * (0.6 + variance));
      const weeklyActive = Math.floor(baseUsers * (0.8 + variance));
      const monthlyActive = Math.floor(baseUsers * (0.95 + variance));

      analytics.push({
        date: date.toISOString().split('T')[0],
        dailyActiveUsers: dailyActive,
        weeklyActiveUsers: weeklyActive,
        monthlyActiveUsers: monthlyActive,
        newUsers: Math.floor(Math.random() * 100) + 20,
        activitiesCompleted: Math.floor(Math.random() * 5000) + 2000,
        averageSessionDuration: Math.floor(Math.random() * 20) + 15,
        retentionRate: 85 + Math.random() * 10
      });
    }

    return analytics;
  }

  private generateContentItems(): ContentItem[] {
    const items: ContentItem[] = [];
    const types: ContentItem['type'][] = ['activity', 'assessment', 'reading', 'math', 'speech', 'science', 'writing'];
    const subjects = ['Reading', 'Math', 'Science', 'Social Studies', 'Language Arts', 'Speech Therapy'];
    const grades = ['Pre-K', 'K', '1', '2', '3', '4', '5'];
    const difficulties: ContentItem['difficultyLevel'][] = ['beginner', 'intermediate', 'advanced'];
    const statuses: ContentItem['status'][] = ['draft', 'review', 'approved', 'published', 'archived'];

    const titles = [
      'Phonics Adventure', 'Multiplication Mastery', 'Science Lab: Plants', 'Creative Writing Workshop',
      'Speech Sounds Practice', 'Reading Comprehension', 'Geometry Basics', 'Historical Timeline',
      'Vocabulary Builder', 'Math Word Problems', 'Biology Basics', 'Grammar Fundamentals',
      'Articulation Exercises', 'Story Sequencing', 'Algebra Introduction', 'Earth Science'
    ];

    for (let i = 0; i < 40; i++) {
      const createdDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      items.push({
        id: `content-${i + 1}`,
        title: titles[i % titles.length],
        type: types[Math.floor(Math.random() * types.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        gradeLevel: grades[Math.floor(Math.random() * grades.length)],
        difficultyLevel: difficulties[Math.floor(Math.random() * difficulties.length)],
        standards: [`CCSS.ELA-LITERACY.RL.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10) + 1}`],
        accessibilityFeatures: ['Text-to-speech', 'High contrast', 'Adjustable font size', 'Audio descriptions'].slice(0, Math.floor(Math.random() * 3) + 1),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdBy: `Teacher ${Math.floor(Math.random() * 20) + 1}`,
        createdAt: createdDate,
        lastModified: new Date(createdDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        usageCount: Math.floor(Math.random() * 1000),
        rating: 3.5 + Math.random() * 1.5
      });
    }

    return items;
  }

  private generateSecurityLogs(): SecurityLog[] {
    const logs: SecurityLog[] = [];
    const eventTypes: SecurityLog['eventType'][] = ['login-success', 'login-failed', 'suspicious-activity', 'data-access', 'api-key-used'];
    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = eventType === 'login-failed' || eventType === 'suspicious-activity' ? 'warning' : 'info';

      logs.push({
        id: `log-${i + 1}`,
        timestamp,
        eventType,
        userId: `user-${Math.floor(Math.random() * 1000) + 1}`,
        userName: `${['Admin', 'Teacher', 'Parent'][Math.floor(Math.random() * 3)]} ${Math.floor(Math.random() * 100)}`,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: `${eventType} event for user account`,
        severity
      });
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateDatabaseMetrics(): DatabaseMetrics {
    return {
      totalQueries: 1247583,
      averageQueryTime: 45.2,
      slowQueries: 237,
      activeConnections: 156,
      databaseSize: 847.5,
      indexEfficiency: 94.7,
      cacheHitRate: 97.3,
      replicationLag: 0.8
    };
  }

  // Public getter methods
  public getDistricts(): District[] {
    return this.districts;
  }

  public getPlatformMetrics(): PlatformMetrics {
    return this.platformMetrics;
  }

  public getSystemHealth(): SystemHealth {
    return this.systemHealth;
  }

  public getAIModels(): AIModelMetrics[] {
    return this.aiModels;
  }

  public getSupportTickets(): SupportTicket[] {
    return this.supportTickets;
  }

  public getFeatureFlags(): FeatureFlag[] {
    return this.featureFlags;
  }

  public getPricingTiers(): PricingTier[] {
    return this.pricingTiers;
  }

  public getUsageAnalytics(): UsageAnalytics[] {
    return this.usageAnalytics;
  }

  public getContentItems(): ContentItem[] {
    return this.contentItems;
  }

  public getSecurityLogs(): SecurityLog[] {
    return this.securityLogs;
  }

  public getDatabaseMetrics(): DatabaseMetrics {
    return this.databaseMetrics;
  }
}

// Export singleton instance methods
const mockDataService = MockDataService.getInstance();

export const getDistricts = () => mockDataService.getDistricts();
export const getPlatformMetrics = () => mockDataService.getPlatformMetrics();
export const getSystemHealth = () => mockDataService.getSystemHealth();
export const getAIModels = () => mockDataService.getAIModels();
export const getSupportTickets = () => mockDataService.getSupportTickets();
export const getFeatureFlags = () => mockDataService.getFeatureFlags();
export const getPricingTiers = () => mockDataService.getPricingTiers();
export const getUsageAnalytics = () => mockDataService.getUsageAnalytics();
export const getContentItems = () => mockDataService.getContentItems();
export const getSecurityLogs = () => mockDataService.getSecurityLogs();
export const getDatabaseMetrics = () => mockDataService.getDatabaseMetrics();
