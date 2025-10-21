/**
 * Onboarding System Types
 * Defines types for user onboarding checklist and progress tracking
 */

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'account' | 'security' | 'content' | 'learning';
  priority: 'required' | 'recommended' | 'optional';
  completed: boolean;
  completedAt?: Date;
  action?: {
    label: string;
    path: string;
    external?: boolean;
  };
  dependencies?: string[]; // IDs of tasks that must be completed first
}

export interface OnboardingProgress {
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  tasks: OnboardingTask[];
  dismissed: boolean;
}

/**
 * Onboarding configuration for different user types
 */
export type OnboardingUserType = 'parent' | 'teacher' | 'learner' | 'admin';

export interface OnboardingConfig {
  userType: OnboardingUserType;
  tasks: OnboardingTask[];
  welcomeMessage?: string;
  completionMessage?: string;
}
