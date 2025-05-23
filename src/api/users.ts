import apiClient from './api';

// Типы пользователей
// API response type - with optional fields
export interface ApiUser {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  role?: string;
  role_id?: number;
  last_login?: string;
  is_active?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// State type - with required fields
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  middle_name?: string;
  role_id?: number;
  last_login?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsersResponse {
  data: ApiUser[];
  pagination?: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
  users?: ApiUser[]; // For backwards compatibility
  total_items?: number; // For backwards compatibility
}

export interface UserProfile {
  id: number;
  user_id: number;
  position?: string;
  preferred_notification_method?: string;
  marketing_consent?: boolean;
  access_level?: number;
  partner_id?: number;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface PasswordReset {
  email: string;
  token: string;
  new_password: string;
  new_password_confirmation: string;
}

// API для работы с пользователями
export const usersApi = {
  // Аутентификация пользователя
  login: (credentials: UserCredentials) => {
    console.log('usersApi.login called with:', { email: credentials.email, password: '***' });
    return apiClient.post('/api/v1/auth/login', credentials);
  },

  // Выход из системы
  logout: () => {
    console.log('usersApi.logout called');
    // Just return a resolved promise since we're handling token removal elsewhere
    return Promise.resolve({ data: { success: true } });
  },

  // Регистрация клиента
  registerClient: (userData: Partial<User>, clientData?: any) => {
    return apiClient.post('/api/v1/clients/register', { user: userData, client: clientData });
  },

  // Запрос на сброс пароля
  requestPasswordReset: (email: string) => {
    return apiClient.post('/api/v1/password_resets', { email });
  },

  // Сброс пароля
  resetPassword: (resetData: PasswordReset) => {
    return apiClient.put('/api/v1/password_resets', resetData);
  },

  // Получение профиля текущего пользователя
  getCurrentUser: () => {
    console.log('usersApi.getCurrentUser called');
    return apiClient.get('/api/v1/users/me');
  },

  // Обновление профиля текущего пользователя
  updateCurrentUser: (userData: Partial<User>) => {
    return apiClient.put('/api/v1/users/me', userData);
  },

  // Изменение пароля текущего пользователя
  changePassword: (currentPassword: string, newPassword: string) => {
    return apiClient.put('/api/v1/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword
    });
  },

  // Получение всех пользователей (только для администраторов)
  getAll: (params?: any) => {
    return apiClient.get<UsersResponse>('/api/v1/users', { params });
  },

  // Получение пользователя по ID
  getById: (id: number) => {
    return apiClient.get(`/api/v1/users/${id}`);
  },

  // Создание нового пользователя (только для администраторов)
  create: (userData: Partial<User>) => {
    return apiClient.post('/api/v1/users', userData);
  },

  // Обновление пользователя (только для администраторов)
  update: (id: number, userData: Partial<User>) => {
    return apiClient.put(`/api/v1/users/${id}`, userData);
  },

  // Блокировка/разблокировка пользователя (только для администраторов)
  toggleActive: (id: number, isActive: boolean) => {
    return apiClient.put(`/api/v1/users/${id}/toggle_active`, { is_active: isActive });
  },

  // Удаление пользователя (только для администраторов)
  delete: (id: number) => {
    return apiClient.delete(`/api/v1/users/${id}`);
  },

  changeRole: (id: number, role: string) => {
    return apiClient.put(`/api/v1/users/${id}/change_role`, { role });
  },

  changeStatus: (id: number, isActive: boolean) => {
    return apiClient.put(`/api/v1/users/${id}/change_status`, { is_active: isActive });
  },
};

export default usersApi;