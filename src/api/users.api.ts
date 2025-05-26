import { baseApi } from './baseApi';
import { User, UserFormData } from '../types/user';

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

interface UserResponse {
  data: User;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, { page?: number; per_page?: number; query?: string }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<UserResponse, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    createUser: builder.mutation<UserResponse, UserFormData>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<UserResponse, { id: number; data: Partial<UserFormData> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    updateUserStatus: builder.mutation<UserResponse, { id: number; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
} = usersApi; 