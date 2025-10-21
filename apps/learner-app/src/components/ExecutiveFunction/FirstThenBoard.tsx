/**
 * First-Then Board Component
 * 
 * Visual support for "First do X, then do Y" behavioral structure.
 * Helps with motivation, transitions, and completing less-preferred tasks.
 * 
 * Features:
 * - Two-phase structure (First/Then)
 * - Optional timer for first activity
 * - Automatic transition celebration
 * - Simple or detailed visual styles
 * - Completion tracking
 */

import React, { useState, useEffect } from 'react';
import { FirstThenBoard as IFirstThenBoard } from '@aivo/types';
import { Card } from '@aivo/ui';

export const FirstThenBoard: React.FC<{
  board: IFirstThenBoard;
  onComplete?: () => void;
}> = ({ board, onComplete }) => {
  const [phase, setPhase] = useState<'first' | 'transition' | 'then'>('first');
  const [timeRemaining, setTimeRemaining] = useState(board.first.duration || 0);

  useEffect(() => {
    if (phase !== 'first' || !board.showTimer || !board.first.duration) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase('transition');
          setTimeout(() => setPhase('then'), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, board]);

  const handleComplete = () => {
    if (phase === 'then' && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="first-then-board">
      {board.visualStyle === 'simple' ? (
        <SimpleFirstThen
          phase={phase}
          board={board}
          timeRemaining={timeRemaining}
          onComplete={handleComplete}
        />
      ) : (
        <DetailedFirstThen
          phase={phase}
          board={board}
          timeRemaining={timeRemaining}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

const SimpleFirstThen: React.FC<{
  phase: 'first' | 'transition' | 'then';
  board: IFirstThenBoard;
  timeRemaining: number;
  onComplete: () => void;
}> = ({ phase, board, timeRemaining, onComplete }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* First */}
      <Card
        className={`
          text-center transition-all duration-500
          ${phase === 'first'
            ? 'ring-4 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
            : phase === 'transition'
            ? 'opacity-50'
            : 'opacity-30'
          }
        `}
        data-testid="first-activity"
      >
        <div className="space-y-4 py-8">
          <div className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
            First
          </div>

          {board.first.icon && (
            <div className="text-7xl">{board.first.icon}</div>
          )}
          {board.first.image && (
            <img
              src={board.first.image}
              alt={board.first.name}
              className="w-32 h-32 mx-auto rounded-xl object-cover"
            />
          )}

          <div className="text-2xl font-bold dark:text-white">{board.first.name}</div>

          {board.showTimer && board.first.duration && phase === 'first' && (
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {Math.ceil(timeRemaining / 60)} min
            </div>
          )}
        </div>
      </Card>

      {/* Then */}
      <Card
        className={`
          text-center transition-all duration-500
          ${phase === 'then'
            ? 'ring-4 ring-green-500 bg-green-50 dark:bg-green-900/30 scale-105'
            : 'opacity-50'
          }
        `}
        data-testid="then-activity"
      >
        <div className="space-y-4 py-8">
          <div className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
            Then
          </div>

          {board.then.icon && (
            <div className="text-7xl">{board.then.icon}</div>
          )}
          {board.then.image && (
            <img
              src={board.then.image}
              alt={board.then.name}
              className="w-32 h-32 mx-auto rounded-xl object-cover"
            />
          )}

          <div className="text-2xl font-bold dark:text-white">{board.then.name}</div>

          {phase === 'then' && (
            <button
              onClick={onComplete}
              className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition"
              data-testid="complete-then"
            >
              ✓ All Done!
            </button>
          )}
        </div>
      </Card>

      {/* Transition Message */}
      {phase === 'transition' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-12 text-center max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold mb-2 dark:text-white">Great Job!</div>
            <div className="text-xl text-neutral-600 dark:text-neutral-400">
              Now it's time for {board.then.name}!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailedFirstThen: React.FC<{
  phase: 'first' | 'transition' | 'then';
  board: IFirstThenBoard;
  timeRemaining: number;
  onComplete: () => void;
}> = ({ phase, board, timeRemaining, onComplete }) => {
  return (
    <div className="space-y-6">
      {/* Current Phase Indicator */}
      <div className="flex items-center justify-center gap-4 text-sm font-medium">
        <div className={`px-4 py-2 rounded-full ${phase === 'first' ? 'bg-blue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
          FIRST
        </div>
        <div className="text-3xl">→</div>
        <div className={`px-4 py-2 rounded-full ${phase === 'then' ? 'bg-green-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
          THEN
        </div>
      </div>

      {/* Active Card */}
      <Card className="p-8">
        {phase === 'first' && (
          <div className="text-center space-y-6" data-testid="first-detailed">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Right Now: First Activity
            </div>

            {board.first.icon && (
              <div className="text-9xl">{board.first.icon}</div>
            )}
            {board.first.image && (
              <img
                src={board.first.image}
                alt={board.first.name}
                className="w-48 h-48 mx-auto rounded-2xl object-cover shadow-lg"
              />
            )}

            <div className="text-4xl font-bold dark:text-white">{board.first.name}</div>

            {board.showTimer && board.first.duration && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Time Remaining</div>
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="mt-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 dark:bg-blue-600 h-4 rounded-full transition-all"
                    style={{
                      width: `${((board.first.duration! - timeRemaining) / board.first.duration!) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
              <div className="font-medium text-green-900 dark:text-green-300">
                When you're done with {board.first.name}...
              </div>
              <div className="text-2xl mt-2">{board.then.icon} {board.then.name}</div>
            </div>
          </div>
        )}

        {phase === 'then' && (
          <div className="text-center space-y-6" data-testid="then-detailed">
            <div className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
              Now: Reward Time!
            </div>

            {board.then.icon && (
              <div className="text-9xl">{board.then.icon}</div>
            )}
            {board.then.image && (
              <img
                src={board.then.image}
                alt={board.then.name}
                className="w-48 h-48 mx-auto rounded-2xl object-cover shadow-lg"
              />
            )}

            <div className="text-4xl font-bold dark:text-white">{board.then.name}</div>

            <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-6">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-bold text-lg text-green-900 dark:text-green-300">
                You did it! Enjoy your reward!
              </div>
            </div>

            <button
              onClick={onComplete}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl rounded-2xl font-bold transition"
              data-testid="complete-detailed"
            >
              ✓ All Done!
            </button>
          </div>
        )}
      </Card>

      {/* Transition Animation */}
      {phase === 'transition' && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center text-white">
            <div className="text-9xl mb-8 animate-bounce">✓</div>
            <div className="text-5xl font-bold mb-4">Awesome!</div>
            <div className="text-3xl">Time for {board.then.name}!</div>
          </div>
        </div>
      )}
    </div>
  );
};

