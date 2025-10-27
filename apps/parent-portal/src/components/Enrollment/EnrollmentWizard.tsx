import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TeacherLicenseStep } from './steps/TeacherLicenseStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { LearningProfileStep } from './steps/LearningProfileStep';
import { AccessibilityStep } from './steps/AccessibilityStep';
import { IEPStep } from './steps/IEPStep';
import { ConsentStep } from './steps/ConsentStep';
import {
  saveEnrollmentProgress,
  loadEnrollmentProgress,
  clearEnrollmentProgress,
} from '../../utils/enrollment/progressPersistence';

export interface StepProps {
  data: Partial<LearnerData>;
  onUpdate: (updates: Partial<LearnerData>) => void;
  errors: Record<string, string>;
}

export interface LearnerData {
  // Role & License (for teacher flow)
  enrollmentRole?: 'parent' | 'teacher';
  licenseKey?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  grade: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Learning Profile
  diagnoses: string[];
  customDiagnosis?: string;
  accommodations: string[];
  customAccommodation?: string;
  learningStrengths: string[];
  learningChallenges: string[];
  
  // Accessibility
  accessibilityPrefs: {
    textToSpeech: boolean;
    voiceInput: boolean;
    largeText: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    calmMode: boolean;
    dyslexiaFont: boolean;
  };
  
  // IEP
  hasIEP: boolean;
  iepDetails?: {
    caseManager: string;
    reviewDate: string;
    goals: string[];
    accommodations: string[];
  };
  
  // Consent
  parentConsent: boolean;
  dataProcessingConsent: boolean;
  assessmentConsent: boolean;
  
  // Model Cloning (added for final step)
  modelId?: string;
  modelCloningComplete?: boolean;
}

interface EnrollmentStep {
  title: string;
  description: string;
  component: (props: StepProps) => ReactElement;
  canSkip?: boolean;
  validation?: (data: Partial<LearnerData>) => boolean;
}

interface EnrollmentWizardProps {
  onComplete: (learner: LearnerData) => void;
}

export function EnrollmentWizard({ onComplete }: EnrollmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [enrollmentRole, setEnrollmentRole] = useState<'parent' | 'teacher' | null>(null);
  const [learnerData, setLearnerData] = useState<Partial<LearnerData>>({
    diagnoses: [],
    accommodations: [],
    learningStrengths: [],
    learningChallenges: [],
    accessibilityPrefs: {
      textToSpeech: true,
      voiceInput: false,
      largeText: false,
      highContrast: false,
      reducedMotion: false,
      calmMode: false,
      dyslexiaFont: false,
    },
    hasIEP: false,
    parentConsent: false,
    dataProcessingConsent: false,
    assessmentConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleSelection = (role: 'parent' | 'teacher') => {
    setEnrollmentRole(role);
    setLearnerData({ ...learnerData, enrollmentRole: role });
    
    // For parents: start at step 0 (Basic Info)
    // For teachers: start at step 0 (License validation)
    setCurrentStep(0);
  };

  const handleLicenseData = (data: { licenseKey: string; studentName: string }) => {
    const [firstName, ...lastNameParts] = data.studentName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    setLearnerData({
      ...learnerData,
      licenseKey: data.licenseKey,
      firstName,
      lastName,
    });
    // Move to next step (Basic Info, which is now step 1 for teachers)
    setCurrentStep(currentStep + 1);
  };

  const validateBasicInfo = (data: Partial<LearnerData>) => {
    const newErrors: Record<string, string> = {};
    if (!data.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!data.grade) newErrors.grade = 'Grade is required';
    
    // Age validation (must be 5-18)
    if (data.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
      if (age < 5 || age > 18) {
        newErrors.dateOfBirth = 'Learner must be between 5 and 18 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConsent = (data: Partial<LearnerData>) => {
    const newErrors: Record<string, string> = {};
    if (!data.parentConsent) newErrors.parentConsent = 'Parental consent is required';
    if (!data.dataProcessingConsent) newErrors.dataProcessingConsent = 'Data processing consent is required';
    if (!data.assessmentConsent) newErrors.assessmentConsent = 'Assessment consent is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build steps dynamically based on role
  const getSteps = (): EnrollmentStep[] => {
    const baseSteps: EnrollmentStep[] = [];
    
    // Step 0: Role Selection (always first if no role selected)
    if (enrollmentRole === null) {
      baseSteps.push({
        title: 'Choose Your Role',
        description: 'Are you a parent or teacher?',
        component: () => null as unknown as ReactElement, // Will be rendered directly in JSX
        canSkip: false,
      });
      return baseSteps;
    }
    
    // Step 1: License validation (only for teachers)
    if (enrollmentRole === 'teacher') {
      baseSteps.push({
        title: 'District License',
        description: 'Validate your district license code',
        component: () => null as unknown as ReactElement, // Will be rendered directly in JSX
        canSkip: false,
      });
    }
    
    // Remaining steps (same for both roles)
    baseSteps.push(
      {
        title: 'Basic Information',
        description: 'Tell us about the learner',
        component: BasicInfoStep,
        validation: validateBasicInfo,
      },
      {
        title: 'Learning Profile',
        description: 'Help us understand their needs',
        component: LearningProfileStep,
        canSkip: true,
      },
      {
        title: 'Accessibility',
        description: 'Customize the learning experience',
        component: AccessibilityStep,
        canSkip: true,
      },
      {
        title: 'IEP Information',
        description: 'Individualized Education Program details',
        component: IEPStep,
        canSkip: true,
      },
      {
        title: 'Consent & Confirm',
        description: 'Review and provide consent',
        component: ConsentStep,
        validation: validateConsent,
      }
    );
    
    return baseSteps;
  };

  const steps = getSteps();
  const currentStepData = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    console.log('➡️ Moving to next step. Current data:', learnerData);
    
    if (currentStepData.validation) {
      if (!currentStepData.validation(learnerData)) {
        console.log('❌ Validation failed for step:', currentStep);
        console.log('Current learner data:', learnerData);
        return; // Validation failed
      }
    }

    if (currentStep === steps.length - 1) {
      // Final step - complete enrollment
      console.log('✅ Final step completed. Learner data:', learnerData);
      clearEnrollmentProgress(); // Clear saved progress
      onComplete(learnerData as LearnerData);
    } else {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors for next step
    }
  };

  const handleBack = () => {
    // Special handling for role selection
    if (currentStep === 0 && enrollmentRole !== null) {
      setEnrollmentRole(null);
      setLearnerData({
        ...learnerData,
        enrollmentRole: undefined,
        licenseKey: undefined,
        firstName: '',
        lastName: '',
      });
      return;
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSkip = () => {
    if (currentStepData.canSkip) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const updateData = (updates: Partial<LearnerData>) => {
    const newData = { ...learnerData, ...updates };
    console.log('📝 Wizard data updated:', updates);
    console.log('📊 Current wizard state:', newData);
    setLearnerData(newData);
  };

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadEnrollmentProgress();
    if (saved && saved.currentStep > 0) {
      const shouldResume = window.confirm(
        '📋 We found a saved enrollment from earlier.\n\nWould you like to continue where you left off?'
      );
      
      if (shouldResume) {
        setCurrentStep(saved.currentStep);
        setLearnerData(saved.data);
      } else {
        clearEnrollmentProgress();
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentStep < steps.length - 1 && currentStep > 0) {
        // Don't save on first or final step
        saveEnrollmentProgress(currentStep, learnerData);
      }
    }, 2000); // Debounce saves by 2 seconds

    return () => clearTimeout(timeout);
  }, [currentStep, learnerData, steps.length]);

  const StepComponent = currentStepData.component;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Progress Header */}
      <div className="rounded-xl bg-white/90 p-6 shadow-lg backdrop-blur border border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-neutral-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-neutral-500">{Math.round(progressPercent)}% Complete</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Content Card */}
      <div
        className="rounded-xl bg-white shadow-xl border border-neutral-200 overflow-hidden"
        data-testid={`enrollment-step-${currentStep + 1}`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-neutral-600">
            {currentStepData.description}
          </p>
        </div>
        
        {/* Content */}
        <div className="px-8 py-8">
          {/* Render role selection if no role selected */}
          {enrollmentRole === null ? (
            <RoleSelectionStep onSelectRole={handleRoleSelection} />
          ) : /* Render license step for teachers on step 0 */
          enrollmentRole === 'teacher' && currentStep === 0 ? (
            <TeacherLicenseStep
              onNext={handleLicenseData}
              onBack={() => {
                setEnrollmentRole(null);
                setLearnerData({
                  ...learnerData,
                  enrollmentRole: undefined,
                  licenseKey: undefined,
                });
              }}
            />
          ) : (
            /* Render normal step components */
            <StepComponent 
              data={learnerData} 
              onUpdate={updateData} 
              errors={errors}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
          {/* Hide back button on role selection, show on all other steps */}
          {enrollmentRole !== null && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
              data-testid="back-button"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          {/* Hide next button on role selection and license validation (they have their own buttons) */}
          {enrollmentRole !== null && !(enrollmentRole === 'teacher' && currentStep === 0) && (
            <div className="flex gap-3">
              {currentStepData.canSkip && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-lg font-medium text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100 transition-colors"
                  data-testid="skip-button"
                >
                  Skip for now
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                data-testid="next-button"
              >
                {currentStep === steps.length - 1 ? 'Complete Enrollment' : 'Continue'}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-neutral-500">
        🔒 All information is encrypted and COPPA/FERPA compliant
      </div>
    </div>
  );
}
