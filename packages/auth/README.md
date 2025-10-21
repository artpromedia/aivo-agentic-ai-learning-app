# @aivo/auth

Shared authentication and authorization system for Aivo Learning platform.

## Features

- **Role-Based Access Control (RBAC)**: Fine-grained permissions for all user roles
- **JWT Token Management**: Secure token storage and auto-refresh
- **React Hooks**: Easy-to-use hooks for auth state and permissions
- **Protected Routes**: Route guards for authentication and authorization
- **Type-Safe**: Full TypeScript support

## Installation

```bash
pnpm add @aivo/auth
```

## Usage

### Setup AuthProvider

```tsx
import { AuthProvider } from '@aivo/auth';

function App() {
  return (
    <AuthProvider apiBaseUrl="/api">
      {/* Your app */}
    </AuthProvider>
  );
}
```

### Using Auth Hooks

```tsx
import { useAuth, usePermissions, useRole } from '@aivo/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { isTeacher, isSuperAdmin } = useRole();

  return (
    <div>
      {isAuthenticated && <p>Hello, {user?.name}</p>}
      {hasPermission(Permission.MANAGE_STUDENTS) && <button>Manage Students</button>}
    </div>
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute, Permission } from '@aivo/auth';

<ProtectedRoute 
  allowedRoles={['teacher', 'super-admin']}
  requiredPermissions={[Permission.VIEW_STUDENT_PROGRESS]}
>
  <StudentDashboard />
</ProtectedRoute>
```

### Guards

```tsx
import { RoleGuard, PermissionGuard } from '@aivo/auth';

<RoleGuard allowedRoles={['super-admin']}>
  <AdminPanel />
</RoleGuard>

<PermissionGuard requiredPermissions={[Permission.MANAGE_FEATURE_FLAGS]}>
  <FeatureFlagEditor />
</PermissionGuard>
```

## Available Roles

- `learner`: Student
- `parent`: Parent/Guardian
- `teacher`: Classroom Teacher
- `school-admin`: School Administrator
- `district-admin`: District Administrator
- `super-admin`: Platform Super Administrator

## License

MIT
