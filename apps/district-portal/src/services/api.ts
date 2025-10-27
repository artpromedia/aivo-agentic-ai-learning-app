/**
 * API Service for District Portal
 * Handles all API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9000';

/**
 * Make an authenticated API request
 */
async function fetchAPI(endpoint: string, options: globalThis.RequestInit = {}) {
  // Get token from localStorage (assuming auth system stores it there)
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * User Management API
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super-admin' | 'district-admin' | 'school-admin' | 'teacher' | 'parent' | 'support-staff';
  is_active: boolean;
  is_verified: boolean;
  onboarding_status: string;
  school_name?: string;
  district_name?: string;
  avatar?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role: User['role'];
  school_name?: string;
  district_name?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: User['role'];
  is_active?: boolean;
  is_verified?: boolean;
  school_name?: string;
  district_name?: string;
}

export interface UserStatsResponse {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  users_by_role: Record<string, number>;
}

export const userAPI = {
  /**
   * Get list of users with optional filters
   */
  async list(params?: {
    role?: User['role'];
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const query = queryParams.toString();
    return fetchAPI(`/api/v1/admin/users${query ? `?${query}` : ''}`);
  },

  /**
   * Get user by ID
   */
  async get(userId: string): Promise<User> {
    return fetchAPI(`/api/v1/admin/users/${userId}`);
  },

  /**
   * Create a new user
   */
  async create(userData: CreateUserRequest): Promise<User> {
    return fetchAPI('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user details
   */
  async update(userId: string, userData: UpdateUserRequest): Promise<User> {
    return fetchAPI(`/api/v1/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user role
   */
  async updateRole(userId: string, role: User['role']): Promise<User> {
    return fetchAPI(`/api/v1/admin/users/${userId}/roles`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Activate user
   */
  async activate(userId: string): Promise<User> {
    return fetchAPI(`/api/v1/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Deactivate user
   */
  async deactivate(userId: string): Promise<User> {
    return fetchAPI(`/api/v1/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * Delete user permanently
   */
  async delete(userId: string): Promise<void> {
    return fetchAPI(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStatsResponse> {
    return fetchAPI('/api/v1/admin/users/stats/summary');
  },

  /**
   * Import users from CSV file
   */
  async importCSV(file: File): Promise<{
    total_rows: number;
    successful: number;
    failed: number;
    errors: Array<{ row: number; email: string; error: string }>;
    created_users: User[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/import-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * Update current user's own profile
   */
  async updateMyProfile(data: { email: string; full_name: string }): Promise<User> {
    return fetchAPI('/api/v1/admin/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload avatar for current user
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

/**
 * School Management API
 */
export interface School {
  id: string;
  district_id: string;
  district_name?: string;
  school_name: string;
  school_code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  principal_name?: string | null;
  principal_email?: string | null;
  admin_email?: string | null;
  seats_allocated: number;
  seats_used: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface SchoolCreateRequest {
  district_id: string;
  school_name: string;
  school_code?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  principal_name?: string;
  principal_email?: string;
  admin_email?: string;
  seats_allocated?: number;
}

export interface SchoolUpdateRequest {
  school_name?: string;
  school_code?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  principal_name?: string;
  principal_email?: string;
  admin_email?: string;
  seats_allocated?: number;
  is_active?: boolean;
}

export interface SchoolStatsResponse {
  total_schools: number;
  active_schools: number;
  inactive_schools: number;
  total_seats_allocated: number;
  total_seats_used: number;
  total_seats_available: number;
}

export const schoolAPI = {
  /**
   * List all schools with optional filters
   */
  async list(params?: {
    district_id?: string;
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<School[]> {
    const queryParams = new URLSearchParams();
    if (params?.district_id) queryParams.set('district_id', params.district_id);
    if (params?.is_active !== undefined) queryParams.set('is_active', String(params.is_active));
    if (params?.search) queryParams.set('search', params.search);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));

    const query = queryParams.toString();
    return fetchAPI(`/api/v1/admin/schools${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single school by ID
   */
  async get(schoolId: string): Promise<School> {
    return fetchAPI(`/api/v1/admin/schools/${schoolId}`);
  },

  /**
   * Create a new school
   */
  async create(data: SchoolCreateRequest): Promise<School> {
    return fetchAPI('/api/v1/admin/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing school
   */
  async update(schoolId: string, data: SchoolUpdateRequest): Promise<School> {
    return fetchAPI(`/api/v1/admin/schools/${schoolId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a school
   */
  async delete(schoolId: string): Promise<void> {
    return fetchAPI(`/api/v1/admin/schools/${schoolId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Activate a school
   */
  async activate(schoolId: string): Promise<School> {
    return fetchAPI(`/api/v1/admin/schools/${schoolId}/activate`, {
      method: 'POST',
    });
  },

  /**
   * Deactivate a school
   */
  async deactivate(schoolId: string): Promise<School> {
    return fetchAPI(`/api/v1/admin/schools/${schoolId}/deactivate`, {
      method: 'POST',
    });
  },

  /**
   * Get school statistics
   */
  async getStats(districtId?: string): Promise<SchoolStatsResponse> {
    const query = districtId ? `?district_id=${districtId}` : '';
    return fetchAPI(`/api/v1/admin/schools/stats${query}`);
  },
};

/**
 * IEP Management API
 */
export type IEPGoalStatus = 'ON_TRACK' | 'NEEDS_ATTENTION' | 'EXCEEDING' | 'NOT_STARTED';

export interface IEPGoal {
  id: string;
  learner_id: string;
  goal_name: string;
  goal_description?: string;
  category?: string;
  current_level?: string;
  target_level?: string;
  start_date?: string;
  target_date?: string;
  progress_percentage: number;
  status: IEPGoalStatus;
  accommodations?: string[];
  created_at: string;
  updated_at: string;
  is_overdue?: boolean;
  learner_name?: string;
  school_name?: string;
}

export interface IEPGoalUpdateRequest {
  goal_name?: string;
  goal_description?: string;
  category?: string;
  current_level?: string;
  target_level?: string;
  start_date?: string;
  target_date?: string;
  progress_percentage?: number;
  status?: IEPGoalStatus;
  accommodations?: string[];
}

export interface IEPStatsResponse {
  total_goals: number;
  on_track: number;
  needs_attention: number;
  exceeding: number;
  not_started: number;
  overdue_count: number;
  upcoming_30_days: number;
  upcoming_60_days: number;
  upcoming_90_days: number;
  compliance_rate: number;
}

export interface ReportScheduleRequest {
  report_type: string;
  school_ids?: string[];
  date_range_start?: string;
  date_range_end?: string;
  frequency?: string;
  recipients?: string[];
}

export interface ReportScheduleResponse {
  schedule_id: string;
  report_type: string;
  scheduled_date: string;
  schools_count: number;
  status: string;
}

export const iepAPI = {
  /**
   * List IEP goals with optional filters
   */
  async list(params?: {
    school_id?: string;
    learner_id?: string;
    status?: IEPGoalStatus;
    category?: string;
    overdue?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<IEPGoal[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/iep/goals${query}`);
  },

  /**
   * Get a single IEP goal by ID
   */
  async get(goalId: string): Promise<IEPGoal> {
    return fetchAPI(`/api/v1/admin/iep/goals/${goalId}`);
  },

  /**
   * Update an IEP goal
   */
  async update(goalId: string, data: IEPGoalUpdateRequest): Promise<IEPGoal> {
    return fetchAPI(`/api/v1/admin/iep/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get IEP statistics
   */
  async getStats(schoolId?: string): Promise<IEPStatsResponse> {
    const query = schoolId ? `?school_id=${schoolId}` : '';
    return fetchAPI(`/api/v1/admin/iep/stats${query}`);
  },

  /**
   * Get overdue IEP goals
   */
  async getOverdue(params?: {
    school_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<IEPGoal[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/iep/overdue${query}`);
  },

  /**
   * Schedule a report
   */
  async scheduleReport(data: ReportScheduleRequest): Promise<ReportScheduleResponse> {
    return fetchAPI(`/api/v1/admin/iep/reports/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Professional Development / Training API
 */
export type TrainingType = 'video' | 'guide' | 'template' | 'workshop' | 'certification';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  type: TrainingType;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  rating: number; // 0-5
  thumbnail_url: string;
  content_url: string;
  is_published: boolean;
  order: number;
  completion_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingEnrollment {
  id: string;
  user_id: string;
  module_id: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  started_at?: string;
  completed_at?: string;
  rating?: number;
  module_title?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  module_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at?: string;
  is_valid: boolean;
  module_title?: string;
  user_name?: string;
  created_at: string;
}

export interface CertificationStats {
  total_teachers: number;
  certified_teachers: number;
  in_progress_teachers: number;
  not_started_teachers: number;
  certification_rate: number;
}

export interface EnrollRequest {
  user_id: string;
  module_id: string;
}

export interface ProgressUpdateRequest {
  progress: number;
  rating?: number;
}

export const trainingAPI = {
  /**
   * List all training modules with optional filters
   */
  async listModules(params?: {
    category?: string;
    type?: TrainingType;
    difficulty?: DifficultyLevel;
    limit?: number;
    offset?: number;
  }): Promise<TrainingModule[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/training/modules${query}`);
  },

  /**
   * Enroll a user in a training module
   */
  async enroll(data: EnrollRequest): Promise<TrainingEnrollment> {
    return fetchAPI('/api/v1/admin/training/enroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get training progress for users
   */
  async getProgress(params?: {
    user_id?: string;
    status?: EnrollmentStatus;
    limit?: number;
    offset?: number;
  }): Promise<TrainingEnrollment[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/training/progress${query}`);
  },

  /**
   * Update training progress
   */
  async updateProgress(enrollmentId: string, data: ProgressUpdateRequest): Promise<TrainingEnrollment> {
    return fetchAPI(`/api/v1/admin/training/progress/${enrollmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get certifications
   */
  async getCertifications(params?: {
    user_id?: string;
    is_valid?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Certification[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/training/certifications${query}`);
  },

  /**
   * Get certification statistics
   */
  async getCertificationStats(): Promise<CertificationStats> {
    return fetchAPI('/api/v1/admin/training/certifications/stats');
  },
};

/**
 * District Reports API
 */
export type ReportType =
  | 'district-performance'
  | 'school-comparison'
  | 'iep-compliance'
  | 'student-progress'
  | 'teacher-effectiveness'
  | 'resource-utilization'
  | 'parent-engagement'
  | 'special-education';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface Report {
  id: number;
  report_type: ReportType;
  report_name: string;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  file_name?: string;
  file_size?: number;
  date_range_start?: string;
  date_range_end?: string;
  generated_by: number;
  generated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface GenerateReportRequest {
  report_type: ReportType;
  report_name: string;
  format: ReportFormat;
  date_range_start?: string;
  date_range_end?: string;
  filters?: Record<string, string | number | boolean>;
}

export interface ScheduledReport {
  id: number;
  name: string;
  description?: string;
  report_type: ReportType;
  format: ReportFormat;
  frequency: ScheduleFrequency;
  schedule_config?: Record<string, string | number>;
  date_range_type?: string;
  filters?: Record<string, string | number | boolean>;
  email_recipients?: string[];
  save_to_dashboard: boolean;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
  last_run_status?: string;
}

export interface CreateScheduledReportRequest {
  name: string;
  description?: string;
  report_type: ReportType;
  format: ReportFormat;
  frequency: ScheduleFrequency;
  schedule_config?: Record<string, string | number>;
  date_range_type?: string;
  filters?: Record<string, string | number | boolean>;
  email_recipients?: string[];
  save_to_dashboard?: boolean;
}

export interface UpdateScheduledReportRequest {
  name?: string;
  description?: string;
  format?: ReportFormat;
  frequency?: ScheduleFrequency;
  schedule_config?: Record<string, string | number>;
  date_range_type?: string;
  filters?: Record<string, string | number | boolean>;
  email_recipients?: string[];
  save_to_dashboard?: boolean;
  is_active?: boolean;
}

export const reportsAPI = {
  /**
   * Generate a new report
   */
  async generate(data: GenerateReportRequest): Promise<Report> {
    return fetchAPI('/api/v1/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List generated reports
   */
  async list(params?: {
    report_type?: ReportType;
    status?: ReportStatus;
    limit?: number;
    offset?: number;
  }): Promise<Report[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/reports/reports${query}`);
  },

  /**
   * Get report details
   */
  async get(reportId: number): Promise<Report> {
    return fetchAPI(`/api/v1/admin/reports/reports/${reportId}`);
  },

  /**
   * Download a generated report file
   */
  async download(reportId: number): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/reports/reports/${reportId}/download`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.blob();
  },

  /**
   * Create a scheduled report
   */
  async createSchedule(data: CreateScheduledReportRequest): Promise<ScheduledReport> {
    return fetchAPI('/api/v1/admin/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List scheduled reports
   */
  async listScheduled(params?: {
    is_active?: boolean;
  }): Promise<ScheduledReport[]> {
    const queryParams = new URLSearchParams();
    if (params?.is_active !== undefined) {
      queryParams.append('is_active', String(params.is_active));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/reports/scheduled${query}`);
  },

  /**
   * Update a scheduled report
   */
  async updateSchedule(scheduleId: number, data: UpdateScheduledReportRequest): Promise<ScheduledReport> {
    return fetchAPI(`/api/v1/admin/reports/scheduled/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a scheduled report
   */
  async deleteSchedule(scheduleId: number): Promise<void> {
    return fetchAPI(`/api/v1/admin/reports/scheduled/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Helper: Trigger download of a blob file
   */
  triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

/**
 * Support Desk API
 */
export type TicketCategory = 'technical' | 'training' | 'billing' | 'feature-request' | 'bug-report';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  submitted_by: number;
  submitted_by_name?: string;
  submitted_by_role?: string;
  school_name?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  message: string;
  author_id: number;
  author_name?: string;
  is_staff_reply: string;
  created_at: string;
}

export interface TicketWithReplies {
  ticket: SupportTicket;
  replies: TicketReply[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: number;
}

export interface KBArticle {
  id: number;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string;
  is_published: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface SupportStats {
  total_tickets: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent_open: number;
}

export const supportAPI = {
  /**
   * List support tickets
   */
  async list(params?: {
    category?: TicketCategory;
    status?: TicketStatus;
    priority?: TicketPriority;
    limit?: number;
    offset?: number;
  }): Promise<SupportTicket[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/support/tickets${query}`);
  },

  /**
   * Create a new support ticket
   */
  async create(data: CreateTicketRequest): Promise<SupportTicket> {
    return fetchAPI('/api/v1/admin/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get ticket details with replies
   */
  async get(ticketId: number): Promise<TicketWithReplies> {
    return fetchAPI(`/api/v1/admin/support/tickets/${ticketId}`);
  },

  /**
   * Update a support ticket
   */
  async update(ticketId: number, data: UpdateTicketRequest): Promise<SupportTicket> {
    return fetchAPI(`/api/v1/admin/support/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Add a reply to a ticket
   */
  async addReply(ticketId: number, message: string): Promise<TicketReply> {
    return fetchAPI(`/api/v1/admin/support/tickets/${ticketId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * List knowledge base articles
   */
  async listKBArticles(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<KBArticle[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/support/kb-articles${query}`);
  },

  /**
   * Get a specific KB article
   */
  async getKBArticle(articleId: number): Promise<KBArticle> {
    return fetchAPI(`/api/v1/admin/support/kb-articles/${articleId}`);
  },

  /**
   * Get support desk statistics
   */
  async getStats(): Promise<SupportStats> {
    return fetchAPI('/api/v1/admin/support/stats');
  },
};

/**
 * Settings API
 */
export interface GeneralSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
}

export interface NotificationSettings {
  email_notifications: string;
  push_notifications: string;
  new_messages: string;
  progress_reports: string;
  iep_reminders: string;
  milestone_alerts: string;
  weekly_digest: string;
  marketing_emails: string;
}

export interface PreferenceSettings {
  theme: string;
  dashboard_layout: string;
  default_view: string;
}

export interface UserSession {
  id: number;
  device_name?: string;
  browser?: string;
  ip_address?: string;
  location?: string;
  is_current: string;
  last_activity: string;
  created_at: string;
}

export const settingsAPI = {
  /**
   * Get general settings
   */
  async getGeneral(): Promise<GeneralSettings> {
    return fetchAPI('/api/v1/admin/settings/general');
  },

  /**
   * Update general settings
   */
  async updateGeneral(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
    return fetchAPI('/api/v1/admin/settings/general', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get notification settings
   */
  async getNotifications(): Promise<NotificationSettings> {
    return fetchAPI('/api/v1/admin/settings/notifications');
  },

  /**
   * Update notification settings
   */
  async updateNotifications(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return fetchAPI('/api/v1/admin/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get preference settings
   */
  async getPreferences(): Promise<PreferenceSettings> {
    return fetchAPI('/api/v1/admin/settings/preferences');
  },

  /**
   * Update preference settings
   */
  async updatePreferences(data: Partial<PreferenceSettings>): Promise<PreferenceSettings> {
    return fetchAPI('/api/v1/admin/settings/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get active sessions
   */
  async getSessions(): Promise<UserSession[]> {
    return fetchAPI('/api/v1/admin/settings/sessions');
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await fetchAPI(`/api/v1/admin/settings/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Integrations API
 */
export interface Integration {
  id: number;
  name: string;
  provider: string;
  integration_type: string;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  sync_frequency: string;
  last_sync?: string;
  next_scheduled_sync?: string;
  records_synced: number;
  data_mapping?: Record<string, string>;
  error_message?: string;
  error_count: number;
  webhook_enabled: string;
  created_at: string;
  updated_at: string;
  connected_at?: string;
}

export interface IntegrationSyncLog {
  id: number;
  integration_id: number;
  sync_type: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
}

export interface CreateIntegrationRequest {
  name: string;
  provider: string;
  integration_type: string;
  base_url?: string;
  api_key?: string;
  api_secret?: string;
  sync_frequency?: string;
  data_mapping?: Record<string, string>;
  webhook_enabled?: string;
}

export interface UpdateIntegrationRequest {
  name?: string;
  status?: string;
  base_url?: string;
  api_key?: string;
  api_secret?: string;
  sync_frequency?: string;
  data_mapping?: Record<string, string>;
  webhook_enabled?: string;
}

export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  syncing: number;
  total_records_synced: number;
}

export interface TestConnectionRequest {
  provider: string;
  base_url?: string;
  api_key?: string;
  api_secret?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: Record<string, string | number | boolean>;
}

export const integrationsAPI = {
  /**
   * List all integrations
   */
  async list(params?: {
    status?: string;
    provider?: string;
  }): Promise<Integration[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`/api/v1/admin/integrations/list${query}`);
  },

  /**
   * Create a new integration
   */
  async create(data: CreateIntegrationRequest): Promise<Integration> {
    return fetchAPI('/api/v1/admin/integrations/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get integration details
   */
  async get(integrationId: number): Promise<Integration> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}`);
  },

  /**
   * Update an integration
   */
  async update(integrationId: number, data: UpdateIntegrationRequest): Promise<Integration> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an integration
   */
  async delete(integrationId: number): Promise<void> {
    await fetchAPI(`/api/v1/admin/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Connect an integration
   */
  async connect(integrationId: number): Promise<Integration> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}/connect`, {
      method: 'POST',
    });
  },

  /**
   * Disconnect an integration
   */
  async disconnect(integrationId: number): Promise<Integration> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}/disconnect`, {
      method: 'POST',
    });
  },

  /**
   * Trigger manual sync
   */
  async sync(integrationId: number): Promise<IntegrationSyncLog> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ sync_type: 'manual' }),
    });
  },

  /**
   * Get sync logs for an integration
   */
  async getLogs(integrationId: number, limit: number = 50): Promise<IntegrationSyncLog[]> {
    return fetchAPI(`/api/v1/admin/integrations/${integrationId}/logs?limit=${limit}`);
  },

  /**
   * Get integration statistics
   */
  async getStats(): Promise<IntegrationStats> {
    return fetchAPI('/api/v1/admin/integrations/stats');
  },

  /**
   * Test connection to a provider
   */
  async testConnection(data: TestConnectionRequest): Promise<TestConnectionResponse> {
    return fetchAPI('/api/v1/admin/integrations/test-connection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
