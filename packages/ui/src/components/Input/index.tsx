import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Icon on the left side */
  leftIcon?: React.ReactNode;
  /** Icon on the right side */
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border-2 px-4 py-3 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
