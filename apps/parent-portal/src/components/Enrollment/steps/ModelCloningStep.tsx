import { useState } from 'react';
import type { StepProps } from '../EnrollmentWizard';
import { ExplainableModelCloning } from '../../ExplainableModelCloning';

/**
 * MODEL CLONING STEP
 * 
 * Final step in enrollment where parents:
 * 1. Learn about AI personalization (transparency)
 * 2. See what data will be used (with PII indicators)
 * 3. Provide informed consent (FERPA/COPPA)
 * 4. Watch 5-step model build in real-time
 * 5. Receive Model Card documentation
 * 
 * This step is completed BEFORE the baseline assessment,
 * ensuring parents understand and consent to AI personalization.
 */

interface ModelCloningStepProps extends StepProps {
  learnerId?: string;
  onModelComplete?: (modelId: string) => void;
}

export function ModelCloningStep({ 
  data, 
  onUpdate,
  learnerId,
  onModelComplete
}: ModelCloningStepProps) {
  const [modelId, setModelId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = (completedModelId: string) => {
    console.log('✅ Model cloning complete:', completedModelId);
    setModelId(completedModelId);
    setIsComplete(true);
    
    // Update enrollment data with model ID
    onUpdate({
      ...data,
      modelId: completedModelId,
      modelCloningComplete: true,
    });

    // Notify parent component
    if (onModelComplete) {
      onModelComplete(completedModelId);
    }
  };

  // If we don't have a learner ID yet, show preparation message
  if (!learnerId) {
    return (
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Almost Ready!
          </h3>
          <p className="text-gray-600 mb-6">
            In the next step, we'll create {data.firstName}'s personalized AI learning model.
            You'll see exactly what data we use and how it works.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-left">
            <h4 className="font-semibold text-purple-900 mb-3">What to Expect:</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Complete transparency about data usage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Watch the 5-step model building process</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Receive a Model Card explaining how it works</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Full FERPA/COPPA compliance with audit trail</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 text-center">
        <p className="text-purple-900 font-medium">
          🎉 Great! Now let's create {data.firstName}'s personalized AI learning model
        </p>
      </div>

      {/* Model Cloning Component */}
      <ExplainableModelCloning 
        learnerId={learnerId}
        onComplete={handleComplete}
      />

      {/* Completion Status */}
      {isComplete && modelId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h4 className="text-lg font-semibold text-green-900 mb-2">
            Model Cloning Complete!
          </h4>
          <p className="text-green-700 text-sm">
            Model ID: <code className="bg-green-100 px-2 py-1 rounded">{modelId}</code>
          </p>
          <p className="text-green-600 text-sm mt-2">
            Click "Complete Enrollment" below to continue to the baseline assessment.
          </p>
        </div>
      )}
    </div>
  );
}
