/**
 * API Service for Teacher Portal
 * Handles all backend API communications
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api/v1';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.data || data;
}

// ============================================================================
// IEP APIs
// ============================================================================

export interface IEPCreateData {
  learner_id: string;
  case_manager: string;
  date_created: string;
  next_review: string;
  effective_date?: string;
  parent_contact?: string;
  parent_phone?: string;
  parent_email?: string;
  services?: ServiceInfo[];
  notes?: string;
}

export interface ServiceInfo {
  service: string;
  frequency: string;
  provider: string;
  duration?: string;
}

export interface IEPResponse {
  id: string;
  learner_id: string;
  teacher_id: string;
  status: 'active' | 'draft' | 'review-due' | 'archived';
  case_manager: string;
  date_created: string;
  last_modified: string;
  next_review: string;
  effective_date?: string;
  parent_contact?: string;
  parent_phone?: string;
  parent_email?: string;
  services?: ServiceInfo[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IEPWithGoalsResponse extends IEPResponse {
  goals: IEPGoalResponse[];
}

export interface IEPGoalResponse {
  id: string;
  learner_id: string;
  goal_name: string;
  goal_description?: string;
  category: string;
  current_level: string;
  target_level: string;
  start_date: string;
  target_date: string;
  progress_percentage: number;
  status: string;
  accommodations?: string[];
  created_at: string;
  updated_at: string;
}

export interface GoalCreateData {
  learner_id: string;
  goal_name: string;
  goal_description?: string;
  category: 'reading' | 'math' | 'social' | 'motor' | 'communication';
  current_level: string;
  target_level: string;
  start_date: string;
  target_date: string;
  accommodations?: string[];
}

/**
 * Create a new IEP document
 */
export async function createIEP(data: IEPCreateData): Promise<IEPResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<IEPResponse>(response);
}

/**
 * Get all IEPs for the current teacher
 */
export async function getIEPs(statusFilter?: string): Promise<IEPResponse[]> {
  const token = getAuthToken();
  const url = statusFilter
    ? `${API_BASE_URL}/iep?status_filter=${statusFilter}`
    : `${API_BASE_URL}/iep`;
  
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse<IEPResponse[]>(response);
}

/**
 * Get a specific IEP by ID
 */
export async function getIEPById(
  iepId: string,
  includeGoals: boolean = false
): Promise<IEPResponse | IEPWithGoalsResponse> {
  const token = getAuthToken();
  const url = includeGoals
    ? `${API_BASE_URL}/iep/${iepId}?include_goals=true`
    : `${API_BASE_URL}/iep/${iepId}`;
  
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse<IEPResponse | IEPWithGoalsResponse>(response);
}

/**
 * Update an existing IEP
 */
export async function updateIEP(
  iepId: string,
  data: Partial<IEPCreateData>
): Promise<IEPResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep/${iepId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<IEPResponse>(response);
}

/**
 * Delete an IEP
 */
export async function deleteIEP(iepId: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep/${iepId}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to delete IEP',
    }));
    throw new Error(error.message);
  }
}

/**
 * Create a new IEP goal
 */
export async function createIEPGoal(data: GoalCreateData): Promise<IEPGoalResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<IEPGoalResponse>(response);
}

/**
 * Get all goals for a specific learner
 */
export async function getIEPGoalsByLearner(
  learnerId: string,
  category?: string
): Promise<IEPGoalResponse[]> {
  const token = getAuthToken();
  const url = category
    ? `${API_BASE_URL}/iep/learners/${learnerId}/goals?category=${category}`
    : `${API_BASE_URL}/iep/learners/${learnerId}/goals`;
  
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse<IEPGoalResponse[]>(response);
}

/**
 * Update an existing IEP goal
 */
export async function updateIEPGoal(
  goalId: string,
  data: Partial<GoalCreateData>
): Promise<IEPGoalResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep/goals/${goalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<IEPGoalResponse>(response);
}

/**
 * Add a data point to track goal progress
 */
export async function addGoalDataPoint(
  goalId: string,
  value: number,
  notes?: string
): Promise<any> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/iep/goals/${goalId}/data-points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      goal_id: goalId,
      value,
      notes,
      recorded_by: 'teacher', // This should come from user context
    }),
  });
  return handleResponse<any>(response);
}

// ============================================================================
// Student/Learner APIs (to be implemented)
// ============================================================================

export async function getStudents(): Promise<any[]> {
  // TODO: Implement when backend endpoint is ready
  return [];
}

export async function getStudentById(studentId: string): Promise<any> {
  // TODO: Implement when backend endpoint is ready
  return null;
}
