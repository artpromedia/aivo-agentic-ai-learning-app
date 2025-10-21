// Example: Login Page Component
import { useState } from 'react';
import { useAuth } from '@aivo/auth';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// Example: Teacher Dashboard with Permission Check
import { useAuth, usePermissions, Permission } from '@aivo/auth';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      
      {hasPermission(Permission.VIEW_STUDENT_PROGRESS) && (
        <section>
          <h2>Student Progress</h2>
          {/* Student progress content */}
        </section>
      )}

      {hasPermission(Permission.MANAGE_IEP_GOALS) && (
        <section>
          <h2>IEP Goals</h2>
          {/* IEP goals management */}
        </section>
      )}

      {hasPermission(Permission.ASSIGN_ACTIVITIES) && (
        <button>Assign New Activity</button>
      )}
    </div>
  );
}

// Example: App Router with Protected Routes
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, Permission } from '@aivo/auth';

function App() {
  return (
    <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes for learners */}
          <ProtectedRoute allowedRoles={['learner']}>
            <Route path="/learn" element={<LearnerApp />} />
          </ProtectedRoute>

          {/* Protected routes for parents */}
          <ProtectedRoute allowedRoles={['parent']}>
            <Route path="/parent" element={<ParentPortal />} />
          </ProtectedRoute>

          {/* Protected routes for teachers */}
          <ProtectedRoute 
            allowedRoles={['teacher', 'school-admin']}
            requiredPermissions={[Permission.VIEW_STUDENT_PROGRESS]}
          >
            <Route path="/teacher" element={<TeacherPortal />} />
          </ProtectedRoute>

          {/* Protected routes for admins */}
          <ProtectedRoute allowedRoles={['super-admin']}>
            <Route path="/admin" element={<AdminPortal />} />
          </ProtectedRoute>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Example: Using Role Guards for Conditional Rendering
import { RoleGuard, PermissionGuard, Permission } from '@aivo/auth';

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show only for teachers */}
      <RoleGuard allowedRoles={['teacher']}>
        <TeacherControls />
      </RoleGuard>

      {/* Show only for admins */}
      <RoleGuard allowedRoles={['school-admin', 'district-admin', 'super-admin']}>
        <AdminControls />
      </RoleGuard>

      {/* Show based on permission */}
      <PermissionGuard requiredPermissions={[Permission.MANAGE_FEATURE_FLAGS]}>
        <FeatureFlagPanel />
      </PermissionGuard>

      {/* Show if user DOES NOT have permission */}
      <PermissionGuard 
        requiredPermissions={[Permission.MANAGE_AI_MODELS]} 
        inverse
      >
        <UpgradePrompt message="Upgrade to access AI model management" />
      </PermissionGuard>
    </div>
  );
}

// Example: Using Role Hook
import { useRole } from '@aivo/auth';

export function UserProfile() {
  const { 
    role, 
    isTeacher, 
    isSuperAdmin, 
    roleConfig 
  } = useRole();

  return (
    <div>
      <h2>User Profile</h2>
      <p>Role: {roleConfig?.name}</p>
      <p>Description: {roleConfig?.description}</p>
      <p>Level: {roleConfig?.level}</p>

      {isTeacher && <TeacherBadge />}
      {isSuperAdmin && <AdminBadge />}
    </div>
  );
}

// Example: Custom Hook for Feature Access
import { usePermissions, Permission } from '@aivo/auth';

export function useFeatureAccess() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return {
    canManageStudents: hasPermission(Permission.MANAGE_IEP_GOALS),
    canViewAnalytics: hasAnyPermission([
      Permission.VIEW_CLASSROOM_ANALYTICS,
      Permission.VIEW_SCHOOL_ANALYTICS,
      Permission.VIEW_DISTRICT_ANALYTICS,
      Permission.VIEW_PLATFORM_ANALYTICS,
    ]),
    canManageBilling: hasAnyPermission([
      Permission.VIEW_BILLING,
      Permission.MANAGE_SUBSCRIPTION,
      Permission.MANAGE_BILLING_ALL,
    ]),
  };
}

export function FeatureAccessExample() {
  const { canManageStudents, canViewAnalytics } = useFeatureAccess();

  return (
    <div>
      {canManageStudents && <button>Manage Students</button>}
      {canViewAnalytics && <AnalyticsDashboard />}
    </div>
  );
}
