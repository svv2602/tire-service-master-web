import apiClient from './api';

// Типы пользователей
export interface User {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  role_id: number;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
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
    return apiClient.post('/auth/login', credentials);
  },

  // Выход из системы
  logout: () => {
    console.log('usersApi.logout called');
    // Just return a resolved promise since we're handling token removal elsewhere
    return Promise.resolve({ data: { success: true } });
  },

  // Регистрация клиента
  registerClient: (userData: Partial<User>, clientData?: any) => {
    return apiClient.post('/clients/register', { user: userData, client: clientData });
  },

  // Запрос на сброс пароля
  requestPasswordReset: (email: string) => {
    return apiClient.post('/password_resets', { email });
  },

  // Сброс пароля
  resetPassword: (resetData: PasswordReset) => {
    return apiClient.put('/password_resets', resetData);
  },

  // Получение профиля текущего пользователя
  getCurrentUser: () => {
    console.log('usersApi.getCurrentUser called');
    return apiClient.get('/users/me');
  },

  // Обновление профиля текущего пользователя
  updateCurrentUser: (userData: Partial<User>) => {
    return apiClient.put('/users/me', userData);
  },

  // Изменение пароля текущего пользователя
  changePassword: (currentPassword: string, newPassword: string) => {
    return apiClient.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword
    });
  },

  // Получение всех пользователей (только для администраторов)
  getAll: (params?: any) => {
    return apiClient.get('/users', { params });
  },

  // Получение пользователя по ID
  getById: (id: number) => {
    return apiClient.get(`/users/${id}`);
  },

  // Создание нового пользователя (только для администраторов)
  create: (userData: Partial<User>) => {
    return apiClient.post('/users', userData);
  },

  // Обновление пользователя (только для администраторов)
  update: (id: number, userData: Partial<User>) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  // Блокировка/разблокировка пользователя (только для администраторов)
  toggleActive: (id: number, isActive: boolean) => {
    return apiClient.put(`/users/${id}/toggle_active`, { is_active: isActive });
  },

  // Удаление пользователя (только для администраторов)
  delete: (id: number) => {
    return apiClient.delete(`/users/${id}`);
  },
};

export default usersApi; 