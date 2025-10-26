/**
 * Assessment Introduction Modal
 * 
 * Shows when assessment is triggered after account creation
 * 
 * Updated: 2025-10-23 06:03:55 UTC
 * By: aivo-ai
 */

import { useNavigate } from 'react-router-dom';
import { Clipboard, Clock, Brain, CheckCircle } from 'lucide-react';

interface AssessmentIntroProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  learnerName: string;
  totalQuestions?: number;
  estimatedMinutes?: number;
}

export function AssessmentIntroModal({
  isOpen,
  onClose,
  assessmentId: _assessmentId,
  learnerName,
  totalQuestions = 20,
  estimatedMinutes = 20
}: AssessmentIntroProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    // Just close the modal - we're already on the assessment page
    onClose();
  };

  const handleLater = () => {
    // Skip for now, go to dashboard
    navigate('/dashboard');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleLater}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Brain size={32} />
            <h2 className="text-3xl font-bold">
              Welcome, {learnerName}!
            </h2>
          </div>
          <p className="text-blue-100">
            Let's create your personalized AI learning brain
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-1">
              Quick Baseline Assessment
            </h3>
            <p className="text-sm text-blue-800">
              This helps us understand your current level and create
              a learning experience that's just right for you!
            </p>
          </div>

          {/* What to Expect */}
          <div>
            <h3 className="font-semibold text-lg mb-4">What to expect:</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clipboard className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="font-medium">{totalQuestions} Questions</p>
                  <p className="text-sm text-gray-600">Math, Reading, and Science</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="font-medium">About {estimatedMinutes} minutes</p>
                  <p className="text-sm text-gray-600">Take your time - no rush!</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Brain className="text-orange-500" size={24} />
                </div>
                <div>
                  <p className="font-medium">Your Personal AI Tutor</p>
                  <p className="text-sm text-gray-600">
                    We'll create your unique learning brain based on your answers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Remember Box */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Remember:</strong> This isn't a test you can "fail."
              We just want to know what you already know so we can help you learn better!
            </p>
          </div>

          {/* Tips */}
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-2">
              Tips for success:
            </h4>
            <ul className="space-y-1">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Find a quiet place with no distractions</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Read each question carefully</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Do your best, but don't stress</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>It's okay to take breaks if needed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl space-y-3">
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Assessment Now 🚀
          </button>
          
          <button
            onClick={handleLater}
            className="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
