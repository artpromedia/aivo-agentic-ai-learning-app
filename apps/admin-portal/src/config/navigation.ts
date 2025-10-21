/**
 * Super Admin Navigation Configuration
 * Organized into sections for Core Management, Operations, and Platform
 */

export interface NavigationItem {
  name: string;
  path: string;
  badge?: string;
  description?: string;
}

export interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

export const superAdminNavigation: NavigationSection[] = [
  {
    section: 'Core Management',
    items: [
      { name: 'Dashboard', path: '/', badge: 'main', description: 'Platform Dashboard' },
      { name: 'Tenants', path: '/tenants', description: 'Tenant Management' },
      { name: 'Licensing', path: '/licensing', description: 'License Management' },
      { name: 'SSO & Sync', path: '/sso', description: 'SSO Configuration' },
      { name: 'SLO Board', path: '/slo', description: 'Service Level Objectives' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { name: 'FinOps', path: '/finops', description: 'Financial Operations' },
      { name: 'HITL Ops', path: '/hitl', description: 'Human-in-the-Loop Operations' },
      { name: 'MDM / Fleet', path: '/mdm', description: 'Mobile Device Management' },
      { name: 'Governance & DSRs', path: '/governance', description: 'Data Governance' },
      { name: 'Pilot Program', path: '/pilot', description: 'Beta Programs' },
    ],
  },
  {
    section: 'Platform',
    items: [
      { name: 'Feature Flags', path: '/flags', description: 'Feature Management' },
      { name: 'Integrations', path: '/integrations', description: 'Third-party Integrations' },
      { name: 'Billing', path: '/billing', description: 'Revenue & Subscriptions' },
      { name: 'Analytics', path: '/analytics', description: 'Platform Analytics' },
      { name: 'AI Brain', path: '/ai-brain', badge: 'live', description: 'AI Provider Connections' },
      { name: 'AI Models', path: '/ai-models', description: 'AI Model Management' },
      { name: 'Content', path: '/content', description: 'Content Library' },
      { name: 'Security', path: '/security', description: 'Security & Compliance' },
      { name: 'RBAC', path: '/rbac', badge: 'new', description: 'Role-Based Access Control' },
      { name: 'Admin Users', path: '/admin-users', badge: 'new', description: 'User & Role Management' },
      { name: 'Audit Log', path: '/audit-log', badge: 'new', description: 'Audit Trail & Impersonation Logs' },
      { name: 'API Keys', path: '/api-keys', badge: 'new', description: 'API Keys & Webhooks Management' },
      { name: 'Routes', path: '/routes', badge: 'dev', description: 'Route Catalog & Testing Helpers' },
      { name: 'Support', path: '/support', description: 'Support Ticketing' },
      { name: 'Database', path: '/database', description: 'Database Administration' },
    ],
  },
];

/**
 * Get all navigation items as a flat array
 */
export const getAllNavigationItems = (): NavigationItem[] => {
  return superAdminNavigation.flatMap((section) => section.items);
};

/**
 * Get navigation item by path
 */
export const getNavigationItem = (path: string): NavigationItem | undefined => {
  return getAllNavigationItems().find((item) => item.path === path);
};
