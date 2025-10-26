import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@aivo/ui';

interface SimonSaysGameProps {
  onComplete: (score: number) => void;
  duration?: number; // seconds
}

export function SimonSaysGame({ onComplete, duration = 60 }: SimonSaysGameProps) {
  const { themeConfig } = useTheme();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  const colors = [
    { id: 0, bg: '#ef4444', light: '#fca5a5', name: 'Red' },
    { id: 1, bg: '#3b82f6', light: '#93c5fd', name: 'Blue' },
    { id: 2, bg: '#22c55e', light: '#86efac', name: 'Green' },
    { id: 3, bg: '#eab308', light: '#fde047', name: 'Yellow' },
  ];

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const playSequence = useCallback(async (seq: number[]) => {
    setIsPlaying(true);
    for (const colorId of seq) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveButton(colorId);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsPlaying(false);
  }, []);

  const nextRound = useCallback(() => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    playSequence(newSequence);
  }, [sequence, playSequence]);

  // Start game
  useEffect(() => {
    if (sequence.length === 0) {
      nextRound();
    }
  }, [sequence.length, nextRound]);

  const handleButtonClick = (colorId: number) => {
    if (isPlaying || gameOver) return;

    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    // Flash button
    setActiveButton(colorId);
    setTimeout(() => setActiveButton(null), 300);

    // Check if correct
    if (colorId !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      onComplete(score);
      return;
    }

    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(score + 1);
      setTimeout(() => nextRound(), 1000);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🎮</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Game Over!
        </h3>
        <p className="text-xl mb-6">
          You completed <strong>{score}</strong> rounds!
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
          <div className="text-sm">Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time Left</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleButtonClick(color.id)}
            disabled={isPlaying}
            className="aspect-square rounded-2xl transition-all transform active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: activeButton === color.id ? color.light : color.bg,
              boxShadow: activeButton === color.id ? '0 0 20px rgba(0,0,0,0.3)' : 'none',
            }}
            aria-label={color.name}
          />
        ))}
      </div>

      <p className="text-center text-sm" style={{ color: themeConfig.colors.text }}>
        {isPlaying ? 'Watch the pattern...' : 'Repeat the pattern!'}
      </p>
    </div>
  );
}
