// Baseline Assessment
export interface BaselineAssessment {
  id: string;
  learnerId: string;
  assessmentType: 'initial-baseline' | 'progress-check' | 'annual-review' | 'diagnostic';
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'incomplete';
  subjects: SubjectAssessment[];
  overallRecommendations: string[];
  assessorId?: string;
  assessorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Assessment
export interface SubjectAssessment {
  subject: 'reading' | 'math' | 'speech' | 'writing' | 'science' | 'social-emotional';
  currentGrade: number; // Student's actual grade
  assessedLevel: number; // Grade level equivalent based on assessment
  percentage: number; // Overall score 0-100
  rawScore?: number;
  maxScore?: number;
  timeSpent: number; // seconds
  completedAt: Date;
  strengths: string[];
  growthAreas: string[];
  recommendation: string;
  skillBreakdown: SkillAssessment[];
  nextSteps: string[];
}

// Skill Assessment
export interface SkillAssessment {
  skill: string;
  category: string;
  level: 'below-grade' | 'approaching-grade' | 'at-grade' | 'above-grade';
  score: number; // 0-100
  proficiency: 'emerging' | 'developing' | 'proficient' | 'advanced';
  questionsAttempted: number;
  questionsCorrect: number;
  notes?: string;
}

// Progress Assessment (ongoing tracking)
export interface ProgressAssessment {
  id: string;
  learnerId: string;
  iepGoalId?: string;
  assessmentPeriod: AssessmentPeriod;
  startDate: Date;
  endDate: Date;
  subject: string;
  skillsAssessed: SkillProgress[];
  overallProgress: number; // 0-100
  growthRate: number; // percentage points per week
  projectedEndOfYearLevel?: number;
  interventionsRecommended?: Intervention[];
  teacherObservations?: string;
  assessedBy: string;
  assessedAt: Date;
}

export type AssessmentPeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semester' | 'annual';

// Skill Progress
export interface SkillProgress {
  skill: string;
  baseline: number; // 0-100
  current: number; // 0-100
  target: number; // 0-100
  growth: number; // percentage points
  trend: 'improving' | 'declining' | 'stable';
  masteryLevel: 'not-started' | 'introduced' | 'practicing' | 'proficient' | 'mastered';
  lastPracticed?: Date;
}

// Intervention
export interface Intervention {
  id: string;
  learnerId: string;
  type: InterventionType;
  tier: 1 | 2 | 3; // RTI tiers
  targetSkills: string[];
  strategy: string;
  frequency: string;
  duration: number; // weeks
  startDate: Date;
  endDate?: Date;
  providerId: string;
  status: 'proposed' | 'active' | 'completed' | 'discontinued';
  effectivenessRating?: number; // 0-100
  notes?: string;
  progressMonitoring?: ProgressMonitoringData[];
}

export type InterventionType = 
  | 'academic-support'
  | 'behavioral-support'
  | 'social-emotional'
  | 'speech-language'
  | 'occupational-therapy'
  | 'assistive-technology'
  | 'modified-instruction'
  | 'small-group'
  | 'one-on-one'
  | 'peer-tutoring';

// Progress Monitoring Data
export interface ProgressMonitoringData {
  date: Date;
  dataPoints: AssessmentDataPoint[];
  observation: string;
  nextSteps?: string;
  recordedBy: string;
}

export interface AssessmentDataPoint {
  metric: string;
  value: number;
  unit: string;
  notes?: string;
}

// Diagnostic Assessment
export interface DiagnosticAssessment {
  id: string;
  learnerId: string;
  assessmentName: string;
  assessmentType: 'cognitive' | 'academic' | 'behavioral' | 'developmental' | 'speech-language' | 'psychological';
  administeredBy: string;
  administeredAt: Date;
  results: DiagnosticResult[];
  overallInterpretation: string;
  recommendations: string[];
  reportUrl?: string;
  isConfidential: boolean;
}

export interface DiagnosticResult {
  domain: string;
  standardScore?: number;
  percentileRank?: number;
  ageEquivalent?: string;
  gradeEquivalent?: number;
  descriptor: 'very-low' | 'low' | 'below-average' | 'average' | 'above-average' | 'high' | 'very-high';
  interpretation: string;
}

// Formative Assessment (in-lesson checks)
export interface FormativeAssessment {
  id: string;
  activityId: string;
  learnerId: string;
  checkpointNumber: number;
  timestamp: Date;
  skillChecked: string;
  understanding: 'not-understood' | 'partially-understood' | 'understood' | 'mastered';
  confidence: number; // 0-100
  needsReteach: boolean;
  teachingAdjustment?: string;
}

// Summative Assessment (end of unit/term)
export interface SummativeAssessment {
  id: string;
  learnerId: string;
  subject: string;
  unitName: string;
  gradeLevel: number;
  administeredAt: Date;
  totalPoints: number;
  earnedPoints: number;
  percentage: number; // 0-100
  letterGrade?: string;
  standardsMet: StandardPerformance[];
  teacherComments?: string;
  parentComments?: string;
}

export interface StandardPerformance {
  standardId: string;
  standardDescription: string;
  performance: 'does-not-meet' | 'partially-meets' | 'meets' | 'exceeds';
  evidence: string[];
}

// Assessment Schedule
export interface AssessmentSchedule {
  id: string;
  learnerId: string;
  assessmentType: 'baseline' | 'progress' | 'diagnostic' | 'formative' | 'summative';
  scheduledDate: Date;
  subject?: string;
  assessorId: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  completedAssessmentId?: string;
  notes?: string;
  reminderSent: boolean;
}

// Assessment Analytics
export interface AssessmentAnalytics {
  learnerId: string;
  period: AssessmentPeriod;
  startDate: Date;
  endDate: Date;
  assessmentsCompleted: number;
  averageScore: number; // 0-100
  growthRate: number; // percentage points
  subjectPerformance: SubjectPerformanceSummary[];
  strengthsIdentified: string[];
  challengesIdentified: string[];
  predictedOutcomes: PredictedOutcome[];
  lastUpdated: Date;
}

export interface SubjectPerformanceSummary {
  subject: string;
  currentLevel: number;
  startLevel: number;
  growth: number;
  onTrack: boolean;
  projectedEndOfYearLevel: number;
}

export interface PredictedOutcome {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number; // 0-100
  timeframe: string;
  factors: string[];
}
