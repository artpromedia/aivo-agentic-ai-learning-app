// Core Activity Interface
export interface Activity {
  id: string;
  learnerId: string;
  sessionId?: string;
  subject: ActivitySubject;
  type: ActivityType;
  title: string;
  description?: string;
  difficulty: number; // 1.0-12.0 (grade level equivalents)
  duration: number; // seconds spent on activity
  startedAt: Date;
  completedAt?: Date;
  accuracy: number; // 0-100
  score: number; // 0-100
  engagementScore: number; // 0-100
  iepGoalsAddressed: string[];
  skillsAssessed: string[];
  responses: ActivityResponse[];
  metadata: ActivityMetadata;
  status: ActivityStatus;
}

export type ActivitySubject = 
  | 'reading'
  | 'math'
  | 'speech'
  | 'writing'
  | 'science'
  | 'social-studies'
  | 'art'
  | 'music'
  | 'physical-education'
  | 'life-skills'
  | 'play';

export type ActivityType = 
  // Reading
  | 'reading-comprehension'
  | 'phonics'
  | 'vocabulary'
  | 'fluency'
  | 'sight-words'
  | 'story-sequencing'
  // Math
  | 'counting'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'fractions'
  | 'geometry'
  | 'word-problems'
  | 'measurement'
  // Speech
  | 'articulation'
  | 'pronunciation'
  | 'conversation'
  | 'vocabulary-building'
  | 'sentence-formation'
  // Writing
  | 'letter-formation'
  | 'spelling'
  | 'sentence-writing'
  | 'paragraph-writing'
  | 'creative-writing'
  // Other
  | 'quiz'
  | 'game'
  | 'assessment'
  | 'practice'
  | 'review';

export type ActivityStatus = 
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'abandoned'
  | 'skipped';

// Activity Response
export interface ActivityResponse {
  questionId: string;
  question: string;
  questionType: QuestionType;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  timeSpent: number; // seconds
  attempts: number;
  hintsUsed: number;
  timestamp: Date;
}

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'fill-in-blank'
  | 'matching'
  | 'ordering'
  | 'open-ended'
  | 'audio-recording'
  | 'drawing'
  | 'drag-drop';

// Activity Metadata
export interface ActivityMetadata {
  adaptiveLevel?: number;
  scaffoldingUsed?: string[];
  breakseTaken?: number;
  emotionalCheckins?: EmotionalCheckin[];
  assistiveTechUsed?: string[];
  parentalSupervision?: boolean;
  teacherNotes?: string;
}

export interface EmotionalCheckin {
  timestamp: Date;
  emotion: 'happy' | 'frustrated' | 'confused' | 'excited' | 'neutral' | 'tired';
  confidence: number; // 0-100
}

// Activity Template (for teachers/admins to create activities)
export interface ActivityTemplate {
  id: string;
  title: string;
  subject: ActivitySubject;
  type: ActivityType;
  description: string;
  difficulty: number;
  estimatedDuration: number; // seconds
  targetGradeLevel: number[];
  questions: Question[];
  instructions: string;
  materials?: string[];
  learningObjectives: string[];
  iepGoalsSupported: string[];
  standardsAligned?: string[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Question (for activity templates)
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: any;
  explanation?: string;
  hints?: string[];
  points: number;
  timeLimit?: number; // seconds
  mediaUrl?: string; // Image, audio, or video
  metadata?: Record<string, any>;
}

// Activity Assignment
export interface ActivityAssignment {
  id: string;
  activityTemplateId: string;
  learnerId: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'started' | 'completed' | 'overdue' | 'cancelled';
  completedActivityId?: string;
  instructions?: string;
  iepGoalIds?: string[];
}

// Activity Analytics
export interface ActivityAnalytics {
  activityId: string;
  learnerId: string;
  completionRate: number; // 0-100
  averageScore: number; // 0-100
  averageAccuracy: number; // 0-100
  averageDuration: number; // seconds
  strugglingAreas: string[];
  masteredSkills: string[];
  recommendedNextActivities: string[];
  adaptiveRecommendations: AdaptiveRecommendation[];
  lastUpdated: Date;
}

export interface AdaptiveRecommendation {
  type: 'increase-difficulty' | 'decrease-difficulty' | 'more-practice' | 'different-approach' | 'take-break';
  reason: string;
  confidence: number; // 0-100
  suggestedAction: string;
}

// Learning Path
export interface LearningPath {
  id: string;
  learnerId: string;
  subject: ActivitySubject;
  title: string;
  description: string;
  activities: string[]; // Activity template IDs in order
  currentActivityIndex: number;
  startedAt?: Date;
  completedAt?: Date;
  progress: number; // 0-100
  estimatedCompletionDate?: Date;
  createdBy: string;
  createdAt: Date;
}
