/**
 * Domain Transition Component
 * Displays break screen between assessment domains
 */
import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Microscope, 
  PenTool, 
  Heart,
  Mic,
  CheckCircle2,
  ArrowRight,
  Coffee,
  Trophy
} from 'lucide-react';
import type { Domain } from '../../types/baseline';

interface DomainTransitionProps {
  completedDomain: Domain;
  nextDomain: Domain;
  completedDomainScore?: number; // 0-100
  questionsCompleted: number;
  totalQuestionsInDomain: number;
  onContinue: () => void;
  allowSkip?: boolean;
}

// Domain metadata
const DOMAIN_INFO: Record<Domain, {
  icon: typeof BookOpen;
  label: string;
  color: string;
  bgColor: string;
  encouragement: string;
}> = {
  reading: {
    icon: BookOpen,
    label: 'Reading',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    encouragement: 'Great reading comprehension!'
  },
  math: {
    icon: Calculator,
    label: 'Math',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    encouragement: 'Excellent problem solving!'
  },
  science: {
    icon: Microscope,
    label: 'Science',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    encouragement: 'Outstanding scientific thinking!'
  },
  writing: {
    icon: PenTool,
    label: 'Writing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    encouragement: 'Wonderful expression!'
  },
  sel: {
    icon: Heart,
    label: 'Social & Emotional',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    encouragement: 'Great self-awareness!'
  },
  speech: {
    icon: Mic,
    label: 'Speech Therapy',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    encouragement: 'Wonderful communication skills!'
  }
};

export function DomainTransition({
  completedDomain,
  nextDomain,
  completedDomainScore,
  questionsCompleted,
  totalQuestionsInDomain,
  onContinue,
  allowSkip = false
}: DomainTransitionProps) {
  const [countdown, setCountdown] = useState(30); // 30 second break
  const [isReady, setIsReady] = useState(false);
  
  const completedInfo = DOMAIN_INFO[completedDomain];
  const nextInfo = DOMAIN_INFO[nextDomain];
  const CompletedIcon = completedInfo.icon;
  const NextIcon = nextInfo.icon;
  
  // Auto-continue after countdown (unless they mark ready earlier)
  useEffect(() => {
    if (isReady) {
      onContinue();
      return;
    }
    
    if (countdown <= 0) {
      onContinue();
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, isReady, onContinue]);
  
  // Get performance feedback
  const getPerformanceFeedback = () => {
    if (!completedDomainScore) return null;
    
    if (completedDomainScore >= 80) {
      return {
        message: 'Amazing work! You really know your stuff!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: Trophy
      };
    } else if (completedDomainScore >= 60) {
      return {
        message: 'Nice job! You\'re doing great!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: CheckCircle2
      };
    } else {
      return {
        message: 'Good effort! Keep trying your best!',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        icon: Heart
      };
    }
  };
  
  const feedback = getPerformanceFeedback();
  const FeedbackIcon = feedback?.icon;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Completed Domain Card */}
        <div className={`${completedInfo.bgColor} rounded-2xl shadow-lg p-8 mb-6 transform transition-all hover:scale-105`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 ${completedInfo.bgColor} rounded-full`}>
              <CompletedIcon className={`w-8 h-8 ${completedInfo.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Completed</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {completedInfo.label}
              </h2>
            </div>
          </div>
          
          <p className={`text-lg ${completedInfo.color} font-medium mb-4`}>
            {completedInfo.encouragement}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>{questionsCompleted} questions completed</span>
            {completedDomainScore !== undefined && (
              <span className="font-semibold">{Math.round(completedDomainScore)}% accuracy</span>
            )}
          </div>
        </div>
        
        {/* Performance Feedback */}
        {feedback && FeedbackIcon && (
          <div className={`${feedback.bgColor} rounded-2xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center gap-3">
              <FeedbackIcon className={`w-6 h-6 ${feedback.color}`} />
              <p className={`text-lg font-semibold ${feedback.color}`}>
                {feedback.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Break Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <Coffee className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Take a quick break!
            </h3>
            <p className="text-gray-600">
              Stretch, grab some water, and get ready for the next section.
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {countdown}
                  </div>
                  <div className="text-sm text-gray-600">seconds</div>
                </div>
              </div>
              {/* Animated progress ring */}
              <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(countdown / 30) * 352} 352`}
                  className="text-blue-500 transition-all duration-1000"
                />
              </svg>
            </div>
          </div>
          
          <button
            onClick={() => setIsReady(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            I'm Ready! Let's Continue
          </button>
          
          {allowSkip && (
            <button
              onClick={() => onContinue()}
              className="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Skip break and continue
            </button>
          )}
        </div>
        
        {/* Next Domain Preview */}
        <div className={`${nextInfo.bgColor} rounded-2xl shadow-lg p-8`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-white rounded-full`}>
              <NextIcon className={`w-8 h-8 ${nextInfo.color}`} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Up Next</div>
              <h2 className="text-2xl font-bold text-gray-900">
                {nextInfo.label}
              </h2>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
