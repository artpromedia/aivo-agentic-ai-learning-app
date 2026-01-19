import type { UserRole } from '@aivo/types';

export interface RoleConfig {
  name: string;
  description: string;
  level: number;
  color: string;
  defaultRoute: string;
}

export const RoleConfigs: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'Admin',
    description: 'Administrator with elevated privileges',
    level: 5,
    color: 'purple',
    defaultRoute: '/dashboard',
  },
  learner: {
    name: 'Learner',
    description: 'Student accessing learning activities',
    level: 1,
    color: 'blue',
    defaultRoute: '/dashboard',
  },
  parent: {
    name: 'Parent',
    description: 'Parent monitoring child progress',
    level: 2,
    color: 'green',
    defaultRoute: '/dashboard',
  },
  teacher: {
    name: 'Teacher',
    description: 'Teacher managing classroom and students',
    level: 3,
    color: 'purple',
    defaultRoute: '/dashboard',
  },
  'school-admin': {
    name: 'School Admin',
    description: 'Administrator managing school-wide settings',
    level: 4,
    color: 'orange',
    defaultRoute: '/dashboard',
  },
  'district-admin': {
    name: 'District Admin',
    description: 'Administrator managing district-wide settings',
    level: 5,
    color: 'red',
    defaultRoute: '/dashboard',
  },
  'super-admin': {
    name: 'Super Admin',
    description: 'Platform administrator with full access',
    level: 6,
    color: 'indigo',
    defaultRoute: '/dashboard',
  },
};

/**
 * Get role configuration
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return RoleConfigs[role];
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return role in RoleConfigs;
}

/**
 * Get default route for role
 */
export function getDefaultRoute(role: UserRole): string {
  return RoleConfigs[role]?.defaultRoute || '/';
}

/**
 * Get all roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(RoleConfigs) as UserRole[];
}

/**
 * Compare role levels (returns true if role1 >= role2)
 */
export function hasRoleLevel(role1: UserRole, role2: UserRole): boolean {
  return RoleConfigs[role1].level >= RoleConfigs[role2].level;
}
