/**
 * ProtectedRoute Component
 * Guards routes based on user roles and permissions (RBAC-enabled)
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole, Role } from '@aivo/types';
import { useAuth } from '../hooks/useAuth';
import { useRBAC } from '../hooks/useRBAC';
import { Permission } from '../types/permissions';
import { ROLE_DEFINITIONS } from '@aivo/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Legacy props
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  // RBAC props
  requiredRoles?: Role[];
  requireAll?: boolean; // If true, user must have ALL roles; otherwise ANY role
  requiredPermission?: string;
  redirectTo?: string;
  showForbidden?: boolean;
  useRBAC?: boolean; // Toggle between old auth and new RBAC
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  requiredRoles,
  requireAll = false,
  requiredPermission,
  redirectTo = '/login',
  showForbidden = true,
  useRBAC: useRBACMode = false,
}) => {
  const { isAuthenticated, hasPermission: hasOldPermission, hasRole } = useAuth();
  const { currentUser, hasAnyRole, hasAllRoles, hasPermission } = useRBAC();
  const location = useLocation();

  // Use RBAC mode if explicitly enabled or if requiredRoles is provided
  if (useRBACMode || requiredRoles) {
    if (!currentUser) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role-based access
    let hasRoleAccess = true;
    if (requiredRoles && requiredRoles.length > 0) {
      hasRoleAccess = requireAll
        ? hasAllRoles(requiredRoles)
        : hasAnyRole(requiredRoles);
    }

    // Check permission-based access
    const hasPermissionAccess = requiredPermission
      ? hasPermission(requiredPermission)
      : true;

    const hasAccess = hasRoleAccess && hasPermissionAccess;

    if (!hasAccess) {
      if (showForbidden) {
        return (
          <ForbiddenPage
            requiredRoles={requiredRoles}
            requiredPermission={requiredPermission}
          />
        );
      }
      return <Navigate to="/forbidden" replace />;
    }

    return <>{children}</>;
  }

  // Legacy auth mode
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && !requiredPermissions.every(hasOldPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

interface ForbiddenPageProps {
  requiredRoles?: Role[];
  requiredPermission?: string;
}

const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  requiredRoles,
  requiredPermission,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50" data-testid="forbidden-page">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold mb-2">403 - Forbidden</h1>
        <p className="text-neutral-600 mb-6">
          You don't have permission to access this page.
        </p>

        {requiredRoles && requiredRoles.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-neutral-600 mb-2">Required roles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {requiredRoles.map(role => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          </div>
        )}

        {requiredPermission && (
          <div className="mb-6">
            <p className="text-sm text-neutral-600 mb-2">Required permission:</p>
            <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-sm font-mono">
              {requiredPermission}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition"
          >
            Go Back
          </button>
          <a
            href="/dashboard"
            className="block w-full px-6 py-3 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const def = ROLE_DEFINITIONS[role];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${def.color}`}>
      {def.name}
    </span>
  );
};
