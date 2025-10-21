import React, { useEffect, useState, useMemo } from 'react';

interface BreathingGameProps {
  onComplete: (score: number) => void;
  duration: number; // seconds
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingGame: React.FC<BreathingGameProps> = ({ onComplete, duration }) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [count, setCount] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  // Breathing cycle timing
  const phaseDurations: Record<BreathPhase, number> = useMemo(() => ({
    inhale: 4,
    hold: 4,
    exhale: 6,
  }), []);

  // Main timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Score based on cycles completed
          const score = Math.min(100, cyclesCompleted * 20);
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cyclesCompleted, onComplete]);

  // Breathing cycle logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(currentPhase => {
            if (currentPhase === 'inhale') {
              return 'hold';
            } else if (currentPhase === 'hold') {
              return 'exhale';
            } else {
              // Completed one full cycle
              setCyclesCompleted(c => c + 1);
              return 'inhale';
            }
          });
          return phaseDurations[phase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, phaseDurations]);

  // Breathing circle animation scale
  const getCircleScale = () => {
    const progress = (phaseDurations[phase] - count) / phaseDurations[phase];
    
    switch (phase) {
      case 'inhale':
        return 1 + progress * 0.5; // Scale from 1 to 1.5
      case 'hold':
        return 1.5; // Stay large
      case 'exhale':
        return 1.5 - progress * 0.5; // Scale from 1.5 to 1
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-blue-400';
      case 'hold':
        return 'bg-purple-400';
      case 'exhale':
        return 'bg-green-400';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in through your nose';
      case 'hold':
        return 'Hold your breath';
      case 'exhale':
        return 'Breathe out slowly through your mouth';
    }
  };

  return (
    <div className="space-y-6" data-testid="breathing-game">
      {/* Timer & Stats */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          ⏱️ Time: {timeRemaining}s
        </div>
        <div className="text-sm text-neutral-600">
          Cycles: {cyclesCompleted}
        </div>
      </div>

      {/* Breathing Visualization */}
      <div className="relative h-80 flex items-center justify-center">
        <div
          className={`
            w-48 h-48 rounded-full transition-all duration-1000 ease-in-out
            flex flex-col items-center justify-center text-white
            ${getPhaseColor()}
          `}
          style={{
            transform: `scale(${getCircleScale()})`,
          }}
          data-testid="breathing-circle"
        >
          <p className="text-6xl font-bold mb-2" aria-live="polite">
            {count}
          </p>
          <p className="text-xl font-medium capitalize">
            {phase}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-lg text-neutral-700">
          {getPhaseInstruction()}
        </p>
      </div>

      {/* Benefits Reminder */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-center text-neutral-700">
          💙 Breathing exercises help calm your mind and improve focus
        </p>
      </div>
    </div>
  );
};
