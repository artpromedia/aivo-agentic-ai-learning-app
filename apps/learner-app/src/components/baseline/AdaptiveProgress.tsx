/**
 * Enhanced Adaptive Progress with 6-Domain Grid
 * Shows 5 checkboxes per domain
 */
import { CheckCircle, Circle } from 'lucide-react';
import type { AccessibilityPreferences } from '../../types/accessibility';
import type { Domain } from '../../types/baseline';

interface AdaptiveProgressProps {
  domains: Domain[];
  itemsAnsweredPerDomain: Record<Domain, number>;
  itemsPerDomain: number;
  preferences: AccessibilityPreferences;
}

const DOMAIN_ICONS: Record<Domain, string> = {
  reading: '📖',
  math: '🔢',
  science: '🔬',
  writing: '✍️',
  sel: '❤️',
  speech: '🗣️'
};

const DOMAIN_LABELS: Record<Domain, string> = {
  reading: 'Reading',
  math: 'Math',
  science: 'Science',
  writing: 'Writing',
  sel: 'Social-Emotional',
  speech: 'Speech'
};

export function AdaptiveProgress({
  domains,
  itemsAnsweredPerDomain,
  itemsPerDomain,
  preferences
}: AdaptiveProgressProps) {
  const totalAnswered = Object.values(itemsAnsweredPerDomain).reduce((a, b) => a + b, 0);
  const totalItems = domains.length * itemsPerDomain;
  const overallProgress = (totalAnswered / totalItems) * 100;

  // Font size class based on preferences
  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[preferences.fontSize];

  // Color scheme classes
  const colorSchemes = {
    'calm-blue': 'bg-blue-50 border-blue-200',
    'soft-green': 'bg-green-50 border-green-200',
    'warm-purple': 'bg-purple-50 border-purple-200',
    'neutral-gray': 'bg-gray-50 border-gray-200'
  };
  const containerClass = colorSchemes[preferences.colorScheme];

  return (
    <div className={`${containerClass} rounded-lg border-2 p-6 ${fontSizeClass}`}>
      {/* Overall Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-semibold ${fontSizeClass}`}>
            Your Progress
          </h2>
          <span className={`font-bold ${fontSizeClass}`}>
            {totalAnswered} / {totalItems}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 6-Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => {
          const answered = itemsAnsweredPerDomain[domain] || 0;
          const isComplete = answered === itemsPerDomain;
          
          return (
            <div
              key={domain}
              className={`p-4 rounded-lg border-2 transition-all ${
                isComplete 
                  ? 'bg-green-100 border-green-400' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {/* Domain Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{DOMAIN_ICONS[domain]}</span>
                  <span className={`font-semibold ${fontSizeClass}`}>
                    {DOMAIN_LABELS[domain]}
                  </span>
                </div>
                {isComplete && (
                  <span className="text-green-600 text-sm font-bold">✓ Done!</span>
                )}
              </div>

              {/* 5 Checkboxes */}
              <div className="flex gap-2 justify-center">
                {Array.from({ length: itemsPerDomain }).map((_, index) => {
                  const isAnswered = index < answered;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      {isAnswered ? (
                        <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600 mt-1">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Celebration */}
      {overallProgress === 50 && (
        <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center">
          <p className={`font-bold text-yellow-800 ${fontSizeClass}`}>
            🎉 Halfway There! You're doing amazing! 🎉
          </p>
        </div>
      )}
      {overallProgress === 100 && (
        <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg text-center">
          <p className={`font-bold text-green-800 ${fontSizeClass}`}>
            🌟 Incredible Work! You finished all domains! 🌟
          </p>
        </div>
      )}
    </div>
  );
}
