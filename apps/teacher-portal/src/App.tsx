import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { EnrollStudent } from './pages/EnrollStudent';
import { StudentAssessmentPage } from './pages/StudentAssessment';
import { IEPManagement } from './pages/IEPManagement';
import { IEPDetail } from './pages/IEPDetail';
import { ProgressMonitoring } from './pages/ProgressMonitoring';
import { Messages } from './pages/Messages';
import { Activities } from './pages/Activities';
import { Reports } from './pages/Reports';

function App() {
  return (
    <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="students" element={<Students />} />
            <Route path="students/enroll" element={<EnrollStudent />} />
            <Route path="students/assessment/:learnerId" element={<StudentAssessmentPage />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="iep" element={<IEPManagement />} />
            <Route path="iep/:id" element={<IEPDetail />} />
            <Route path="progress" element={<ProgressMonitoring />} />
            <Route path="messages" element={<Messages />} />
            <Route path="activities" element={<Activities />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
