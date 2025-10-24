/**
 * Authentication API Client
 * 
 * Handles all authentication-related API calls
 * 
 * Updated: 2025-10-23 05:53:28 UTC
 * By: aivo-ai
 */

// Get API URL from environment or default to localhost
const getApiBaseUrl = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = import.meta as any;
  return meta?.env?.VITE_API_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

interface RegisterParentRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

interface RegisterTeacherRequest {
  email: string;
  password: string;
  full_name: string;
  school_name: string;
  district_name?: string;
  license_id: string;
  phone?: string;
}

interface AddChildRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level: number;
  current_reading_level?: string;
  current_math_level?: string;
  diagnoses?: string[];
  accommodations?: Record<string, unknown>;
  has_iep?: boolean;
  location_data: {
    postal_code: string;
    school_name?: string;
    city: string;
    state: string;
    country_code: string;
  };
}

interface AssignLicenseRequest {
  student_first_name: string;
  student_last_name: string;
  student_email?: string;
  grade_level: number;
  diagnoses?: string[];
  accommodations?: Record<string, unknown>;
  has_iep?: boolean;
}

class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Register a new parent account
   */
  async registerParent(data: RegisterParentRequest) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register/parent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Register a new teacher account with license verification
   */
  async registerTeacher(data: RegisterTeacherRequest) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  /**
   * Logout and revoke tokens
   */
  async logout() {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Logout failed');
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Token refresh failed');
    }

    const data = await response.json();
    
    // Update tokens
    localStorage.setItem('access_token', data.access_token);
    
    return data;
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get user info');
    }

    return response.json();
  }

  /**
   * Parent adds a child to their account
   */
  async addChild(data: AddChildRequest) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/add-child`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add child');
    }

    return response.json();
  }

  /**
   * Teacher assigns license to a student
   */
  async assignLicense(data: AssignLicenseRequest) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/assign-license`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to assign license');
    }

    return response.json();
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/verify-email/${token}`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Email verification failed');
    }

    return response.json();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password reset request failed');
    }

    return response.json();
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Password reset failed');
    }

    return response.json();
  }
}

// Export singleton instance
export const authApi = new AuthApiClient();

// Export types
export type {
  RegisterParentRequest,
  RegisterTeacherRequest,
  AddChildRequest,
  AssignLicenseRequest
};
