import { baseApi } from './baseApi';

// Типы
interface LoginRequest {
  login: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
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
    client_id?: number; // ID клиента, если пользователь является клиентом
    profile?: {
      position?: string;
      access_level: number;
    };
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
  role_id: number;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  client_id?: number; // ID клиента, если пользователь является клиентом
  preferred_locale?: string;
  // Google OAuth поля
  google_id?: string;
  google_email?: string;
  provider?: string;
  uid?: string;
  profile?: {
    position?: string;
    access_level: number;
  };
}

interface FullUserResponse {
  user: CurrentUserResponse;
  client?: {
    id: number;
    preferred_notification_method: string;
    total_bookings: number;
    completed_bookings: number;
    average_rating_given: number;
  };
  admin_info?: {
    role_permissions: string[];
    last_login: string;
  };
}

// Расширяем базовый API для работы с авторизацией
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Вход в систему
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => {
        // 🔍 ПОДРОБНОЕ ЛОГИРОВАНИЕ ЗАПРОСА
        const requestData = { auth: credentials };
        console.log('🔐 Auth API login запрос:', {
          originalCredentials: credentials,
          requestBody: requestData,
          url: 'auth/login',
          method: 'POST',
          timestamp: new Date().toISOString()
        });
        
        return {
          url: 'auth/login',
          method: 'POST',
          body: requestData,
          credentials: 'include', // Важно для получения куки
        };
      },
      // Инвалидируем кеш пользователя после успешного входа
      invalidatesTags: ['User'],
      // Логируем только успешный вход - данные пользователя управляются Redux
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        console.log('🚀 Auth API login: запрос отправлен с данными:', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Успешный вход пользователя:', {
            userEmail: data.user.email,
            userRole: data.user.role,
            hasAccessToken: !!data.access_token,
            accessTokenPreview: data.access_token ? `${data.access_token.substring(0, 20)}...` : 'отсутствует'
          });
          // Принудительно инвалидируем кеш для получения свежих данных
          dispatch(authApi.util.invalidateTags(['User']));
        } catch (error: any) {
          console.error('❌ Ошибка при входе:', {
            status: error.error?.status,
            data: error.error?.data,
            originalError: error
          });
        }
      },
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query<FullUserResponse, void>({
      query: () => ({
        url: 'auth/me',
        method: 'GET',
        credentials: 'include', // Важно для отправки куки
      }),
      transformResponse: (response: FullUserResponse) => {
        console.log('🔄 Трансформация ответа getCurrentUser:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка getCurrentUser:', response);
        return {
          status: response.status,
          data: response.data?.error || 'Ошибка получения данных пользователя'
        };
      },
      providesTags: ['User'],
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
      invalidatesTags: ['User'], // Инвалидируем кеш пользователя
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          console.log('✅ Успешный выход');
          // Принудительно очищаем весь кеш RTK Query
          dispatch(authApi.util.resetApiState());
        } catch (error) {
          console.error('❌ Ошибка при выходе:', error);
        }
      },
    }),

    // Обновление профиля текущего пользователя
    updateProfile: builder.mutation<CurrentUserResponse, { first_name: string; last_name: string; email: string; phone: string }>({
      query: (profileData) => ({
        url: 'auth/profile',
        method: 'PUT',
        body: { user: profileData },
        credentials: 'include',
      }),
      transformResponse: (response: { user: CurrentUserResponse }) => {
        console.log('🔄 Профиль обновлен:', response);
        return response.user;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка обновления профиля:', response);
        return {
          status: response.status,
          data: response.data?.errors || response.data?.error || 'Ошибка обновления профиля'
        };
      },
      // Инвалидируем кэш getCurrentUser после успешного обновления
      invalidatesTags: ['User'],
      // Также обновляем Redux store
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Принудительно обновляем кэш getCurrentUser
          dispatch(authApi.util.invalidateTags(['User']));
        } catch (error) {
          console.error('❌ Ошибка при обновлении профиля:', error);
        }
      },
    }),

    // Смена пароля пользователя
    changePassword: builder.mutation<CurrentUserResponse, { id: number; password: string; password_confirmation: string }>({
      query: ({ id, password, password_confirmation }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: { user: { password, password_confirmation } },
        credentials: 'include',
      }),
      transformResponse: (response: { user: CurrentUserResponse }) => {
        console.log('🔄 Пароль успешно изменён:', response);
        return response.user;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка смены пароля:', response);
        return {
          status: response.status,
          data: response.data?.errors || response.data?.error || 'Ошибка смены пароля'
        };
      },
      invalidatesTags: ['User'],
    }),
  }),
});

// Экспортируем хуки
export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi; 