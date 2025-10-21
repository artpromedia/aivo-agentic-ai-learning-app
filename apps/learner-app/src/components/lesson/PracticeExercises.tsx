import { useState } from 'react';
import { useTheme } from '@aivo/ui';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

interface PracticeExercisesProps {
  questions: Question[];
  onComplete?: (score: number) => void;
  onAnswerSubmit?: (correct: boolean) => void;
}

export function PracticeExercises({ questions, onComplete, onAnswerSubmit }: PracticeExercisesProps) {
  const { themeConfig } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div>No questions available</div>;
  }
  
  const currentAnswer = answers[currentQuestion.id] || '';
  const isCorrect = currentAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleSubmit = () => {
    setShowFeedback(true);
    // Notify parent of answer correctness
    if (onAnswerSubmit) {
      onAnswerSubmit(isCorrect);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Calculate score
      const score = Object.entries(answers).filter(([id, answer]) => {
        const q = questions.find((q) => q.id === id);
        return q && answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      }).length;
      setCompleted(true);
      onComplete?.(score);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const calculateScore = () => {
    return Object.entries(answers).filter(([id, answer]) => {
      const q = questions.find((q) => q.id === id);
      return q && answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    }).length;
  };

  if (completed) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div
        className="rounded-2xl p-8 text-center shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: themeConfig.colors.border,
        }}
      >
        <div className="text-8xl mb-6">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          {percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-xl mb-6" style={{ color: themeConfig.colors.text }}>
          You got <span className="font-bold" style={{ color: themeConfig.colors.primary }}>{score}</span> out of{' '}
          <span className="font-bold">{questions.length}</span> correct
        </p>
        <div className="text-6xl font-bold mb-8" style={{ color: themeConfig.colors.primary }}>
          {percentage}%
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setAnswers({});
              setCurrentQuestionIndex(0);
              setCompleted(false);
              setShowFeedback(false);
            }}
            className="px-6 py-3 rounded-xl font-medium transition transform hover:scale-105"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: 'white',
            }}
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setShowFeedback(false);
            }}
            className="px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 border-2"
            style={{
              backgroundColor: 'white',
              borderColor: themeConfig.colors.border,
              color: themeConfig.colors.text,
            }}
          >
            📝 Review Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              backgroundColor: themeConfig.colors.primary,
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: themeConfig.colors.border,
        }}
      >
        <div className="mb-6">
          <div
            className="text-sm font-medium mb-2"
            style={{ color: themeConfig.colors.primary }}
          >
            Question {currentQuestionIndex + 1}
          </div>
          <h3
            className="text-2xl font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.type === 'multiple-choice' &&
            currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && handleAnswer(option)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition transform hover:scale-102 ${
                  showFeedback
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : option === currentAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : currentAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showFeedback && option === currentQuestion.correctAnswer
                        ? 'bg-green-500 border-green-500'
                        : showFeedback && option === currentAnswer
                        ? 'bg-red-500 border-red-500'
                        : currentAnswer === option
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {showFeedback && option === currentQuestion.correctAnswer && (
                      <span className="text-white text-sm">✓</span>
                    )}
                    {showFeedback && option === currentAnswer && option !== currentQuestion.correctAnswer && (
                      <span className="text-white text-sm">✗</span>
                    )}
                    {!showFeedback && currentAnswer === option && (
                      <span className="text-white text-sm">●</span>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}

          {currentQuestion.type === 'fill-blank' && (
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => !showFeedback && handleAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className={`w-full p-4 rounded-xl border-2 text-lg ${
                showFeedback
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:outline-none'
              }`}
            />
          )}

          {currentQuestion.type === 'true-false' &&
            ['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => !showFeedback && handleAnswer(option)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition transform hover:scale-102 ${
                  showFeedback
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : option === currentAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : currentAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showFeedback && option === currentQuestion.correctAnswer
                        ? 'bg-green-500 border-green-500'
                        : showFeedback && option === currentAnswer
                        ? 'bg-red-500 border-red-500'
                        : currentAnswer === option
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {showFeedback && option === currentQuestion.correctAnswer && (
                      <span className="text-white text-sm">✓</span>
                    )}
                    {showFeedback && option === currentAnswer && option !== currentQuestion.correctAnswer && (
                      <span className="text-white text-sm">✗</span>
                    )}
                    {!showFeedback && currentAnswer === option && (
                      <span className="text-white text-sm">●</span>
                    )}
                  </div>
                  <span className="font-medium text-xl">{option === 'True' ? '✓ True' : '✗ False'}</span>
                </div>
              </button>
            ))}
        </div>

        {/* Hint Button */}
        {currentQuestion.hint && !showFeedback && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 rounded-lg border-2 text-sm font-medium transition"
              style={{
                borderColor: themeConfig.colors.border,
                color: themeConfig.colors.primary,
              }}
            >
              💡 {showHint ? 'Hide' : 'Show'} Hint
            </button>
            {showHint && (
              <div className="mt-3 p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                <p className="text-sm text-yellow-800">{currentQuestion.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-xl border-2 mb-4 ${
              isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{isCorrect ? '✅' : '❌'}</span>
              <div>
                <p className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </p>
                <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {currentQuestion.explanation}
                </p>
                {!isCorrect && (
                  <p className="text-sm mt-2 text-gray-700">
                    Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{
              backgroundColor: 'white',
              borderColor: themeConfig.colors.border,
              color: themeConfig.colors.text,
            }}
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            {!showFeedback ? (
              <button
                onClick={handleSubmit}
                disabled={!currentAnswer}
                className="px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  color: 'white',
                }}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-medium transition transform hover:scale-105"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  color: 'white',
                }}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
