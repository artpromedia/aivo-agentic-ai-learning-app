/**
 * Emotion Check-In Component
 * 
 * Visual emotion selection with 8 emotions, intensity levels,
 * and optional trigger input. Used at start of regulation session.
 */

import React, { useState } from 'react';
import type { EmotionState } from '@aivo/types';
import { Button, Card } from '@aivo/ui';

interface EmotionOption {
  emotion: EmotionState['emotion'];
  label: string;
  icon: string;
  color: string;
}

const EMOTIONS: EmotionOption[] = [
  { emotion: 'calm', label: 'Calm', icon: '😌', color: 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700' },
  { emotion: 'happy', label: 'Happy', icon: '😊', color: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700' },
  { emotion: 'sad', label: 'Sad', icon: '😢', color: 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700' },
  { emotion: 'angry', label: 'Angry', icon: '😠', color: 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700' },
  { emotion: 'frustrated', label: 'Frustrated', icon: '😤', color: 'bg-orange-100 border-orange-300 dark:bg-orange-900 dark:border-orange-700' },
  { emotion: 'anxious', label: 'Worried', icon: '😰', color: 'bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700' },
  { emotion: 'tired', label: 'Tired', icon: '😴', color: 'bg-neutral-100 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600' },
  { emotion: 'excited', label: 'Excited', icon: '🤩', color: 'bg-pink-100 border-pink-300 dark:bg-pink-900 dark:border-pink-700' },
];

export const EmotionCheckIn: React.FC<{
  onComplete: (emotion: Omit<EmotionState, 'timestamp'>) => void;
  onSkip?: () => void;
  showLevel?: boolean;
}> = ({ onComplete, onSkip, showLevel = true }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionState['emotion'] | null>(null);
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [trigger, setTrigger] = useState('');
  const [showTrigger, setShowTrigger] = useState(false);

  const handleSubmit = () => {
    if (!selectedEmotion) return;

    onComplete({
      emotion: selectedEmotion,
      level,
      trigger: trigger || undefined,
    });
  };

  const selectedOption = EMOTIONS.find(e => e.emotion === selectedEmotion);

  return (
    <div className="space-y-6" data-testid="emotion-check-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">How are you feeling?</h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          It's okay to have big feelings. Let's check in.
        </p>
      </div>

      {/* Emotion Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {EMOTIONS.map(option => (
          <button
            key={option.emotion}
            onClick={() => setSelectedEmotion(option.emotion)}
            className={`
              p-6 rounded-2xl border-2 transition-all text-center
              ${selectedEmotion === option.emotion
                ? `${option.color} scale-105 shadow-lg`
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }
            `}
            data-testid={`emotion-${option.emotion}`}
          >
            <div className="text-5xl mb-2">{option.icon}</div>
            <div className="font-medium dark:text-white">{option.label}</div>
          </button>
        ))}
      </div>

      {/* Intensity Level */}
      {showLevel && selectedEmotion && (
        <Card className={selectedOption?.color}>
          <h3 className="font-semibold mb-4 text-center dark:text-white">
            How {selectedOption?.label.toLowerCase()} are you?
          </h3>
          <div className="flex justify-between items-center gap-2">
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl as 1 | 2 | 3 | 4 | 5)}
                className={`
                  flex-1 aspect-square rounded-xl border-2 font-bold text-2xl transition
                  ${level === lvl
                    ? 'bg-white border-neutral-900 dark:border-white scale-110'
                    : 'bg-white/50 dark:bg-neutral-700/50 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }
                `}
                data-testid={`level-${lvl}`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            <span>A little</span>
            <span>Very much</span>
          </div>
        </Card>
      )}

      {/* Optional: What happened? */}
      {selectedEmotion && !showTrigger && (
        <div className="text-center">
          <button
            onClick={() => setShowTrigger(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            data-testid="show-trigger"
          >
            + Want to tell me what happened? (optional)
          </button>
        </div>
      )}

      {showTrigger && (
        <Card>
          <label className="block text-sm font-medium mb-2 dark:text-white">
            What made you feel this way? (optional)
          </label>
          <textarea
            className="w-full h-20 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            placeholder="It's okay if you don't want to share..."
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            data-testid="trigger-input"
          />
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            data-testid="skip-check-in"
          >
            Skip for Now
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedEmotion}
          data-testid="submit-emotion"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
