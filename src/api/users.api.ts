import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { User } from '../types/user';
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

export interface UserFormData {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role_id: number;
  is_active: boolean;
  password?: string;
  password_confirmation?: string;
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

// Функция перенесена в utils/roles.utils.ts

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
            middle_name: user.middle_name,
            role: getRoleFromId(user.role_id),
            role_id: user.role_id,
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
      transformResponse: (response: { data: ApiUser }): { data: User } => ({
        data: {
          ...response.data,
          phone: response.data.phone || '',
          role: getRoleFromId(response.data.role_id),
          role_id: response.data.role_id,
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