import { Permission, RolePermissions } from '../types/permissions';
import type { UserRole } from '@aivo/types';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission | Permission[]
): boolean {
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.every((perm) => userPermissions.includes(perm));
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * Check if a permission is valid
 */
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission);
}

/**
 * Get all permissions
 */
export function getAllPermissions(): Permission[] {
  return Object.values(Permission);
}

/**
 * Group permissions by category
 */
export function getPermissionsByCategory(): Record<string, Permission[]> {
  const categories: Record<string, Permission[]> = {
    student: [],
    parent: [],
    teacher: [],
    schoolAdmin: [],
    districtAdmin: [],
    superAdmin: [],
  };

  Object.entries(Permission).forEach(([key, value]) => {
    if (key.startsWith('VIEW_OWN') || key.startsWith('COMPLETE') || key === 'VIEW_REWARDS') {
      categories.student?.push(value);
    } else if (key.includes('CHILD') || key.includes('DEVICE') || key.includes('SUBSCRIPTION')) {
      categories.parent?.push(value);
    } else if (key.includes('IEP') || key === 'ASSIGN_ACTIVITIES' || key === 'COMMUNICATE_WITH_PARENTS') {
      categories.teacher?.push(value);
    } else if (key.includes('SCHOOL') && !key.includes('DISTRICT')) {
      categories.schoolAdmin?.push(value);
    } else if (key.includes('DISTRICT')) {
      categories.districtAdmin?.push(value);
    } else if (key.includes('PLATFORM') || key.includes('ALL') || key.includes('DATABASE')) {
      categories.superAdmin?.push(value);
    }
  });

  return categories;
}
