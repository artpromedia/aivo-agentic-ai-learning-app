import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@aivo/ui';

interface BreathingExerciseProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function BreathingExercise({ onComplete, duration = 60 }: BreathingExerciseProps) {
  const { themeConfig } = useTheme();
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [circleScale, setCircleScale] = useState(1);

  const phaseDurations = useMemo(() => ({
    inhale: 4,
    hold: 4,
    exhale: 4,
  }), []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(cyclesCompleted * 10);
    }
  }, [timeLeft, cyclesCompleted, onComplete]);

  // Breathing cycle
  useEffect(() => {
    let phaseTimer: ReturnType<typeof setTimeout>;

    const advancePhase = () => {
      setPhase(current => {
        if (current === 'inhale') return 'hold';
        if (current === 'hold') return 'exhale';
        setCyclesCompleted(prev => prev + 1);
        return 'inhale';
      });
    };

    phaseTimer = setTimeout(advancePhase, phaseDurations[phase] * 1000);

    return () => clearTimeout(phaseTimer);
  }, [phase, phaseDurations]);

  // Animate circle
  useEffect(() => {
    if (phase === 'inhale') {
      setCircleScale(1.5);
    } else if (phase === 'hold') {
      setCircleScale(1.5);
    } else {
      setCircleScale(1);
    }
  }, [phase]);

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return '#60a5fa';
      case 'hold':
        return '#a78bfa';
      case 'exhale':
        return '#34d399';
    }
  };

  if (timeLeft === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🧘</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Great Job!
        </h3>
        <p className="text-xl mb-6">
          You completed <strong>{cyclesCompleted}</strong> breathing cycles
        </p>
        <p className="text-sm" style={{ color: themeConfig.colors.text }}>
          Your mind is refreshed and ready to learn!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.primary }}>
          {cyclesCompleted} Cycles
        </div>
        <div className="text-sm" style={{ color: themeConfig.colors.text }}>
          {timeLeft}s remaining
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div
          className="rounded-full flex items-center justify-center transition-all duration-4000 ease-in-out"
          style={{
            width: '200px',
            height: '200px',
            backgroundColor: getPhaseColor(),
            transform: `scale(${circleScale})`,
            transition: `transform ${phaseDurations[phase]}s ease-in-out`,
            boxShadow: `0 0 60px ${getPhaseColor()}`,
          }}
        >
          <div className="text-white text-center">
            <div className="text-3xl font-bold mb-2">{getPhaseInstructions()}</div>
            <div className="text-sm opacity-80">Follow the circle</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium" style={{ color: themeConfig.colors.text }}>
          {phase === 'inhale' && '🌬️ Breathe in slowly through your nose'}
          {phase === 'hold' && '⏸️ Hold your breath gently'}
          {phase === 'exhale' && '😌 Breathe out slowly through your mouth'}
        </p>
        <p className="text-sm" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
          Focus on the expanding and contracting circle
        </p>
      </div>
    </div>
  );
}
