import { RouteDefinition, routeRegistry } from '@aivo/utils';

/**
 * Admin Portal Route Definitions
 * 
 * This file contains all routes for the admin portal.
 * Routes are automatically registered with the global route registry
 * for testing and documentation purposes.
 */

export const adminPortalRoutes: RouteDefinition[] = [
  // Dashboard & Home
  {
    path: '/',
    screen: 'Dashboard',
    title: 'Dashboard',
    description: 'Main admin dashboard with system overview',
    roles: ['global_admin', 'district_admin', 'school_admin'],
    category: 'admin',
    testId: 'page-dashboard',
  },

  // User Management
  {
    path: '/users',
    screen: 'Users',
    title: 'User Management',
    description: 'Manage all users in the system',
    roles: ['global_admin', 'district_admin'],
    category: 'admin',
    testId: 'page-users',
  },
  {
    path: '/users/:id',
    screen: 'UserDetail',
    title: 'User Details',
    description: 'View and edit user details',
    roles: ['global_admin', 'district_admin'],
    category: 'admin',
    params: { id: 'User ID' },
    testId: 'page-user-detail',
  },

  // School Management
  {
    path: '/schools',
    screen: 'Schools',
    title: 'School Management',
    description: 'Manage schools and districts',
    roles: ['global_admin', 'district_admin'],
    category: 'admin',
    testId: 'page-schools',
  },
  {
    path: '/schools/:id',
    screen: 'SchoolDetail',
    title: 'School Details',
    description: 'View and edit school information',
    roles: ['global_admin', 'district_admin', 'school_admin'],
    category: 'admin',
    params: { id: 'School ID' },
    testId: 'page-school-detail',
  },

  // Device Management
  {
    path: '/devices',
    screen: 'DeviceFleet',
    title: 'Device Fleet Management',
    description: 'Manage all Aivo Pads and devices',
    roles: ['global_admin', 'tech_support'],
    category: 'admin',
    testId: 'page-device-fleet',
  },
  {
    path: '/devices/:id',
    screen: 'DeviceDetail',
    title: 'Device Details',
    description: 'View and manage individual device',
    roles: ['global_admin', 'tech_support'],
    category: 'admin',
    params: { id: 'Device ID' },
    testId: 'page-device-detail',
  },

  // Content Management
  {
    path: '/content',
    screen: 'ContentLibrary',
    title: 'Content Library',
    description: 'Manage educational content and lessons',
    roles: ['global_admin', 'district_admin', 'teacher'],
    category: 'admin',
    testId: 'page-content-library',
  },
  {
    path: '/content/subjects',
    screen: 'SubjectManagement',
    title: 'Subject Management',
    description: 'Configure subjects and curricula',
    roles: ['global_admin', 'district_admin'],
    category: 'admin',
    testId: 'page-subject-management',
  },

  // AI Baseline Assessment Management
  {
    path: '/assessment/question-review',
    screen: 'QuestionReviewDashboard',
    title: 'Question Review Dashboard',
    description: 'Review and approve AI-generated assessment questions',
    roles: ['global_admin', 'district_admin', 'teacher'],
    category: 'admin',
    testId: 'page-question-review',
  },
  {
    path: '/assessment/quality-metrics',
    screen: 'QualityMetricsDashboard',
    title: 'Quality Metrics Dashboard',
    description: 'Monitor question quality and performance metrics',
    roles: ['global_admin', 'district_admin', 'school_admin'],
    category: 'admin',
    testId: 'page-quality-metrics',
  },

  // Analytics & Reports
  {
    path: '/analytics',
    screen: 'Analytics',
    title: 'System Analytics',
    description: 'View system-wide analytics and metrics',
    roles: ['global_admin', 'district_admin', 'school_admin'],
    category: 'admin',
    testId: 'page-analytics',
  },
  {
    path: '/reports',
    screen: 'Reports',
    title: 'Reports',
    description: 'Generate and view system reports',
    roles: ['global_admin', 'district_admin', 'school_admin', 'teacher'],
    category: 'admin',
    testId: 'page-reports',
  },

  // API & Integrations
  {
    path: '/api-keys',
    screen: 'APIKeys',
    title: 'API Keys & Webhooks',
    description: 'Manage API credentials and webhook configurations',
    roles: ['global_admin', 'tech_support'],
    category: 'developer',
    testId: 'page-api-keys',
  },
  {
    path: '/integrations',
    screen: 'Integrations',
    title: 'Third-Party Integrations',
    description: 'Configure external integrations',
    roles: ['global_admin', 'tech_support'],
    category: 'developer',
    testId: 'page-integrations',
  },

  // Audit & Security
  {
    path: '/audit-log',
    screen: 'AuditLog',
    title: 'Audit Log',
    description: 'View system audit logs and security events',
    roles: ['global_admin', 'legal_compliance'],
    category: 'admin',
    testId: 'page-audit-log',
  },
  {
    path: '/security',
    screen: 'Security',
    title: 'Security Settings',
    description: 'Configure security policies and access controls',
    roles: ['global_admin'],
    category: 'settings',
    testId: 'page-security',
  },

  // Developer Tools
  {
    path: '/routes',
    screen: 'RouteCatalog',
    title: 'Route Catalog',
    description: 'Browse all application routes with testing helpers',
    roles: ['global_admin', 'tech_support'],
    category: 'developer',
    testId: 'page-route-catalog',
  },
  {
    path: '/system-health',
    screen: 'SystemHealth',
    title: 'System Health',
    description: 'Monitor system health and performance',
    roles: ['global_admin', 'tech_support'],
    category: 'developer',
    testId: 'page-system-health',
  },

  // Settings
  {
    path: '/settings',
    screen: 'Settings',
    title: 'System Settings',
    description: 'Configure global system settings',
    roles: ['global_admin'],
    category: 'settings',
    testId: 'page-settings',
  },
  {
    path: '/settings/profile',
    screen: 'ProfileSettings',
    title: 'Profile Settings',
    description: 'Manage your admin profile',
    roles: ['global_admin', 'district_admin', 'school_admin', 'teacher'],
    category: 'settings',
    testId: 'page-profile-settings',
  },
];

/**
 * Initialize the route registry with admin portal routes
 */
export function initializeAdminRoutes(): void {
  routeRegistry.registerMany(adminPortalRoutes);
}

/**
 * Get all admin routes
 */
export function getAdminRoutes(): RouteDefinition[] {
  return adminPortalRoutes;
}
