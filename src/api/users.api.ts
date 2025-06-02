import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { User, UserFormData } from '../types/user';
import { getRoleFromId, getRoleId } from '../utils/roles.utils';

export interface ApiUser {
  id: number;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role_id: number;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Интерфейс для ответа API (как приходит с бэкенда)
export interface ApiUsersResponse {
  data: Array<ApiUser>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// Интерфейс для фронтенда (как используем во фронтенде)
export interface UsersResponse {
  data: Array<User>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  totalItems: number;
}

export interface UsersQueryParams {
  page?: number;
  per_page?: number;
  query?: string;
  role?: string;
  active?: boolean;
}

// Функция перенесена в utils/roles.utils.ts

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params = {}) => ({
        url: 'users',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 25,
          ...(params.query && { query: params.query }),
          ...(params.role && { role: params.role }),
          ...(params.active !== undefined && { active: params.active })
        },
      }),
      transformResponse: (response: ApiUsersResponse): UsersResponse => ({
        data: response.data.map(user => ({
          id: user.id.toString(),
          email: user.email,
          phone: user.phone || '',
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name || '',
          role: getRoleFromId(user.role_id),
          role_id: user.role_id,
          is_active: user.is_active,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
        })),
        pagination: response.pagination,
        totalItems: response.pagination.total_count,
      }),
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Ошибка получения пользователей:', response);
        return {
          status: response.status,
          data: response.data?.message || response.data?.error || 'Произошла ошибка при получении пользователей'
        };
      },
      providesTags: ['User'],
    }),
    getUserById: builder.query<{ data: User }, string>({
      query: (id) => `users/${id}`,
      transformResponse: (response: { data: ApiUser }): { data: User } => ({
        data: {
          id: response.data.id.toString(),
          email: response.data.email,
          phone: response.data.phone || '',
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          middle_name: response.data.middle_name || '',
          role: getRoleFromId(response.data.role_id),
          role_id: response.data.role_id,
          is_active: response.data.is_active,
          email_verified: response.data.email_verified,
          phone_verified: response.data.phone_verified,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        }
      }),
      providesTags: ['User'],
    }),
    createUser: builder.mutation<{ data: User }, UserFormData>({
      query: (data) => ({
        url: 'users',
        method: 'POST',
        body: { user: data },
      }),
      transformResponse: (response: { data: ApiUser }): { data: User } => ({
        data: {
          id: response.data.id.toString(),
          email: response.data.email,
          phone: response.data.phone || '',
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          middle_name: response.data.middle_name || '',
          role: getRoleFromId(response.data.role_id),
          role_id: response.data.role_id,
          is_active: response.data.is_active,
          email_verified: response.data.email_verified,
          phone_verified: response.data.phone_verified,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        }
      }),
      transformErrorResponse: (response: { status: number, data: any }) => {
        return {
          status: response.status,
          data: response.data?.errors || 'Произошла ошибка при создании пользователя'
        };
      },
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ data: User }, { id: string; data: UserFormData }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: { user: data },
      }),
      transformResponse: (response: { data: ApiUser }): { data: User } => ({
        data: {
          id: response.data.id.toString(),
          email: response.data.email,
          phone: response.data.phone || '',
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          middle_name: response.data.middle_name || '',
          role: getRoleFromId(response.data.role_id),
          role_id: response.data.role_id,
          is_active: response.data.is_active,
          email_verified: response.data.email_verified,
          phone_verified: response.data.phone_verified,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        }
      }),
      transformErrorResponse: (response: { status: number, data: any }) => {
        return {
          status: response.status,
          data: response.data?.errors || 'Произошла ошибка при обновлении пользователя'
        };
      },
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Ошибка удаления пользователя:', response);
        return {
          status: response.status,
          data: response.data?.message || response.data?.error || 'Произошла ошибка при удалении пользователя'
        };
      },
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