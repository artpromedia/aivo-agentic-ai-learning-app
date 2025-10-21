/**
 * Role-Based Access Control (RBAC) Types
 * Defines roles, permissions, and user types for the RBAC system
 */

export const ROLES = [
  'global_admin',
  'finance_admin',
  'tech_support',
  'legal_compliance',
  'district_admin',
  'school_admin',
  'teacher',
  'parent',
  'learner',
] as const;

export type Role = typeof ROLES[number];

export interface RBACPermission {
  id: string;
  name: string;
  description: string;
  category: 'admin' | 'content' | 'data' | 'finance' | 'legal';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;
  mfa_enabled: boolean;
}

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  hierarchy_level: number; // 1 = highest (global_admin), 10 = lowest (learner)
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  global_admin: {
    id: 'global_admin',
    name: 'Global Administrator',
    description: 'Full system access - can manage all users, settings, and data',
    color: 'bg-black text-white',
    permissions: ['*'], // All permissions
    hierarchy_level: 1,
  },
  finance_admin: {
    id: 'finance_admin',
    name: 'Finance Administrator',
    description: 'Manage billing, subscriptions, and financial reports',
    color: 'bg-emerald-100 text-emerald-800',
    permissions: [
      'billing.view',
      'billing.manage',
      'subscriptions.view',
      'subscriptions.manage',
      'invoices.view',
      'invoices.export',
      'reports.financial',
    ],
    hierarchy_level: 2,
  },
  tech_support: {
    id: 'tech_support',
    name: 'Technical Support',
    description: 'Manage API keys, webhooks, integrations, and technical troubleshooting',
    color: 'bg-indigo-100 text-indigo-800',
    permissions: [
      'api_keys.view',
      'api_keys.create',
      'api_keys.revoke',
      'webhooks.view',
      'webhooks.manage',
      'integrations.view',
      'integrations.configure',
      'logs.view',
      'diagnostics.run',
    ],
    hierarchy_level: 2,
  },
  legal_compliance: {
    id: 'legal_compliance',
    name: 'Legal & Compliance',
    description: 'Access audit logs, compliance reports, and legal documentation',
    color: 'bg-amber-100 text-amber-800',
    permissions: [
      'audit_log.view',
      'audit_log.export',
      'compliance.view',
      'compliance.reports',
      'dsr.view',
      'dsr.manage',
      'legal_docs.view',
      'legal_docs.manage',
    ],
    hierarchy_level: 2,
  },
  district_admin: {
    id: 'district_admin',
    name: 'District Administrator',
    description: 'Manage schools, teachers, and district-level settings',
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'schools.view',
      'schools.manage',
      'teachers.view',
      'teachers.manage',
      'district_settings.manage',
      'reports.district',
    ],
    hierarchy_level: 3,
  },
  school_admin: {
    id: 'school_admin',
    name: 'School Administrator',
    description: 'Manage teachers and students within a school',
    color: 'bg-cyan-100 text-cyan-800',
    permissions: [
      'teachers.view',
      'students.view',
      'school_settings.manage',
      'reports.school',
    ],
    hierarchy_level: 4,
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    description: 'Manage classroom, students, and IEP goals',
    color: 'bg-purple-100 text-purple-800',
    permissions: [
      'students.view',
      'iep.view',
      'iep.manage',
      'activities.assign',
      'progress.view',
      'reports.classroom',
    ],
    hierarchy_level: 5,
  },
  parent: {
    id: 'parent',
    name: 'Parent/Guardian',
    description: 'View child progress and manage settings',
    color: 'bg-pink-100 text-pink-800',
    permissions: [
      'child.view',
      'child.settings',
      'progress.view',
      'messages.teacher',
    ],
    hierarchy_level: 6,
  },
  learner: {
    id: 'learner',
    name: 'Learner',
    description: 'Access learning activities and view own progress',
    color: 'bg-yellow-100 text-yellow-800',
    permissions: [
      'activities.view',
      'activities.complete',
      'progress.own.view',
      'rewards.view',
    ],
    hierarchy_level: 10,
  },
};

/**
 * Permission Categories
 */
export const PERMISSION_CATEGORIES = {
  admin: 'Administration',
  content: 'Content Management',
  data: 'Data Access',
  finance: 'Financial',
  legal: 'Legal & Compliance',
} as const;

/**
 * All available permissions in the system
 */
export const ALL_PERMISSIONS: RBACPermission[] = [
  // Admin permissions
  { id: 'users.view', name: 'View Users', description: 'View user list and details', category: 'admin' },
  { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, delete users', category: 'admin' },
  { id: 'roles.view', name: 'View Roles', description: 'View role definitions', category: 'admin' },
  { id: 'roles.manage', name: 'Manage Roles', description: 'Assign and remove roles', category: 'admin' },
  
  // Content permissions
  { id: 'content.view', name: 'View Content', description: 'View learning content', category: 'content' },
  { id: 'content.create', name: 'Create Content', description: 'Create new content', category: 'content' },
  { id: 'content.edit', name: 'Edit Content', description: 'Modify existing content', category: 'content' },
  { id: 'content.delete', name: 'Delete Content', description: 'Remove content', category: 'content' },
  
  // Data permissions
  { id: 'students.view', name: 'View Students', description: 'View student profiles', category: 'data' },
  { id: 'students.manage', name: 'Manage Students', description: 'Edit student information', category: 'data' },
  { id: 'iep.view', name: 'View IEPs', description: 'View IEP documents', category: 'data' },
  { id: 'iep.manage', name: 'Manage IEPs', description: 'Create and edit IEPs', category: 'data' },
  { id: 'progress.view', name: 'View Progress', description: 'View student progress', category: 'data' },
  { id: 'reports.view', name: 'View Reports', description: 'Access reports', category: 'data' },
  
  // Finance permissions
  { id: 'billing.view', name: 'View Billing', description: 'View billing information', category: 'finance' },
  { id: 'billing.manage', name: 'Manage Billing', description: 'Manage billing and payments', category: 'finance' },
  { id: 'subscriptions.view', name: 'View Subscriptions', description: 'View subscription details', category: 'finance' },
  { id: 'subscriptions.manage', name: 'Manage Subscriptions', description: 'Manage subscriptions', category: 'finance' },
  
  // Legal permissions
  { id: 'audit_log.view', name: 'View Audit Log', description: 'Access audit logs', category: 'legal' },
  { id: 'compliance.view', name: 'View Compliance', description: 'View compliance reports', category: 'legal' },
  { id: 'dsr.manage', name: 'Manage DSR', description: 'Handle data subject requests', category: 'legal' },
];
