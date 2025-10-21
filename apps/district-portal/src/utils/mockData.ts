/**
 * District Portal Mock Data
 * Comprehensive mock data for district-level administrator portal
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface School {
  id: string;
  name: string;
  principal: string;
  principalEmail: string;
  principalPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  iepComplianceRate: number;
  averageProgress: number;
  licenseCount: number;
  licenseUsage: number;
  establishedDate: Date;
  lastActivityDate: Date;
  performance: {
    reading: number;
    math: number;
    speech: number;
  };
  specialEducationStats: {
    totalIEPs: number;
    activeIEPs: number;
    overdueReviews: number;
  };
}

export interface DistrictUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'district-admin' | 'school-admin' | 'teacher' | 'parent' | 'support-staff';
  schoolId?: string;
  schoolName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
  accountCreated: Date;
  licenseAssigned: boolean;
  permissions: string[];
  usageStats: {
    loginCount: number;
    featuresUsed: string[];
    lastFeatureUsed: string;
  };
}

export interface ComplianceMetrics {
  totalIEPs: number;
  compliantIEPs: number;
  overdueReviews: number;
  upcomingReviews: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
  progressReportsOnTime: number;
  progressReportsTotal: number;
  evaluationsDue: number;
  evaluationsCompleted: number;
  complianceBySchool: Array<{
    schoolId: string;
    schoolName: string;
    complianceRate: number;
    overdueCount: number;
  }>;
  complianceByTeacher: Array<{
    teacherId: string;
    teacherName: string;
    schoolName: string;
    totalIEPs: number;
    compliantIEPs: number;
    overdueCount: number;
  }>;
}

export interface DistrictMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalSchools: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  iepComplianceRate: number;
  averageStudentProgress: number;
  licenseUtilization: number;
  supportTicketsOpen: number;
  supportTicketsResolved: number;
  parentEngagementRate: number;
  teacherAdoptionRate: number;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: 'SIS' | 'LMS' | 'Communication' | 'Assessment' | 'Authentication';
  provider: string;
  status: 'active' | 'error' | 'inactive' | 'syncing';
  lastSync: Date;
  nextScheduledSync: Date;
  syncFrequency: string;
  recordsSynced: number;
  errorCount: number;
  errorMessage?: string;
  dataMapping: {
    students: boolean;
    teachers: boolean;
    classes: boolean;
    grades: boolean;
  };
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'training' | 'billing' | 'feature-request' | 'bug-report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submittedBy: string;
  submittedByRole: string;
  schoolName: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
}

export interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'guide' | 'template' | 'workshop' | 'certification';
  category: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionCount: number;
  rating: number;
  url: string;
  thumbnailUrl: string;
}

export interface EngagementTrend {
  date: string;
  activeUsers: number;
  activeTeachers: number;
  activeParents: number;
  activeStudents: number;
  sessions: number;
  avgSessionDuration: number; // in minutes
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const schoolNames = [
  'Lincoln Elementary School',
  'Washington Middle School',
  'Roosevelt High School',
  'Jefferson Elementary School',
  'Madison Middle School',
  'Monroe High School',
  'Kennedy Elementary School',
  'Eisenhower Middle School',
  'Truman High School',
  'Adams Elementary School',
  'Jackson Middle School',
  'Wilson High School',
];

const principals = [
  { name: 'Dr. Michael Chen', email: 'mchen@district.edu', phone: '(555) 101-2001' },
  { name: 'Ms. Sarah Thompson', email: 'sthompson@district.edu', phone: '(555) 101-2002' },
  { name: 'Dr. James Rodriguez', email: 'jrodriguez@district.edu', phone: '(555) 101-2003' },
  { name: 'Ms. Emily Davis', email: 'edavis@district.edu', phone: '(555) 101-2004' },
  { name: 'Mr. Robert Wilson', email: 'rwilson@district.edu', phone: '(555) 101-2005' },
  { name: 'Dr. Lisa Anderson', email: 'landerson@district.edu', phone: '(555) 101-2006' },
  { name: 'Ms. Maria Garcia', email: 'mgarcia@district.edu', phone: '(555) 101-2007' },
  { name: 'Dr. David Martinez', email: 'dmartinez@district.edu', phone: '(555) 101-2008' },
  { name: 'Ms. Jennifer Lee', email: 'jlee@district.edu', phone: '(555) 101-2009' },
  { name: 'Mr. Christopher Brown', email: 'cbrown@district.edu', phone: '(555) 101-2010' },
  { name: 'Dr. Patricia Taylor', email: 'ptaylor@district.edu', phone: '(555) 101-2011' },
  { name: 'Ms. Amanda White', email: 'awhite@district.edu', phone: '(555) 101-2012' },
];

const addresses = [
  { address: '123 Oak Street', city: 'Springfield', state: 'IL', zipCode: '62701' },
  { address: '456 Maple Avenue', city: 'Springfield', state: 'IL', zipCode: '62702' },
  { address: '789 Pine Road', city: 'Springfield', state: 'IL', zipCode: '62703' },
  { address: '321 Elm Boulevard', city: 'Springfield', state: 'IL', zipCode: '62704' },
  { address: '654 Cedar Lane', city: 'Springfield', state: 'IL', zipCode: '62705' },
  { address: '987 Birch Drive', city: 'Springfield', state: 'IL', zipCode: '62706' },
  { address: '147 Willow Court', city: 'Springfield', state: 'IL', zipCode: '62707' },
  { address: '258 Spruce Way', city: 'Springfield', state: 'IL', zipCode: '62708' },
  { address: '369 Ash Street', city: 'Springfield', state: 'IL', zipCode: '62709' },
  { address: '741 Poplar Avenue', city: 'Springfield', state: 'IL', zipCode: '62710' },
  { address: '852 Hickory Road', city: 'Springfield', state: 'IL', zipCode: '62711' },
  { address: '963 Walnut Boulevard', city: 'Springfield', state: 'IL', zipCode: '62712' },
];

function generateSchools(): School[] {
  return schoolNames.map((name, index) => {
    const totalStudents = Math.floor(Math.random() * 400) + 200;
    const totalTeachers = Math.floor(totalStudents / 15) + 5;
    const activeStudents = Math.floor(totalStudents * (0.85 + Math.random() * 0.1));
    const activeTeachers = Math.floor(totalTeachers * (0.9 + Math.random() * 0.1));
    const licenseCount = totalTeachers + 5;
    const licenseUsage = activeTeachers;
    const totalIEPs = Math.floor(totalStudents * 0.15);
    const activeIEPs = Math.floor(totalIEPs * 0.95);

    return {
      id: `school-${index + 1}`,
      name,
      principal: principals[index].name,
      principalEmail: principals[index].email,
      principalPhone: principals[index].phone,
      address: addresses[index].address,
      city: addresses[index].city,
      state: addresses[index].state,
      zipCode: addresses[index].zipCode,
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      iepComplianceRate: Math.floor(Math.random() * 15) + 85,
      averageProgress: Math.floor(Math.random() * 20) + 70,
      licenseCount,
      licenseUsage,
      establishedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
      lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      performance: {
        reading: Math.floor(Math.random() * 20) + 75,
        math: Math.floor(Math.random() * 20) + 72,
        speech: Math.floor(Math.random() * 20) + 78,
      },
      specialEducationStats: {
        totalIEPs,
        activeIEPs,
        overdueReviews: Math.floor(Math.random() * 5),
      },
    };
  });
}

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function generateUsers(schools: School[]): DistrictUser[] {
  const users: DistrictUser[] = [];
  let userId = 1;

  // Generate district admins (3)
  for (let i = 0; i < 3; i++) {
    users.push({
      id: `user-${userId++}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `admin${i + 1}@district.edu`,
      phone: `(555) 200-${1000 + i}`,
      role: 'district-admin',
      status: 'active',
      lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      accountCreated: new Date(2023, 0, 1),
      licenseAssigned: true,
      permissions: ['all'],
      usageStats: {
        loginCount: Math.floor(Math.random() * 500) + 200,
        featuresUsed: ['dashboard', 'reports', 'schools', 'users', 'compliance'],
        lastFeatureUsed: 'dashboard',
      },
    });
  }

  // Generate school admins (1 per school)
  schools.forEach((school, index) => {
    users.push({
      id: `user-${userId++}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `admin.${school.name.toLowerCase().replace(/\s+/g, '.')}@district.edu`,
      phone: `(555) 300-${1000 + index}`,
      role: 'school-admin',
      schoolId: school.id,
      schoolName: school.name,
      status: 'active',
      lastLogin: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
      accountCreated: new Date(2023, Math.floor(Math.random() * 12), 1),
      licenseAssigned: true,
      permissions: ['school-management', 'reports', 'users'],
      usageStats: {
        loginCount: Math.floor(Math.random() * 300) + 100,
        featuresUsed: ['dashboard', 'students', 'teachers', 'reports'],
        lastFeatureUsed: 'students',
      },
    });
  });

  // Generate teachers (5-8 per school)
  schools.forEach((school) => {
    const teacherCount = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < teacherCount; i++) {
      users.push({
        id: `user-${userId++}`,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        email: `teacher${userId}@district.edu`,
        phone: `(555) 400-${1000 + userId}`,
        role: 'teacher',
        schoolId: school.id,
        schoolName: school.name,
        status: Math.random() > 0.9 ? 'inactive' : 'active',
        lastLogin: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000),
        accountCreated: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        licenseAssigned: Math.random() > 0.1,
        permissions: ['classroom', 'iep-management', 'activities'],
        usageStats: {
          loginCount: Math.floor(Math.random() * 200) + 50,
          featuresUsed: ['students', 'iep-goals', 'activities', 'messages'],
          lastFeatureUsed: ['students', 'iep-goals', 'activities'][Math.floor(Math.random() * 3)],
        },
      });
    }
  });

  // Generate parents (20)
  for (let i = 0; i < 20; i++) {
    const school = schools[Math.floor(Math.random() * schools.length)];
    users.push({
      id: `user-${userId++}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `parent${i + 1}@email.com`,
      phone: `(555) 500-${1000 + i}`,
      role: 'parent',
      schoolId: school.id,
      schoolName: school.name,
      status: Math.random() > 0.85 ? 'pending' : 'active',
      lastLogin: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000),
      accountCreated: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      licenseAssigned: false,
      permissions: ['parent-dashboard', 'messages', 'progress-reports'],
      usageStats: {
        loginCount: Math.floor(Math.random() * 100) + 10,
        featuresUsed: ['dashboard', 'messages', 'progress'],
        lastFeatureUsed: ['dashboard', 'messages'][Math.floor(Math.random() * 2)],
      },
    });
  }

  return users;
}

function generateComplianceMetrics(schools: School[], users: DistrictUser[]): ComplianceMetrics {
  const totalIEPs = schools.reduce((sum, school) => sum + school.specialEducationStats.totalIEPs, 0);
  const compliantIEPs = Math.floor(totalIEPs * 0.92);
  const overdueReviews = totalIEPs - compliantIEPs;

  const complianceBySchool = schools.map(school => ({
    schoolId: school.id,
    schoolName: school.name,
    complianceRate: school.iepComplianceRate,
    overdueCount: school.specialEducationStats.overdueReviews,
  }));

  const teachers = users.filter(u => u.role === 'teacher' && u.status === 'active');
  const complianceByTeacher = teachers.slice(0, 15).map(teacher => {
    const teacherIEPs = Math.floor(Math.random() * 8) + 3;
    const compliant = Math.floor(teacherIEPs * (0.85 + Math.random() * 0.15));
    return {
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      schoolName: teacher.schoolName || 'Unknown',
      totalIEPs: teacherIEPs,
      compliantIEPs: compliant,
      overdueCount: teacherIEPs - compliant,
    };
  });

  return {
    totalIEPs,
    compliantIEPs,
    overdueReviews,
    upcomingReviews: {
      next30Days: Math.floor(totalIEPs * 0.15),
      next60Days: Math.floor(totalIEPs * 0.25),
      next90Days: Math.floor(totalIEPs * 0.35),
    },
    progressReportsOnTime: Math.floor(totalIEPs * 0.88),
    progressReportsTotal: totalIEPs,
    evaluationsDue: Math.floor(totalIEPs * 0.12),
    evaluationsCompleted: Math.floor(totalIEPs * 0.10),
    complianceBySchool,
    complianceByTeacher,
  };
}

function generateDistrictMetrics(schools: School[], users: DistrictUser[]): DistrictMetrics {
  const totalStudents = schools.reduce((sum, school) => sum + school.totalStudents, 0);
  const activeStudents = schools.reduce((sum, school) => sum + school.activeStudents, 0);
  const totalTeachers = schools.reduce((sum, school) => sum + school.totalTeachers, 0);
  const activeTeachers = schools.reduce((sum, school) => sum + school.activeTeachers, 0);
  const totalLicenses = schools.reduce((sum, school) => sum + school.licenseCount, 0);
  const usedLicenses = schools.reduce((sum, school) => sum + school.licenseUsage, 0);

  return {
    totalStudents,
    activeStudents,
    totalTeachers,
    activeTeachers,
    totalSchools: schools.length,
    activeUsersToday: Math.floor(totalTeachers * 0.65) + Math.floor(users.filter(u => u.role === 'parent').length * 0.15),
    activeUsersThisWeek: Math.floor(totalTeachers * 0.85) + Math.floor(users.filter(u => u.role === 'parent').length * 0.45),
    iepComplianceRate: Math.floor(schools.reduce((sum, school) => sum + school.iepComplianceRate, 0) / schools.length),
    averageStudentProgress: Math.floor(schools.reduce((sum, school) => sum + school.averageProgress, 0) / schools.length),
    licenseUtilization: Math.floor((usedLicenses / totalLicenses) * 100),
    supportTicketsOpen: 12,
    supportTicketsResolved: 145,
    parentEngagementRate: 68,
    teacherAdoptionRate: 87,
  };
}

function generateIntegrations(): IntegrationStatus[] {
  return [
    {
      id: 'int-1',
      name: 'PowerSchool SIS',
      type: 'SIS',
      provider: 'PowerSchool',
      status: 'active',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 22 * 60 * 60 * 1000),
      syncFrequency: 'Daily at 2:00 AM',
      recordsSynced: 3847,
      errorCount: 0,
      dataMapping: {
        students: true,
        teachers: true,
        classes: true,
        grades: true,
      },
    },
    {
      id: 'int-2',
      name: 'Google Classroom',
      type: 'LMS',
      provider: 'Google',
      status: 'active',
      lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 20 * 60 * 60 * 1000),
      syncFrequency: 'Every 6 hours',
      recordsSynced: 1256,
      errorCount: 2,
      errorMessage: '2 classrooms failed to sync - retrying',
      dataMapping: {
        students: true,
        teachers: true,
        classes: true,
        grades: false,
      },
    },
    {
      id: 'int-3',
      name: 'Microsoft Teams',
      type: 'Communication',
      provider: 'Microsoft',
      status: 'active',
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 5 * 60 * 60 * 1000),
      syncFrequency: 'Every 6 hours',
      recordsSynced: 2134,
      errorCount: 0,
      dataMapping: {
        students: false,
        teachers: true,
        classes: true,
        grades: false,
      },
    },
    {
      id: 'int-4',
      name: 'Canvas LMS',
      type: 'LMS',
      provider: 'Instructure',
      status: 'error',
      lastSync: new Date(Date.now() - 26 * 60 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 2 * 60 * 60 * 1000),
      syncFrequency: 'Daily at 3:00 AM',
      recordsSynced: 0,
      errorCount: 5,
      errorMessage: 'Authentication failed - API key expired',
      dataMapping: {
        students: true,
        teachers: true,
        classes: true,
        grades: true,
      },
    },
    {
      id: 'int-5',
      name: 'NWEA MAP',
      type: 'Assessment',
      provider: 'NWEA',
      status: 'active',
      lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 12 * 60 * 60 * 1000),
      syncFrequency: 'Weekly on Mondays',
      recordsSynced: 892,
      errorCount: 1,
      errorMessage: '1 student record missing - manual review needed',
      dataMapping: {
        students: true,
        teachers: false,
        classes: false,
        grades: true,
      },
    },
    {
      id: 'int-6',
      name: 'ParentSquare',
      type: 'Communication',
      provider: 'ParentSquare',
      status: 'syncing',
      lastSync: new Date(Date.now() - 10 * 60 * 1000),
      nextScheduledSync: new Date(Date.now() + 5 * 60 * 60 * 1000),
      syncFrequency: 'Real-time',
      recordsSynced: 456,
      errorCount: 0,
      dataMapping: {
        students: true,
        teachers: false,
        classes: false,
        grades: false,
      },
    },
  ];
}

function generateSupportTickets(schools: School[]): SupportTicket[] {
  const categories: SupportTicket['category'][] = ['technical', 'training', 'billing', 'feature-request', 'bug-report'];
  const priorities: SupportTicket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const statuses: SupportTicket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];

  const ticketTitles = [
    'Unable to access IEP dashboard',
    'Request training on progress monitoring features',
    'Billing discrepancy for October licenses',
    'Add bulk student import feature',
    'Student progress not updating correctly',
    'Need help setting up Google Classroom integration',
    'Reports not generating PDF exports',
    'Request additional user licenses',
    'Mobile app login issues',
    'Data not syncing from SIS',
    'Parent portal access problems',
    'Feature request: Custom report templates',
  ];

  return ticketTitles.map((title, index) => ({
    id: `ticket-${index + 1}`,
    title,
    description: `Detailed description of the issue: ${title.toLowerCase()}. Please investigate and resolve as soon as possible.`,
    category: categories[index % categories.length],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    submittedBy: `User ${index + 1}`,
    submittedByRole: ['teacher', 'school-admin', 'district-admin'][Math.floor(Math.random() * 3)],
    schoolName: schools[Math.floor(Math.random() * schools.length)].name,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    assignedTo: Math.random() > 0.3 ? 'Support Team' : undefined,
    responseTime: Math.random() > 0.5 ? Math.floor(Math.random() * 48) + 1 : undefined,
    resolutionTime: Math.random() > 0.6 ? Math.floor(Math.random() * 120) + 4 : undefined,
  }));
}

function generateTrainingResources(): TrainingResource[] {
  return [
    {
      id: 'train-1',
      title: 'Getting Started with Aivo Learning',
      description: 'Complete introduction to the platform for new teachers',
      type: 'video',
      category: 'Platform Basics',
      duration: 45,
      difficulty: 'beginner',
      completionCount: 234,
      rating: 4.8,
      url: '/training/getting-started',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Getting+Started',
    },
    {
      id: 'train-2',
      title: 'Writing Effective IEP Goals',
      description: 'Best practices for creating measurable and achievable IEP goals',
      type: 'guide',
      category: 'IEP Management',
      duration: 30,
      difficulty: 'intermediate',
      completionCount: 189,
      rating: 4.9,
      url: '/training/iep-goals',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=IEP+Goals',
    },
    {
      id: 'train-3',
      title: 'Progress Monitoring Strategies',
      description: 'Learn how to effectively track and document student progress',
      type: 'video',
      category: 'Assessment',
      duration: 60,
      difficulty: 'intermediate',
      completionCount: 156,
      rating: 4.7,
      url: '/training/progress-monitoring',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Progress+Monitoring',
    },
    {
      id: 'train-4',
      title: 'Accommodation Templates Library',
      description: 'Ready-to-use accommodation strategies for various needs',
      type: 'template',
      category: 'Resources',
      duration: 15,
      difficulty: 'beginner',
      completionCount: 312,
      rating: 4.6,
      url: '/training/accommodations',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Accommodations',
    },
    {
      id: 'train-5',
      title: 'Data Analysis Workshop',
      description: 'Advanced workshop on analyzing student performance data',
      type: 'workshop',
      category: 'Data & Reporting',
      duration: 120,
      difficulty: 'advanced',
      completionCount: 87,
      rating: 4.9,
      url: '/training/data-analysis',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Data+Analysis',
    },
    {
      id: 'train-6',
      title: 'Special Education Certification',
      description: 'Complete certification program for special education teachers',
      type: 'certification',
      category: 'Professional Development',
      duration: 480,
      difficulty: 'advanced',
      completionCount: 45,
      rating: 5.0,
      url: '/training/certification',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=Certification',
    },
  ];
}

function generateEngagementTrends(): EngagementTrend[] {
  const trends: EngagementTrend[] = [];
  const baseActiveUsers = 450;
  const baseTeachers = 120;
  const baseParents = 180;
  const baseStudents = 1500;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 0.3 : 1;

    trends.push({
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor((baseActiveUsers + baseActiveUsers * variance) * weekendMultiplier),
      activeTeachers: Math.floor((baseTeachers + baseTeachers * variance) * weekendMultiplier),
      activeParents: Math.floor((baseParents + baseParents * variance) * weekendMultiplier),
      activeStudents: Math.floor((baseStudents + baseStudents * variance) * weekendMultiplier),
      sessions: Math.floor((850 + 850 * variance) * weekendMultiplier),
      avgSessionDuration: Math.floor(22 + Math.random() * 8),
    });
  }

  return trends;
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let schoolsInstance: School[] | null = null;
let usersInstance: DistrictUser[] | null = null;
let complianceInstance: ComplianceMetrics | null = null;
let metricsInstance: DistrictMetrics | null = null;
let integrationsInstance: IntegrationStatus[] | null = null;
let ticketsInstance: SupportTicket[] | null = null;
let trainingInstance: TrainingResource[] | null = null;
let trendsInstance: EngagementTrend[] | null = null;

export function getSchools(): School[] {
  if (!schoolsInstance) {
    schoolsInstance = generateSchools();
  }
  return schoolsInstance;
}

export function getSchoolById(id: string): School | undefined {
  return getSchools().find(school => school.id === id);
}

export function getUsers(): DistrictUser[] {
  if (!usersInstance) {
    usersInstance = generateUsers(getSchools());
  }
  return usersInstance;
}

export function getUserById(id: string): DistrictUser | undefined {
  return getUsers().find(user => user.id === id);
}

export function getComplianceMetrics(): ComplianceMetrics {
  if (!complianceInstance) {
    complianceInstance = generateComplianceMetrics(getSchools(), getUsers());
  }
  return complianceInstance;
}

export function getDistrictMetrics(): DistrictMetrics {
  if (!metricsInstance) {
    metricsInstance = generateDistrictMetrics(getSchools(), getUsers());
  }
  return metricsInstance;
}

export function getIntegrations(): IntegrationStatus[] {
  if (!integrationsInstance) {
    integrationsInstance = generateIntegrations();
  }
  return integrationsInstance;
}

export function getSupportTickets(): SupportTicket[] {
  if (!ticketsInstance) {
    ticketsInstance = generateSupportTickets(getSchools());
  }
  return ticketsInstance;
}

export function getTrainingResources(): TrainingResource[] {
  if (!trainingInstance) {
    trainingInstance = generateTrainingResources();
  }
  return trainingInstance;
}

export function getEngagementTrends(): EngagementTrend[] {
  if (!trendsInstance) {
    trendsInstance = generateEngagementTrends();
  }
  return trendsInstance;
}
