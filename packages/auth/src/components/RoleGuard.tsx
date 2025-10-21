import React from 'react';
import type { UserRole } from '@aivo/types';
import { useRole } from '../hooks/useRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  inverse?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
  inverse = false,
}) => {
  const { hasRole } = useRole();

  const isAllowed = hasRole(allowedRoles);
  const shouldRender = inverse ? !isAllowed : isAllowed;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
