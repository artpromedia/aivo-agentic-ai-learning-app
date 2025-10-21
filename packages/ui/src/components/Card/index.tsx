import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Background color for icon container */
  iconColor?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Enable hover effect */
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = 'bg-primary-100',
  children,
  className,
  padding = 'md',
  hover = false,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card',
        hover && 'transition-shadow hover:shadow-card-hover cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {(title || icon) && (
        <div className="mb-4">
          {icon && (
            <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3', iconColor)}>
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-xl font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
