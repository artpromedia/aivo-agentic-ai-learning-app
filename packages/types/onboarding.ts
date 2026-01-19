// Onboarding types

export type OnboardingCategory = 'account' | 'security' | 'content' | 'learning' | 'integration';
export type OnboardingPriority = 'required' | 'recommended' | 'optional';

export interface OnboardingAction {
  label: string;
  path: string;
  external?: boolean;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: OnboardingCategory;
  priority: OnboardingPriority;
  completed: boolean;
  action?: OnboardingAction;
  dependencies?: string[];
  estimatedTime?: string;
}

export interface OnboardingProgress {
  userId: string;
  startedAt: Date;
  currentStep: number;
  totalSteps?: number;
  completedTasks: string[];
  skippedTasks?: string[];
  tasks?: OnboardingTask[];
  lastUpdated?: Date;
  completed?: boolean;
  completedAt?: Date;
  dismissed?: boolean;
}
