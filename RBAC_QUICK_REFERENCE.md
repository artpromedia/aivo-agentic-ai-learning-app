# RBAC System - Quick Reference Guide

## Overview

The Role-Based Access Control (RBAC) system provides comprehensive role management, permission checks, and user impersonation for testing and development.

## Key Features

✅ **9 Predefined Roles** with hierarchy-based access
✅ **Permission System** with granular controls  
✅ **User Impersonation** for QA/testing
✅ **Route Guards** for protected pages
✅ **Persistent State** via localStorage
✅ **Admin UI** for role management

## Roles & Hierarchy

Roles are organized by hierarchy level (1 = highest, 10 = lowest):

| Role | Level | Icon | Use Case |
|------|-------|------|----------|
| **Global Admin** | 1 | 👑 | Full system access |
| **Finance Admin** | 2 | 💰 | Billing & subscriptions |
| **Tech Support** | 2 | 🔧 | API keys, webhooks, integrations |
| **Legal & Compliance** | 2 | ⚖️ | Audit logs, compliance reports |
| **District Admin** | 3 | 🏛️ | Schools, teachers, district settings |
| **School Admin** | 4 | 🏫 | Teachers, students within school |
| **Teacher** | 5 | 👨‍🏫 | Classroom, students, IEP goals |
| **Parent** | 6 | 👪 | View child progress |
| **Learner** | 10 | 🎓 | Learning activities |

## Usage

### Using the Hook

```typescript
import { useRBAC } from '@aivo/auth';

function MyComponent() {
  const { 
    currentUser, 
    hasAnyRole, 
    hasAllRoles, 
    hasPermission,
    impersonate 
  } = useRBAC();

  // Check if user has any of these roles
  if (hasAnyRole(['global_admin', 'finance_admin'])) {
    // Show finance controls
  }

  // Check if user has ALL roles
  if (hasAllRoles(['teacher', 'school_admin'])) {
    // User has both roles
  }

  // Check specific permission
  if (hasPermission('billing.manage')) {
    // Show billing management
  }

  // Impersonate another user (for testing)
  impersonate('u_finance');
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@aivo/auth';

// Require ANY of these roles
<ProtectedRoute 
  requiredRoles={['global_admin', 'finance_admin']}
  useRBAC={true}
>
  <FinancePage />
</ProtectedRoute>

// Require ALL roles
<ProtectedRoute 
  requiredRoles={['teacher', 'school_admin']}
  requireAll={true}
  useRBAC={true}
>
  <AdminTeacherPage />
</ProtectedRoute>

// Require specific permission
<ProtectedRoute 
  requiredPermission="billing.manage"
  useRBAC={true}
>
  <BillingSettings />
</ProtectedRoute>
```

### Role Badge Component

```typescript
import { RoleBadge } from '@aivo/ui';

<RoleBadge 
  role="global_admin" 
  size="md" 
  showIcon={true} 
/>
```

## Default Users

The system comes with 9 pre-configured test users:

| User | Email | Roles | MFA |
|------|-------|-------|-----|
| Alice Global | alice@aivo.ai | Global Admin | ✅ |
| Finn Finance | finn@aivo.ai | Finance Admin | ✅ |
| Taylor Tech | taylor@aivo.ai | Tech Support | ❌ |
| Lina Legal | lina@aivo.ai | Legal & Compliance | ✅ |
| Diana District | diana@district.edu | District Admin | ❌ |
| Steve School | steve@school.edu | School Admin | ❌ |
| Tom Teacher | teacher@school.edu | Teacher | ❌ |
| Sam Support | sam@aivo.ai | Tech Support | ❌ |
| Pat Viewer | pat@aivo.ai | (No roles) | ❌ |

## Permissions by Role

### Global Admin
- **All permissions** (wildcard `*`)

### Finance Admin
- `billing.view`, `billing.manage`
- `subscriptions.view`, `subscriptions.manage`
- `invoices.view`, `invoices.export`
- `reports.financial`

### Tech Support
- `api_keys.view`, `api_keys.create`, `api_keys.revoke`
- `webhooks.view`, `webhooks.manage`
- `integrations.view`, `integrations.configure`
- `logs.view`, `diagnostics.run`

### Legal & Compliance
- `audit_log.view`, `audit_log.export`
- `compliance.view`, `compliance.reports`
- `dsr.view`, `dsr.manage`
- `legal_docs.view`, `legal_docs.manage`

### District Admin
- `schools.view`, `schools.manage`
- `teachers.view`, `teachers.manage`
- `district_settings.manage`, `reports.district`

### School Admin
- `teachers.view`, `students.view`
- `school_settings.manage`, `reports.school`

### Teacher
- `students.view`, `iep.view`, `iep.manage`
- `activities.assign`, `progress.view`
- `reports.classroom`

### Parent
- `child.view`, `child.settings`
- `progress.view`, `messages.teacher`

### Learner
- `activities.view`, `activities.complete`
- `progress.own.view`, `rewards.view`

## RBAC Management Page

Access the RBAC Management page at **`/rbac`** in the admin portal to:

✅ **View all role definitions** with descriptions
✅ **Manage user roles** with toggle buttons  
✅ **Add new users** with role assignments
✅ **Impersonate users** for testing
✅ **Toggle user status** (active/inactive)
✅ **Enable/disable MFA** per user
✅ **Reset to defaults** to restore test users

## Testing & QA

### Impersonation Workflow

1. Navigate to `/rbac` in admin portal
2. Find the user you want to test
3. Click **"🎭 Impersonate"** button
4. Navigate to pages to test access
5. Switch users or reset when done

### Console Logging

Impersonation events are logged to console:
```
🎭 Now impersonating: Finn Finance (finn@aivo.ai)
🎭 Stopped impersonation, returned to default user
🔄 Reset to default users
```

### LocalStorage

All RBAC state is persisted to localStorage:
- `rbac_users` - All user data
- `rbac_current_user_id` - Currently impersonated user

## API Reference

### useRBAC Hook

```typescript
const {
  // State
  users,              // All users
  currentUser,        // Current/impersonated user
  
  // Role checks
  hasAnyRole,         // Check if user has any of roles
  hasAllRoles,        // Check if user has all roles
  canAccessRole,      // Check hierarchy-based access
  
  // Permission checks
  hasPermission,      // Check specific permission
  
  // User management
  addUser,            // Add new user
  removeUser,         // Remove user
  updateUser,         // Update user properties
  toggleRole,         // Add/remove role from user
  
  // Impersonation
  impersonate,        // Switch to user
  stopImpersonation,  // Return to default
  setCurrentUserId,   // Direct user switch
  
  // Utilities
  resetToDefaults,    // Reset all to defaults
} = useRBAC();
```

### ProtectedRoute Component

```typescript
<ProtectedRoute
  // Legacy props (old auth system)
  allowedRoles?: UserRole[]
  requiredPermissions?: Permission[]
  
  // RBAC props (new system)
  requiredRoles?: Role[]           // Required roles
  requireAll?: boolean             // Need ALL roles? (default: ANY)
  requiredPermission?: string      // Required permission
  useRBAC?: boolean                // Enable RBAC mode
  
  // Common props
  redirectTo?: string              // Redirect path (default: /login)
  showForbidden?: boolean          // Show 403 page (default: true)
>
  {children}
</ProtectedRoute>
```

## Examples

### Example 1: Finance Dashboard

```typescript
function FinanceDashboard() {
  const { hasPermission } = useRBAC();

  return (
    <div>
      <h1>Finance Dashboard</h1>
      
      {hasPermission('billing.manage') && (
        <BillingControls />
      )}
      
      {hasPermission('invoices.export') && (
        <ExportButton />
      )}
    </div>
  );
}

// Wrap in route
<ProtectedRoute 
  requiredRoles={['global_admin', 'finance_admin']}
  useRBAC={true}
>
  <FinanceDashboard />
</ProtectedRoute>
```

### Example 2: Multi-Role Page

```typescript
function SchoolManagement() {
  const { currentUser, hasAnyRole } = useRBAC();

  const isDistrictAdmin = currentUser.roles.includes('district_admin');
  const isSchoolAdmin = currentUser.roles.includes('school_admin');

  return (
    <div>
      {isDistrictAdmin && <DistrictControls />}
      {(isDistrictAdmin || isSchoolAdmin) && <SchoolList />}
      {hasAnyRole(['teacher', 'school_admin', 'district_admin']) && (
        <StudentList />
      )}
    </div>
  );
}
```

### Example 3: QA Test Script

```typescript
// Test different user perspectives
const testUsers = [
  'u_global',    // Full access
  'u_finance',   // Finance features
  'u_teacher',   // Classroom features
  'u_viewer',    // Limited/no access
];

testUsers.forEach(userId => {
  impersonate(userId);
  // Test features with this user
  // Verify correct access/restrictions
});

// Reset when done
resetToDefaults();
```

## Troubleshooting

### Issue: User has no roles
**Solution**: Use RBAC Management page to assign roles

### Issue: Permission check always fails
**Solution**: Check role definitions in `packages/types/src/rbac.ts`

### Issue: Impersonation not working
**Solution**: Check localStorage or use resetToDefaults()

### Issue: 403 Forbidden on all pages
**Solution**: Make sure you're using `useRBAC={true}` prop on ProtectedRoute

## Files Modified/Created

### Core Types
- ✅ `packages/types/src/rbac.ts` - Role definitions, permissions
- ✅ `packages/types/src/index.ts` - Export RBAC types

### Auth Package
- ✅ `packages/auth/src/hooks/useRBAC.ts` - RBAC hook
- ✅ `packages/auth/src/hooks/index.ts` - Export hook
- ✅ `packages/auth/src/components/ProtectedRoute.tsx` - Updated with RBAC
- ✅ `packages/auth/src/hooks/__tests__/useRBAC.test.ts` - Tests

### UI Package
- ✅ `packages/ui/src/components/RoleBadge.tsx` - Badge component
- ✅ `packages/ui/src/components/index.ts` - Export badge
- ✅ `packages/ui/package.json` - Added @aivo/types dependency

### Admin Portal
- ✅ `apps/admin-portal/src/pages/RBACManagement.tsx` - Management page
- ✅ `apps/admin-portal/src/App.tsx` - Added route
- ✅ `apps/admin-portal/src/config/navigation.ts` - Added nav item

## Next Steps

1. ✅ **Test the RBAC Management page** at `/rbac`
2. ✅ **Add RBAC to other portals** (teacher, district, parent)
3. ✅ **Write integration tests** for role-based workflows
4. ✅ **Add permission checks** to sensitive operations
5. ✅ **Document role changes** in CHANGELOG

---

**Status**: ✅ Complete
**Date**: January 2025
**Version**: 1.0.0
