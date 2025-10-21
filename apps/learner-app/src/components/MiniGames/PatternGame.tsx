import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@aivo/ui';

interface PatternGameProps {
  onComplete: (score: number) => void;
  duration: number; // seconds
}

export const PatternGame: React.FC<PatternGameProps> = ({ onComplete, duration }) => {
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Generate a pattern
  const generatePattern = useMemo(() => {
    return () => {
      const patternTypes = ['add', 'multiply', 'fibonacci'];
      const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];
      
      switch (type) {
        case 'add': {
          const start = Math.floor(Math.random() * 10) + 1;
          const step = Math.floor(Math.random() * 5) + 1;
          return Array.from({ length: 4 }, (_, i) => start + (i * step));
        }
        case 'multiply': {
          const start = Math.floor(Math.random() * 5) + 2;
          const multiplier = Math.floor(Math.random() * 3) + 2;
          return Array.from({ length: 4 }, (_, i) => start * Math.pow(multiplier, i));
        }
        case 'fibonacci': {
          const a = Math.floor(Math.random() * 3) + 1;
          const b = Math.floor(Math.random() * 3) + 2;
          const sequence = [a, b];
          for (let i = 2; i < 4; i++) {
            const prev1 = sequence[i - 1];
            const prev2 = sequence[i - 2];
            if (prev1 !== undefined && prev2 !== undefined) {
              sequence.push(prev1 + prev2);
            }
          }
          return sequence;
        }
        default:
          return [1, 2, 3, 4];
      }
    };
  }, []);

  // Initialize first pattern
  useEffect(() => {
    setCurrentPattern(generatePattern());
  }, [generatePattern]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(Math.min(100, score));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [score, onComplete]);

  const getCorrectAnswer = () => {
    if (currentPattern.length < 2) return 0;
    
    const val0 = currentPattern[0] ?? 0;
    const val1 = currentPattern[1] ?? 0;
    const val2 = currentPattern[2] ?? 0;
    const lastVal = currentPattern[currentPattern.length - 1] ?? 0;
    const secondLastVal = currentPattern[currentPattern.length - 2] ?? 0;
    
    // Detect pattern type
    const diff1 = val1 - val0;
    const diff2 = val2 - val1;
    
    // Check if it's addition pattern
    if (diff1 === diff2) {
      return lastVal + diff1;
    }
    
    // Check if it's multiplication pattern
    if (val0 !== 0 && val1 !== 0 && val1 / val0 === val2 / val1) {
      const ratio = val1 / val0;
      return Math.round(lastVal * ratio);
    }
    
    // Fibonacci pattern
    return lastVal + secondLastVal;
  };

  const handleSubmit = () => {
    if (userAnswer === null) return;
    
    const correct = getCorrectAnswer();
    const isCorrect = userAnswer === correct;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer(null);
      setCurrentPattern(generatePattern());
    }, 1500);
  };

  const handleNumberClick = (num: number) => {
    if (feedback) return;
    setUserAnswer(num);
  };

  // Generate answer options
  const answerOptions = useMemo(() => {
    const correct = getCorrectAnswer();
    const options = new Set([correct]);
    
    // Add wrong answers
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = correct + offset;
      if (wrong > 0 && wrong !== correct) {
        options.add(wrong);
      }
    }
    
    return Array.from(options).sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPattern]);

  return (
    <div className="space-y-6" data-testid="pattern-game">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          ⏱️ Time: {timeRemaining}s
        </div>
        <div className="text-sm text-neutral-600">
          Score: {score}
        </div>
        <div className="text-sm font-medium">
          🔥 Streak: {streak}
        </div>
      </div>

      {/* Pattern Display */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <p className="text-sm text-neutral-600 mb-4 text-center">
          What number comes next?
        </p>
        <div className="flex items-center justify-center gap-3 text-3xl font-bold">
          {currentPattern.map((num, idx) => (
            <React.Fragment key={idx}>
              <span className="bg-white px-6 py-4 rounded-xl shadow-sm">
                {num}
              </span>
              {idx < currentPattern.length - 1 && (
                <span className="text-neutral-400">→</span>
              )}
            </React.Fragment>
          ))}
          <span className="text-neutral-400">→</span>
          <span className="bg-yellow-100 px-6 py-4 rounded-xl border-2 border-dashed border-yellow-400">
            ?
          </span>
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3">
        {answerOptions.map((option) => (
          <Button
            key={option}
            variant={userAnswer === option ? 'primary' : 'outline'}
            size="lg"
            fullWidth
            onClick={() => handleNumberClick(option)}
            disabled={feedback !== null}
            className={`text-2xl font-bold ${
              feedback === 'correct' && userAnswer === option
                ? 'bg-green-500 hover:bg-green-500'
                : feedback === 'incorrect' && userAnswer === option
                ? 'bg-red-500 hover:bg-red-500'
                : ''
            }`}
            data-testid={`option-${option}`}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Submit Button */}
      {userAnswer !== null && !feedback && (
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleSubmit}
          data-testid="submit-answer"
        >
          Submit Answer
        </Button>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`text-center p-4 rounded-xl ${
          feedback === 'correct' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <p className="text-2xl mb-2">
            {feedback === 'correct' ? '✅' : '❌'}
          </p>
          <p className="text-lg font-semibold">
            {feedback === 'correct' ? 'Correct!' : 'Not quite!'}
          </p>
          {feedback === 'incorrect' && (
            <p className="text-sm text-neutral-600 mt-1">
              The answer was {getCorrectAnswer()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
