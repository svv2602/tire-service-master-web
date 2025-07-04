import { baseApi } from './baseApi';

interface RegisterRequest {
  user: {
    first_name: string;
    last_name: string;
    email?: string; // Email теперь опциональный для регистрации клиентов
    phone: string;
    password: string;
    password_confirmation: string;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  client: {
    id: number;
    preferred_notification_method: string;
  };
  tokens: {
    access: string;
  };
}

interface LoginRequest {
  login: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  client: {
    id: number;
    preferred_notification_method: string;
  };
  tokens: {
    access: string;
  };
}

interface ClientMeResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    email_verified: boolean;
    phone_verified: boolean;
    role: string;
    is_active: boolean;
  };
  client: {
    id: number;
    preferred_notification_method: string;
    total_bookings: number;
    completed_bookings: number;
    average_rating_given: number;
  };
}

export const clientAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerClient: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: 'clients/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginClient: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'clients/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getClientMe: builder.query<ClientMeResponse, void>({
      query: () => ({
        url: 'clients/me',
        method: 'GET',
        credentials: 'include',
      }),
      transformResponse: (response: ClientMeResponse) => {
        console.log('🔄 Трансформация ответа getClientMe:', response);
        return response;
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('❌ Ошибка getClientMe:', response);
        return {
          status: response.status,
          data: response.data?.error || 'Ошибка получения данных клиента'
        };
      },
      providesTags: ['User'],
    }),
  }),
});

export const { useRegisterClientMutation, useLoginClientMutation, useGetClientMeQuery } = clientAuthApi;
