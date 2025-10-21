import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface ReactionTimeGameProps {
  onComplete: (score: number) => void;
  rounds?: number;
}

export function ReactionTimeGame({ onComplete, rounds = 5 }: ReactionTimeGameProps) {
  const { themeConfig } = useTheme();
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'click' | 'early' | 'result'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  useEffect(() => {
    if (phase === 'waiting' && currentRound < rounds) {
      // Random delay between 1-4 seconds
      const delay = Math.random() * 3000 + 1000;
      const timer = setTimeout(() => {
        setPhase('click');
        setStartTime(Date.now());
      }, delay);
      return () => clearTimeout(timer);
    } else if (currentRound >= rounds && phase === 'waiting') {
      setPhase('result');
      const avgTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
      const score = Math.max(0, 100 - Math.floor(avgTime / 10)); // Lower time = higher score
      onComplete(score);
    }
  }, [phase, currentRound, rounds, reactionTimes, onComplete]);

  const handleClick = () => {
    if (phase === 'waiting') {
      // Clicked too early
      setPhase('early');
      setTimeout(() => {
        setPhase('waiting');
      }, 1500);
    } else if (phase === 'click') {
      // Good click!
      const reactionTime = Date.now() - startTime;
      setReactionTimes([...reactionTimes, reactionTime]);
      setCurrentRound(currentRound + 1);
      setPhase('ready');
      setTimeout(() => {
        if (currentRound + 1 < rounds) {
          setPhase('waiting');
        }
      }, 1000);
    }
  };

  const averageTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  if (phase === 'result') {
    let rating = 'Good!';
    let emoji = '👍';
    if (averageTime < 250) {
      rating = 'Lightning Fast!';
      emoji = '⚡';
    } else if (averageTime < 350) {
      rating = 'Excellent!';
      emoji = '🌟';
    } else if (averageTime > 500) {
      rating = 'Keep Practicing!';
      emoji = '💪';
    }

    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">{emoji}</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          {rating}
        </h3>
        <p className="text-2xl mb-6">
          Average: <strong>{averageTime}ms</strong>
        </p>
        <div className="max-w-md mx-auto space-y-2">
          {reactionTimes.map((time, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: themeConfig.colors.background }}
            >
              <span>Round {index + 1}</span>
              <span className="font-bold">{time}ms</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-xl font-bold mb-2">Reaction Time Test</p>
        <p className="text-sm" style={{ opacity: 0.7 }}>
          Round {currentRound + 1} of {rounds}
        </p>
        {averageTime > 0 && (
          <p className="text-lg mt-2">
            Average: <strong>{averageTime}ms</strong>
          </p>
        )}
      </div>

      <button
        onClick={handleClick}
        className="w-full h-96 rounded-2xl text-3xl font-bold transition-all transform active:scale-95 focus:outline-none"
        style={{
          backgroundColor:
            phase === 'waiting' ? '#ef4444' :
            phase === 'click' ? '#22c55e' :
            phase === 'ready' ? '#3b82f6' :
            phase === 'early' ? '#f59e0b' : '#6b7280',
          color: 'white',
        }}
      >
        {phase === 'waiting' && 'Wait for Green...'}
        {phase === 'click' && 'CLICK NOW!'}
        {phase === 'ready' && (
          <div>
            <div className="text-6xl mb-2">✓</div>
            <div>{reactionTimes[reactionTimes.length - 1]}ms</div>
          </div>
        )}
        {phase === 'early' && (
          <div>
            <div className="text-6xl mb-2">⚠️</div>
            <div>Too Early!</div>
          </div>
        )}
      </button>

      <p className="text-center text-sm" style={{ opacity: 0.7 }}>
        {phase === 'waiting' ? 'Stay focused! Click when it turns green.' : 
         phase === 'click' ? 'Go! Go! Go!' :
         phase === 'ready' ? 'Get ready for the next round...' : ''}
      </p>
    </div>
  );
}
