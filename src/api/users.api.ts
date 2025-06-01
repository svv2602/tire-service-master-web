import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { User } from '../types/models';

// Интерфейс для ответа API (как приходит с бэкенда)
export interface ApiUsersResponse {
  data: Array<{
    id: number;
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    role_id: number;
    is_active: boolean;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// Интерфейс для фронтенда (преобразованный)
export interface UsersResponse {
  users: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface UsersQueryParams {
  page?: number;
  per_page?: number;
  query?: string;
  role?: string;
  active?: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  position?: string;
  preferred_notification_method?: string;
  marketing_consent?: boolean;
  access_level?: number;
  partner_id?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface PasswordReset {
  email: string;
}

// Функция для преобразования role_id в строку роли
const getRoleFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'admin';
    case 2: return 'manager';
    case 3: return 'partner';
    case 4: return 'operator';
    case 5: return 'client';
    default: return 'client';
  }
};

// Функция для преобразования строки роли в role_id
export const getRoleId = (role: string): number => {
  switch (role) {
    case 'admin': return 1;
    case 'manager': return 2;
    case 'partner': return 3;
    case 'operator': return 4;
    case 'client': return 5;
    default: return 5; // По умолчанию - клиент
  }
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params) => ({
        url: 'users',
        method: 'GET',
        params: {
          ...params,
          page: params.page,
          per_page: params.per_page
        },
      }),
      transformResponse: (response: ApiUsersResponse): UsersResponse => {
        return {
          users: response.data.map(user => ({
            id: user.id,
            email: user.email,
            phone: user.phone || '',
            first_name: user.first_name,
            last_name: user.last_name,
            role: getRoleFromId(user.role_id),
            is_active: user.is_active,
            email_verified: user.email_verified,
            phone_verified: user.phone_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
          })),
          totalItems: response.pagination.total_count,
          currentPage: Number(response.pagination.current_page),
          totalPages: Number(response.pagination.total_pages),
          itemsPerPage: Number(response.pagination.per_page),
        };
      },
      providesTags: ['User'],
    }),
    getUserById: builder.query<{ data: User }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<{ data: User }, Omit<User, 'id' | 'created_at' | 'updated_at'>>({
      query: (data) => ({
        url: 'users',
        method: 'POST',
        body: { user: data },
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ data: User }, { id: string; data: Omit<User, 'id' | 'created_at' | 'updated_at'> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT', // Примечание: бэкенд использует PUT метод
        body: { user: data },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi; 