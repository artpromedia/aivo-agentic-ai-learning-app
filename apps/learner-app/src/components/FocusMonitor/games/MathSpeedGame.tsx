import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface MathSpeedGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function MathSpeedGame({ onComplete, duration = 90 }: MathSpeedGameProps) {
  const { themeConfig } = useTheme();
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const generateProblem = () => {
    const operations = ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;

    switch (op) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 30;
        num2 = Math.floor(Math.random() * 30) + 5;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 15) + 2;
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2}`;
        break;
      default:
        num1 = 0;
        answer = 0;
        question = '';
    }

    setProblem({ question, answer });
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score * 10);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    if (answer === problem.answer) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback('correct');
      setTimeout(() => generateProblem(), 800);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
      setUserAnswer('');
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🧮</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Math Champion!
        </h3>
        <p className="text-xl mb-2">
          Solved: <strong>{score}</strong> problems
        </p>
        <p className="text-lg mb-6" style={{ opacity: 0.7 }}>
          Best Streak: {Math.max(streak, 0)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {score}
          </div>
          <div className="text-sm">Solved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: streak >= 3 ? '#f59e0b' : themeConfig.colors.text }}>
            {streak >= 3 && '🔥'} {streak}
          </div>
          <div className="text-sm">Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <p className="text-6xl md:text-7xl font-bold mb-6" style={{ color: themeConfig.colors.primary }}>
          {problem.question}
        </p>
        <p className="text-4xl font-bold" style={{ color: themeConfig.colors.text }}>
          = ?
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
          placeholder="Your answer"
          className="w-full p-6 text-4xl text-center rounded-2xl border-4 focus:outline-none mb-4"
          style={{
            borderColor: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : themeConfig.colors.border,
            backgroundColor: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
          }}
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!userAnswer}
          className="w-full py-4 rounded-xl text-xl font-bold transition transform hover:scale-105 disabled:opacity-50"
          style={{
            backgroundColor: themeConfig.colors.primary,
            color: 'white',
          }}
        >
          Submit Answer
        </button>
      </div>

      {feedback === 'correct' && (
        <div className="text-center text-3xl animate-bounce">
          ✅ Correct! {streak >= 3 && '🔥 On Fire!'}
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-center">
          <div className="text-3xl animate-shake mb-2">❌</div>
          <p className="text-lg">The answer was {problem.answer}</p>
        </div>
      )}
    </div>
  );
}
