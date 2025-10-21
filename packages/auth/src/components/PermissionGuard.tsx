import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../types/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  inverse?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  requireAll = true,
  fallback = null,
  inverse = false,
}) => {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  const isAllowed = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  const shouldRender = inverse ? !isAllowed : isAllowed;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
