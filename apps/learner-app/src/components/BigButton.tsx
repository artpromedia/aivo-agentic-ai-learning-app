import React from 'react';

interface BigButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function BigButton({ 
  onClick, 
  children, 
  variant = 'primary', 
  icon, 
  disabled = false,
  className = ''
}: BigButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800',
    success: 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800',
    warning: 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800',
    secondary: 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        min-w-[200px] min-h-[80px] px-8 py-6
        ${variants[variant]}
        text-white text-2xl font-bold rounded-3xl
        shadow-2xl hover:shadow-3xl
        transform hover:scale-105 active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-4
        ${className}
      `}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon && <span className="text-4xl">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
