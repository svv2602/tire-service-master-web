import { UserRole } from './index';

export interface User {
  id: number;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: UserRole;
  role_id: number;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  client_id?: number;
  
  // Связанные сущности для ролей
  partner?: {
    id: number;
    name: string;
  };
  operator?: {
    id: number;
    access_level: number;
    service_point_ids?: number[];
  };
  client?: {
    id: number;
    preferred_notification_method?: string;
  };
}

export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
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