import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { EncouragementBanner } from '../components/EncouragementBanner';

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'scale' | 'visual';
  options?: string[];
  images?: string[];
}

const assessmentQuestions: Question[] = [
  {
    id: 1,
    question: "How do you feel about reading?",
    type: 'visual',
    images: ['😊', '😐', '😕', '😢'],
  },
  {
    id: 2,
    question: "What's your favorite way to learn?",
    type: 'multiple-choice',
    options: ['Looking at pictures', 'Listening to stories', 'Doing activities', 'Playing games'],
  },
  {
    id: 3,
    question: "How confident are you with numbers?",
    type: 'scale',
    options: ['Not sure', 'A little', 'Good', 'Very good!'],
  },
  {
    id: 4,
    question: "What makes learning fun for you?",
    type: 'multiple-choice',
    options: ['Music and sounds', 'Colorful pictures', 'Moving around', 'Solving puzzles'],
  },
  {
    id: 5,
    question: "How do you like to work?",
    type: 'visual',
    images: ['👤', '👥', '👨‍🏫', '🏠'],
  },
];

export function BaselineAssessment() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (optionIndex: number) => {
    // Save answer
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    
    // Show encouragement
    setShowEncouragement(true);
    
    // Move to next question or finish
    setTimeout(() => {
      setShowEncouragement(false);
      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        navigate('/assessment-results');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-6 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {currentQuestionIndex + 1}/{assessmentQuestions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-2xl mb-8">
          <h2 className="text-5xl font-bold text-center text-neutral-900 mb-12">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestion.type === 'visual' && currentQuestion.images?.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-3xl flex items-center justify-center text-9xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label={`Option ${index + 1}`}
              >
                {emoji}
              </button>
            ))}

            {currentQuestion.type !== 'visual' && currentQuestion.options?.map((option, index) => (
              <BigButton
                key={index}
                onClick={() => handleAnswer(index)}
                variant={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'warning' : 'secondary'}
                className="min-h-[100px] text-xl"
              >
                {option}
              </BigButton>
            ))}
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-2xl text-purple-600">
          Pick the answer that feels right for you! There's no wrong answer. 💜
        </p>
      </div>

      {/* Encouragement Banner */}
      <EncouragementBanner show={showEncouragement} />
    </div>
  );
}
