import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../../components/BigButton';
import { ProgressRing } from '../../components/ProgressRing';
import { EncouragementBanner } from '../../components/EncouragementBanner';
import { ExitConfirmation } from '../../components/ExitConfirmation';

interface MathProblem {
  question: string;
  answer: number;
  visual: string[];
  hint: string;
}

const problems: MathProblem[] = [
  {
    question: "How many apples are there?",
    answer: 5,
    visual: ['🍎', '🍎', '🍎', '🍎', '🍎'],
    hint: "Count them one by one!",
  },
  {
    question: "2 + 3 = ?",
    answer: 5,
    visual: ['●●', '●●●'],
    hint: "Put the groups together!",
  },
  {
    question: "If you have 7 stars and give away 3, how many are left?",
    answer: 4,
    visual: ['⭐⭐⭐⭐⭐⭐⭐'],
    hint: "Take away 3 stars!",
  },
  {
    question: "What comes after 8?",
    answer: 9,
    visual: ['1', '2', '3', '4', '5', '6', '7', '8', '?'],
    hint: "Keep counting!",
  },
];

export function MathActivity() {
  const navigate = useNavigate();
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const problem = problems[currentProblem];
  const progress = ((currentProblem + 1) / problems.length) * 100;

  if (!problem) return null;

  const handleNumberClick = (num: number) => {
    setUserAnswer(userAnswer + num.toString());
  };

  const handleClear = () => {
    setUserAnswer('');
  };

  const handleSubmit = () => {
    const isCorrect = parseInt(userAnswer) === problem.answer;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
    
    setShowEncouragement(true);
    setUserAnswer('');
    setShowHint(false);
    
    setTimeout(() => {
      setShowEncouragement(false);
      if (currentProblem < problems.length - 1) {
        setCurrentProblem(currentProblem + 1);
      } else {
        // Activity complete
        navigate('/subjects');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-bold text-neutral-900 flex items-center gap-4">
            🔢 Math Time
          </h1>
          <button
            onClick={() => setShowExitConfirmation(true)}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-all duration-200"
            aria-label="Exit activity"
          >
            🚪
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-6 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ProgressRing progress={progress} size={60} strokeWidth={6} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-2xl">
          {/* Question */}
          <h2 className="text-4xl font-bold text-center text-green-600 mb-8">
            {problem.question}
          </h2>

          {/* Visual Representation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 mb-8 min-h-[200px] flex items-center justify-center">
            <div className="flex flex-wrap justify-center gap-4">
              {problem.visual.map((item, index) => (
                <div
                  key={index}
                  className="text-6xl animate-bounce-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Answer Display */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8 min-h-[100px] flex items-center justify-center">
            <span className="text-6xl font-bold text-purple-600">
              {userAnswer || '?'}
            </span>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl text-5xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="aspect-square bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-2xl text-4xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✕
            </button>
            <button
              onClick={() => handleNumberClick(0)}
              className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl text-5xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userAnswer}
              className="aspect-square bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-neutral-300 disabled:to-neutral-400 disabled:cursor-not-allowed text-white rounded-2xl text-4xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✓
            </button>
          </div>

          {/* Hint Button */}
          <div className="flex justify-center">
            <BigButton
              onClick={() => setShowHint(!showHint)}
              variant="warning"
              icon="💡"
            >
              {showHint ? 'Hide Hint' : 'Need Help?'}
            </BigButton>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="mt-6 bg-yellow-100 border-4 border-yellow-400 rounded-2xl p-6 text-center animate-slide-down">
              <p className="text-2xl text-neutral-800 font-semibold">
                💡 {problem.hint}
              </p>
            </div>
          )}
        </div>
      </div>

      <EncouragementBanner show={showEncouragement} />
      <ExitConfirmation
        isOpen={showExitConfirmation}
        onConfirm={() => navigate('/subjects')}
        onCancel={() => setShowExitConfirmation(false)}
      />

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
