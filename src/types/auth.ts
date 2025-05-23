import { User } from './models';

// Интерфейс для ответа с токеном
export interface TokenResponse {
  auth_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

// Интерфейс для запроса на вход
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

// Интерфейс для запроса на регистрацию
export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Интерфейс для запроса на сброс пароля
export interface PasswordResetRequest {
  email: string;
}

// Интерфейс для подтверждения сброса пароля
export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  password_confirmation: string;
} 