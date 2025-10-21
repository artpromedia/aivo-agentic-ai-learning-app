/**
 * Calming Space Component
 * 
 * Full-screen calming environment for learners experiencing high distress.
 * Features rotating calming messages, breathing animation, and optional timer.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@aivo/ui';

const CALMING_MESSAGES = [
  "You're safe here.",
  "Take your time.",
  "Breathe slowly.",
  "It's okay to feel upset.",
  "You're doing great.",
  "This will pass.",
  "One breath at a time.",
  "You are strong.",
  "It's okay to take a break.",
  "You've got this.",
];

export const CalmingSpace: React.FC<{
  duration?: number; // seconds, 0 = indefinite
  onExit: () => void;
}> = ({ duration = 0, onExit }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [message, setMessage] = useState(CALMING_MESSAGES[0]);

  useEffect(() => {
    // Rotate calming messages every 5 seconds
    const messageInterval = setInterval(() => {
      setMessage(CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)]);
    }, 5000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onExit]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      data-testid="calming-space"
    >
      <div className="text-center text-white space-y-8 p-8 max-w-2xl">
        {/* Breathing Circle */}
        <div className="flex justify-center">
          <div
            className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center animate-pulse"
            style={{ animationDuration: '4s' }}
            data-testid="breathing-circle"
          >
            <div className="text-6xl">🌙</div>
          </div>
        </div>

        {/* Message */}
        <div className="text-3xl font-light" aria-live="polite" data-testid="calming-message">
          {message}
        </div>

        {/* Timer */}
        {duration > 0 && timeRemaining > 0 && (
          <div className="text-xl opacity-75" data-testid="calming-timer">
            {Math.ceil(timeRemaining / 60)} {Math.ceil(timeRemaining / 60) === 1 ? 'minute' : 'minutes'} remaining
          </div>
        )}

        {/* Breathing Guide */}
        <div className="text-lg opacity-90">
          <p>Breathe in slowly... hold... breathe out slowly...</p>
        </div>

        {/* Exit */}
        <div className="pt-8">
          <Button
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            onClick={onExit}
            data-testid="exit-calming-space"
          >
            I'm ready to go back
          </Button>
        </div>

        {/* Tips */}
        <div className="text-sm opacity-75 pt-4">
          <p>💡 Tip: Find a quiet spot, close your eyes, and breathe slowly</p>
        </div>
      </div>
    </div>
  );
};
