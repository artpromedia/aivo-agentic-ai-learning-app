/**
 * Mock Data Generators for Teacher Portal
 * Comprehensive data for students, IEP goals, activities, messages, and analytics
 */

// ============================================================================
// Student Data
// ============================================================================

export interface StudentData {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  iepStatus: 'active' | 'in-progress' | 'review-due';
  lastActive: Date;
  overallProgress: number;
  currentLevel: {
    reading: string;
    math: string;
  };
  alerts: string[];
  currentActivity?: {
    subject: string;
    activityName: string;
    startedAt: Date;
    accuracy: number;
    questionsCompleted: number;
    totalQuestions: number;
  };
  performance: {
    reading: number;
    math: number;
    speech: number;
    socialSkills: number;
  };
  engagementMetrics: {
    averageSessionDuration: number; // minutes
    activeDaysThisWeek: number;
    completionRate: number;
    motivationScore: number;
  };
  iepGoals: IEPGoalData[];
  parentInfo: {
    name: string;
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone' | 'text';
    lastMessageDate: Date;
  };
  accommodations: string[];
  notes: string;
}

export interface IEPGoalData {
  id: string;
  domain: 'reading' | 'math' | 'speech' | 'social-emotional' | 'motor-skills';
  description: string;
  measurableObjective: string;
  targetDate: Date;
  progress: number;
  status: 'on-track' | 'needs-support' | 'exceeded' | 'discontinued';
  activitiesCompleted: number;
  totalActivities: number;
  lastActivity: Date;
  evidence: string[];
  teacherNotes: string[];
}

export interface ActivityData {
  id: string;
  name: string;
  subject: 'reading' | 'math' | 'speech' | 'social-emotional';
  standard: string;
  difficulty: number;
  duration: number;
  completionRate: number;
  averageAccuracy: number;
  assignedStudents: number;
  description: string;
  skills: string[];
}

export interface MessageData {
  id: string;
  parentName: string;
  studentName: string;
  subject: string;
  preview: string;
  fullMessage: string;
  timestamp: Date;
  isRead: boolean;
  hasAttachment: boolean;
  thread: {
    id: string;
    messageCount: number;
  };
}

export interface AnalyticsDataType {
  classroomSummary: {
    totalStudents: number;
    activeToday: number;
    averageProgress: number;
    iepGoalsOnTrack: number;
    interventionsNeeded: number;
  };
  subjectTrends: {
    subject: string;
    weeklyData: { date: string; averageScore: number }[];
    improvement: number;
  }[];
  engagementMetrics: {
    dailyActiveUsers: { date: string; count: number }[];
    averageSessionDuration: number;
    completionRates: { week: string; rate: number }[];
  };
  iepMastery: {
    domain: string;
    goalsTotal: number;
    goalsOnTrack: number;
    goalsMastered: number;
    goalsNeedingSupport: number;
  }[];
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

const subjects = ['reading', 'math', 'speech', 'social-emotional'] as const;

const activities = [
  { name: 'Phonics Practice', subject: 'reading', standard: 'RF.K.2' },
  { name: 'Number Recognition', subject: 'math', standard: 'K.CC.A.3' },
  { name: 'Sight Words Level 1', subject: 'reading', standard: 'RF.K.3' },
  { name: 'Counting Objects', subject: 'math', standard: 'K.CC.B.5' },
  { name: 'Articulation Practice', subject: 'speech', standard: 'SL.K.6' },
  { name: 'Pattern Recognition', subject: 'math', standard: 'K.G.B.4' },
  { name: 'Reading Comprehension', subject: 'reading', standard: 'RL.1.1' },
  { name: 'Addition Facts', subject: 'math', standard: '1.OA.C.6' },
  { name: 'Emotion Recognition', subject: 'social-emotional', standard: 'SEL.1.A' },
  { name: 'Story Sequencing', subject: 'reading', standard: 'RL.1.3' },
];

const accommodations = [
  'Extended time (1.5x)',
  'Read-aloud support',
  'Reduced answer choices',
  'Frequent breaks',
  'Visual supports',
  'Quiet workspace',
  'Assistive technology',
  'Preferential seating',
  'Reduced workload',
  'Modified assignments',
];

export function generateStudents(count: number = 24): StudentData[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    
    const lastActive = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const isActiveNow = Math.random() > 0.7;
    
    const iepGoals = generateIEPGoals(Math.floor(Math.random() * 3) + 3);
    const overallProgress = Math.floor(
      iepGoals.reduce((sum, goal) => sum + goal.progress, 0) / iepGoals.length
    );
    
    const alerts: string[] = [];
    if (overallProgress < 60) alerts.push('Low progress');
    if (lastActive < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) alerts.push('Inactive');
    if (Math.random() > 0.8) alerts.push('IEP review due');
    
    const grades = ['K', '1st', '2nd', '3rd'];
    const currentActivity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
      id: `student-${i + 1}`,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      grade: grades[Math.floor(Math.random() * 4)] || 'K',
      iepStatus: ['active', 'in-progress', 'review-due'][
        Math.floor(Math.random() * 3)
      ] as 'active' | 'in-progress' | 'review-due',
      lastActive,
      overallProgress,
      currentLevel: {
        reading: ['Pre-K', 'K', '1st', '2nd'][Math.floor(Math.random() * 4)] || 'K',
        math: ['Pre-K', 'K', '1st', '2nd'][Math.floor(Math.random() * 4)] || 'K',
      },
      alerts,
      currentActivity: isActiveNow ? {
        subject: subjects[Math.floor(Math.random() * subjects.length)] || 'reading',
        activityName: currentActivity?.name || 'Unknown Activity',
        startedAt: new Date(Date.now() - Math.random() * 30 * 60 * 1000),
        accuracy: Math.floor(Math.random() * 40) + 60,
        questionsCompleted: Math.floor(Math.random() * 8) + 2,
        totalQuestions: 10,
      } : undefined,
      performance: {
        reading: Math.floor(Math.random() * 40) + 60,
        math: Math.floor(Math.random() * 40) + 60,
        speech: Math.floor(Math.random() * 40) + 60,
        socialSkills: Math.floor(Math.random() * 40) + 60,
      },
      engagementMetrics: {
        averageSessionDuration: Math.floor(Math.random() * 20) + 15,
        activeDaysThisWeek: Math.floor(Math.random() * 6) + 1,
        completionRate: Math.floor(Math.random() * 30) + 70,
        motivationScore: Math.floor(Math.random() * 30) + 70,
      },
      iepGoals,
      parentInfo: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        email: `${firstName?.toLowerCase() || 'parent'}.${lastName?.toLowerCase() || 'family'}@example.com`,
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        preferredContact: ['email', 'phone', 'text'][
          Math.floor(Math.random() * 3)
        ] as 'email' | 'phone' | 'text',
        lastMessageDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      },
      accommodations: accommodations
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 2),
      notes: 'Student shows strong progress in visual learning tasks. Benefits from movement breaks.',
    };
  });
}

export function generateIEPGoals(count: number = 5): IEPGoalData[] {
  const goalTemplates = [
    {
      domain: 'reading' as const,
      description: 'Improve reading fluency',
      measurableObjective: 'Student will read grade-level text at 90 words per minute with 95% accuracy',
    },
    {
      domain: 'math' as const,
      description: 'Master addition facts',
      measurableObjective: 'Student will solve 20 addition problems within 5 minutes with 90% accuracy',
    },
    {
      domain: 'speech' as const,
      description: 'Improve articulation',
      measurableObjective: 'Student will correctly pronounce /r/ sound in 80% of opportunities',
    },
    {
      domain: 'social-emotional' as const,
      description: 'Develop self-regulation skills',
      measurableObjective: 'Student will use coping strategies when frustrated in 4/5 opportunities',
    },
    {
      domain: 'reading' as const,
      description: 'Increase reading comprehension',
      measurableObjective: 'Student will answer 4/5 comprehension questions correctly after reading',
    },
    {
      domain: 'math' as const,
      description: 'Understand place value',
      measurableObjective: 'Student will identify tens and ones in numbers to 100 with 85% accuracy',
    },
    {
      domain: 'motor-skills' as const,
      description: 'Improve fine motor control',
      measurableObjective: 'Student will write letters correctly on lines in 90% of attempts',
    },
  ];

  return Array.from({ length: count }, (_, i): IEPGoalData => {
    const template = goalTemplates[i % goalTemplates.length];
    if (!template) throw new Error('No goal templates available');
    
    const progress = Math.floor(Math.random() * 100);
    const status: IEPGoalData['status'] =
      progress >= 90 ? 'exceeded' :
      progress >= 60 ? 'on-track' :
      progress >= 30 ? 'needs-support' : 'needs-support';
    
    const totalActivities = Math.floor(Math.random() * 20) + 10;
    const activitiesCompleted = Math.floor(totalActivities * (progress / 100));

    return {
      id: `goal-${i + 1}`,
      domain: template.domain,
      description: template.description,
      measurableObjective: template.measurableObjective,
      targetDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
      progress,
      status,
      activitiesCompleted,
      totalActivities,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      evidence: [
        'Work sample from Nov 15 showing 85% accuracy',
        'Teacher observation: Student independently used strategy 3 times',
        'Progress monitoring data: 78% on weekly assessment',
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      teacherNotes: [
        'Student responds well to visual supports',
        'Needs frequent breaks to maintain focus',
      ].slice(0, Math.floor(Math.random() * 2) + 1),
    };
  });
}

export function generateActivities(count: number = 20): ActivityData[] {
  return Array.from({ length: count }, (_, i): ActivityData => {
    const activity = activities[i % activities.length];
    if (!activity) throw new Error('No activities available');
    
    return {
      id: `activity-${i + 1}`,
      name: activity.name,
      subject: activity.subject as 'reading' | 'math' | 'speech' | 'social-emotional',
      standard: activity.standard,
      difficulty: Math.floor(Math.random() * 5) + 1,
      duration: Math.floor(Math.random() * 20) + 10,
      completionRate: Math.floor(Math.random() * 30) + 70,
      averageAccuracy: Math.floor(Math.random() * 30) + 70,
      assignedStudents: Math.floor(Math.random() * 15) + 5,
      description: `Engaging ${activity.subject} activity aligned to ${activity.standard}`,
      skills: [
        'Pattern recognition',
        'Critical thinking',
        'Memory',
        'Problem solving',
      ].slice(0, Math.floor(Math.random() * 3) + 1),
    };
  });
}

export function generateMessages(count: number = 15): MessageData[] {
  const messageSubjects = [
    'Question about homework',
    'Thank you for the progress report',
    'Concerns about recent behavior',
    'Schedule parent-teacher conference',
    'Update on IEP meeting',
    'Request for additional support',
    'Celebrating recent progress!',
    'Absence notification',
    'Question about accommodations',
    'Field trip permission',
  ];

  const students = generateStudents(10);

  const messages = Array.from({ length: count }, (_, i) => {
    const student = students[i % students.length];
    if (!student) throw new Error('No students available');
    
    const subject = messageSubjects[i % messageSubjects.length] || 'General message';
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id: `message-${i + 1}`,
      parentName: student.parentInfo.name,
      studentName: student.name,
      subject,
      preview: `Hi, I wanted to discuss ${student.name}'s recent progress...`,
      fullMessage: `Hi,\n\nI wanted to discuss ${student.name}'s recent progress. I've noticed some improvements in their work, and I'm wondering if we could schedule a time to talk about next steps.\n\nThank you,\n${student.parentInfo.name}`,
      timestamp,
      isRead: Math.random() > 0.3,
      hasAttachment: Math.random() > 0.7,
      thread: {
        id: `thread-${Math.floor(i / 2) + 1}`,
        messageCount: Math.floor(Math.random() * 5) + 1,
      },
    };
  });
  
  return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateAnalytics(): AnalyticsDataType {
  const students = generateStudents(24);
  
  return {
    classroomSummary: {
      totalStudents: students.length,
      activeToday: students.filter(s => s.currentActivity).length,
      averageProgress: Math.floor(
        students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length
      ),
      iepGoalsOnTrack: students.flatMap(s => s.iepGoals).filter(g => g.status === 'on-track' || g.status === 'exceeded').length,
      interventionsNeeded: students.filter(s => s.alerts.length > 0).length,
    },
    subjectTrends: subjects.map(subject => ({
      subject,
      weeklyData: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageScore: Math.floor(Math.random() * 20) + 70,
      })),
      improvement: Math.floor(Math.random() * 20) - 5,
    })),
    engagementMetrics: {
      dailyActiveUsers: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.floor(Math.random() * 10) + 15,
      })),
      averageSessionDuration: 22,
      completionRates: Array.from({ length: 4 }, (_, i) => ({
        week: `Week ${i + 1}`,
        rate: Math.floor(Math.random() * 15) + 80,
      })),
    },
    iepMastery: [
      { domain: 'Reading', goalsTotal: 45, goalsOnTrack: 32, goalsMastered: 8, goalsNeedingSupport: 5 },
      { domain: 'Math', goalsTotal: 38, goalsOnTrack: 28, goalsMastered: 6, goalsNeedingSupport: 4 },
      { domain: 'Speech', goalsTotal: 22, goalsOnTrack: 16, goalsMastered: 4, goalsNeedingSupport: 2 },
      { domain: 'Social-Emotional', goalsTotal: 18, goalsOnTrack: 12, goalsMastered: 3, goalsNeedingSupport: 3 },
    ],
  };
}

export function generateInterventionAlerts(students: StudentData[]): InterventionAlert[] {
  return students
    .filter(s => s.overallProgress < 60 || s.alerts.length > 0)
    .map(student => ({
      id: `alert-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      type: student.overallProgress < 40 ? 'urgent' as const : 'warning' as const,
      reason: student.overallProgress < 60 ? 'Low overall progress' : (student.alerts[0] || 'General concern'),
      details: `${student.name} is showing ${student.overallProgress}% progress. Consider intervention strategies.`,
      recommendedActions: [
        'Review IEP accommodations',
        'Adjust difficulty levels',
        'Schedule parent meeting',
        'Consult with specialist',
      ],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }));
}

// Export singleton instances for consistent data across components
let cachedStudents: StudentData[] | null = null;
let cachedActivities: ActivityData[] | null = null;
let cachedMessages: MessageData[] | null = null;
let cachedAnalytics: AnalyticsDataType | null = null;

export function getStudents(): StudentData[] {
  if (!cachedStudents) {
    cachedStudents = generateStudents(24);
  }
  return cachedStudents;
}

export function getActivities(): ActivityData[] {
  if (!cachedActivities) {
    cachedActivities = generateActivities(20);
  }
  return cachedActivities;
}

export function getMessages(): MessageData[] {
  if (!cachedMessages) {
    cachedMessages = generateMessages(15);
  }
  return cachedMessages;
}

export function getAnalytics(): AnalyticsDataType {
  if (!cachedAnalytics) {
    cachedAnalytics = generateAnalytics();
  }
  return cachedAnalytics;
}

export function getStudentById(id: string): StudentData | undefined {
  return getStudents().find(s => s.id === id);
}

export function getInterventionAlerts(): InterventionAlert[] {
  return generateInterventionAlerts(getStudents());
}

// Type for intervention alerts
export interface InterventionAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'urgent' | 'warning' | 'info';
  reason: string;
  details: string;
  recommendedActions: string[];
  createdAt: Date;
}
