import { UserRole } from '@aivo/types';

export enum Permission {
  // Student Permissions
  VIEW_OWN_PROGRESS = 'view_own_progress',
  COMPLETE_ACTIVITIES = 'complete_activities',
  VIEW_REWARDS = 'view_rewards',
  
  // Parent Permissions
  VIEW_CHILD_PROGRESS = 'view_child_progress',
  MANAGE_CHILD_PROFILE = 'manage_child_profile',
  COMMUNICATE_WITH_TEACHER = 'communicate_with_teacher',
  MANAGE_DEVICES = 'manage_devices',
  VIEW_BILLING = 'view_billing',
  MANAGE_SUBSCRIPTION = 'manage_subscription',
  
  // Teacher Permissions
  VIEW_STUDENT_PROGRESS = 'view_student_progress',
  MANAGE_IEP_GOALS = 'manage_iep_goals',
  ASSIGN_ACTIVITIES = 'assign_activities',
  COMMUNICATE_WITH_PARENTS = 'communicate_with_parents',
  EXPORT_STUDENT_DATA = 'export_student_data',
  VIEW_CLASSROOM_ANALYTICS = 'view_classroom_analytics',
  
  // School Admin Permissions
  MANAGE_SCHOOL_USERS = 'manage_school_users',
  VIEW_SCHOOL_ANALYTICS = 'view_school_analytics',
  MANAGE_TEACHER_ACCOUNTS = 'manage_teacher_accounts',
  VIEW_IEP_COMPLIANCE = 'view_iep_compliance',
  
  // District Admin Permissions
  MANAGE_DISTRICT_USERS = 'manage_district_users',
  VIEW_DISTRICT_ANALYTICS = 'view_district_analytics',
  MANAGE_SCHOOLS = 'manage_schools',
  MANAGE_LICENSES = 'manage_licenses',
  VIEW_DISTRICT_REPORTS = 'view_district_reports',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  
  // Super Admin Permissions
  MANAGE_ALL_DISTRICTS = 'manage_all_districts',
  MANAGE_PLATFORM_SETTINGS = 'manage_platform_settings',
  VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
  MANAGE_FEATURE_FLAGS = 'manage_feature_flags',
  MANAGE_AI_MODELS = 'manage_ai_models',
  ACCESS_DATABASE = 'access_database',
  MANAGE_BILLING_ALL = 'manage_billing_all',
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  learner: [
    Permission.VIEW_OWN_PROGRESS,
    Permission.COMPLETE_ACTIVITIES,
    Permission.VIEW_REWARDS,
  ],
  parent: [
    Permission.VIEW_CHILD_PROGRESS,
    Permission.MANAGE_CHILD_PROFILE,
    Permission.COMMUNICATE_WITH_TEACHER,
    Permission.MANAGE_DEVICES,
    Permission.VIEW_BILLING,
    Permission.MANAGE_SUBSCRIPTION,
  ],
  teacher: [
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.MANAGE_IEP_GOALS,
    Permission.ASSIGN_ACTIVITIES,
    Permission.COMMUNICATE_WITH_PARENTS,
    Permission.EXPORT_STUDENT_DATA,
    Permission.VIEW_CLASSROOM_ANALYTICS,
  ],
  'school-admin': [
    Permission.MANAGE_SCHOOL_USERS,
    Permission.VIEW_SCHOOL_ANALYTICS,
    Permission.MANAGE_TEACHER_ACCOUNTS,
    Permission.VIEW_IEP_COMPLIANCE,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.VIEW_CLASSROOM_ANALYTICS,
  ],
  'district-admin': [
    Permission.MANAGE_DISTRICT_USERS,
    Permission.VIEW_DISTRICT_ANALYTICS,
    Permission.MANAGE_SCHOOLS,
    Permission.MANAGE_LICENSES,
    Permission.VIEW_DISTRICT_REPORTS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.VIEW_IEP_COMPLIANCE,
  ],
  'super-admin': Object.values(Permission),
};
