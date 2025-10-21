import { useNavigate } from 'react-router-dom';
import { useTheme } from '@aivo/ui';
import type { Subject } from '../config/subjects';
import { ProgressRing } from './ProgressRing';

interface SubjectCardProps {
  subject: Subject;
  progress?: number;
  starsEarned?: number;
  totalStars?: number;
  onClick?: () => void;
}

export function SubjectCard({
  subject,
  progress = 0,
  starsEarned = 0,
  totalStars = 30,
  onClick,
}: SubjectCardProps) {
  const navigate = useNavigate();
  const { themeConfig, theme } = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to subject detail page instead of direct subject route
      const themeParam = theme.toLowerCase();
      navigate(`/learner/${themeParam}/subject/${subject.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative bg-white shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all ${subject.color} flex flex-col`}
      style={{
        borderRadius: themeConfig.borderRadius.card,
        padding: themeConfig.spacing.card,
        transitionDuration: `${themeConfig.animations.duration}ms`,
      }}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          borderRadius: themeConfig.borderRadius.card,
          transitionDuration: `${themeConfig.animations.duration}ms`,
          background: 'currentColor',
        }}
      />

      <div className="relative flex flex-col flex-1">
        {/* Subject Icon */}
        <div
          className="mb-6 text-center animate-bounce-slow"
          style={{
            fontSize: themeConfig.iconSize.subject,
          }}
        >
          {subject.icon}
        </div>

        {/* Subject Name */}
        <h2
          className="font-bold text-center text-neutral-900 mb-4"
          style={{
            fontSize: themeConfig.fontSize.heading,
          }}
        >
          {subject.displayName}
        </h2>

        {/* Description */}
        <p
          className="text-center text-neutral-600 mb-6 px-2 min-h-[3rem]"
          style={{
            fontSize: `calc(${themeConfig.fontSize.base} * 0.9)`,
          }}
        >
          {subject.description}
        </p>

        {/* Progress Ring */}
        {progress > 0 && (
          <div className="flex justify-center mb-6">
            <ProgressRing progress={progress} size={140} />
          </div>
        )}

        {/* Stars */}
        {starsEarned > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">⭐</span>
            <span className="text-2xl font-bold text-yellow-600">
              {starsEarned}/{totalStars}
            </span>
          </div>
        )}

        {/* Estimated Duration */}
        {subject.estimatedDuration && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
              <span className="text-lg">⏱️</span>
              <span style={{ fontSize: `calc(${themeConfig.fontSize.base} * 0.85)` }}>
                {subject.estimatedDuration}
              </span>
            </span>
          </div>
        )}

        {/* Tool Badges */}
        {(subject.writingPadEnabled || subject.drawPadEnabled) && (
          <div className="flex items-center justify-center gap-3 mb-4">
            {subject.writingPadEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open writing pad modal
                }}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                title="Writing Pad Available"
              >
                <span className="text-xl">✏️</span>
                <span style={{ fontSize: `calc(${themeConfig.fontSize.base} * 0.85)` }}>
                  Writing Pad
                </span>
              </button>
            )}
            {subject.drawPadEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open draw pad modal
                }}
                className="flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                title="Draw Pad Available"
              >
                <span className="text-xl">🎨</span>
                <span style={{ fontSize: `calc(${themeConfig.fontSize.base} * 0.85)` }}>
                  Draw Pad
                </span>
              </button>
            )}
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* Play Button */}
        <div
          className="w-full py-4 px-8 rounded-2xl font-bold text-center group-hover:scale-110 transition-transform duration-300 mt-4"
          style={{
            backgroundColor: themeConfig.colors.primary,
            color: '#ffffff',
            fontSize: `calc(${themeConfig.fontSize.heading} * 0.9)`,
          }}
        >
          Let's Learn! →
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
}
