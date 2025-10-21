import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface LogicPuzzleGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function LogicPuzzleGame({ onComplete, duration = 120 }: LogicPuzzleGameProps) {
  const { themeConfig } = useTheme();
  const [puzzle, setPuzzle] = useState<{ pattern: number[]; answer: number; options: number[] }>({
    pattern: [],
    answer: 0,
    options: [],
  });
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

  const generatePuzzle = (level: number) => {
    const puzzleTypes = [
      // Arithmetic sequences
      () => {
        const start = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 5) + 2;
        const pattern = [start, start + diff, start + diff * 2, start + diff * 3];
        const answer = start + diff * 4;
        return { pattern, answer };
      },
      // Multiply sequences
      () => {
        const start = Math.floor(Math.random() * 5) + 2;
        const mult = 2;
        const pattern = [start, start * mult, start * mult * mult, start * mult * mult * mult];
        const answer = start * mult * mult * mult * mult;
        return { pattern, answer };
      },
      // Fibonacci-like
      () => {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 2;
        const c = a + b;
        const d = b + c;
        const pattern = [a, b, c, d];
        const answer = c + d;
        return { pattern, answer };
      },
      // Square numbers
      () => {
        const n = Math.floor(Math.random() * 3) + 2;
        const pattern = [n * n, (n + 1) * (n + 1), (n + 2) * (n + 2), (n + 3) * (n + 3)];
        const answer = (n + 4) * (n + 4);
        return { pattern, answer };
      },
    ];

    const typeIndex = Math.floor(Math.random() * Math.min(puzzleTypes.length, level + 1));
    const type = puzzleTypes[typeIndex];
    if (!type) return;
    const { pattern, answer } = type();
    
    // Generate wrong options
    const options = [answer];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = answer + offset;
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    setPuzzle({ pattern, answer, options });
    setFeedback(null);
  };

  useEffect(() => {
    generatePuzzle(difficulty);
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score * 20);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const handleAnswer = (selectedAnswer: number) => {
    if (selectedAnswer === puzzle.answer) {
      setScore(score + 1);
      setFeedback('correct');
      // Increase difficulty every 3 correct answers
      if ((score + 1) % 3 === 0 && difficulty < 3) {
        setDifficulty(difficulty + 1);
      }
      setTimeout(() => generatePuzzle(difficulty), 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🧠</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Logic Master!
        </h3>
        <p className="text-xl mb-2">
          Solved: <strong>{score}</strong> puzzles
        </p>
        <p className="text-lg mb-6" style={{ opacity: 0.7 }}>
          Difficulty Level: {difficulty}
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
          <div className="text-2xl font-bold" style={{ color: themeConfig.colors.primary }}>
            Level {difficulty}
          </div>
          <div className="text-sm">Difficulty</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-xl font-bold mb-6">Find the pattern and complete the sequence:</p>
        <div className="flex justify-center items-center gap-4 mb-4">
          {puzzle.pattern.map((num, index) => (
            <div
              key={index}
              className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-xl"
              style={{
                backgroundColor: themeConfig.colors.primary,
                color: 'white',
              }}
            >
              {num}
            </div>
          ))}
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl font-bold rounded-xl border-4 border-dashed"
            style={{ borderColor: themeConfig.colors.primary }}
          >
            ?
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {puzzle.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="p-6 rounded-xl text-2xl font-bold transition transform hover:scale-105 active:scale-95 border-4"
            style={{
              backgroundColor: 'white',
              borderColor: themeConfig.colors.border,
              color: themeConfig.colors.text,
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback === 'correct' && (
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-2">🎉</div>
          <p className="text-xl font-bold text-green-600">
            Correct! Great pattern recognition!
          </p>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-center text-2xl text-red-600 animate-shake">
          ❌ Try analyzing the pattern again!
        </div>
      )}
    </div>
  );
}
