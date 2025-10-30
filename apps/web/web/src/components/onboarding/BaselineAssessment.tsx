/**
 * Baseline Assessment Component
 * 
 * Initial assessment to gauge learner's current level and preferences
 * Used during onboarding to personalize AI model
 * 
 * Updated: 2025-10-25 00:35:00 UTC
 * By: aivo-ai
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    images: ['👤 Alone', '👥 With friends', '👨‍🏫 With teacher', '🏠 At home'],
  },
  {
    id: 6,
    question: "Which subject sounds most fun?",
    type: 'multiple-choice',
    options: ['Math puzzles', 'Reading stories', 'Science experiments', 'Art and creativity'],
  },
  {
    id: 7,
    question: "How do you feel about homework?",
    type: 'visual',
    images: ['😃', '🙂', '😐', '😟'],
  },
  {
    id: 8,
    question: "What helps you focus best?",
    type: 'multiple-choice',
    options: ['Quiet space', 'Background music', 'Short breaks', 'Fidget tools'],
  },
];

interface BaselineAssessmentProps {
  learnerId: string;
  onComplete?: () => void;
}

export function BaselineAssessment({ learnerId, onComplete }: BaselineAssessmentProps) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = async (optionIndex: number) => {
    // Save answer
    const newAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(newAnswers);
    
    // Show encouragement
    setShowEncouragement(true);
    
    // Move to next question or finish
    setTimeout(async () => {
      setShowEncouragement(false);
      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Assessment complete - submit results
        try {
          const token = localStorage.getItem('access_token');
          await fetch(`http://localhost:9000/api/v1/assessments/baseline`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              learner_id: learnerId,
              answers: newAnswers,
              completed_at: new Date().toISOString()
            })
          });
        } catch (error) {
          console.error('Failed to submit assessment:', error);
        }
        
        // Save completion date locally
        localStorage.setItem('lastAssessmentDate', new Date().toISOString());
        
        // Navigate to model cloning page
        if (onComplete) {
          onComplete();
        } else {
          navigate(`/onboarding/cloning/${learnerId}`);
        }
      }
    }, 1500);
  };

  const encouragementMessages = [
    "Great choice! 🌟",
    "You're doing awesome! ⭐",
    "Perfect! Keep going! 🎉",
    "Excellent! 🎈",
    "Wonderful! 💫",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 md:p-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-4 md:h-6 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xl md:text-2xl font-bold text-purple-600">
            {currentQuestionIndex + 1}/{assessmentQuestions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-2xl mb-8">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center text-neutral-900 mb-8 md:mb-12">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentQuestion.type === 'visual' && currentQuestion.images?.map((content, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-3xl flex flex-col items-center justify-center text-5xl md:text-7xl lg:text-9xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label={`Option ${index + 1}`}
              >
                {content}
              </button>
            ))}

            {currentQuestion.type !== 'visual' && currentQuestion.options?.map((option, index) => {
              const colors = [
                'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
                'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              ];
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`min-h-[80px] md:min-h-[100px] bg-gradient-to-r ${colors[index % colors.length]} text-white rounded-2xl px-6 py-4 text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-lg md:text-2xl text-purple-600 font-medium">
          Pick the answer that feels right for you! There's no wrong answer. 💜
        </p>
      </div>

      {/* Encouragement Banner */}
      {showEncouragement && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-8 rounded-3xl shadow-2xl transform scale-110 animate-bounce">
            <p className="text-4xl font-bold">
              {encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


