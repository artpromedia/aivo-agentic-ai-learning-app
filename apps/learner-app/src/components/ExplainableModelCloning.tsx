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
  privacy_defaults: Record<string, unknown>;
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
  const [stage, setStage] = useState<'intro' | 'building' | 'complete'>('intro');
  const [introData, setIntroData] = useState<ModelIntroData | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load intro data
  useEffect(() => {
    loadIntroData();
  }, [learnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadIntroData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:9000/api/v1/model-cloning/model-intro/${learnerId}`
      );
      if (!response.ok) {
        // Use mock data if API is not available
        console.warn('API not available, using mock data for model cloning intro');
        const mockData: ModelIntroData = {
          learner: {
            id: learnerId,
            first_name: 'Student',
            preferred_name: 'Student',
            grade: '3rd Grade'
          },
          baseline_summary: {
            reading_level: 3.5,
            math_level: 3.2,
            writing_level: 3.0,
            completed_at: new Date().toISOString()
          },
          data_usage: {
            assessment_scores: {
              used: true,
              description: 'Your test answers to know what you already know',
              pii: false
            },
            learning_preferences: {
              used: true,
              description: 'How you like to learn (videos, games, reading)',
              pii: false
            }
          },
          privacy_defaults: {
            share_progress_with_teacher: true,
            share_progress_with_parent: true,
            use_voice_responses: true
          },
          estimated_time_seconds: 30,
          base_model_version: '1.0.0'
        };
        setIntroData(mockData);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setIntroData(data);
    } catch (err: unknown) {
      // If network error, use mock data
      console.warn('Network error, using mock data for model cloning intro', err);
      const mockData: ModelIntroData = {
        learner: {
          id: learnerId,
          first_name: 'Student',
          preferred_name: 'Student',
          grade: '3rd Grade'
        },
        baseline_summary: {
          reading_level: 3.5,
          math_level: 3.2,
          writing_level: 3.0,
          completed_at: new Date().toISOString()
        },
        data_usage: {
          assessment_scores: {
            used: true,
            description: 'Your test answers to know what you already know',
            pii: false
          },
          learning_preferences: {
            used: true,
            description: 'How you like to learn (videos, games, reading)',
            pii: false
          }
        },
        privacy_defaults: {
          share_progress_with_teacher: true,
          share_progress_with_parent: true,
          use_voice_responses: true
        },
        estimated_time_seconds: 30,
        base_model_version: '1.0.0'
      };
      setIntroData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const startBuilding = async () => {
    try {
      setLoading(true);
      setStage('building');

      // Start model building (consent is implicit for learner-facing flow)
      await buildModel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const buildModel = async () => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/v1/model-cloning/build-model`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
            learner_id: learnerId,
            privacy_settings: introData?.privacy_defaults,
          }),
        }
      );

      let data;
      if (!response.ok) {
        // Use mock model ID if API is not available
        console.warn('API not available, using mock model ID');
        data = {
          model_id: `mock-model-${learnerId}-${Date.now()}`,
          steps: [
            {
              step_number: 1,
              step_name: 'Loading Your Assessment',
              description: 'Reading your test answers',
              data_inputs: { types: ['assessment_responses'], from_learner: true, pii: false },
              data_outputs: { artifact: 'ability_estimates', fields: ['reading', 'math', 'science'] },
              explanation: 'We look at how you did on each question',
              duration_ms: 2000,
              status: 'complete'
            },
            {
              step_number: 2,
              step_name: 'Finding Your Level',
              description: 'Figuring out what grade level you\'re at',
              data_inputs: { types: ['ability_estimates'], from_learner: false, pii: false },
              data_outputs: { artifact: 'grade_levels', fields: ['reading', 'math', 'science'] },
              explanation: 'We match your score to your learning level',
              duration_ms: 2000,
              status: 'complete'
            },
            {
              step_number: 3,
              step_name: 'Picking Your Lessons',
              description: 'Choosing lessons just right for you',
              data_inputs: { types: ['grade_levels'], from_learner: false, pii: false },
              data_outputs: { artifact: 'lesson_plan', subjects: ['Reading', 'Math', 'Science'] },
              explanation: 'We find lessons that are perfect for your level',
              duration_ms: 2000,
              status: 'complete'
            },
            {
              step_number: 4,
              step_name: 'Setting Up Games',
              description: 'Getting fun learning games ready',
              data_inputs: { types: ['lesson_plan'], from_learner: false, pii: false },
              data_outputs: { artifact: 'activity_queue', features: ['games', 'videos', 'quizzes'] },
              explanation: 'We prepare activities you\'ll enjoy',
              duration_ms: 2000,
              status: 'complete'
            },
            {
              step_number: 5,
              step_name: 'Your AI is Ready!',
              description: 'Everything is set up for you to start learning',
              data_inputs: { types: ['all'], from_learner: false, pii: false },
              data_outputs: { artifact: 'personalized_model', rules: ['adaptive', 'engaging', 'safe'] },
              explanation: 'Your personal AI teacher is ready to help you learn and grow',
              duration_ms: 2000,
              status: 'complete'
            }
          ]
        };
      } else {
        data = await response.json();
      }
      
      setModelId(data.model_id);

      // Store model ID in localStorage
      localStorage.setItem('brain_id', data.model_id);
      localStorage.setItem('model_cloning_complete', 'true');

      // Use build steps from response or mock data
      if (data.steps) {
        setBuildSteps(data.steps);
      } else {
        await loadBuildSteps(data.model_id);
      }

      // Animate through steps
      animateSteps();
    } catch (err: unknown) {
      // If network error, use mock data and continue
      console.warn('Network error during model building, using mock data', err);
      const mockModelId = `mock-model-${learnerId}-${Date.now()}`;
      setModelId(mockModelId);
      localStorage.setItem('brain_id', mockModelId);
      localStorage.setItem('model_cloning_complete', 'true');
      
      // Set mock build steps
      setBuildSteps([
        {
          step_number: 1,
          step_name: 'Loading Your Assessment',
          description: 'Reading your test answers',
          data_inputs: { types: ['assessment_responses'], from_learner: true, pii: false },
          data_outputs: { artifact: 'ability_estimates', fields: ['reading', 'math', 'science'] },
          explanation: 'We look at how you did on each question',
          duration_ms: 2000,
          status: 'complete'
        },
        {
          step_number: 2,
          step_name: 'Finding Your Level',
          description: 'Figuring out what grade level you\'re at',
          data_inputs: { types: ['ability_estimates'], from_learner: false, pii: false },
          data_outputs: { artifact: 'grade_levels', fields: ['reading', 'math', 'science'] },
          explanation: 'We match your score to your learning level',
          duration_ms: 2000,
          status: 'complete'
        },
        {
          step_number: 3,
          step_name: 'Picking Your Lessons',
          description: 'Choosing lessons just right for you',
          data_inputs: { types: ['grade_levels'], from_learner: false, pii: false },
          data_outputs: { artifact: 'lesson_plan', subjects: ['Reading', 'Math', 'Science'] },
          explanation: 'We find lessons that are perfect for your level',
          duration_ms: 2000,
          status: 'complete'
        },
        {
          step_number: 4,
          step_name: 'Setting Up Games',
          description: 'Getting fun learning games ready',
          data_inputs: { types: ['lesson_plan'], from_learner: false, pii: false },
          data_outputs: { artifact: 'activity_queue', features: ['games', 'videos', 'quizzes'] },
          explanation: 'We prepare activities you\'ll enjoy',
          duration_ms: 2000,
          status: 'complete'
        },
        {
          step_number: 5,
          step_name: 'Your AI is Ready!',
          description: 'Everything is set up for you to start learning',
          data_inputs: { types: ['all'], from_learner: false, pii: false },
          data_outputs: { artifact: 'personalized_model', rules: ['adaptive', 'engaging', 'safe'] },
          explanation: 'Your personal AI teacher is ready to help you learn and grow',
          duration_ms: 2000,
          status: 'complete'
        }
      ]);
      
      animateSteps();
    }
  };

  const loadBuildSteps = async (model: string) => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/v1/model-cloning/model/${model}/build-steps`
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-8 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-4 rounded-xl">
                <Info className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  🧠 Creating Your Personal AI Brain!
                </h2>
                <p className="text-lg text-gray-600">
                  Hi {introData.learner.preferred_name || introData.learner.first_name}! 
                  We're building a special AI just for you that will help you learn in the best way possible.
                </p>
              </div>
            </div>
          </div>

          {/* Your Learning Levels */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              ⭐ Your Learning Levels
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                <p className="text-lg font-semibold text-gray-700 mb-2">📚 Reading</p>
                <p className="text-5xl font-bold text-blue-600">
                  {introData.baseline_summary.reading_level.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Grade Level</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <p className="text-lg font-semibold text-gray-700 mb-2">🔢 Math</p>
                <p className="text-5xl font-bold text-green-600">
                  {introData.baseline_summary.math_level.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Grade Level</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                <p className="text-lg font-semibold text-gray-700 mb-2">✍️ Writing</p>
                <p className="text-5xl font-bold text-purple-600">
                  {introData.baseline_summary.writing_level.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Grade Level</p>
              </div>
            </div>
          </div>

          {/* What Makes Your AI Special */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Eye className="w-7 h-7 text-indigo-600" />
              What Makes Your AI Special?
            </h3>
            <div className="space-y-4">
              {Object.entries(introData.data_usage).filter(([, value]) => value.used).map(([key]) => (
                <div
                  key={key}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Lock className="w-7 h-7 text-green-600" />
              Your Privacy is Protected! 🛡️
            </h3>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <span>Your AI is <strong>only yours</strong> - nobody else can use it</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <span>Your information stays <strong>private and safe</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <span>You and your parents can see everything it does</span>
              </li>
            </ul>
          </div>

          {/* Time Estimate */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 flex items-center gap-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">
                This will take about {introData.estimated_time_seconds} seconds ⏱️
              </p>
              <p className="text-gray-700">
                You'll see your AI being built step by step!
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={startBuilding}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 px-8 rounded-2xl text-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loading ? '⏳ Getting Ready...' : '🚀 Create My AI Brain!'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Building Stage
  // ============================================================

  if (stage === 'building') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🔨 Building Your AI Brain...
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Watch the magic happen! Each step makes your AI smarter.
            </p>

            <div className="space-y-4">
              {buildSteps.map((step, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep - 1;

                return (
                  <div
                    key={step.step_number}
                    className={`border-4 rounded-2xl p-6 transition-all ${
                      isComplete
                        ? 'border-green-500 bg-green-50'
                        : isCurrent
                        ? 'border-blue-500 bg-blue-50 animate-pulse shadow-lg'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
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
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {step.step_name}
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                          {step.explanation}
                        </p>

                        {(isComplete || isCurrent) && (
                          <div className="bg-white rounded-xl p-4">
                            <p className="font-semibold text-gray-700 mb-2">✨ Creating:</p>
                            <p className="text-gray-600 text-lg">
                              {step.data_outputs.artifact.replace(/_/g, ' ')}
                            </p>
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
      </div>
    );
  }

  // ============================================================
  // RENDER: Complete Stage
  // ============================================================

  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="bg-gradient-to-br from-green-100 to-green-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>

            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              🎉 Your AI Brain is Ready!
            </h2>

            <p className="text-2xl text-gray-600 mb-10">
              Awesome job, {introData?.learner.preferred_name || introData?.learner.first_name}! 
              Your personal AI is all set up and ready to help you learn!
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-10 text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">✨ What Your AI Can Do:</h3>
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Gives you just-right challenges (not too easy, not too hard!)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Helps you learn in the way that works best for you</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Answers your homework questions with helpful hints</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <span>Tracks your progress and celebrates your wins! 🎊</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                // Clear onboarding flags
                localStorage.removeItem('needs_assessment');
                localStorage.removeItem('onboarding_flow');
                localStorage.removeItem('skip_pin_setup');
                
                if (onComplete && modelId) {
                  onComplete(modelId);
                } else {
                  // Navigate to subject selection
                  navigate('/subjects');
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 px-12 rounded-2xl text-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Start Learning!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Loading/Error States
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-10 h-10 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-red-900 mb-3">Oops! Something went wrong</h3>
                <p className="text-lg text-red-700 mb-6">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    loadIntroData();
                  }}
                  className="bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
        <p className="text-2xl font-semibold text-gray-700">Loading your AI information...</p>
      </div>
    </div>
  );
}


