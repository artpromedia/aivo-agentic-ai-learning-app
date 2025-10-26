// Homework and assignment types
export type HomeworkStep = 'understand' | 'plan' | 'solve' | 'check';

export interface HomeworkFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface ExtractedContent {
  text: string;
  rawText: string;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface HomeworkSession {
  id: string;
  learnerId: string;
  title?: string;
  subject?: string;
  files: HomeworkFile[];
  textInput?: string;
  extractedContent?: ExtractedContent;
  currentStep: HomeworkStep;
  steps: {
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
  keyQuestions: string[];
  hints: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface WorkProduct {
  type: 'text' | 'image' | 'audio' | 'file';
  content: string;
  metadata?: Record<string, any>;
}

export interface StepGuidance {
  step: HomeworkStep;
  title: string;
  description: string;
  tips: string[];
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
