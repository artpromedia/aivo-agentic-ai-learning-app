import { useState } from 'react';
import { ExplainableModelCloning } from '../components/ExplainableModelCloning';

/**
 * MODEL CLONING TEST PAGE
 * 
 * This page demonstrates the complete Explainable Model Cloning workflow:
 * 1. Introduction: Shows what data will be used (transparency)
 * 2. Consent: Parent reviews and signs consent
 * 3. Building: Real-time display of 5-step build process
 * 4. Complete: Success state with next steps
 * 
 * FERPA/COPPA Compliant | Full Transparency | Parent Control
 */

const ModelCloningTestPage = () => {
  const [testLearnerId, setTestLearnerId] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleStartTest = () => {
    if (!testLearnerId.trim()) {
      alert('Please enter a learner ID');
      return;
    }
    setShowWorkflow(true);
  };

  const handleReset = () => {
    setShowWorkflow(false);
    setTestLearnerId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Explainable Model Cloning Test Page
          </h1>
          <p className="text-gray-600">
            Test the complete model personalization workflow with full transparency
          </p>
        </div>

        {!showWorkflow ? (
          /* Setup Form */
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Start Model Cloning Test
            </h2>

            <div className="space-y-6">
              {/* Learner ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learner ID
                </label>
                <input
                  type="text"
                  value={testLearnerId}
                  onChange={(e) => setTestLearnerId(e.target.value)}
                  placeholder="Enter learner ID (e.g., test-learner-123)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 If you don't have a learner ID, use: <code className="bg-gray-100 px-2 py-1 rounded">test-learner-123</code>
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    ✨ What You'll See
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Introduction with data summary</li>
                    <li>• Transparent consent process</li>
                    <li>• Live 5-step build progress</li>
                    <li>• Model card documentation</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    🔒 Privacy Features
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• PII detection & protection</li>
                    <li>• Audit trail logging</li>
                    <li>• Consent versioning</li>
                    <li>• FERPA/COPPA compliant</li>
                  </ul>
                </div>
              </div>

              {/* API Status Check */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Prerequisites
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✓ API Gateway running on port 9000</li>
                  <li>✓ Database migrated with model cloning tables</li>
                  <li>✓ Model cloning endpoints registered</li>
                  <li className="mt-2 text-xs text-yellow-600">
                    Check console for API responses during workflow
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                🚀 Start Model Cloning Workflow
              </button>
            </div>
          </div>
        ) : (
          /* Workflow Component */
          <div>
            <div className="mb-4">
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to Setup
              </button>
            </div>

            <ExplainableModelCloning learnerId={testLearnerId} />

            {/* Developer Tools */}
            <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">
                🛠️ Developer Tools
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>Learner ID:</span>
                  <code className="bg-gray-700 px-2 py-1 rounded">{testLearnerId}</code>
                </div>
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span>API Base:</span>
                  <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:9000/api/v1</code>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Open browser DevTools → Network tab to see API requests
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Link */}
        <div className="mt-8 text-center text-sm text-gray-500">
          📚 See <code className="bg-gray-100 px-2 py-1 rounded">EXPLAINABLE_MODEL_CLONING_COMPLETE.md</code> for full documentation
        </div>
      </div>
    </div>
  );
};

export default ModelCloningTestPage;


