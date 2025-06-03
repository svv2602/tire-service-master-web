import { baseApi } from './baseApi';
import config from '../config';

// Типы
interface LoginRequest {
  auth: {
    email: string;
    password: string;
  };
}

interface LoginResponse {
  auth_token: string;
  token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    role: string;
    last_login?: string;
    is_active: boolean;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
    updated_at: string;
    profile?: {
      position?: string;
      access_level: number;
    };
  };
  message: string;
}

interface CurrentUserResponse {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    position?: string;
    access_level: number;
  };
}

// Расширяем базовый API для работы с авторизацией
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Вход в систему
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Сохраняем токены после успешного входа
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          
          // Сохраняем токены в localStorage
          localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, data.auth_token || data.token);
          localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
          
          // Сохраняем refresh token если есть
          if (data.refresh_token) {
            localStorage.setItem('tvoya_shina_refresh_token', data.refresh_token);
          }
          
          console.log('✅ Данные аутентификации сохранены в localStorage');
          
        } catch (error) {
          console.error('❌ Ошибка при сохранении данных аутентификации:', error);
        }
      },
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: 'users/me',
        method: 'GET',
      }),
    }),

    // Обновление токена
    refreshToken: builder.mutation<LoginResponse, { refresh_token: string }>({
      query: (body) => ({
        url: 'auth/refresh',
        method: 'POST',
        body,
      }),
      // Сохраняем новые токены после обновления
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          
          // Сохраняем новые токены
          localStorage.setItem(config.AUTH_TOKEN_STORAGE_KEY, data.auth_token || data.token);
          
          if (data.refresh_token) {
            localStorage.setItem('tvoya_shina_refresh_token', data.refresh_token);
          }
          
          console.log('✅ Токен успешно обновлен');
          
        } catch (error) {
          console.error('❌ Ошибка при обновлении токена:', error);
        }
      },
    }),

    // Выход из системы
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      // Очищаем данные при выходе
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          
          // Очищаем localStorage
          localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
          localStorage.removeItem('tvoya_shina_refresh_token');
          localStorage.removeItem('tvoya_shina_user');
          
          console.log('✅ Данные аутентификации очищены');
          
        } catch (error) {
          console.error('❌ Ошибка при выходе:', error);
          // Все равно очищаем данные даже при ошибке
          localStorage.removeItem(config.AUTH_TOKEN_STORAGE_KEY);
          localStorage.removeItem('tvoya_shina_refresh_token');
          localStorage.removeItem('tvoya_shina_user');
        }
      },
    }),
  }),
});

// Экспортируем хуки
export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi; 