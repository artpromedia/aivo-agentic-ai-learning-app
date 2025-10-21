import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { Permission } from '../types/permissions';

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  permissions: Permission[];
}

export function usePermissions(): UsePermissionsReturn {
  const { user, hasPermission: contextHasPermission } = useAuth();

  const hasPermission = useCallback(
    (permission: Permission | Permission[]): boolean => {
      return contextHasPermission(permission);
    },
    [contextHasPermission]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((perm) => user.permissions.includes(perm));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.every((perm) => user.permissions.includes(perm));
    },
    [user]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
}
