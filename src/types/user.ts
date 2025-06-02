export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PARTNER = 'partner',
  OPERATOR = 'operator',
  CLIENT = 'client',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
  role_id: number;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role_id: number;
  is_active: boolean;
  password?: string;
  password_confirmation?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}