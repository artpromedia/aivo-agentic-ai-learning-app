import { UserRole } from '@aivo/types';
import { Permission } from './permissions';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  organizationId?: string;
  schoolId?: string;
  districtId?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  clearError: () => void;
}
