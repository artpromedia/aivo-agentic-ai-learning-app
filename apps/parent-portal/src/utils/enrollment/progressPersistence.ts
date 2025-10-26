import type { LearnerData } from '../../components/Enrollment/EnrollmentWizard';

const STORAGE_KEY = 'enrollment_progress';

export interface EnrollmentProgress {
  currentStep: number;
  data: Partial<LearnerData>;
  timestamp: string;
  expiresAt: string;
}

export const saveEnrollmentProgress = (step: number, data: Partial<LearnerData>) => {
  const progress: EnrollmentProgress = {
    currentStep: step,
    data,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save enrollment progress:', error);
  }
};

export const loadEnrollmentProgress = (): EnrollmentProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const progress: EnrollmentProgress = JSON.parse(stored);
    
    // Check if expired
    if (new Date(progress.expiresAt) < new Date()) {
      clearEnrollmentProgress();
      return null;
    }
    
    return progress;
  } catch (error) {
    console.error('Failed to load enrollment progress:', error);
    return null;
  }
};

export const clearEnrollmentProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear enrollment progress:', error);
  }
};

export const hasEnrollmentProgress = (): boolean => {
  return loadEnrollmentProgress() !== null;
};
