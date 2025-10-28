/**
 * Break Reminder Component
 * Suggests breaks and mindfulness exercises
 */
import { useState, useEffect } from 'react';
import { Coffee, Heart, Smile, Wind } from 'lucide-react';

interface BreakReminderProps {
  questionsCompleted: number;
  onContinue: () => void;
  onTakeBreak: () => void;
  gradeBand: 'K-5' | '6-8' | '9-12';
}

export function BreakReminder({
  questionsCompleted,
  onContinue,
  onTakeBreak,
  gradeBand
}: BreakReminderProps) {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathCount, setBreathCount] = useState(0);

  // Breathing animation
  useEffect(() => {
    if (!showBreathing) return;

    const phases = ['in', 'hold', 'out'] as const;
    const durations = [4000, 2000, 4000]; // ms
    let currentPhase = 0;
    let count = 0;

    const interval = setInterval(() => {
      setBreathPhase(phases[currentPhase]);
      currentPhase = (currentPhase + 1) % phases.length;
      
      if (currentPhase === 0) {
        count++;
        setBreathCount(count);
        if (count >= 3) {
          clearInterval(interval);
          setTimeout(() => setShowBreathing(false), 1000);
        }
      }
    }, durations[currentPhase]);

    return () => clearInterval(interval);
  }, [showBreathing]);

  const activities = {
    'K-5': [
      { icon: '🦋', text: 'Pretend to be a butterfly and stretch your wings!' },
      { icon: '🌊', text: 'Make wave sounds: Whoooosh... whoooosh...' },
      { icon: '⭐', text: 'Close your eyes and think of something happy!' },
      { icon: '🐢', text: 'Move slowly like a turtle for a minute.' }
    ],
    '6-8': [
      { icon: '🧘', text: 'Try the 4-7-8 breathing: Breathe in for 4, hold for 7, out for 8.' },
      { icon: '💪', text: 'Do 10 jumping jacks to wake up your body!' },
      { icon: '🎨', text: 'Draw or doodle something creative for 2 minutes.' },
      { icon: '🚶', text: 'Walk around the room and stretch.' }
    ],
    '9-12': [
      { icon: '🧠', text: 'Take a mindful moment: Notice 5 things you can see, 4 you can touch, 3 you can hear.' },
      { icon: '💧', text: 'Drink some water and do neck rolls.' },
      { icon: '📱', text: 'Set a timer for 5 minutes and take a screen break.' },
      { icon: '🎯', text: 'Do a quick body scan: Release tension from head to toe.' }
    ]
  };

  const randomActivity = activities[gradeBand][Math.floor(Math.random() * activities[gradeBand].length)];

  if (showBreathing) {
    const scale = breathPhase === 'in' ? 'scale-150' : breathPhase === 'hold' ? 'scale-150' : 'scale-100';
    const instructions = {
      in: 'Breathe in slowly...',
      hold: 'Hold...',
      out: 'Breathe out slowly...'
    };

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50">
        <div className="text-center space-y-8">
          <div 
            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-400 transition-transform duration-4000 ease-in-out ${scale}`}
          />
          <p className="text-3xl font-bold text-gray-800">{instructions[breathPhase]}</p>
          <p className="text-xl text-gray-600">Breath {breathCount + 1} of 3</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex justify-center">
            <Coffee className="w-20 h-20 text-purple-500" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900">
            Great job! Time for a quick break? 🎉
          </h2>
          
          <p className="text-xl text-gray-600">
            You've completed {questionsCompleted} questions! Taking breaks helps your brain work better.
          </p>

          {/* Suggested Activity */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
            <p className="text-6xl mb-4">{randomActivity.icon}</p>
            <p className="text-lg font-semibold text-gray-800">
              {randomActivity.text}
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowBreathing(true)}
              className="flex flex-col items-center gap-2 p-6 bg-blue-100 hover:bg-blue-200 rounded-2xl transition-all"
            >
              <Wind className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-blue-900">Breathing Exercise</span>
            </button>

            <button
              onClick={onTakeBreak}
              className="flex flex-col items-center gap-2 p-6 bg-green-100 hover:bg-green-200 rounded-2xl transition-all"
            >
              <Heart className="w-8 h-8 text-green-600" />
              <span className="font-semibold text-green-900">5 Min Break</span>
            </button>

            <button
              onClick={onContinue}
              className="flex flex-col items-center gap-2 p-6 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-all"
            >
              <Smile className="w-8 h-8 text-purple-600" />
              <span className="font-semibold text-purple-900">Keep Going!</span>
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Remember: You can take a break anytime you need!
          </p>
        </div>
      </div>
    </div>
  );
}
