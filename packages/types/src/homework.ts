/**
 * Homework Helper Types
 * Multi-modal homework assistance with OCR, step-by-step guidance, and adaptive support
 */

export interface HomeworkSession {
  id: string;
  learnerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  
  // Input
  title: string;
  inputMethod: 'photo' | 'document' | 'text' | 'multiple';
  originalText?: string; // Pasted text
  files: HomeworkFile[];
  
  // Analysis
  detectedSubject?: string;
  detectedGrade?: string; // Grade level of the homework
  targetLevel?: string; // Learner's current level (may differ from grade)
  difficultyAdjustment?: 'none' | 'simplified' | 'scaffolded';
  
  // Content
  extractedContent: ExtractedContent;
  problemStatement: string;
  keyQuestions: string[];
  
  // Progress
  currentStep: HomeworkStep;
  completedSteps: string[];
  workProducts: WorkProduct[];
  
  // Settings
  settings: HomeworkSettings;
  
  // AI assistance
  hintsGiven: number;
  explanationsProvided: string[];
  scaffoldingLevel: 'minimal' | 'moderate' | 'extensive';
}

export interface HomeworkFile {
  id: string;
  name: string;
  type: 'image/jpeg' | 'image/png' | 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  size: number;
  url: string;
  uploadedAt: Date;
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  confidence?: number; // OCR confidence 0-100
}

export interface ExtractedContent {
  rawText: string;
  structuredContent: {
    instructions?: string;
    questions?: string[];
    context?: string;
    rubric?: string;
  };
  detectedElements: {
    hasMathEquations: boolean;
    hasImages: boolean;
    hasTable: boolean;
    hasCode: boolean;
    language: string;
  };
}

export type HomeworkStep = 
  | 'understand' 
  | 'plan' 
  | 'solve' 
  | 'check';

export interface WorkProduct {
  id: string;
  step: HomeworkStep;
  type: 'drawing' | 'text' | 'equation' | 'diagram';
  content: string; // JSON or data URL
  createdAt: Date;
  feedback?: string;
}

export interface HomeworkSettings {
  readAloud: boolean;
  parentAssistMode: boolean;
  showHints: boolean;
  allowCalculator: boolean;
  timerEnabled: boolean;
  breakReminders: boolean;
  targetReadingLevel?: string; // e.g., "3rd grade", "5th grade"
}

export interface HintRequest {
  sessionId: string;
  step: HomeworkStep;
  studentQuestion?: string;
  timestamp: Date;
}

export interface StepGuidance {
  step: HomeworkStep;
  title: string;
  description: string;
  prompts: string[];
  resources: {
    type: 'video' | 'article' | 'example' | 'tool';
    title: string;
    url?: string;
  }[];
  checkpoints: string[];
}

// Helper type for creating new sessions
export interface CreateHomeworkSessionInput {
  learnerId: string;
  title: string;
  inputMethod: 'photo' | 'document' | 'text';
  text?: string;
  files?: File[];
}

// Helper type for session updates
export interface UpdateHomeworkSessionInput {
  status?: HomeworkSession['status'];
  currentStep?: HomeworkStep;
  completedSteps?: string[];
  workProducts?: WorkProduct[];
  settings?: Partial<HomeworkSettings>;
  scaffoldingLevel?: HomeworkSession['scaffoldingLevel'];
}
