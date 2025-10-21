/**
 * useRBAC Hook
 * Provides role-based access control functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminUser, Role, ROLE_DEFINITIONS } from '@aivo/types';
import { AuditLogger } from '../utils/auditLogger';

export function useRBAC() {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem('rbac_users');
      return stored ? JSON.parse(stored, dateReviver) : getDefaultUsers();
    } catch {
      return getDefaultUsers();
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('rbac_current_user_id');
      return stored || users[0]?.id || 'u_global';
    } catch {
      return users[0]?.id || 'u_global';
    }
  });

  // Persist users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rbac_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }, [users]);

  // Persist current user ID
  useEffect(() => {
    try {
      localStorage.setItem('rbac_current_user_id', currentUserId);
    } catch (error) {
      console.error('Failed to save current user:', error);
    }
  }, [currentUserId]);

  // Get current user
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Check if user has any of the required roles
  const hasAnyRole = useCallback((requiredRoles?: Role[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    // Global admin has access to everything
    if (currentUser.roles.includes('global_admin')) return true;
    
    return requiredRoles.some(role => currentUser.roles.includes(role));
  }, [currentUser]);

  // Check if user has ALL required roles
  const hasAllRoles = useCallback((requiredRoles: Role[]): boolean => {
    if (currentUser.roles.includes('global_admin')) return true;
    return requiredRoles.every(role => currentUser.roles.includes(role));
  }, [currentUser]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    // Global admin has all permissions
    if (currentUser.roles.includes('global_admin')) return true;

    // Check each role's permissions
    return currentUser.roles.some(role => {
      const rolePerms = ROLE_DEFINITIONS[role].permissions;
      return rolePerms.includes('*') || rolePerms.includes(permission);
    });
  }, [currentUser]);

  // Check if user can access based on hierarchy
  const canAccessRole = useCallback((targetRole: Role): boolean => {
    // Global admin can access everything
    if (currentUser.roles.includes('global_admin')) return true;

    // Check if any of user's roles are higher in hierarchy
    const userHighestLevel = Math.min(
      ...currentUser.roles.map(role => ROLE_DEFINITIONS[role].hierarchy_level)
    );
    const targetLevel = ROLE_DEFINITIONS[targetRole].hierarchy_level;

    return userHighestLevel <= targetLevel;
  }, [currentUser]);

  // Toggle role for a user
  const toggleRole = useCallback((userId: string, role: Role) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      
      const hasRole = u.roles.includes(role);
      const newRoles = hasRole
        ? u.roles.filter(r => r !== role)
        : [...u.roles, role];
      
      return { ...u, roles: newRoles };
    }));
  }, []);

  // Add new user
  const addUser = useCallback((name: string, email: string, roles: Role[] = []) => {
    const newUser: AdminUser = {
      id: `u_${Date.now()}`,
      email,
      name,
      roles,
      createdAt: new Date(),
      active: true,
      mfa_enabled: false,
    };
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  // Remove user
  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // If removing current user, switch to first available
    if (userId === currentUserId) {
      const remaining = users.filter(u => u.id !== userId);
      if (remaining.length > 0) {
        setCurrentUserId(remaining[0].id);
      }
    }
  }, [currentUserId, users]);

  // Update user
  const updateUser = useCallback((userId: string, updates: Partial<AdminUser>) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ));
  }, []);

  // Impersonate user (for QA/testing)
  const impersonate = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const previousUserId = currentUserId;
      setCurrentUserId(userId);
      
      // Log to audit trail
      AuditLogger.log({
        action: 'impersonate_start',
        originalUserId: previousUserId,
        targetUserId: user.id,
        targetUserName: user.name,
        targetUserEmail: user.email,
        targetUserRoles: user.roles,
      });
      
      console.log(`🎭 Now impersonating: ${user.name} (${user.email})`);
    }
  }, [users, currentUserId]);

  // Stop impersonation and return to default user
  const stopImpersonation = useCallback(() => {
    const defaultUser = users.find(u => u.id === 'u_global');
    if (defaultUser) {
      const previousUserId = currentUserId;
      setCurrentUserId(defaultUser.id);
      
      // Log to audit trail
      AuditLogger.log({
        action: 'impersonate_stop',
        originalUserId: previousUserId,
        targetUserId: defaultUser.id,
        targetUserName: defaultUser.name,
        targetUserEmail: defaultUser.email,
      });
      
      console.log('🎭 Stopped impersonation, returned to default user');
    }
  }, [users, currentUserId]);

  // Reset to default users (for testing)
  const resetToDefaults = useCallback(() => {
    const defaultUsers = getDefaultUsers();
    setUsers(defaultUsers);
    setCurrentUserId(defaultUsers[0].id);
    console.log('🔄 Reset to default users');
  }, []);

  return {
    users,
    currentUser,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    canAccessRole,
    toggleRole,
    addUser,
    removeUser,
    updateUser,
    impersonate,
    stopImpersonation,
    resetToDefaults,
    setCurrentUserId,
  };
}

/**
 * Date reviver for JSON.parse to handle Date objects
 */
function dateReviver(_key: string, value: unknown) {
  if (typeof value === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

/**
 * Get default users for initialization
 */
function getDefaultUsers(): AdminUser[] {
  return [
    {
      id: 'u_global',
      email: 'alice@aivo.ai',
      name: 'Alice Global',
      roles: ['global_admin'],
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      active: true,
      mfa_enabled: true,
    },
    {
      id: 'u_finance',
      email: 'finn@aivo.ai',
      name: 'Finn Finance',
      roles: ['finance_admin'],
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date(),
      active: true,
      mfa_enabled: true,
    },
    {
      id: 'u_tech',
      email: 'taylor@aivo.ai',
      name: 'Taylor Tech',
      roles: ['tech_support'],
      createdAt: new Date('2024-01-03'),
      lastLogin: new Date(),
      active: true,
      mfa_enabled: false,
    },
    {
      id: 'u_legal',
      email: 'lina@aivo.ai',
      name: 'Lina Legal',
      roles: ['legal_compliance'],
      createdAt: new Date('2024-01-04'),
      lastLogin: new Date(),
      active: true,
      mfa_enabled: true,
    },
    {
      id: 'u_district',
      email: 'diana@district.edu',
      name: 'Diana District',
      roles: ['district_admin'],
      createdAt: new Date('2024-01-05'),
      active: true,
      mfa_enabled: false,
    },
    {
      id: 'u_school',
      email: 'steve@school.edu',
      name: 'Steve School',
      roles: ['school_admin'],
      createdAt: new Date('2024-01-06'),
      active: true,
      mfa_enabled: false,
    },
    {
      id: 'u_teacher',
      email: 'teacher@school.edu',
      name: 'Tom Teacher',
      roles: ['teacher'],
      createdAt: new Date('2024-01-07'),
      active: true,
      mfa_enabled: false,
    },
    {
      id: 'u_support',
      email: 'sam@aivo.ai',
      name: 'Sam Support',
      roles: ['tech_support'],
      createdAt: new Date('2024-01-08'),
      active: true,
      mfa_enabled: false,
    },
    {
      id: 'u_viewer',
      email: 'pat@aivo.ai',
      name: 'Pat Viewer',
      roles: [],
      createdAt: new Date('2024-01-09'),
      active: true,
      mfa_enabled: false,
    },
  ];
}
