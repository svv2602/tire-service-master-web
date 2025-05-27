import { baseApi } from './baseApi';

// Типы
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
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
    }),

    // Получение текущего пользователя
    getCurrentUser: builder.query<LoginResponse['user'], void>({
      query: () => ({
        url: 'auth/me',
        method: 'GET',
      }),
    }),

    // Выход из системы
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

// Экспортируем хуки
export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi; 