import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/onboarding/Onboarding';
import { ParentSignup } from './pages/ParentSignup';
import { Progress } from './pages/Progress';
import { SubjectProgress } from './pages/SubjectProgress';
import { Devices } from './pages/Devices';
import { Invitations } from './pages/Invitations';
import { BaselineResults } from './pages/BaselineResults';
import { ChildResultsPage } from './pages/baseline/ChildResultsPage';
import { Trial } from './pages/Trial';
import { Billing } from './pages/Billing';
import ModelCloningTestPage from './pages/ModelCloningTestPage';
import { ModelCloning } from './pages/ModelCloning';

function App() {
  return (
    <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Signup - Create parent account then go to onboarding */}
          <Route path="/signup/parent" element={<ParentSignup />} />
          
          {/* Onboarding - Add children (requires parent to be logged in) */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Model Cloning - Accessed after baseline assessment completion */}
          <Route path="/model-cloning" element={<ModelCloning />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="progress" element={<Progress />} />
            <Route path="progress/:subject" element={<SubjectProgress />} />
            <Route path="devices" element={<Devices />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="baseline-results" element={<BaselineResults />} />
            <Route path="children/:childId/baseline/:sessionId" element={<ChildResultsPage />} />
            <Route path="trial" element={<Trial />} />
            <Route path="billing" element={<Billing />} />
            <Route path="model-cloning-test" element={<ModelCloningTestPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
