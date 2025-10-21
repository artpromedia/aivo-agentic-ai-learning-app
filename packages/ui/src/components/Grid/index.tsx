import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps {
  /** Number of columns */
  cols?: '1' | '2' | '3' | '4' | 'auto';
  /** Gap between grid items */
  gap?: 'sm' | 'md' | 'lg';
  /** Grid content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  cols = '1',
  gap = 'md',
  children,
  className,
}) => {
  const gridCols = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'auto': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapStyles = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', gridCols[cols], gapStyles[gap], className)}>
      {children}
    </div>
  );
};
