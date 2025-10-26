import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, Lock, Eye, Clock } from 'lucide-react';

interface ModelIntroData {
  learner: {
    id: string;
    first_name: string;
    preferred_name: string;
    grade: string;
  };
  baseline_summary: {
    reading_level: number;
    math_level: number;
    writing_level: number;
    completed_at: string;
  };
  data_usage: Record<string, {
    used: boolean;
    description: string;
    pii: boolean;
  }>;
  privacy_defaults: Record<string, any>;
  estimated_time_seconds: number;
  base_model_version: string;
}

interface BuildStep {
  step_number: number;
  step_name: string;
  description: string;
  data_inputs: {
    types: string[];
    from_learner: boolean;
    pii: boolean;
  };
  data_outputs: {
    artifact: string;
    size?: string;
    fields?: string[];
    features?: string[];
    subjects?: string[];
    rules?: string[];
  };
  explanation: string;
  duration_ms: number;
  status: string;
}

interface ExplainableModelCloningProps {
  learnerId: string;
  onComplete?: (modelId: string) => void;
}

export function ExplainableModelCloning({
  learnerId,
  onComplete,
}: ExplainableModelCloningProps) {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'intro' | 'consent' | 'building' | 'complete'>('intro');
  const [introData, setIntroData] = useState<ModelIntroData | null>(null);
  const [consentId, setConsentId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load intro data
  useEffect(() => {
    loadIntroData();
  }, [learnerId]);

  const loadIntroData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/model-cloning/model-intro/${learnerId}`
      );
      if (!response.ok) throw new Error('Failed to load intro data');
      const data = await response.json();
      setIntroData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async () => {
    try {
      setLoading(true);
      const parentId = localStorage.getItem('user_id');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/model-cloning/record-consent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learner_id: learnerId,
            consented_by: parentId,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to record consent');

      const data = await response.json();
      setConsentId(data.consent_id);
      setStage('building');

      // Start model building
      await buildModel(data.consent_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const buildModel = async (consent: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/model-cloning/build-model`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learner_id: learnerId,
            consent_id: consent,
            privacy_settings: introData?.privacy_defaults,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to build model');

      const data = await response.json();
      setModelId(data.model_id);

      // Load build steps to show progress
      await loadBuildSteps(data.model_id);

      // Animate through steps
      animateSteps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadBuildSteps = async (model: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/model-cloning/model/${model}/build-steps`
      );
      if (!response.ok) throw new Error('Failed to load build steps');
      const data = await response.json();
      setBuildSteps(data.steps);
    } catch (err) {
      console.error('Failed to load build steps:', err);
    }
  };

  const animateSteps = () => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => setStage('complete'), 1000);
      }
    }, 1000);
  };

  // ============================================================
  // RENDER: Introduction Stage
  // ============================================================

  if (stage === 'intro' && introData) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create {introData.learner.preferred_name || introData.learner.first_name}'s
                Personal AI Learning Model
              </h2>
              <p className="text-gray-600">
                We'll create a personalized AI model tailored to your child's unique learning
                needs. This process is completely transparent - you'll see exactly what data
                is used and how.
              </p>
            </div>
          </div>
        </div>

        {/* What Data Will Be Used */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            What Data Will Be Used?
          </h3>
          <div className="space-y-3">
            {Object.entries(introData.data_usage).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  value.used ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {value.used ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {value.pii && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Contains PII
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Baseline Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Learning Levels (from Assessment)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reading</p>
              <p className="text-3xl font-bold text-blue-600">
                {introData.baseline_summary.reading_level.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Grade Level</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Math</p>
              <p className="text-3xl font-bold text-green-600">
                {introData.baseline_summary.math_level.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Grade Level</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Writing</p>
              <p className="text-3xl font-bold text-purple-600">
                {introData.baseline_summary.writing_level.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Grade Level</p>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Privacy & Security Protections
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                Model is <strong>completely private</strong> and isolated to your family
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>No data sharing</strong> between learners - each model is separate
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Full transparency</strong> - complete audit trail of all operations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>
                You can <strong>export or delete</strong> the model at any time
              </span>
            </li>
          </ul>
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">
              Estimated Time: {introData.estimated_time_seconds} seconds
            </p>
            <p className="text-sm text-gray-600">
              You'll see each step as it happens
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStage('consent')}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Continue to Consent
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Consent Stage
  // ============================================================

  if (stage === 'consent' && introData) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Parent/Guardian Consent
          </h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-sm text-gray-700 space-y-3 max-h-96 overflow-y-auto">
            <p className="font-semibold text-lg">
              Consent to Create Personalized AI Learning Model
            </p>

            <p>
              I consent to the creation of a personalized AI learning model for my child.
              I understand that:
            </p>

            <ul className="space-y-2 pl-4">
              <li>
                • The model is created by applying my child's baseline assessment results
                to a copy of the base Aivo Brain
              </li>
              <li>
                • The model is private and isolated to my family/class
              </li>
              <li>
                • No data is shared between learners
              </li>
              <li>
                • I can view, export, or delete the model at any time
              </li>
              <li>
                • A complete audit trail of all operations is maintained
              </li>
              <li>
                • I have reviewed the privacy settings and data usage details
              </li>
            </ul>

            <p className="text-xs text-gray-500 mt-4">
              Version 1.0 | {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleConsent}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'I Consent - Create Model'}
            </button>
            <button
              onClick={() => setStage('intro')}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Building Stage
  // ============================================================

  if (stage === 'building') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Building Your Child's Personal AI Model
          </h2>
          <p className="text-gray-600 mb-8">
            Watch as we create a personalized learning experience. Each step is explained
            below.
          </p>

          <div className="space-y-4">
            {buildSteps.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep - 1;
              const isPending = index >= currentStep;

              return (
                <div
                  key={step.step_number}
                  className={`border-2 rounded-lg p-6 transition-all ${
                    isComplete
                      ? 'border-green-500 bg-green-50'
                      : isCurrent
                      ? 'border-blue-500 bg-blue-50 animate-pulse'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isComplete ? '✓' : step.step_number}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {step.step_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {step.explanation}
                      </p>

                      {(isComplete || isCurrent) && (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-white rounded p-3">
                            <p className="font-semibold text-gray-700 mb-1">Data Used:</p>
                            <ul className="text-gray-600 space-y-1">
                              {step.data_inputs.types.map((type) => (
                                <li key={type}>• {type.replace(/_/g, ' ')}</li>
                              ))}
                            </ul>
                            <p className="text-xs text-gray-500 mt-2">
                              PII: {step.data_inputs.pii ? 'Yes' : 'No'}
                            </p>
                          </div>

                          <div className="bg-white rounded p-3">
                            <p className="font-semibold text-gray-700 mb-1">Created:</p>
                            <p className="text-gray-600">
                              {step.data_outputs.artifact.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Complete Stage
  // ============================================================

  if (stage === 'complete') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Model Created Successfully!
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            {introData?.learner.preferred_name || introData?.learner.first_name}'s personal
            AI learning model is ready. The platform will now adapt to their unique needs
            and learning style.
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What Happens Next:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <span>Content difficulty will automatically adjust to their level</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <span>Learning pathways are personalized to fill knowledge gaps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <span>Homework Helper will provide age-appropriate guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <span>You can view progress and audit logs anytime</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              if (onComplete && modelId) {
                onComplete(modelId);
              } else {
                navigate('/dashboard');
              }
            }}
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Loading/Error States
  // ============================================================

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadIntroData();
                }}
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading model information...</p>
      </div>
    </div>
  );
}
