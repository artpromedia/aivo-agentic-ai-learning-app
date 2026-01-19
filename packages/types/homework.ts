// Homework and assignment types
export type HomeworkStep = 'understand' | 'plan' | 'solve' | 'check';
export type HomeworkStatus = 'pending' | 'in-progress' | 'completed' | 'abandoned';
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface HomeworkFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  ocrStatus?: OcrStatus;
  extractedText?: string;
  confidence?: number;
}

export interface StructuredContent {
  instructions?: string;
  questions?: string[];
  context?: string;
  rubric?: string;
}

export interface DetectedElements {
  hasMathEquations: boolean;
  hasImages: boolean;
  hasTable: boolean;
  hasCode: boolean;
  language: string;
}

export interface ExtractedContent {
  text?: string;
  rawText: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  structuredContent?: StructuredContent;
  detectedElements?: DetectedElements;
}

export interface HomeworkSessionSettings {
  readAloud: boolean;
  parentAssistMode: boolean;
  showHints: boolean;
  allowCalculator: boolean;
  timerEnabled: boolean;
  breakReminders: boolean;
}

export interface HomeworkSession {
  id: string;
  learnerId: string;
  title?: string;
  subject?: string;
  status?: HomeworkStatus;
  files: HomeworkFile[];
  textInput?: string;
  originalText?: string;
  extractedContent?: ExtractedContent;
  currentStep: HomeworkStep;
  steps?: {
    understand?: {
      completed: boolean;
      keyPoints?: string[];
      questions?: string[];
    };
    plan?: {
      completed: boolean;
      strategy?: string;
      steps?: string[];
    };
    solve?: {
      completed: boolean;
      workProduct?: string;
      progress?: number;
    };
    check?: {
      completed: boolean;
      verified?: boolean;
      feedback?: string;
    };
  };
  completedSteps?: HomeworkStep[];
  keyQuestions: string[];
  hints: string[];
  hintsGiven?: number;
  explanationsProvided?: HomeworkStep[];
  progress?: number;
  problemStatement?: string;
  detectedSubject?: string;
  detectedGrade?: string;
  targetLevel?: string;
  workProducts?: WorkProduct[];
  settings?: HomeworkSessionSettings;
  scaffoldingLevel?: 'minimal' | 'moderate' | 'maximum';
  inputMethod?: 'photo' | 'document' | 'text' | 'multiple';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface WorkProduct {
  type: 'text' | 'image' | 'audio' | 'file';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface StepGuidance {
  step: HomeworkStep;
  title: string;
  description: string;
  tips?: string[];
  examples?: string[];
  prompts?: string[];
  resources?: Array<{
    type: 'video' | 'tool' | 'example' | 'article';
    title: string;
    url: string;
  }>;
  checkpoints?: string[];
}

export interface CreateHomeworkSessionInput {
  learnerId: string;
  title?: string;
  files?: File[];
  textInput?: string;
  text?: string;
  subject?: string;
  inputMethod?: 'photo' | 'document' | 'text' | 'multiple';
}
