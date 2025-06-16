import { baseApi } from './baseApi';
import config from '../config';

// Типы
interface LoginRequest {
  auth: {
    login: string;
    password: string;
  };
}

interface LoginResponse {
  message: string;
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
    email_verified?: boolean;
    phone_verified?: boolean;
    created_at?: string;
    updated_at?: string;
    profile?: {
      position?: string;
      access_level: number;
    };
  };
  tokens: {
    access: string;
    // refresh токен теперь приходит только в куки
  };
  admin_info?: {
    role_permissions: string[];
    last_login: string;
  };
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
        credentials: 'include', // Важно для получения куки
      }),
      // Сохраняем только пользователя после успешного входа
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          
          // Сохраняем только данные пользователя
          localStorage.setItem('tvoya_shina_user', JSON.stringify(data.user));
          
          console.log('✅ Данные пользователя сохранены в localStorage');
          
        } catch (error) {
          console.error('❌ Ошибка при сохранении данных пользователя:', error);
        }
      },
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: 'users/me',
        method: 'GET',
        credentials: 'include', // Важно для отправки куки
      }),
    }),

    // Обновление токена
    refreshToken: builder.mutation<{ access_token: string }, void>({
      query: () => ({
        url: 'auth/refresh',
        method: 'POST',
        credentials: 'include', // Важно для отправки и получения куки
      }),
    }),

    // Выход из системы
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
        credentials: 'include', // Важно для отправки куки
      }),
      // Очищаем данные при выходе
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          
          // Очищаем только данные пользователя
          localStorage.removeItem('tvoya_shina_user');
          
          console.log('✅ Данные пользователя очищены');
          
        } catch (error) {
          console.error('❌ Ошибка при выходе:', error);
          // Все равно очищаем данные пользователя даже при ошибке
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