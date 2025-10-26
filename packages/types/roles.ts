// Role and permission types
export type UserRole = 'admin' | 'teacher' | 'parent' | 'learner' | 'district-admin' | 'super-admin';

export type Role = 
  | 'super_admin'
  | 'district_admin'
  | 'school_admin'
  | 'teacher'
  | 'parent'
  | 'learner'
  | 'support_staff';

export interface RoleDefinition {
  name: string;
  hierarchy_level: number;
  permissions: string[];
  description: string;
}

export const ROLES: Role[] = [
  'super_admin',
  'district_admin',
  'school_admin',
  'teacher',
  'parent',
  'learner',
  'support_staff',
];

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  super_admin: {
    name: 'Super Administrator',
    hierarchy_level: 100,
    permissions: ['*'],
    description: 'Full system access',
  },
  district_admin: {
    name: 'District Administrator',
    hierarchy_level: 80,
    permissions: [
      'manage_district',
      'view_all_schools',
      'manage_schools',
      'view_reports',
      'manage_teachers',
    ],
    description: 'Manages entire district',
  },
  school_admin: {
    name: 'School Administrator',
    hierarchy_level: 60,
    permissions: [
      'manage_school',
      'view_school_data',
      'manage_teachers',
      'view_reports',
    ],
    description: 'Manages a single school',
  },
  teacher: {
    name: 'Teacher',
    hierarchy_level: 40,
    permissions: [
      'view_students',
      'manage_assignments',
      'view_progress',
      'communicate_parents',
    ],
    description: 'Manages classroom and students',
  },
  parent: {
    name: 'Parent/Guardian',
    hierarchy_level: 20,
    permissions: ['view_own_children', 'communicate_teacher', 'view_progress'],
    description: 'Views and supports their children',
  },
  learner: {
    name: 'Learner',
    hierarchy_level: 10,
    permissions: ['view_own_data', 'complete_assignments', 'use_learning_tools'],
    description: 'Student using the platform',
  },
  support_staff: {
    name: 'Support Staff',
    hierarchy_level: 30,
    permissions: ['view_students', 'provide_support', 'view_iep'],
    description: 'Provides specialized support',
  },
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  district_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}
