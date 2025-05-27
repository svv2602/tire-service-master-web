export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  CLIENT = 'client',
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  client_id?: number;
  partner_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
} 