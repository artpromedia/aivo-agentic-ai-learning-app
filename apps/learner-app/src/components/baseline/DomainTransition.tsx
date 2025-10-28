/**
 * Enhanced Domain Transition with Breathing Exercise
 * Age-appropriate transitions with mindfulness
 */
import {
    ArrowRight,
    BookOpen,
    Calculator,
    Heart,
    Mic,
    Microscope,
    PenTool,
    Wind
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AccessibilityPreferences } from '../../types/accessibility';
import type { Domain, GradeBand } from '../../types/baseline';

interface DomainTransitionProps {
  domain: Domain;
  gradeBand: GradeBand;
  preferences: AccessibilityPreferences;
  onComplete: () => void;
}

const DOMAIN_INFO: Record<Domain, {
  icon: typeof BookOpen;
  label: string;
  color: string;
  encouragement: string;
}> = {
  reading: {
    icon: BookOpen,
    label: 'Reading',
    color: 'text-blue-600',
    encouragement: 'Time to explore stories and ideas!'
  },
  math: {
    icon: Calculator,
    label: 'Math',
    color: 'text-purple-600',
    encouragement: 'Let\'s solve some cool problems!'
  },
  science: {
    icon: Microscope,
    label: 'Science',
    color: 'text-green-600',
    encouragement: 'Ready to discover how things work?'
  },
  writing: {
    icon: PenTool,
    label: 'Writing',
    color: 'text-orange-600',
    encouragement: 'Time to share your ideas!'
  },
  sel: {
    icon: Heart,
    label: 'Social-Emotional',
    color: 'text-pink-600',
    encouragement: 'Let\'s talk about feelings and friendships!'
  },
  speech: {
    icon: Mic,
    label: 'Speech & Language',
    color: 'text-indigo-600',
    encouragement: 'Time to practice communication!'
  }
};

const AGE_APPROPRIATE_MESSAGES: Record<GradeBand, {
  title: string;
  breathingInstruction: string;
  readyPhrase: string;
}> = {
  'K-5': {
    title: 'Let\'s Take a Breath Together!',
    breathingInstruction: 'Follow the circle: Breathe in... Hold... Breathe out...',
    readyPhrase: 'I\'m ready to try my best!'
  },
  '6-8': {
    title: 'Quick Mindfulness Break',
    breathingInstruction: 'Take a moment to center yourself with deep breathing.',
    readyPhrase: 'Let\'s do this!'
  },
  '9-12': {
    title: 'Transition Break',
    breathingInstruction: 'Use this breathing exercise to reset and refocus.',
    readyPhrase: 'Ready to continue'
  }
};

type BreathPhase = 'in' | 'hold' | 'out';

export function DomainTransition({
  domain,
  gradeBand,
  preferences,
  onComplete
}: DomainTransitionProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in');
  const [showBreathing, setShowBreathing] = useState(true);
  const [countdown, setCountdown] = useState(4);

  const info = DOMAIN_INFO[domain];
  const Icon = info.icon;
  const messages = AGE_APPROPRIATE_MESSAGES[gradeBand];

  // Breathing animation cycle: in (4s) → hold (4s) → out (4s)
  useEffect(() => {
    if (!showBreathing) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;
        
        // Reset countdown and move to next phase
        setBreathPhase(current => {
          if (current === 'in') return 'hold';
          if (current === 'hold') return 'out';
          return 'in';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showBreathing]);

  const phaseLabels = {
    in: 'Breathe In',
    hold: 'Hold',
    out: 'Breathe Out'
  };

  const phaseColors = {
    in: 'from-blue-400 to-blue-600',
    hold: 'from-purple-400 to-purple-600',
    out: 'from-green-400 to-green-600'
  };

  // Font size class
  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[preferences.fontSize];

  // Scale animation for breathing
  const scaleClass = breathPhase === 'in' ? 'scale-150' : breathPhase === 'hold' ? 'scale-150' : 'scale-100';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        {showBreathing ? (
          /* Breathing Exercise */
          <div className="text-center space-y-6">
            <h2 className={`font-bold ${fontSizeClass} mb-4`}>
              {messages.title}
            </h2>

            {/* Breathing Circle */}
            <div className="flex justify-center items-center h-64">
              <div
                className={`
                  w-40 h-40 rounded-full 
                  bg-gradient-to-br ${phaseColors[breathPhase]}
                  flex items-center justify-center
                  transition-transform duration-4000 ease-in-out
                  ${scaleClass}
                  ${!preferences.reduceAnimations ? 'animate-pulse' : ''}
                `}
              >
                <div className="text-white text-center">
                  <Wind className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold text-lg">{phaseLabels[breathPhase]}</p>
                  <p className="text-3xl font-bold">{countdown}</p>
                </div>
              </div>
            </div>

            <p className={`text-gray-600 ${fontSizeClass}`}>
              {messages.breathingInstruction}
            </p>

            {/* Skip Button */}
            <button
              onClick={() => setShowBreathing(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 underline"
            >
              Skip to next section
            </button>
          </div>
        ) : (
          /* Domain Introduction */
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${info.color} bg-opacity-10`}>
                <Icon className={`w-16 h-16 ${info.color}`} />
              </div>
            </div>

            <div>
              <h2 className={`font-bold ${fontSizeClass} mb-2`}>
                Up Next: {info.label}
              </h2>
              <p className={`text-gray-600 ${fontSizeClass}`}>
                {info.encouragement}
              </p>
            </div>

            <div className={`p-4 bg-blue-50 rounded-lg ${fontSizeClass}`}>
              <p className="font-semibold text-blue-900">
                {messages.readyPhrase}
              </p>
            </div>

            <button
              onClick={onComplete}
              className={`
                w-full py-3 px-6 
                bg-gradient-to-r ${phaseColors.in}
                text-white font-bold rounded-lg
                hover:shadow-lg transition-all
                flex items-center justify-center gap-2
                ${fontSizeClass}
              `}
            >
              Start {info.label}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
