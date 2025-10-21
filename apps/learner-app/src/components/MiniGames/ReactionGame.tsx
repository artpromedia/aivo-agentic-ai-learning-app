import React, { useEffect, useState } from 'react';
import { Button } from '@aivo/ui';

interface ReactionGameProps {
  onComplete: (score: number) => void;
  duration: number; // seconds
}

export const ReactionGame: React.FC<ReactionGameProps> = ({ onComplete, duration }) => {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'go' | 'toosoon' | 'result'>('idle');
  const [attempts, setAttempts] = useState<number[]>([]);
  const [currentReaction, setCurrentReaction] = useState<number | null>(null);
  const [goTimestamp, setGoTimestamp] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  // Game timer
  useEffect(() => {
    if (phase === 'idle') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Calculate final score
          const avgReaction = attempts.length > 0
            ? attempts.reduce((a, b) => a + b, 0) / attempts.length
            : 1000;
          const score = Math.max(0, 100 - Math.floor(avgReaction / 10));
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, attempts, onComplete]);

  // Waiting phase timer
  useEffect(() => {
    if (phase !== 'waiting') return;
    
    const delay = 1000 + Math.random() * 3000; // 1-4 seconds
    const timer = setTimeout(() => {
      setPhase('go');
      setGoTimestamp(performance.now());
    }, delay);

    return () => clearTimeout(timer);
  }, [phase]);

  const handleStart = () => {
    setPhase('waiting');
    setCurrentReaction(null);
  };

  const handleTap = () => {
    if (phase === 'waiting') {
      // Too soon
      setPhase('toosoon');
      setTimeout(() => setPhase('idle'), 1500);
    } else if (phase === 'go') {
      // Calculate reaction time
      const reaction = Math.round(performance.now() - goTimestamp);
      setCurrentReaction(reaction);
      setAttempts([...attempts, reaction]);
      setPhase('result');
      setTimeout(() => setPhase('idle'), 1500);
    }
  };

  const getBestTime = () => {
    return attempts.length > 0 ? Math.min(...attempts) : null;
  };

  const getAverageTime = () => {
    return attempts.length > 0
      ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
      : null;
  };

  return (
    <div className="space-y-4" data-testid="reaction-game">
      {/* Timer */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          ⏱️ Time: {timeRemaining}s
        </div>
        <div className="text-sm text-neutral-600">
          Attempts: {attempts.length}
        </div>
      </div>

      {/* Game Area */}
      <div
        onClick={handleTap}
        className={`
          h-64 rounded-2xl flex flex-col items-center justify-center text-center
          cursor-pointer select-none transition-all
          ${phase === 'idle' && 'bg-neutral-100 hover:bg-neutral-200'}
          ${phase === 'waiting' && 'bg-red-200 animate-pulse'}
          ${phase === 'go' && 'bg-green-400'}
          ${phase === 'toosoon' && 'bg-yellow-200'}
          ${phase === 'result' && 'bg-blue-100'}
        `}
        data-testid="reaction-tap-area"
      >
        {phase === 'idle' && (
          <div>
            <p className="text-2xl mb-4">🎯</p>
            <p className="text-lg font-medium mb-2">Tap to Start</p>
            <p className="text-sm text-neutral-600">Wait for green, then tap as fast as you can!</p>
          </div>
        )}

        {phase === 'waiting' && (
          <div>
            <p className="text-2xl mb-4">🔴</p>
            <p className="text-lg font-medium">Wait for green...</p>
          </div>
        )}

        {phase === 'go' && (
          <div>
            <p className="text-4xl mb-4">💚</p>
            <p className="text-2xl font-bold">TAP NOW!</p>
          </div>
        )}

        {phase === 'toosoon' && (
          <div>
            <p className="text-2xl mb-4">⚠️</p>
            <p className="text-lg font-medium">Too Soon!</p>
            <p className="text-sm">Wait for green before tapping</p>
          </div>
        )}

        {phase === 'result' && (
          <div>
            <p className="text-2xl mb-4">⚡</p>
            <p className="text-3xl font-bold mb-2">{currentReaction}ms</p>
            <p className="text-sm">
              {currentReaction! < 200 && '🔥 Lightning fast!'}
              {currentReaction! >= 200 && currentReaction! < 300 && '✨ Great reaction!'}
              {currentReaction! >= 300 && currentReaction! < 400 && '👍 Good job!'}
              {currentReaction! >= 400 && '💪 Keep practicing!'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-sm text-neutral-600 mb-1">Best Time</p>
            <p className="text-2xl font-bold text-green-700">{getBestTime()}ms</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-neutral-600 mb-1">Average</p>
            <p className="text-2xl font-bold text-blue-700">{getAverageTime()}ms</p>
          </div>
        </div>
      )}

      {phase === 'idle' && attempts.length > 0 && (
        <Button variant="primary" fullWidth onClick={handleStart} data-testid="try-again">
          Try Again
        </Button>
      )}
    </div>
  );
};
