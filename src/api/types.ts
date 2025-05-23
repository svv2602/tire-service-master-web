// Типы для пользователей
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типы для авторизации
export interface UserCredentials {
  email: string;
  password: string;
}

// Типы для регистрации
export interface UserRegistration extends UserCredentials {
  first_name: string;
  last_name: string;
  phone?: string;
}

// Типы для сброса пароля
export interface PasswordReset {
  email: string;
  reset_token?: string;
  new_password?: string;
}

export type { AxiosResponse } from 'axios';
