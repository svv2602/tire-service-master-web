import { baseApi } from './baseApi';

// Типы для восстановления пароля
interface ForgotPasswordRequest {
  login: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  expires_at?: string;
  error?: string;
  user?: {
    email?: string;
    phone?: string;
  };
}

// Расширяем базовый API для работы с восстановлением пароля
export const passwordApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Запрос восстановления пароля
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: 'password/forgot',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ForgotPasswordResponse) => {
        console.log('🔄 Запрос восстановления пароля отправлен:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка запроса восстановления:', response);
        return {
          status: response.status,
          data: response.data?.error || 'Ошибка отправки запроса восстановления'
        };
      },
    }),

    // Сброс пароля по токену
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: 'password/reset',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ResetPasswordResponse) => {
        console.log('🔄 Пароль успешно изменён:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка сброса пароля:', response);
        return {
          status: response.status,
          data: response.data?.error || response.data?.details || 'Ошибка сброса пароля'
        };
      },
    }),

    // Проверка действительности токена
    verifyResetToken: builder.query<VerifyTokenResponse, string>({
      query: (token) => ({
        url: `password/verify_token/${token}`,
        method: 'GET',
      }),
      transformResponse: (response: VerifyTokenResponse) => {
        console.log('🔄 Проверка токена:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка проверки токена:', response);
        return {
          status: response.status,
          data: response.data?.error || 'Ошибка проверки токена'
        };
      },
    }),
  }),
});

// Экспортируем хуки
export const {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetTokenQuery,
} = passwordApi; 