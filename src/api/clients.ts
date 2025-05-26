import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { Client, User } from '../types/models';

// Интерфейс для ответа API с пагинацией
interface ClientsResponse {
  data: Client[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

// Параметры запроса клиентов
interface ClientsQueryParams {
  query?: string;
  page?: number;
  per_page?: number;
}

// Данные формы клиента
export interface ClientFormData {
  preferred_notification_method?: string;
  marketing_consent?: boolean;
  user: {
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
  };
}

// Данные для обновления клиента
export interface ClientUpdateData {
  preferred_notification_method?: string;
  marketing_consent?: boolean;
  user?: {
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
  };
}

// Данные для регистрации клиента
export interface ClientRegistrationData {
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
}

// Данные для социальной аутентификации
export interface SocialAuthData {
  provider: string;
  token: string;
  provider_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
  baseQuery,
  tagTypes: ['Clients'],
  endpoints: (builder) => ({
    getClients: builder.query<ClientsResponse, ClientsQueryParams | void>({
      query: (params) => {
        const queryParams = params || {};
        return {
          url: 'clients',
          params: {
            query: queryParams.query,
            page: queryParams.page || 1,
            per_page: queryParams.per_page || 25,
          },
        };
      },
      providesTags: ['Clients'],
    }),
    getClient: builder.query<Client, number>({
      query: (id) => `clients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Clients', id }],
    }),
    createClient: builder.mutation<Client, ClientFormData>({
      query: (data) => ({
        url: 'clients',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    updateClient: builder.mutation<Client, { id: number; data: ClientUpdateData }>({
      query: ({ id, data }) => ({
        url: `clients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Clients', id }],
    }),
    deleteClient: builder.mutation<void, number>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),
    registerClient: builder.mutation<{ auth_token: string; message: string }, { client: ClientRegistrationData }>({
      query: (data) => ({
        url: 'clients/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    socialAuth: builder.mutation<{ token: string; user: User }, SocialAuthData>({
      query: (data) => ({
        url: 'clients/social_auth',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clients'],
    }),
    createTestClient: builder.mutation<Client, void>({
      query: () => ({
        url: 'clients/create_test',
        method: 'POST',
      }),
      invalidatesTags: ['Clients'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useRegisterClientMutation,
  useSocialAuthMutation,
  useCreateTestClientMutation,
} = clientsApi; 