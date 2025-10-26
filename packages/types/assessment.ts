// Assessment types
export interface Assessment {
  id: string;
  learnerId: string;
  type: 'diagnostic' | 'formative' | 'summative';
  subject: string;
  score?: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface AssessmentResult {
  assessmentId: string;
  answers: AssessmentAnswer[];
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  timeSpent?: number;
}
