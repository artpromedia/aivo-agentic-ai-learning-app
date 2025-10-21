# Auth System Quick Reference

## 🚀 Quick Start

### 1. Install (Already in workspace)
```bash
# Already available as @aivo/auth
```

### 2. Wrap Your App
```tsx
import { AuthProvider } from '@aivo/auth';

<AuthProvider apiBaseUrl="/api">
  <App />
</AuthProvider>
```

### 3. Use Hooks
```tsx
import { useAuth } from '@aivo/auth';

const { user, login, logout } = useAuth();
```

---

## 📚 Common Patterns

### Login
```tsx
const { login } = useAuth();
await login({ email, password });
```

### Logout
```tsx
const { logout } = useAuth();
logout();
```

### Check Permission
```tsx
const { hasPermission } = usePermissions();
if (hasPermission(Permission.MANAGE_STUDENTS)) { }
```

### Check Role
```tsx
const { isTeacher, isSuperAdmin } = useRole();
if (isTeacher) { }
```

### Protect Route
```tsx
<ProtectedRoute allowedRoles={['teacher']}>
  <Dashboard />
</ProtectedRoute>
```

### Conditional Render by Role
```tsx
<RoleGuard allowedRoles={['super-admin']}>
  <AdminPanel />
</RoleGuard>
```

### Conditional Render by Permission
```tsx
<PermissionGuard requiredPermissions={[Permission.MANAGE_IEP_GOALS]}>
  <IEPEditor />
</PermissionGuard>
```

---

## 🎭 All Roles

| Role | Code | Level |
|------|------|-------|
| Learner | `learner` | 1 |
| Parent | `parent` | 2 |
| Teacher | `teacher` | 3 |
| School Admin | `school-admin` | 4 |
| District Admin | `district-admin` | 5 |
| Super Admin | `super-admin` | 6 |

---

## 🔑 Common Permissions

### Student
- `VIEW_OWN_PROGRESS`
- `COMPLETE_ACTIVITIES`
- `VIEW_REWARDS`

### Parent
- `VIEW_CHILD_PROGRESS`
- `MANAGE_CHILD_PROFILE`
- `MANAGE_DEVICES`
- `VIEW_BILLING`

### Teacher
- `VIEW_STUDENT_PROGRESS`
- `MANAGE_IEP_GOALS`
- `ASSIGN_ACTIVITIES`
- `VIEW_CLASSROOM_ANALYTICS`

### Admin
- `MANAGE_SCHOOLS`
- `MANAGE_LICENSES`
- `VIEW_DISTRICT_ANALYTICS`
- `MANAGE_PLATFORM_SETTINGS`

---

## 🛠️ API Reference

### useAuth()
```tsx
const {
  user,              // Current user
  isAuthenticated,   // Auth status
  isLoading,         // Loading state
  error,             // Error message
  login,             // Login function
  logout,            // Logout function
  updateUser,        // Update user
  hasPermission,     // Check permission
  hasRole           // Check role
} = useAuth();
```

### usePermissions()
```tsx
const {
  hasPermission,      // Single check
  hasAnyPermission,   // Any match
  hasAllPermissions,  // All match
  permissions        // All permissions
} = usePermissions();
```

### useRole()
```tsx
const {
  role,              // Current role
  isLearner,         // Role flags
  isParent,
  isTeacher,
  isSchoolAdmin,
  isDistrictAdmin,
  isSuperAdmin,
  roleConfig        // Role config
} = useRole();
```

---

## 📂 Files Created

### Core Files (22 total)
```
packages/auth/
├── src/
│   ├── types/
│   │   ├── auth.ts              (AuthUser, AuthTokens, etc.)
│   │   ├── permissions.ts       (Permission enum, RolePermissions)
│   │   └── index.ts
│   ├── contexts/
│   │   └── AuthContext.tsx      (Main auth provider)
│   ├── hooks/
│   │   ├── useAuth.ts           (Auth hook)
│   │   ├── usePermissions.ts    (Permission hook)
│   │   ├── useRole.ts           (Role hook)
│   │   └── index.ts
│   ├── components/
│   │   ├── ProtectedRoute.tsx   (Route guard)
│   │   ├── RoleGuard.tsx        (Role guard)
│   │   ├── PermissionGuard.tsx  (Permission guard)
│   │   └── index.ts
│   ├── utils/
│   │   ├── tokenManager.ts      (Token management)
│   │   ├── permissions.ts       (Permission utilities)
│   │   ├── roleConfig.ts        (Role utilities)
│   │   └── index.ts
│   └── index.ts                 (Main exports)
├── package.json
├── tsconfig.json
├── eslint.config.js
├── README.md
└── EXAMPLES.tsx
```

---

## 💡 Tips

1. **Always wrap with AuthProvider** at app root
2. **Use hooks** for auth state, not context directly
3. **Check permissions** before rendering sensitive UI
4. **Use guards** for cleaner conditional rendering
5. **Protect routes** at router level, not component level
6. **Handle errors** from login/logout operations

---

## 🔗 Resources

- Full Documentation: `AUTH_SYSTEM_COMPLETE.md`
- Examples: `packages/auth/EXAMPLES.tsx`
- Types: `packages/auth/src/types/`
- Package README: `packages/auth/README.md`
