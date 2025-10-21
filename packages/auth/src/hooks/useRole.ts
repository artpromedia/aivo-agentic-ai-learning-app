import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '@aivo/types';
import { getRoleConfig, hasRoleLevel } from '../utils/roleConfig';

export interface UseRoleReturn {
  role: UserRole | null;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasRoleLevel: (role: UserRole) => boolean;
  isLearner: boolean;
  isParent: boolean;
  isTeacher: boolean;
  isSchoolAdmin: boolean;
  isDistrictAdmin: boolean;
  isSuperAdmin: boolean;
  roleConfig: ReturnType<typeof getRoleConfig> | null;
}

export function useRole(): UseRoleReturn {
  const { user, hasRole: contextHasRole } = useAuth();

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      return contextHasRole(role);
    },
    [contextHasRole]
  );

  const checkRoleLevel = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      return hasRoleLevel(user.role, role);
    },
    [user]
  );

  const roleFlags = useMemo(
    () => ({
      isLearner: user?.role === 'learner',
      isParent: user?.role === 'parent',
      isTeacher: user?.role === 'teacher',
      isSchoolAdmin: user?.role === 'school-admin',
      isDistrictAdmin: user?.role === 'district-admin',
      isSuperAdmin: user?.role === 'super-admin',
    }),
    [user]
  );

  const roleConfig = useMemo(() => {
    if (!user) return null;
    return getRoleConfig(user.role);
  }, [user]);

  return {
    role: user?.role || null,
    hasRole,
    hasRoleLevel: checkRoleLevel,
    ...roleFlags,
    roleConfig,
  };
}
