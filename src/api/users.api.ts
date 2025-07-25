import { baseApi } from './baseApi';
import type { User, UserFormData } from '../types/user';
import { getRoleFromId } from '../utils/roles.utils';

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

// Типы для управления блокировкой пользователей
export interface SuspensionInfo {
  is_suspended: boolean;
  reason?: string;
  suspended_at?: string;
  suspended_until?: string;
  suspended_by?: string;
  is_permanent: boolean;
  days_remaining?: number;
}

export interface SuspendUserRequest {
  reason: string;
  until_date?: string; // ISO date string или пустая строка для постоянной блокировки
}

export interface SuspensionResponse {
  data: SuspensionInfo;
  message: string;
}

// Функция перенесена в utils/roles.utils.ts

export const usersApi = baseApi.injectEndpoints({
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
          id: user.id,
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
          id: response.data.id,
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
          id: response.data.id,
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
          id: response.data.id,
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
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        console.log('Ответ API при удалении:', response);
        return { success: true };
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Ошибка удаления пользователя:', response);
        return {
          status: response.status,
          data: response.data?.message || response.data?.error || 'Произошла ошибка при удалении пользователя'
        };
      },
      invalidatesTags: ['User'],
    }),
    // Проверка существования пользователя
    checkUserExists: builder.query<{
      exists: boolean;
      user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        role: string;
        client_id?: number;
      };
    }, { phone?: string; email?: string }>({
      query: ({ phone, email }) => ({
        url: 'users/check_exists',
        params: { phone, email },
      }),
      keepUnusedDataFor: 0, // Не кэшируем результаты проверки
    }),

    // API для блокировки пользователей
    suspendUser: builder.mutation<SuspensionResponse, { userId: number; data: SuspendUserRequest }>({
      query: ({ userId, data }) => ({
        url: `users/${userId}/suspend`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    unsuspendUser: builder.mutation<SuspensionResponse, number>({
      query: (userId) => ({
        url: `users/${userId}/unsuspend`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    getSuspensionInfo: builder.query<{ data: SuspensionInfo }, number>({
      query: (userId) => `users/${userId}/suspension_info`,
      providesTags: (result, error, userId) => [
        { type: 'User', id: userId },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCheckUserExistsQuery,
  
  // Хуки для блокировки пользователей
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetSuspensionInfoQuery,
} = usersApi;