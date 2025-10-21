/**
 * Visual Timer Component
 * 
 * Provides 5 visual timer styles for learners with executive function challenges:
 * - Pie: Circular progress (most popular)
 * - Bar: Horizontal progress bar
 * - Hourglass: Animated hourglass flip
 * - Traffic Light: Color-coded time remaining (green/yellow/red)
 * - Countdown: Large digital clock
 * 
 * Features:
 * - Customizable warnings at intervals
 * - Sound and visual alerts
 * - Pause/resume functionality
 * - Auto-start option
 */

import React, { useState, useEffect } from 'react';
import type { VisualTimer as IVisualTimer, TimerWarning } from '@aivo/types';
import { Button, Card } from '@aivo/ui';

export const VisualTimer: React.FC<{
  timer: IVisualTimer;
  onComplete?: () => void;
  onCancel?: () => void;
}> = ({ timer, onComplete, onCancel }) => {
  const [timeRemaining, setTimeRemaining] = useState(timer.duration);
  const [isRunning, setIsRunning] = useState(timer.autoStart);
  const [isPaused, setIsPaused] = useState(false);

  const showWarning = React.useCallback((warning: TimerWarning) => {
    if (timer.soundEnabled && warning.sound) {
      playSound(warning.sound);
    }
    // Visual warning would use toast/notification in production
    console.log(`Warning: ${warning.message}`);
  }, [timer.soundEnabled]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (timer.soundEnabled) {
            playSound('complete');
          }
          if (onComplete) {
            onComplete();
          }
          return 0;
        }

        // Check for warnings
        const warning = timer.warnings.find(w => w.secondsRemaining === prev);
        if (warning) {
          showWarning(warning);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timer, onComplete, showWarning]);

  const playSound = (type: string) => {
    // In production, play actual audio files
    console.log(`Playing sound: ${type}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs };
  };

  const { mins, secs } = formatTime(timeRemaining);
  const progress = ((timer.duration - timeRemaining) / timer.duration) * 100;

  return (
    <Card data-testid="visual-timer">
      <div className="space-y-6">
        {/* Timer Name */}
        <div className="text-center">
          <h3 className="text-xl font-bold dark:text-white">{timer.name}</h3>
        </div>

        {/* Visual Display */}
        <div className="flex justify-center">
          {timer.style === 'pie' && <PieTimer progress={progress} color={timer.color} />}
          {timer.style === 'bar' && <BarTimer progress={progress} color={timer.color} />}
          {timer.style === 'hourglass' && <HourglassTimer progress={progress} />}
          {timer.style === 'traffic-light' && (
            <TrafficLightTimer timeRemaining={timeRemaining} totalDuration={timer.duration} />
          )}
          {timer.style === 'countdown' && (
            <CountdownTimer mins={mins} secs={secs} color={timer.color} />
          )}
        </div>

        {/* Time Display */}
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums dark:text-white">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            {isRunning && !isPaused ? 'Time remaining' : isPaused ? 'Paused' : 'Ready to start'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning && (
            <Button
              variant="primary"
              onClick={() => setIsRunning(true)}
              data-testid="start-timer"
            >
              ▶️ Start
            </Button>
          )}
          
          {isRunning && !isPaused && (
            <Button
              variant="outline"
              onClick={() => setIsPaused(true)}
              data-testid="pause-timer"
            >
              ⏸️ Pause
            </Button>
          )}
          
          {isPaused && (
            <Button
              variant="primary"
              onClick={() => setIsPaused(false)}
              data-testid="resume-timer"
            >
              ▶️ Resume
            </Button>
          )}
          
          {(isRunning || isPaused) && onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              data-testid="cancel-timer"
            >
              Stop
            </Button>
          )}
        </div>

        {/* Upcoming Warnings */}
        {timer.warnings.length > 0 && (
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            <div className="font-medium mb-1">Reminders:</div>
            <ul className="list-disc pl-5 space-y-1">
              {timer.warnings
                .filter(w => w.secondsRemaining < timeRemaining)
                .map((w, i) => (
                  <li key={i}>
                    {Math.floor(w.secondsRemaining / 60)} min: {w.message}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Pie Timer - Circular progress (most intuitive for time passing)
 */
const PieTimer: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="200" height="200" className="transform -rotate-90" data-testid="pie-timer">
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="20"
      />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="20"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000"
      />
    </svg>
  );
};

/**
 * Bar Timer - Horizontal progress bar (simple, linear)
 */
const BarTimer: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  return (
    <div className="w-64 h-32 bg-neutral-200 dark:bg-neutral-700 rounded-2xl overflow-hidden" data-testid="bar-timer">
      <div
        className="h-full transition-all duration-1000"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

/**
 * Hourglass Timer - Animated hourglass (playful, visual metaphor)
 */
const HourglassTimer: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div 
      className="text-8xl animate-bounce" 
      style={{ animationDuration: '2s' }}
      data-testid="hourglass-timer"
    >
      {progress < 50 ? '⏳' : '⌛'}
    </div>
  );
};

/**
 * Traffic Light Timer - Color-coded (green/yellow/red for time awareness)
 */
const TrafficLightTimer: React.FC<{
  timeRemaining: number;
  totalDuration: number;
}> = ({ timeRemaining, totalDuration }) => {
  const percentRemaining = (timeRemaining / totalDuration) * 100;
  
  const isGreen = percentRemaining > 50;
  const isYellow = percentRemaining > 25 && percentRemaining <= 50;
  const isRed = percentRemaining <= 25;

  return (
    <div className="space-y-4" data-testid="traffic-light-timer">
      <div 
        className={`w-24 h-24 rounded-full transition-colors ${
          isGreen ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-200 dark:bg-green-900'
        }`} 
      />
      <div 
        className={`w-24 h-24 rounded-full transition-colors ${
          isYellow ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-yellow-200 dark:bg-yellow-900'
        }`} 
      />
      <div 
        className={`w-24 h-24 rounded-full transition-colors ${
          isRed ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-red-200 dark:bg-red-900'
        }`} 
      />
    </div>
  );
};

/**
 * Countdown Timer - Large digital display (clear, numerical)
 */
const CountdownTimer: React.FC<{ mins: number; secs: number; color: string }> = ({ mins, secs, color }) => {
  return (
    <div 
      className="w-64 h-64 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-xl"
      style={{ backgroundColor: color }}
      data-testid="countdown-timer"
    >
      <div className="text-center">
        <div>{mins}</div>
        <div className="text-3xl">:</div>
        <div>{secs.toString().padStart(2, '0')}</div>
      </div>
    </div>
  );
};
