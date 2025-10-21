import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import { UserMenu } from './components/UserMenu';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import SchoolManagement from './pages/SchoolManagement';
import UserManagement from './pages/UserManagement';
import IEPCompliance from './pages/IEPCompliance';
import DistrictReports from './pages/DistrictReports';
import ProfessionalDevelopment from './pages/ProfessionalDevelopment';
import Integrations from './pages/Integrations';
import SupportDesk from './pages/SupportDesk';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '📊 Dashboard', icon: '📊' },
    { path: '/schools', label: '🏫 Schools', icon: '🏫' },
    { path: '/users', label: '👥 Users', icon: '👥' },
    { path: '/compliance', label: '✓ IEP Compliance', icon: '✓' },
    { path: '/reports', label: '📈 Reports', icon: '📈' },
    { path: '/training', label: '🎓 Training', icon: '🎓' },
    { path: '/integrations', label: '🔌 Integrations', icon: '🔌' },
    { path: '/support', label: '🎧 Support', icon: '🎧' },
  ];

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/aivo-icon.svg" 
              alt="Aivo Learning" 
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-lg font-bold text-neutral-900">Aivo Learning</h1>
              <p className="text-xs text-neutral-500">District Administrator</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label.split(' ')[1] || item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="pl-4 border-l border-neutral-200">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['district-admin']}>
              <div className="min-h-screen bg-neutral-50">
                <Navigation />
                <main className="max-w-[1800px] mx-auto px-6 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/schools" element={<SchoolManagement />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/compliance" element={<IEPCompliance />} />
                    <Route path="/reports" element={<DistrictReports />} />
                    <Route path="/training" element={<ProfessionalDevelopment />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/support" element={<SupportDesk />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
