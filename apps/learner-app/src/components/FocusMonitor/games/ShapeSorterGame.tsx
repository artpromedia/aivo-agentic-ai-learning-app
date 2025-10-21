import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface ShapeSorterGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function ShapeSorterGame({ onComplete, duration = 60 }: ShapeSorterGameProps) {
  const { themeConfig } = useTheme();
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const shapes = [
    { id: 0, shape: '⭐', name: 'Star', color: '#fbbf24' },
    { id: 1, shape: '●', name: 'Circle', color: '#60a5fa' },
    { id: 2, shape: '■', name: 'Square', color: '#f87171' },
    { id: 3, shape: '▲', name: 'Triangle', color: '#34d399' },
  ];

  const [targetShape, setTargetShape] = useState(shapes[Math.floor(Math.random() * shapes.length)]);

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

  const handleShapeClick = (shapeId: number) => {
    if (gameOver || !targetShape) return;

    if (shapeId === targetShape.id) {
      // Correct!
      setScore(score + 1);
      setTargetShape(shapes[Math.floor(Math.random() * shapes.length)]);
    } else {
      // Wrong
      setMistakes(mistakes + 1);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🌟</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Great Job!
        </h3>
        <p className="text-xl mb-2">
          You sorted <strong>{score}</strong> shapes!
        </p>
        <p className="text-lg mb-6" style={{ opacity: 0.7 }}>
          Mistakes: {mistakes}
        </p>
      </div>
    );
  }

  if (!targetShape) return null;

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

      {/* Target Shape */}
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <p className="text-xl font-bold mb-4">Find the:</p>
        <div className="text-9xl mb-2" style={{ color: targetShape.color }}>
          {targetShape.shape}
        </div>
        <p className="text-2xl font-bold" style={{ color: targetShape.color }}>
          {targetShape.name}
        </p>
      </div>

      {/* Shape Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleShapeClick(shape.id)}
            className="aspect-square rounded-2xl transition-all transform hover:scale-110 active:scale-95 text-9xl flex items-center justify-center"
            style={{
              backgroundColor: 'white',
              border: `4px solid ${shape.color}`,
              color: shape.color,
            }}
          >
            {shape.shape}
          </button>
        ))}
      </div>

      <p className="text-center text-lg font-medium" style={{ color: themeConfig.colors.primary }}>
        Click the {targetShape.name}!
      </p>
    </div>
  );
}
