/**
 * Regulation Activity Component
 * 
 * Guides learners through regulation activities with:
 * - Intro screen with instructions
 * - Active timer with visual support
 * - Breathing animation
 * - Completion check-in
 */

import React, { useState, useEffect } from 'react';
import type { RegulationActivity as IRegulationActivity, EmotionState } from '@aivo/types';
import { Button, Card } from '@aivo/ui';
import { EmotionCheckIn } from './EmotionCheckIn';

export const RegulationActivityView: React.FC<{
  activity: IRegulationActivity;
  emotionBefore: EmotionState;
  onComplete: (emotionAfter: EmotionState, notes?: string) => void;
  onBack?: () => void;
}> = ({ activity, onComplete, onBack }) => {
  const [step, setStep] = useState<'intro' | 'active' | 'complete'>('intro');
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(activity.duration);
  const [notes, setNotes] = useState('');

  // Timer
  useEffect(() => {
    if (step !== 'active') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setStep('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Auto-advance instructions
  useEffect(() => {
    if (step !== 'active' || activity.type !== 'breathing') return;

    const instructionDuration = activity.duration / activity.instructions.length;
    const interval = setInterval(() => {
      setCurrentInstruction(prev => {
        if (prev >= activity.instructions.length - 1) return prev;
        return prev + 1;
      });
    }, instructionDuration * 1000);

    return () => clearInterval(interval);
  }, [step, activity]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'intro') {
    return (
      <div className="space-y-6" data-testid="activity-intro">
        <div className="text-center">
          <div className="text-6xl mb-4">{activity.icon}</div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">{activity.name}</h2>
          <p className="text-neutral-600 dark:text-neutral-300">{activity.description}</p>
        </div>

        <Card>
          <h3 className="font-semibold mb-3 dark:text-white">What we'll do:</h3>
          <ol className="space-y-2 list-decimal pl-5 text-sm dark:text-neutral-300">
            {activity.instructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold mb-1 dark:text-white">Duration</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                About {Math.ceil(activity.duration / 60)} minutes
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatTime(activity.duration)}
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              data-testid="back-button"
            >
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setStep('active')}
            data-testid="start-activity"
          >
            Let's Begin
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'active') {
    return (
      <div className="space-y-6" data-testid="activity-active">
        {/* Timer */}
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all"
              style={{
                width: `${((activity.duration - timeRemaining) / activity.duration) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Visual Support */}
        {activity.type === 'breathing' && (
          <BreathingAnimation instruction={activity.instructions[currentInstruction] || ''} />
        )}

        {/* Current Instruction */}
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
          <div className="text-center py-8">
            <div className="text-3xl mb-4">{activity.icon}</div>
            <p className="text-xl font-medium dark:text-white">
              {activity.instructions[currentInstruction]}
            </p>
          </div>
        </Card>

        {/* All Instructions (small) */}
        <Card>
          <div className="space-y-2">
            {activity.instructions.map((instruction, i) => (
              <div
                key={i}
                className={`
                  text-sm p-2 rounded transition
                  ${i === currentInstruction 
                    ? 'bg-blue-100 dark:bg-blue-900/50 font-medium dark:text-white' 
                    : 'text-neutral-600 dark:text-neutral-400'}
                `}
              >
                {i + 1}. {instruction}
              </div>
            ))}
          </div>
        </Card>

        {/* Early Exit */}
        <div className="text-center">
          <button
            onClick={() => setStep('complete')}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
            data-testid="end-early"
          >
            I'm done (end early)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="activity-complete">
      <div className="text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Great Job!</h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          You completed {activity.name}
        </p>
      </div>

      <EmotionCheckIn
        onComplete={(emotion) => onComplete({ ...emotion, timestamp: new Date() }, notes)}
        showLevel={true}
      />

      <Card>
        <label className="block text-sm font-medium mb-2 dark:text-white">
          Notes (optional) - What did you notice?
        </label>
        <textarea
          className="w-full h-20 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="Did this help? How do you feel now?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="activity-notes"
        />
      </Card>
    </div>
  );
};

/**
 * Breathing Animation Component
 * 
 * Shows expanding/contracting circle for breathing exercises
 */
const BreathingAnimation: React.FC<{ instruction: string }> = ({ instruction }) => {
  const isInhale = instruction.toLowerCase().includes('in') && !instruction.toLowerCase().includes('hold');
  const isHold = instruction.toLowerCase().includes('hold');

  return (
    <div className="flex items-center justify-center h-64" data-testid="breathing-animation">
      <div
        className={`
          rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700
          transition-all ease-in-out shadow-lg
          ${isHold ? 'w-48 h-48' : isInhale ? 'w-48 h-48' : 'w-24 h-24'}
        `}
        style={{
          transitionDuration: '4s',
        }}
        aria-label={`Breathing circle: ${instruction}`}
      />
    </div>
  );
};
