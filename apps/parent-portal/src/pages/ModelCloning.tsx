import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExplainableModelCloning } from '../components/ExplainableModelCloning';

/**
 * MODEL CLONING PAGE (Production Flow)
 * 
 * Parents are redirected here AFTER baseline assessment completion.
 * 
 * Flow:
 * 1. Parent enrolls child → Enrollment data collected
 * 2. Child takes baseline assessment → Learning data collected  
 * 3. Parent returns here → AI model personalization with full transparency
 * 
 * The assessment results provide the data needed to personalize
 * the AI model to the child's specific learning patterns.
 */

export function ModelCloning() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [learnerId, setLearnerId] = useState<string>('');
  const [learnerName, setLearnerName] = useState<string>('');

  useEffect(() => {
    // Get learner ID from URL or localStorage
    const learnerIdFromUrl = searchParams.get('learner_id');
    const learnerIdFromStorage = localStorage.getItem('current_learner_id');
    
    const id = learnerIdFromUrl || learnerIdFromStorage;
    
    if (!id) {
      console.error('No learner ID found');
      navigate('/');
      return;
    }

    setLearnerId(id);

    // Get learner name from localStorage if available
    const learnerProfileStr = localStorage.getItem('learner_profile');
    if (learnerProfileStr) {
      try {
        const profile = JSON.parse(learnerProfileStr);
        setLearnerName(profile.first_name || 'your child');
      } catch (e) {
        setLearnerName('your child');
      }
    }
  }, [searchParams, navigate]);

  const handleModelComplete = (modelId: string) => {
    console.log('✅ Model cloning complete for model:', modelId);
    
    // Store model ID for reference
    localStorage.setItem('current_model_id', modelId);
    localStorage.setItem('model_cloning_complete', 'true');
    
    // Redirect to parent dashboard - onboarding complete!
    console.log('🎉 Onboarding complete! Redirecting to dashboard...');
    
    // Small delay to show completion message
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  if (!learnerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with context */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ✅ Baseline Assessment Complete
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Creating {learnerName}'s Personalized AI Learning Model 🧠
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Great news! We've learned about {learnerName}'s strengths and learning style from the baseline assessment.
            Now we'll use that data to create a personalized AI model designed specifically for them.
          </p>
          
          {/* Why This Matters */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-3xl mx-auto text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Why We're Doing This
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <strong>Using Real Data:</strong> The baseline assessment provided valuable insights about how {learnerName} learns best.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <strong>Complete Transparency:</strong> You'll see exactly what data we use and how we use it.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <strong>Personalized Learning:</strong> This AI model will adapt to {learnerName}'s unique needs and pace.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <strong>Your Control:</strong> FERPA/COPPA compliant with full audit trail and parent controls.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Cloning Workflow */}
        <ExplainableModelCloning 
          learnerId={learnerId}
          onComplete={handleModelComplete}
        />

        {/* Footer with progress indicator */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-400">Enrollment Complete</span>
            <span className="text-gray-300">→</span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-400">Assessment Complete</span>
            <span className="text-gray-300">→</span>
            <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-gray-900 font-medium">AI Personalization</span>
            <span className="text-gray-300">→</span>
            <span className="w-3 h-3 rounded-full bg-gray-300"></span>
            <span className="text-gray-400">Start Learning!</span>
          </div>
          <p className="text-xs text-gray-400">
            After this step, {learnerName} can start using their personalized learning experience
          </p>
        </div>
      </div>
    </div>
  );
}
