import { baseApi } from './baseApi';

interface RegisterRequest {
  user: {
    first_name: string;
    last_name: string;
    email: string;
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

export const clientAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerClient: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: 'clients/register',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useRegisterClientMutation } = clientAuthApi;
