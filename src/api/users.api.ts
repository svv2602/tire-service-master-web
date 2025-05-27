import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { User } from '../types/models';

export interface UsersResponse {
  users: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface UsersQueryParams {
  page?: string;
  per_page?: string;
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

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params) => ({
        url: 'users',
        method: 'GET',
        params,
      }),
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
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ data: User }, { id: string; data: Omit<User, 'id' | 'created_at' | 'updated_at'> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
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