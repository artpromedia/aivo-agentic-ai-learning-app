import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface CountingGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function CountingGame({ onComplete, duration = 60 }: CountingGameProps) {
  const { themeConfig } = useTheme();
  const [items, setItems] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const emojis = ['🍎', '🍌', '🍇', '🍓', '🍊', '🌟', '🎈', '🎁', '🐶', '🐱'];

  // Generate new question
  const generateQuestion = () => {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const count = Math.floor(Math.random() * 9) + 1; // 1-9
    setItems(Array(count).fill(emoji));
    setAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const count = Math.floor(Math.random() * 9) + 1;
    setItems(Array(count).fill(emoji));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const correctAnswer = items.length.toString();
    if (answer === correctAnswer) {
      setScore(score + 1);
      setFeedback('correct');
      setTimeout(() => generateQuestion(), 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🎉</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Awesome Counting!
        </h3>
        <p className="text-xl mb-6">
          You counted <strong>{score}</strong> correctly!
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
          <div className="text-sm">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-2xl font-bold mb-6">How many do you see?</p>
        <div className="flex flex-wrap justify-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          {items.map((item, index) => (
            <div key={index} className="text-6xl">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && answer && handleSubmit()}
          placeholder="Type the number"
          className="w-full p-6 text-4xl text-center rounded-2xl border-4 focus:outline-none mb-4"
          style={{
            borderColor: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : themeConfig.colors.border,
            backgroundColor: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
          }}
          min="1"
          max="10"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!answer}
          className="w-full py-4 rounded-xl text-xl font-bold transition transform hover:scale-105 disabled:opacity-50"
          style={{
            backgroundColor: themeConfig.colors.primary,
            color: 'white',
          }}
        >
          Check Answer
        </button>
      </div>

      {feedback === 'correct' && (
        <div className="text-center text-3xl animate-bounce">
          ✅ Correct!
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-center text-3xl animate-shake">
          ❌ Try Again!
        </div>
      )}
    </div>
  );
}
