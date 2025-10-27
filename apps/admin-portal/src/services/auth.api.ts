/**
 * Real API Authentication Service for Admin Portal
 * This bypasses the mock authentication in @aivo/auth and calls the real backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  role: string;
  redirect_url: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Login with real backend API
 */
export async function loginWithAPI(credentials: LoginCredentials): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  // Use FormData for multipart/form-data format (FastAPI Form expects this)
  const formData = new FormData();
  formData.append('email', credentials.email);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header - browser will set it automatically with boundary
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    // Handle FastAPI validation errors which come as an array
    if (Array.isArray(error.detail)) {
      const errorMessages = error.detail.map((err: { loc?: string[]; msg: string }) => `${err.loc?.join('.')} - ${err.msg}`).join(', ');
      throw new Error(errorMessages || 'Validation error');
    }
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const data: LoginResponse = await response.json();

  // Fetch user details with the access token
  const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user details');
  }

  const userData = await userResponse.json();

  return {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      role: userData.role,
    },
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/**
 * Get current user from API
 */
export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  const userData = await response.json();

  return {
    id: userData.id,
    email: userData.email,
    name: userData.full_name,
    role: userData.role,
  };
}
