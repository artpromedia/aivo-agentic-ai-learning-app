/**
 * RBAC Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRBAC } from '../useRBAC';

describe('useRBAC', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default users', () => {
    const { result } = renderHook(() => useRBAC());

    expect(result.current.users).toHaveLength(9);
    expect(result.current.currentUser).toBeDefined();
    expect(result.current.currentUser.id).toBe('u_global');
    expect(result.current.currentUser.roles).toContain('global_admin');
  });

  it('should check if user has any required role', () => {
    const { result } = renderHook(() => useRBAC());

    // Global admin should have access to everything
    expect(result.current.hasAnyRole(['finance_admin', 'tech_support'])).toBe(true);
    expect(result.current.hasAnyRole([])).toBe(true);
    expect(result.current.hasAnyRole(undefined)).toBe(true);
  });

  it('should check if user has all required roles', () => {
    const { result } = renderHook(() => useRBAC());

    // Global admin should have access to everything
    expect(result.current.hasAllRoles(['finance_admin', 'tech_support'])).toBe(true);
    
    // Switch to a user with specific roles
    act(() => {
      result.current.impersonate('u_finance');
    });

    expect(result.current.hasAllRoles(['finance_admin'])).toBe(true);
    expect(result.current.hasAllRoles(['finance_admin', 'tech_support'])).toBe(false);
  });

  it('should check if user has specific permission', () => {
    const { result } = renderHook(() => useRBAC());

    // Global admin has all permissions
    expect(result.current.hasPermission('billing.view')).toBe(true);
    expect(result.current.hasPermission('anything')).toBe(true);

    // Switch to finance admin
    act(() => {
      result.current.impersonate('u_finance');
    });

    expect(result.current.hasPermission('billing.view')).toBe(true);
    expect(result.current.hasPermission('api_keys.create')).toBe(false);
  });

  it('should toggle user roles', () => {
    const { result } = renderHook(() => useRBAC());

    const userId = 'u_viewer';
    const initialRoles = result.current.users.find(u => u.id === userId)?.roles || [];

    // Add a role
    act(() => {
      result.current.toggleRole(userId, 'teacher');
    });

    let user = result.current.users.find(u => u.id === userId);
    expect(user?.roles).toContain('teacher');

    // Remove the role
    act(() => {
      result.current.toggleRole(userId, 'teacher');
    });

    user = result.current.users.find(u => u.id === userId);
    expect(user?.roles).not.toContain('teacher');
  });

  it('should add new user', () => {
    const { result } = renderHook(() => useRBAC());

    const initialCount = result.current.users.length;

    act(() => {
      result.current.addUser('John Doe', 'john@example.com', ['teacher']);
    });

    expect(result.current.users).toHaveLength(initialCount + 1);
    
    const newUser = result.current.users.find(u => u.email === 'john@example.com');
    expect(newUser).toBeDefined();
    expect(newUser?.name).toBe('John Doe');
    expect(newUser?.roles).toContain('teacher');
    expect(newUser?.active).toBe(true);
  });

  it('should remove user', () => {
    const { result } = renderHook(() => useRBAC());

    const userToRemove = result.current.users[result.current.users.length - 1];
    const initialCount = result.current.users.length;

    act(() => {
      result.current.removeUser(userToRemove.id);
    });

    expect(result.current.users).toHaveLength(initialCount - 1);
    expect(result.current.users.find(u => u.id === userToRemove.id)).toBeUndefined();
  });

  it('should update user properties', () => {
    const { result } = renderHook(() => useRBAC());

    const userId = 'u_viewer';

    act(() => {
      result.current.updateUser(userId, { 
        active: false,
        mfa_enabled: true 
      });
    });

    const user = result.current.users.find(u => u.id === userId);
    expect(user?.active).toBe(false);
    expect(user?.mfa_enabled).toBe(true);
  });

  it('should impersonate user', () => {
    const { result } = renderHook(() => useRBAC());

    expect(result.current.currentUser.id).toBe('u_global');

    act(() => {
      result.current.impersonate('u_finance');
    });

    expect(result.current.currentUser.id).toBe('u_finance');
    expect(result.current.currentUser.roles).toContain('finance_admin');
  });

  it('should stop impersonation', () => {
    const { result } = renderHook(() => useRBAC());

    act(() => {
      result.current.impersonate('u_finance');
    });

    expect(result.current.currentUser.id).toBe('u_finance');

    act(() => {
      result.current.stopImpersonation();
    });

    expect(result.current.currentUser.id).toBe('u_global');
  });

  it('should reset to default users', () => {
    const { result } = renderHook(() => useRBAC());

    // Add a new user
    act(() => {
      result.current.addUser('Test User', 'test@example.com', []);
    });

    expect(result.current.users.length).toBeGreaterThan(9);

    // Reset
    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.users).toHaveLength(9);
    expect(result.current.currentUser.id).toBe('u_global');
  });

  it('should persist users to localStorage', () => {
    const { result } = renderHook(() => useRBAC());

    act(() => {
      result.current.addUser('Persistent User', 'persist@example.com', ['teacher']);
    });

    const stored = localStorage.getItem('rbac_users');
    expect(stored).toBeDefined();
    
    const users = JSON.parse(stored!);
    expect(users.some((u: { email: string }) => u.email === 'persist@example.com')).toBe(true);
  });

  it('should persist current user ID to localStorage', () => {
    const { result } = renderHook(() => useRBAC());

    act(() => {
      result.current.impersonate('u_finance');
    });

    const stored = localStorage.getItem('rbac_current_user_id');
    expect(stored).toBe('u_finance');
  });

  it('should check hierarchy-based access', () => {
    const { result } = renderHook(() => useRBAC());

    // Global admin can access any role
    expect(result.current.canAccessRole('learner')).toBe(true);
    expect(result.current.canAccessRole('global_admin')).toBe(true);

    // Switch to teacher
    act(() => {
      result.current.impersonate('u_teacher');
    });

    // Teacher (level 5) can access learner (level 10) but not admin roles
    expect(result.current.canAccessRole('learner')).toBe(true);
    expect(result.current.canAccessRole('parent')).toBe(true);
    expect(result.current.canAccessRole('global_admin')).toBe(false);
    expect(result.current.canAccessRole('district_admin')).toBe(false);
  });
});
