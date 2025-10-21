import { useEffect, useState, type FC } from 'react';
import { useTheme } from '@aivo/ui';

interface FocusMetrics {
  attentionScore: number; // 0-100
  correctAnswersStreak: number;
  timeOnTask: number; // seconds
  idleTime: number; // seconds
  lastInteraction: Date;
  distractionEvents: number;
}

interface FocusMonitorProps {
  learnerId: string;
  subjectId: string;
  theme: 'K5' | 'MS' | 'HS';
  onGameBreakSuggested: () => void;
  maxBreaksPerDay?: number;
  breaksUsedToday?: number;
  allowManualBreaks?: boolean;
  onMetricsUpdate?: (metrics: FocusMetrics) => void;
}

export const FocusMonitor: FC<FocusMonitorProps> = ({
  learnerId: _learnerId,
  subjectId: _subjectId,
  theme: _theme,
  onGameBreakSuggested,
  maxBreaksPerDay = 3,
  breaksUsedToday = 0,
  allowManualBreaks = true,
  onMetricsUpdate,
}) => {
  const { themeConfig } = useTheme();
  const [metrics, setMetrics] = useState<FocusMetrics>({
    attentionScore: 100,
    correctAnswersStreak: 0,
    timeOnTask: 0,
    idleTime: 0,
    lastInteraction: new Date(),
    distractionEvents: 0,
  });

  const [focusState, setFocusState] = useState<'focused' | 'wandering' | 'distracted'>('focused');
  const [showSuggestion, setShowSuggestion] = useState(false);

  const breaksRemaining = Math.max(0, maxBreaksPerDay - breaksUsedToday);
  const canTakeBreak = breaksRemaining > 0;

  // Expose methods for parent components to update metrics
  useEffect(() => {
    if (window) {
      (window as any).updateFocusMetrics = {
        recordAnswer: (correct: boolean) => {
          setMetrics(prev => {
            const newMetrics = {
              ...prev,
              correctAnswersStreak: correct 
                ? Math.max(0, prev.correctAnswersStreak) + 1 
                : Math.min(0, prev.correctAnswersStreak) - 1,
            };
            onMetricsUpdate?.(newMetrics);
            return newMetrics;
          });
        },
        recordDistraction: () => {
          setMetrics(prev => {
            const newMetrics = {
              ...prev,
              distractionEvents: prev.distractionEvents + 1,
            };
            onMetricsUpdate?.(newMetrics);
            return newMetrics;
          });
        },
      };
    }

    return () => {
      if (window) {
        delete (window as any).updateFocusMetrics;
      }
    };
  }, [onMetricsUpdate]);

  // Track user activity
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let taskTimer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      setMetrics(prev => ({
        ...prev,
        lastInteraction: new Date(),
        idleTime: 0,
      }));
    };

    const trackActivity = () => {
      resetIdle();
    };

    // Listen for user interactions
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, trackActivity);
    });

    // Check for idle time
    idleTimer = setInterval(() => {
      const now = new Date();
      const timeSinceInteraction = (now.getTime() - metrics.lastInteraction.getTime()) / 1000;
      
      if (timeSinceInteraction > 10) { // Check every 10 seconds
        setMetrics(prev => ({
          ...prev,
          idleTime: timeSinceInteraction,
        }));
      }
    }, 1000);

    // Track time on task
    taskTimer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timeOnTask: prev.timeOnTask + 1,
      }));
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
      clearInterval(idleTimer);
      clearInterval(taskTimer);
    };
  }, [metrics.lastInteraction]);

  // Calculate focus state based on metrics
  useEffect(() => {
    const calculateFocusState = () => {
      let score = 100; // Start fresh each calculation

      // Penalize for idle time
      if (metrics.idleTime > 60) {
        score -= 30;
      } else if (metrics.idleTime > 30) {
        score -= 15;
      }

      // Penalize for incorrect answer streaks
      if (metrics.correctAnswersStreak < 0 && Math.abs(metrics.correctAnswersStreak) >= 3) {
        score -= 20;
      } else if (metrics.correctAnswersStreak < 0) {
        score -= 10;
      }

      // Penalize for distraction events
      score -= metrics.distractionEvents * 10;

      // Bonus for sustained focus
      if (metrics.timeOnTask > 300 && metrics.correctAnswersStreak > 5) {
        score += 10;
      }

      // Bonus for correct streaks
      if (metrics.correctAnswersStreak > 3) {
        score += 10;
      }

      const finalScore = Math.max(0, Math.min(100, score));
      
      setMetrics(prev => {
        const newMetrics = { ...prev, attentionScore: finalScore };
        onMetricsUpdate?.(newMetrics);
        return newMetrics;
      });

      // Determine focus state
      if (finalScore >= 70) {
        setFocusState('focused');
        setShowSuggestion(false);
      } else if (finalScore >= 40) {
        setFocusState('wandering');
        if (canTakeBreak && !showSuggestion) {
          setTimeout(() => setShowSuggestion(true), 2000); // Delay suggestion
        }
      } else {
        setFocusState('distracted');
        if (canTakeBreak) {
          setTimeout(() => setShowSuggestion(true), 1000);
        }
      }
    };

    calculateFocusState();
  }, [metrics.idleTime, metrics.correctAnswersStreak, metrics.distractionEvents, metrics.timeOnTask, canTakeBreak]);

  const handleStartBreak = () => {
    setShowSuggestion(false);
    onGameBreakSuggested();
  };

  const getFocusIcon = () => {
    switch (focusState) {
      case 'focused':
        return '🎯';
      case 'wandering':
        return '💭';
      case 'distracted':
        return '😵';
    }
  };

  const getFocusColor = () => {
    switch (focusState) {
      case 'focused':
        return { bg: '#dcfce7', border: '#86efac', text: '#166534' };
      case 'wandering':
        return { bg: '#fef3c7', border: '#fde047', text: '#854d0e' };
      case 'distracted':
        return { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' };
    }
  };

  const colors = getFocusColor();

  return (
    <div className="space-y-4" data-testid="focus-monitor">
      <div
        className="rounded-2xl p-6 shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-label={`Focus state: ${focusState}`}>
              {getFocusIcon()}
            </span>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: themeConfig.colors.text }}>
                Focus Monitor
              </h3>
              <p className="text-sm capitalize" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                Status: {focusState}
              </p>
            </div>
          </div>
          
          <div
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {metrics.attentionScore}% Attention
          </div>
        </div>

        {/* Metrics Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeConfig.colors.primary}11` }}>
            <div className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
              {Math.floor(metrics.timeOnTask / 60)}m
            </div>
            <div className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
              Time on Task
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeConfig.colors.primary}11` }}>
            <div className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
              {Math.max(0, metrics.correctAnswersStreak)}
            </div>
            <div className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
              Correct Streak
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeConfig.colors.primary}11` }}>
            <div className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
              {breaksRemaining}
            </div>
            <div className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
              Breaks Left
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeConfig.colors.primary}11` }}>
            <div className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
              {metrics.distractionEvents}
            </div>
            <div className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
              Distractions
            </div>
          </div>
        </div>

        {/* Game Break Suggestion */}
        {showSuggestion && canTakeBreak && (
          <div className="mb-4 p-4 rounded-xl border-2 bg-blue-50" style={{ borderColor: '#60a5fa' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <p className="font-medium mb-3 text-blue-900">
                  {focusState === 'distracted' 
                    ? "You seem distracted. A quick game break can help reset your focus!"
                    : "Your attention is wandering. Want to take a short break?"}
                </p>
                <button
                  onClick={handleStartBreak}
                  className="px-4 py-2 rounded-lg font-medium transition transform hover:scale-105"
                  style={{
                    backgroundColor: themeConfig.colors.primary,
                    color: 'white',
                  }}
                  data-testid="accept-break-suggestion"
                >
                  Start Game Break
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Break Button */}
        {allowManualBreaks && (
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: themeConfig.colors.border }}>
            <p className="text-sm" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
              Need a break? Take one anytime.
            </p>
            <button
              onClick={handleStartBreak}
              disabled={!canTakeBreak}
              className="px-4 py-2 rounded-lg text-sm font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2"
              style={{
                backgroundColor: 'white',
                borderColor: themeConfig.colors.border,
                color: themeConfig.colors.text,
              }}
              data-testid="manual-break-button"
            >
              {canTakeBreak ? 'Start Break' : 'No Breaks Left'}
            </button>
          </div>
        )}

        {!canTakeBreak && (
          <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: `${themeConfig.colors.primary}11`, color: themeConfig.colors.text }}>
            You've used all {maxBreaksPerDay} breaks for today. Great job staying focused! 🌟
          </div>
        )}
      </div>
    </div>
  );
};
