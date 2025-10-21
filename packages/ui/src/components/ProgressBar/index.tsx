import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Color variant for subject-specific progress */
  color?: 'primary' | 'reading' | 'math' | 'speech' | 'writing';
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-600',
    reading: 'bg-reading-500',
    math: 'bg-math-500',
    speech: 'bg-speech-500',
    writing: 'bg-writing-500',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-neutral-700">Progress</span>
          <span className="text-sm font-bold text-neutral-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
