import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@aivo/auth';
import { superAdminNavigation } from './config/navigation';
import { ViewAsSelector } from './components/ViewAsSelector';
import { UserMenu } from './components/UserMenu';
import { routeRegistry } from '@aivo/utils';
import { initializeAdminRoutes } from './routes/definitions';
import { useEffect } from 'react';

// Authentication
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// User Management
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Core Management
import Dashboard from './pages/Dashboard';
import Shell from './pages/Shell';
import Tenants from './pages/Tenants';
import Licensing from './pages/Licensing';
import SSOSync from './pages/SSOSync';
import SLOBoard from './pages/SLOBoard';

// PROMPT 64: Enhanced Licensing Pages
import { DistrictsListPage } from './pages/Districts/DistrictsList';
import { CreateDistrictPage } from './pages/Districts/CreateDistrict';
import { DistrictDetailsPage } from './pages/Districts/DistrictDetails';
import { ProvisionLicensesPage } from './pages/Districts/ProvisionLicenses';
import { VaultDashboardPage } from './pages/Vault/VaultDashboard';
import { LicensingAnalyticsPage } from './pages/Analytics/LicensingAnalytics';

// Operations
import FinOps from './pages/FinOps';
import HITLOps from './pages/HITLOps';
import MDMFleet from './pages/MDMFleet';
import Governance from './pages/Governance';
import PilotProgram from './pages/PilotProgram';

// Platform (original pages)
import FeatureFlags from './pages/FeatureFlags';
import Integrations from './pages/Integrations';
import PlatformAnalytics from './pages/PlatformAnalytics';
import AIBrain from './pages/AIBrain';
import AIModelManagement from './pages/AIModelManagement';
import ContentManagement from './pages/ContentManagement';
import SecurityCompliance from './pages/SecurityCompliance';
import SupportTicketing from './pages/SupportTicketing';
import DatabaseAdmin from './pages/DatabaseAdmin';
import BillingManagement from './pages/BillingManagement';
import SystemConfiguration from './pages/SystemConfiguration';
import RBACManagement from './pages/RBACManagement';
import { AuditLogPage } from './pages/AuditLog.tsx';
import AdminUsers from './pages/AdminUsers';
import { APIKeysWebhooksPage } from './pages/APIKeysWebhooks';
import { RouteCatalogPage } from './pages/RouteCatalog';

import './styles/index.css';

// Route Initializer Component
function RouteInitializer() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Setup navigation helper for testing
    routeRegistry.setupNavigationHelper((path: string) => {
      navigate(path);
    });

    // Update current route
    if (typeof window !== 'undefined') {
      window.__CURRENT_ROUTE = location.pathname;
    }
  }, [navigate, location.pathname]);

  return null;
}

function Navigation() {
  const location = useLocation();
  const allNavItems = superAdminNavigation.flatMap(section => section.items);

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/aivo-icon.svg" 
                alt="Aivo Learning" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-neutral-900">Aivo Super Admin</span>
            </Link>
          </div>
          
          {/* User Impersonation Selector */}
          <div className="flex items-center gap-4">
            <ViewAsSelector />
            <UserMenu />
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 overflow-x-auto scrollbar-hide">
        <div className="max-w-full mx-auto px-6">
          <div className="flex space-x-1">
            {allNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
                title={item.description}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  // Initialize route registry
  useEffect(() => {
    initializeAdminRoutes();
  }, []);

  return (
    <AuthProvider apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}>
      <BrowserRouter>
        <RouteInitializer />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['super-admin']}>
              <div className="min-h-screen bg-neutral-50">
                <Navigation />
                <main className="max-w-[1600px] mx-auto px-6 py-8">
                  <Routes>
                    {/* Core Management */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/shell" element={<Shell />} />
                    <Route path="/tenants" element={<Tenants />} />
                    <Route path="/licensing" element={<Licensing />} />
                    <Route path="/sso" element={<SSOSync />} />
                    <Route path="/slo" element={<SLOBoard />} />
                    
                    {/* PROMPT 64: Enhanced Licensing Management */}
                    <Route path="/licensing/districts" element={<DistrictsListPage />} />
                    <Route path="/licensing/districts/create" element={<CreateDistrictPage />} />
                    <Route path="/licensing/districts/:districtId" element={<DistrictDetailsPage />} />
                    <Route path="/licensing/districts/:districtId/provision" element={<ProvisionLicensesPage />} />
                    <Route path="/licensing/vault" element={<VaultDashboardPage />} />
                    <Route path="/licensing/analytics" element={<LicensingAnalyticsPage />} />
                    
                    {/* Operations */}
                    <Route path="/finops" element={<FinOps />} />
                    <Route path="/hitl" element={<HITLOps />} />
                    <Route path="/mdm" element={<MDMFleet />} />
                    <Route path="/governance" element={<Governance />} />
                    <Route path="/pilot" element={<PilotProgram />} />
                    
                    {/* Platform */}
                    <Route path="/flags" element={<FeatureFlags />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/analytics" element={<PlatformAnalytics />} />
                    <Route path="/ai-brain" element={<AIBrain />} />
                    <Route path="/ai-models" element={<AIModelManagement />} />
                    <Route path="/content" element={<ContentManagement />} />
                    <Route path="/security" element={<SecurityCompliance />} />
                    <Route path="/support" element={<SupportTicketing />} />
                    <Route path="/database" element={<DatabaseAdmin />} />
                    <Route path="/system-configuration" element={<SystemConfiguration />} />
                    <Route path="/rbac" element={<RBACManagement />} />
                    <Route path="/audit-log" element={<AuditLogPage />} />
                    <Route path="/admin-users" element={<AdminUsers />} />
                    <Route path="/api-keys" element={<APIKeysWebhooksPage />} />
                    <Route path="/routes" element={<RouteCatalogPage />} />
                    
                    {/* Billing (separate from integrations) */}
                    <Route path="/billing" element={<BillingManagement />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
