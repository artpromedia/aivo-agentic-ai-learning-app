/**
 * RoleBadge Component
 * Displays a role badge with appropriate styling
 */

import React from 'react';
import { Role, ROLE_DEFINITIONS } from '@aivo/types';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = false,
  onClick,
}) => {
  const def = ROLE_DEFINITIONS[role];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconMap: Record<Role, string> = {
    global_admin: '👑',
    finance_admin: '💰',
    tech_support: '🔧',
    legal_compliance: '⚖️',
    district_admin: '🏛️',
    school_admin: '🏫',
    teacher: '👨‍🏫',
    parent: '👪',
    learner: '🎓',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${def.color} ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
      title={def.description}
    >
      {showIcon && <span>{iconMap[role]}</span>}
      <span>{def.name}</span>
    </span>
  );
};
